'use client';

import { useRef, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = ['calca', 'blusa', 'camiseta', 'short', 'vestido'] as const;
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'] as const;

const schema = z.object({
  marca: z.string().min(1, 'Informe a marca'),
  cor: z.string().min(1, 'Informe a cor'),
  descricao: z.string().min(5, 'Descrição muito curta'),
  preco: z.number({ error: 'Informe um valor válido' }).positive('O preço deve ser maior que zero'),
  category: z.enum(CATEGORIES, { error: 'Selecione a categoria' }),
  size: z.enum(SIZES, { error: 'Selecione o tamanho' }),
});

type FormValues = z.infer<typeof schema>;

export interface ProductFormProps {
  defaultValues?: Partial<FormValues>;
  existingImages?: string[];
  onSubmitAction: (formData: FormData) => Promise<void>;
  submitLabel: string;
  submittingLabel: string;
}

export function ProductForm({
  defaultValues,
  existingImages = [],
  onSubmitAction,
  submitLabel,
  submittingLabel,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [files, setFiles] = useState<File[]>([]);
  const [removedExisting, setRemovedExisting] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const existingCount = existingImages.length - removedExisting.length;
  const newCount = files.length;

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    setImageError(null);
    const newFiles = Array.from(selected).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      const url = existingImages[index];
      if (!removedExisting.includes(url)) {
        setRemovedExisting(prev => [...prev, url]);
      }
      setPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length + removedExisting.length;
      const adjustedFileIndex = index - (existingImages.length - removedExisting.length);
      setFiles(prev => prev.filter((_, i) => i !== adjustedFileIndex));
      setPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = (values: FormValues) => {
    if (existingCount + newCount === 0) {
      setImageError('Adicione pelo menos uma imagem do produto.');
      return;
    }
    setServerError(null);

    const data = new FormData();
    data.append('marca', values.marca);
    data.append('cor', values.cor);
    data.append('descricao', values.descricao);
    data.append('preco', String(values.preco));
    data.append('category', values.category);
    data.append('size', values.size);
    files.forEach(f => data.append('images', f));
    if (removedExisting.length > 0) {
      data.append('removedImages', JSON.stringify(removedExisting));
    }

    startTransition(async () => {
      try {
        await onSubmitAction(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro inesperado';
        if (!message.includes('NEXT_REDIRECT')) {
          setServerError(message);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fotos do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#A0522D] transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Clique para adicionar fotos</p>
            <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {imageError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {imageError}
            </p>
          )}

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => {
                const isRemoved = i < existingImages.length && removedExisting.includes(existingImages[i]);
                if (isRemoved) return null;
                return (
                  <div key={i} className="relative group">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <Image src={src} alt={`preview ${i + 1}`} fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
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
            <FormField label="Marca" required htmlFor="marca" error={errors.marca?.message}>
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
              <Input id="preco" type="number" min="0.01" step="0.01" placeholder="0,00" {...register('preco', { valueAsNumber: true })} />
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

            <FormField label="Tamanho" required error={errors.size?.message}>
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
        <Button type="submit" disabled={isPending} className="flex-1 bg-[#A0522D] hover:bg-[#8B4513]">
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {submittingLabel}</>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
