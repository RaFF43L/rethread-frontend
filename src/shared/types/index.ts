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
  // Optional fields for the editorial redesign — currently absent from the API,
  // the UI degrades gracefully (hides whatever isn't filled in)
  // until the backend starts sending them (see BACKEND_SPEC.md).
  brand?: string;
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

// User profile for display. There is no /auth/me: this comes from the `user`
// field of the callback response and is cached in a non-HttpOnly cookie.
// All optional: the UI applies a fallback (initials) when something is missing.
export interface GoogleUser {
  name?: string;
  email?: string;
  picture?: string;
  groups?: string[];
}

// Backend response when starting the login: the authorization URL and the state.
export interface GoogleLoginInit {
  url: string;
  state: string;
}

// Response from POST /auth/google/callback. NOTE: the backend's Swagger does not
// document this response body (only a description) — this shape is confirmed with
// the backend owner, not derived from the spec. The tokens are consumed
// server-side (route handlers) and stored in HttpOnly cookies; only `user` is
// exposed to the client. `refreshToken` powers logout (LogoutDto) and refresh.
export interface GoogleCallbackResponse {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  isNewUser?: boolean;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    pictureUrl?: string;
    groups?: string[];
  };
}
