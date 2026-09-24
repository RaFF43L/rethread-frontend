export interface ProductImage {
  id: number;
  urlS3: string;
}

export interface ProductBackend {
  id: number;
  codigoIdentificacao: string;
  cor: string;
  marca: string;
  category?: string;
  size?: string;
  urlS3?: string;
  images?: ProductImage[];
  imageUrls?: string[];
  videos?: { id: number; urlS3: string }[];
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
  products: ProductBackend[];
}

export type ProductCondition =
  | 'new_with_tag'
  | 'excellent'
  | 'very_good'
  | 'visible_marks';

export interface ProductMeasurement {
  label: string;
  valueCm: number;
  standardRangeCm?: [number, number];
}

export interface Product {
  id: string;
  numericId: number;
  name: string;
  description: string;
  price: number;
  color: string;
  images: string[];
  imageDetails?: { id: number; url: string }[];
  videos: string[];
  category?: string;
  size?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  // Campos opcionais para o redesign editorial — ausentes hoje na API,
  // a UI degrada graciosamente (esconde o que não vier preenchido)
  // até que o backend passe a enviá-los (ver BACKEND_SPEC.md).
  condition?: ProductCondition;
  era?: string;
  style?: string[];
  fit?: string;
  material?: string;
  measurements?: ProductMeasurement[];
  curationNote?: string;
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

export interface DashboardStats {
  total: number;
  available: number;
  sold: number;
  totalValue: number;
  availableValue: number;
  soldValue: number;
}

export interface DashboardFilterParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  size?: string;
  marca?: string;
  cor?: string;
  status?: 'available' | 'sold';
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
  user?: User;
  token?: string;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}
