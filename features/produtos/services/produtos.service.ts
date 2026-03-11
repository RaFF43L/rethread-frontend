import { apiClient } from '@/shared/lib/api-client';
import { Produto, PaginatedResponse, ProdutoBackend, BackendPaginatedResponse } from '@/shared/types';
import { getImageUrl, isS3Image } from '@/shared/lib/env';

export interface GetProdutosParams {
  page?: number;
  limit?: number;
  categoria?: string;
  cor?: string;
  q?: string; 
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
      disponivel: produtoBackend.status === 'available',
      createdAt: produtoBackend.createdAt,
      updatedAt: produtoBackend.updatedAt,
    };
  }

  async getProdutos(params: GetProdutosParams = {}): Promise<PaginatedResponse<Produto>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.categoria) searchParams.append('categoria', params.categoria);
    if (params.cor) searchParams.append('cor', params.cor);
    if (params.q) searchParams.append('q', params.q);

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
