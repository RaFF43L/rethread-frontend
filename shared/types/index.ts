export interface ProdutoBackend {
  id: number;
  codigoIdentificacao: string;
  cor: string;
  marca: string;
  urlS3: string;
  status: 'available' | 'unavailable';
  descricao: string;
  preco: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  imageUrl?: string; // URL pré-assinada do S3
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  cor: string;
  imagem: string;
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
