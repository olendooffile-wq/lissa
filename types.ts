
export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  whatsapp?: string;
  role: UserRole;
  photo: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Coupon {
  id: string;
  client_id: string;
  code: string;
  discount: string;
  validity: string;
  status: 'active' | 'expired';
  created_at?: string;
}

export interface Wristband {
  id: string;
  client_id: string;
  code: string;
  status: 'valid' | 'used' | 'expired';
  event_name: string;
  created_at?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  created_at?: string;
}
