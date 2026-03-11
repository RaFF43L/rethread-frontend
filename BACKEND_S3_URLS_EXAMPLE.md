/**
 * Exemplo de código para o BACKEND (NestJS)
 * Como retornar URLs diretas do S3 ao invés de URLs pré-assinadas
 */

// ========================================
// OPÇÃO 1: URLs Diretas (S3 Público)
// ========================================

// src/config/aws.config.ts
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'rethread-prod',
  // Não precisa mais de getSignedUrl!
};

// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('AWS_S3_BUCKET');
    this.region = this.configService.get('AWS_REGION');
  }

  /**
   * Constrói URL pública direta do S3
   * Requer: Bucket configurado como público
   */
  private getPublicImageUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Ao criar/atualizar produto, salve a URL direta
   */
  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    // 1. Upload para S3
    const key = `products/${Date.now()}-${file.originalname}`;
    await this.uploadToS3(key, file.buffer);

    // 2. Construir URL pública
    const imageUrl = this.getPublicImageUrl(key);

    // 3. Salvar no banco
    const product = await this.productRepository.save({
      ...createProductDto,
      imageUrl, // ← URL DIRETA (sem query params)
      imageKey: key, // Guardar key para deletar depois
    });

    return product;
  }

  /**
   * Upload para S3 COM permissão pública
   */
  private async uploadToS3(key: string, buffer: Buffer) {
    const s3 = new AWS.S3();
    
    await s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      // ⚠️ IMPORTANTE: Tornar objeto público
      ACL: 'public-read',
    }).promise();
  }

  /**
   * Listar produtos - retorna imageUrl direta
   */
  async findAll(query: FindProductsDto) {
    const products = await this.productRepository.find(query);

    // imageUrl já vem do banco como URL direta
    return {
      data: products.map(p => ({
        codigoIdentificacao: p.id,
        marca: p.brand,
        preco: p.price.toString(),
        cor: p.color,
        descricao: p.description,
        imageUrl: p.imageUrl, // ← URL LIMPA: https://bucket.s3.region.amazonaws.com/products/xxx.jpeg
        status: p.available ? 'available' : 'sold',
      })),
      page: query.page || 1,
      limit: query.limit || 10,
      total: products.length,
    };
  }
}

// ========================================
// OPÇÃO 2: CloudFront (URLs limpas + CDN)
// ========================================

// src/config/aws.config.ts
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'rethread-prod',
  cloudFrontUrl: process.env.CLOUDFRONT_URL || 'https://d1234abcd.cloudfront.net',
  // Ou domínio customizado:
  // cloudFrontUrl: 'https://cdn.segundaaura.com.br',
};

// src/products/products.service.ts
@Injectable()
export class ProductsService {
  private readonly cloudFrontUrl: string;

  constructor(private configService: ConfigService) {
    this.cloudFrontUrl = this.configService.get('CLOUDFRONT_URL');
  }

  /**
   * Constrói URL via CloudFront
   */
  private getCloudFrontUrl(key: string): string {
    return `${this.cloudFrontUrl}/${key}`;
  }

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const key = `products/${Date.now()}-${file.originalname}`;
    await this.uploadToS3(key, file.buffer);

    // URL via CloudFront (limpa, sem query params)
    const imageUrl = this.getCloudFrontUrl(key);

    const product = await this.productRepository.save({
      ...createProductDto,
      imageUrl, // ← URL CLOUDFRONT: https://cdn.segundaaura.com.br/products/xxx.jpeg
      imageKey: key,
    });

    return product;
  }

  /**
   * Upload para S3 PRIVADO (CloudFront acessa via OAI)
   */
  private async uploadToS3(key: string, buffer: Buffer) {
    const s3 = new AWS.S3();
    
    await s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      // Não precisa de ACL public-read (CloudFront acessa via OAI)
    }).promise();
  }
}

// ========================================
// OPÇÃO 3: Endpoint Proxy
// ========================================

// src/products/products.controller.ts
import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Endpoint que retorna imagem diretamente
   * URL limpa: https://api.segundaaura.com.br/products/image/abc-123-def
   */
  @Get('image/:id')
  async getProductImage(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    // 1. Buscar produto no banco
    const product = await this.productsService.findOne(id);
    if (!product || !product.imageKey) {
      throw new NotFoundException('Product or image not found');
    }

    // 2. Buscar imagem do S3
    const s3 = new AWS.S3();
    const s3Object = await s3.getObject({
      Bucket: this.bucket,
      Key: product.imageKey,
    }).promise();

    // 3. Retornar imagem
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // Cache 1 ano
      'Content-Length': s3Object.Body.length,
    });

    return res.send(s3Object.Body);
  }
}

// Frontend usa:
// const imageUrl = `${API_URL}/products/image/${product.id}`;

// ========================================
// CONFIGURAÇÃO AWS S3 BUCKET PÚBLICO
// ========================================

/**
 * 1. AWS Console → S3 → rethread-prod
 * 
 * 2. Permissions → Block public access → Edit
 *    - Desmarcar "Block all public access"
 *    - Confirmar
 * 
 * 3. Permissions → Bucket Policy → Edit
 *    Cole o JSON abaixo:
 */

const bucketPolicy = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rethread-prod/products/*"
    }
  ]
};

/**
 * 4. Salvar
 * 
 * 5. Testar:
 *    curl https://rethread-prod.s3.us-east-1.amazonaws.com/products/xxx.jpeg
 *    Deve retornar a imagem (não 403)
 */

// ========================================
// VARIÁVEIS DE AMBIENTE (.env)
// ========================================

/**
 * Backend .env
 */
const backendEnv = `
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=rethread-prod

# Escolha UMA das opções:

# Opção 1: URLs diretas S3
# (sem variável adicional, construir URL manualmente)

# Opção 2: CloudFront
CLOUDFRONT_URL=https://d1234abcd.cloudfront.net
# ou
CLOUDFRONT_URL=https://cdn.segundaaura.com.br

# Opção 3: Proxy endpoint
# (sem variável adicional, frontend usa /products/image/:id)
`;

/**
 * Frontend .env.production
 */
const frontendEnv = `
# Opção 1 e 2: API retorna imageUrl completa
NEXT_PUBLIC_API_URL=https://api.segundaaura.com.br

# Opção 3: Frontend constrói URL do proxy
NEXT_PUBLIC_API_URL=https://api.segundaaura.com.br
# imageUrl = \`\${API_URL}/products/image/\${product.id}\`
`;

// ========================================
// RESUMO: QUAL ESCOLHER?
// ========================================

/**
 * Para SEGUNDA AURA BRECHÓ:
 * 
 * ✅ RECOMENDADO: OPÇÃO 1 (S3 Público)
 * 
 * Motivos:
 * - Imagens de roupas não são sensíveis
 * - Implementação rápida (5 minutos)
 * - Sem custo adicional
 * - WhatsApp mostra preview
 * - URLs permanentes
 * 
 * Passos:
 * 1. Configurar bucket público (instruções acima)
 * 2. Atualizar backend para retornar URLs diretas
 * 3. Deploy e testar no WhatsApp
 * 
 * Done! 🚀
 */
