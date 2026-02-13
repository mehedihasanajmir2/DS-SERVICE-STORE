
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  isPublic: boolean;
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  fullName: string;
  whatsappNumber: string;
  deliveryEmail: string;
  paymentMethod: string;
  transactionId: string;
  screenshotUrl?: string;
}

export type View = 'shop' | 'product-detail' | 'checkout' | 'cart' | 'admin' | 'profile';
