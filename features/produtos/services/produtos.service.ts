import { apiClient } from '@/shared/lib/api-client';
import { Produto, PaginatedResponse, ProdutoBackend, BackendPaginatedResponse, CategoryGroup } from '@/shared/types';
import { getImageUrl } from '@/shared/lib/env';

export interface GetProdutosParams {
  page?: number;
  limit?: number;
}

export interface GetProdutosFilterParams {
  size?: string;
  cor?: string;
  marca?: string;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  limit?: number;
}

export class ProdutosService {

  private adaptProduto(produtoBackend: ProdutoBackend): Produto {
    let imagens: string[] = [];

    if (produtoBackend.imageUrls && produtoBackend.imageUrls.length > 0) {
      imagens = produtoBackend.imageUrls;
    } else if (produtoBackend.images && produtoBackend.images.length > 0) {
      imagens = produtoBackend.images.map(img => 
        getImageUrl(img.urlS3, '/placeholder-product.svg')
      );
    } else if (produtoBackend.imageUrl) {
      imagens = [produtoBackend.imageUrl];
    } else if (produtoBackend.urlS3) {
      imagens = [getImageUrl(produtoBackend.urlS3, '/placeholder-product.svg')];
    } else {
      imagens = ['/placeholder-product.svg'];
    }

    return {
      id: produtoBackend.codigoIdentificacao,
      nome: produtoBackend.marca || 'Produto',
      descricao: produtoBackend.descricao,
      preco: parseFloat(produtoBackend.preco),
      cor: produtoBackend.cor,
      imagens,
      categoria: produtoBackend.category,
      tamanho: produtoBackend.size,
      disponivel: produtoBackend.status === 'available',
      createdAt: produtoBackend.createdAt,
      updatedAt: produtoBackend.updatedAt,
    };
  }

  async getCategorias(): Promise<CategoryGroup[]> {
    return apiClient.get<CategoryGroup[]>('/products/categories');
  }

  async getProdutosByCategoria(categoria: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Produto>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/products/categories/${categoria}${query ? `?${query}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<ProdutoBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduto(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getProdutos(params: GetProdutosParams = {}): Promise<PaginatedResponse<Produto>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<ProdutoBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduto(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getProdutosFiltered(params: GetProdutosFilterParams = {}): Promise<PaginatedResponse<Produto>> {
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
    const response = await apiClient.get<BackendPaginatedResponse<ProdutoBackend>>(endpoint);
    return {
      data: response.data.map(p => this.adaptProduto(p)),
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: Math.ceil(response.total / response.limit),
      },
    };
  }

  async getProdutoById(id: string): Promise<Produto> {
    const response = await apiClient.get<ProdutoBackend>(`/products/codigo/${id}`);
    return this.adaptProduto(response);
  }

  async createProduto(produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Produto> {
    const response = await apiClient.withAuth(token).post<ProdutoBackend>('/products', produto);
    return this.adaptProduto(response);
  }

  async updateProduto(id: string, produto: Partial<Produto>, token: string): Promise<Produto> {
    const response = await apiClient.withAuth(token).put<ProdutoBackend>(`/products/${id}`, produto);
    return this.adaptProduto(response);
  }

  async deleteProduto(id: string, token: string): Promise<void> {
    return apiClient.withAuth(token).delete<void>(`/products/${id}`);
  }
}

export const produtosService = new ProdutosService();
