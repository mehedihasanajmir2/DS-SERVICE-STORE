
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
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
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
}

export type View = 'shop' | 'product-detail' | 'checkout' | 'cart';

// Database Schema Documentation (Conceptual for MongoDB/PostgreSQL)
/**
 * -- PostgreSQL Schema --
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   email TEXT UNIQUE NOT NULL,
 *   password_hash TEXT NOT NULL,
 *   is_admin BOOLEAN DEFAULT FALSE
 * );
 * 
 * CREATE TABLE products (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   price DECIMAL(10,2) NOT NULL,
 *   category TEXT,
 *   image_url TEXT,
 *   stock INTEGER DEFAULT 0
 * );
 * 
 * CREATE TABLE orders (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES users(id),
 *   total_amount DECIMAL(10,2),
 *   status TEXT DEFAULT 'pending',
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */
