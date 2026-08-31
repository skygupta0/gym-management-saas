export type Role = 'SUPER_ADMIN' | 'GYM_OWNER' | 'GYM_ADMIN' | 'STAFF' | 'TRAINER' | 'MEMBER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type BusinessType =
  | 'TRADITIONAL_GYM'
  | 'FITNESS_CENTER'
  | 'CROSSFIT'
  | 'YOGA_STUDIO'
  | 'PERSONAL_TRAINING'
  | 'MMA_MARTIAL_ARTS'
  | 'ZUMBA_DANCE'
  | 'OTHER';

export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'INACTIVE';

export interface User {
  id: string;
  tenantId: string | null;
  email: string;
  firstName: string;
  lastName: string | null;
  fullName: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  logoUrl: string | null;
  currency: string;
  timezone: string;
  status: TenantStatus;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  gymName: string | null;
  gymSlug: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TenantOnboardRequest {
  gymName: string;
  businessType: BusinessType;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  ownerFirstName: string;
  ownerLastName?: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  role: Role;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
