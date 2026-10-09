import { apiClient } from '@/shared/lib/api-client';
import { Product, PaginatedResponse, ProductBackend, BackendPaginatedResponse, CategoryGroup, DashboardStats, DashboardFilterParams } from '@/shared/types';
import { getImageUrl } from '@/shared/lib/env';

export interface GetProductsParams {
  page?: number;
  limit?: number;
}

export interface GetProductsFilterParams {
  size?: string;
  cor?: string;
  marca?: string;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  limit?: number;
}

export interface PresignedUrlEntry {
  key: string;
  url: string;
}

export interface ProductMediaInput {
  fileName: string;
  fileType: string;
}

export type ProductDepartment = 'feminino' | 'masculino' | 'unissex';
export type ProductStretch = 'none' | 'low' | 'medium' | 'high';

/** All measurements in centimeters; every field is optional. */
export interface ProductMeasurementsInput {
  chest?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  shoulder?: number;
  sleeve?: number;
  length?: number;
  rise?: number;
  inseam?: number;
  hem?: number;
}

export interface CreateProductInput {
  marca: string;
  cor: string;
  descricao: string;
  preco: number;
  category: string;
  size: string;
  // --- Optional editorial / AI-agent fields (CreateProductDto) ---
  title?: string;
  department?: ProductDepartment;
  era?: string;
  sizeRegion?: string;
  fabric?: string;
  stretch?: ProductStretch;
  styleTags?: string[];
  occasions?: string[];
  condition?: string;
  notes?: string;
  measurements?: ProductMeasurementsInput;
  media?: ProductMediaInput[];
}

export interface CreateProductResponse {
  product: Product;
  presignedUrls?: PresignedUrlEntry[];
}

interface CreateProductBackendResponse {
  product: ProductBackend;
  presignedUrls?: PresignedUrlEntry[];
}

export class ProductsService {

  private adaptProduct(backend: ProductBackend): Product {
    let images: string[] = [];
    let imageDetails: { id: number; url: string }[] | undefined;
    let videos: string[] = [];

    if (backend.images && backend.images.length > 0) {
      const sorted = [...backend.images].sort((a, b) => a.id - b.id);
      images = sorted.map(img => getImageUrl(img.urlS3, '/placeholder-product.svg'));
      imageDetails = sorted.map(img => ({ id: img.id, url: getImageUrl(img.urlS3, '/placeholder-product.svg') }));
    } else if (backend.imageUrls && backend.imageUrls.length > 0) {
      images = backend.imageUrls;
    } else if (backend.imageUrl) {
      images = [backend.imageUrl];
    } else if (backend.urlS3) {
      images = [getImageUrl(backend.urlS3, '/placeholder-product.svg')];
    } else {
      images = ['/placeholder-product.svg'];
    }

    if (backend.videos && Array.isArray(backend.videos) && backend.videos.length > 0) {
      videos = backend.videos.map((v) => v.urlS3).filter(Boolean);
    }

    return {
      id: backend.codigoIdentificacao,
      numericId: backend.id,
      name: backend.marca || '',
      description: backend.descricao,
      price: parseFloat(backend.preco),
      color: backend.cor,
      images,
      imageDetails,
      videos,
      category: backend.category,
      size: backend.size,
      available: backend.status === 'available',
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
    };
  }

  async getCategories(): Promise<CategoryGroup[]> {
    return apiClient.get<CategoryGroup[]>('/products/categories');
  }

  async getProductsByCategory(category: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/products/categories/${category}${query ? `?${query}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<ProductBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduct(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getProducts(params: GetProductsParams = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<ProductBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduct(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getProductsFiltered(params: GetProductsFilterParams = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params.size) searchParams.append('size', params.size);
    if (params.cor) searchParams.append('cor', params.cor);
    if (params.marca) searchParams.append('marca', params.marca);
    if (params.precoMin !== undefined) searchParams.append('precoMin', params.precoMin.toString());
    if (params.precoMax !== undefined) searchParams.append('precoMax', params.precoMax.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/products/filter${query ? `?${query}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<ProductBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduct(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getDashboard(params: DashboardFilterParams = {}, token?: string): Promise<DashboardStats> {
    const searchParams = new URLSearchParams();
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.category) searchParams.append('category', params.category);
    if (params.size) searchParams.append('size', params.size);
    if (params.marca) searchParams.append('marca', params.marca);
    if (params.cor) searchParams.append('cor', params.cor);
    if (params.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    const endpoint = `/products/dashboard${query ? `?${query}` : ''}`;

    if (token) {
      return apiClient.withAuth(token).get<DashboardStats>(endpoint);
    }
    return apiClient.get<DashboardStats>(endpoint);
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ProductBackend>(`/products/codigo/${id}`);
    return this.adaptProduct(response);
  }

  async getProductByNumericId(id: number): Promise<Product> {
    const response = await apiClient.get<ProductBackend>(`/products/${id}`);
    return this.adaptProduct(response);
  }

  // Authenticated writes. On the client `token` is omitted: the /api/backend
  // proxy injects the Bearer from the HttpOnly cookie. On the server (admin
  // actions) the caller passes the token read from the cookie store.
  async createProduct(product: CreateProductInput, token?: string): Promise<CreateProductResponse> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    const response = await client.post<CreateProductBackendResponse>('/products', product);
    return {
      product: this.adaptProduct(response.product),
      presignedUrls: response.presignedUrls,
    };
  }

  async updateProduct(id: string, product: Partial<Product>, token?: string): Promise<Product> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    const response = await client.put<ProductBackend>(`/products/${id}`, product);
    return this.adaptProduct(response);
  }

  async deleteProduct(id: string, token?: string): Promise<void> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.delete<void>(`/products/${id}`);
  }

  // --- Favorites (require authentication; use the product's numeric id) ---

  async getFavorites(params: GetProductsParams = {}, token?: string): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/favorites${query ? `?${query}` : ''}`;
    const client = token ? apiClient.withAuth(token) : apiClient;
    const response = await client.get<BackendPaginatedResponse<ProductBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduct(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async addFavorite(productId: number, token?: string): Promise<void> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.put<void>(`/favorites/${productId}`);
  }

  async removeFavorite(productId: number, token?: string): Promise<void> {
    const client = token ? apiClient.withAuth(token) : apiClient;
    return client.delete<void>(`/favorites/${productId}`);
  }
}

export const productsService = new ProductsService();
