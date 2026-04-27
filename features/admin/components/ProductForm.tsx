'use client';

import { useRef, useState, useTransition, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { FormField } from '@/shared/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Upload, X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { compressImage } from '@/shared/utils/compress-image';
import { getPresignedUrl, uploadToS3, registerProductImage } from '@/features/products/services/s3-upload';
import { registerProductVideo } from '@/features/products/services/register-video';
import { productsService } from '@/features/products/services/products.service';
import { apiClient } from '@/shared/lib/api-client';

const CATEGORIES = ['calca', 'blusa', 'camiseta', 'short', 'vestido'] as const;
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'] as const;

const schema = z.object({
  marca: z.string().optional(),
  cor: z.string().min(1, 'Informe a cor'),
  descricao: z.string().min(5, 'Descrição muito curta'),
  preco: z.number({ error: 'Informe um valor válido' }).positive('O preço deve ser maior que zero'),
  category: z.enum(CATEGORIES, { error: 'Selecione a categoria' }),
  size: z.string().min(1, 'Informe o tamanho'),
});

type FormValues = z.infer<typeof schema>;

type MediaItem =
  | { kind: 'existing'; imageId: number; url: string; src: string }
  | { kind: 'new'; file: File; src: string };

export interface ProductFormProps {
  productId?: string;
  productNumericId?: number;
  defaultValues?: Partial<FormValues>;
  existingImages?: { id: number; url: string }[];
  submitLabel: string;
  submittingLabel: string;
  redirectTo?: string;
}

export function ProductForm({
  productId,
  productNumericId,
  defaultValues,
  existingImages = [],
  submitLabel,
  submittingLabel,
  redirectTo = '/admin/products',
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    existingImages.map(img => ({ kind: 'existing', imageId: img.id, url: img.url, src: img.url }))
  );
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedCategory = watch('category');
  const isMounted = useRef(false);

  // Reset size only when the user actively changes category, not on initial mount
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setValue('size', '' as any);
  }, [selectedCategory, setValue]);

  const handleFiles = async (selected: FileList | null) => {
    if (!selected) return;
    setImageError(null);
    const imageFiles = Array.from(selected).filter(f => f.type.startsWith('image/'));
    const videoFilesArr = Array.from(selected).filter(f => f.type.startsWith('video/'));

    if (imageFiles.length > 0) {
      setIsCompressing(true);
      try {
        const compressed = await Promise.all(imageFiles.map(compressImage));
        const newItems = await Promise.all(
          compressed.map(
            file =>
              new Promise<MediaItem>(resolve => {
                const reader = new FileReader();
                reader.onload = e =>
                  resolve({ kind: 'new', file, src: e.target?.result as string });
                reader.readAsDataURL(file);
              })
          )
        );
        setMediaItems(prev => [...prev, ...newItems]);
      } catch {
        setImageError('Erro ao processar imagens. Tente novamente.');
      } finally {
        setIsCompressing(false);
      }
    }

    if (videoFilesArr.length > 0) {
      setVideoFiles(prev => [...prev, ...videoFilesArr]);
      videoFilesArr.forEach(f => {
        const reader = new FileReader();
        reader.onload = e =>
          setVideoPreviews(prev => [...prev, e.target?.result as string]);
        reader.readAsDataURL(f);
      });
    }
  };

  const removeItem = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, dir: 'left' | 'right') => {
    const target = dir === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= mediaItems.length) return;
    setMediaItems(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleDragStart = (index: number) => setDragFrom(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dragOver) setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragFrom !== null && dragFrom !== index) {
      setMediaItems(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragFrom, 1);
        next.splice(index, 0, moved);
        return next;
      });
    }
    setDragFrom(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const onSubmit = async (values: FormValues) => {
    if (mediaItems.length + videoFiles.length === 0) {
      setImageError('Adicione pelo menos uma imagem ou vídeo do produto.');
      return;
    }
    setServerError(null);

    startTransition(async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('rethread_admin_token='))
          ?.split('=')[1];

        const productPayload = {
          marca: values.marca || '',
          cor: values.cor,
          descricao: values.descricao,
          preco: values.preco,
          category: values.category,
          size: values.size,
        };

        let resolvedProductId: string;
        if (productNumericId !== undefined && productId) {
          await apiClient.withAuth(token || '').put(`/products/${productNumericId}`, productPayload);
          resolvedProductId = productId;

          const keptImageIds = new Set(
            mediaItems
              .filter((m): m is Extract<MediaItem, { kind: 'existing' }> => m.kind === 'existing')
              .map(m => m.imageId)
          );
          const removedImageIds = existingImages
            .map(img => img.id)
            .filter(id => !keptImageIds.has(id));
          for (const imageId of removedImageIds) {
            await apiClient.withAuth(token || '').delete(`/products/images/${imageId}`);
          }
        } else {
          const created = await productsService.createProduct(productPayload as any, token || '');
          resolvedProductId = created.id;
        }

        for (const item of mediaItems) {
          if (item.kind === 'new') {
            const { url, key } = await getPresignedUrl(resolvedProductId, item.file.name, item.file.type, token);
            await uploadToS3(url, item.file);
            await registerProductImage(resolvedProductId, key, token);
          }
        }

        for (const file of videoFiles) {
          const { url, key } = await getPresignedUrl(resolvedProductId, file.name, file.type, token);
          await uploadToS3(url, file);
          await registerProductVideo(resolvedProductId, key, token);
        }

        router.push(redirectTo);
      } catch (err: any) {
        const msg = Array.isArray(err?.message) ? err.message.join(', ') : (err?.message || 'Erro ao salvar produto');
        setServerError(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fotos e Vídeos do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-foreground transition-colors disabled:opacity-50"
          >
            {isCompressing ? (
              <span>
                <Loader2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Comprimindo imagens...</p>
              </span>
            ) : (
              <span>
                <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar fotos ou vídeos</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP, MP4, WEBM</p>
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target?.files ?? null)}
          />

          {imageError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {imageError}
            </p>
          )}

          {(mediaItems.length > 0 || videoPreviews.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {mediaItems.map((item, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={e => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={[
                    'relative cursor-grab active:cursor-grabbing transition-all select-none',
                    dragFrom === i ? 'opacity-40 scale-95' : '',
                    dragOver === i && dragFrom !== i
                      ? 'ring-2 ring-foreground ring-offset-1 rounded-lg'
                      : '',
                  ].join(' ')}
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <Image
                      src={item.src}
                      alt={`preview ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Capa badge */}
                  {i === 0 && (
                    <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded leading-4">
                      Capa
                    </span>
                  )}

                  {/* X — sempre visível, vermelho */}
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Mover esquerda (fallback mobile) */}
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveItem(i, 'left')}
                      className="absolute bottom-0 left-0 bg-black/50 hover:bg-black/70 text-white rounded-bl-lg w-6 h-6 flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Mover direita (fallback mobile) */}
                  {i < mediaItems.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveItem(i, 'right')}
                      className="absolute bottom-0 right-0 bg-black/50 hover:bg-black/70 text-white rounded-br-lg w-6 h-6 flex items-center justify-center transition-colors z-10"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {videoPreviews.map((src, i) => (
                <div key={`video-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <video src={src} controls className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Marca — opcional */}
            <FormField label="Marca" htmlFor="marca" error={errors.marca?.message}>
              <Input id="marca" placeholder="ex: Zara, H&M, Renner..." {...register('marca')} />
            </FormField>
            <FormField label="Cor" required htmlFor="cor" error={errors.cor?.message}>
              <Input id="cor" placeholder="ex: Azul, Rosa, Preto..." {...register('cor')} />
            </FormField>
          </div>

          <FormField label="Descrição" required htmlFor="descricao" error={errors.descricao?.message}>
            <Textarea
              id="descricao"
              rows={3}
              placeholder="Descreva o produto, estado de conservação, material..."
              {...register('descricao')}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Preço (R$)" required htmlFor="preco" error={errors.preco?.message}>
              <Input
                id="preco"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                {...register('preco', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Categoria" required error={errors.category?.message}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {/* Tamanho — input livre para calça, select para o resto */}
            <FormField label="Tamanho" required error={errors.size?.message}>
              {selectedCategory === 'calca' ? (
                <Input
                  id="size"
                  placeholder="ex: 36, 38, 40..."
                  {...register('size')}
                />
              ) : (
                <Controller
                  name="size"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
          </div>
        </CardContent>
      </Card>

      {serverError && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {serverError}
        </div>
      )}

      <div className="flex gap-3 pb-8">
        <Button type="button" variant="outline" className="flex-1" asChild>
          <Link href="/admin/products">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1 bg-foreground hover:bg-foreground/80 text-background">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
