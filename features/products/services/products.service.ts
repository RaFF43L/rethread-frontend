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

export class ProductsService {

  private adaptProduct(backend: ProductBackend): Product {
    let images: string[] = [];

    if (backend.imageUrls && backend.imageUrls.length > 0) {
      images = backend.imageUrls;
    } else if (backend.images && backend.images.length > 0) {
      images = backend.images.map(img => 
        getImageUrl(img.urlS3, '/placeholder-product.svg')
      );
    } else if (backend.imageUrl) {
      images = [backend.imageUrl];
    } else if (backend.urlS3) {
      images = [getImageUrl(backend.urlS3, '/placeholder-product.svg')];
    } else {
      images = ['/placeholder-product.svg'];
    }

    return {
      id: backend.codigoIdentificacao,
      numericId: backend.id,
      name: backend.marca || 'Produto',
      description: backend.descricao,
      price: parseFloat(backend.preco),
      color: backend.cor,
      images,
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

  async getDashboard(params: DashboardFilterParams = {}): Promise<DashboardStats> {
    const searchParams = new URLSearchParams();
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.category) searchParams.append('category', params.category);
    if (params.size) searchParams.append('size', params.size);
    if (params.marca) searchParams.append('marca', params.marca);
    if (params.cor) searchParams.append('cor', params.cor);
    if (params.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    return apiClient.get<DashboardStats>(`/products/dashboard${query ? `?${query}` : ''}`);
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<ProductBackend>(`/products/codigo/${id}`);
    return this.adaptProduct(response);
  }

  async getProductByNumericId(id: number): Promise<Product> {
    const response = await apiClient.get<ProductBackend>(`/products/${id}`);
    return this.adaptProduct(response);
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Product> {
    const response = await apiClient.withAuth(token).post<ProductBackend>('/products', product);
    return this.adaptProduct(response);
  }

  async updateProduct(id: string, product: Partial<Product>, token: string): Promise<Product> {
    const response = await apiClient.withAuth(token).put<ProductBackend>(`/products/${id}`, product);
    return this.adaptProduct(response);
  }

  async deleteProduct(id: string, token: string): Promise<void> {
    return apiClient.withAuth(token).delete<void>(`/products/${id}`);
  }
}

export const productsService = new ProductsService();
