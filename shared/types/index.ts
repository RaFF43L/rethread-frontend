export interface ProductImage {
  id: number;
  urlS3: string;
}

export interface ProdutoBackend {
  id: number;
  codigoIdentificacao: string;
  cor: string;
  marca: string;
  category?: string;
  size?: string;
  urlS3?: string;
  images?: ProductImage[];
  imageUrls?: string[];
  status: 'available' | 'unavailable';
  descricao: string;
  preco: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUrl?: string;
}

export interface CategoryGroup {
  category: string;
  products: ProdutoBackend[];
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  cor: string;
  imagens: string[];
  categoria?: string;
  tamanho?: string;
  disponivel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
  token: string;
}
