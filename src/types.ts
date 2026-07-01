export interface Product {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
    bkashNumber?: string;
    bkashTrxId?: string;
  };
  totalAmount: number;
  shippingCharge: number;
  discount: number;
  finalAmount: number;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export type Category = 'all' | 'gadgets' | 'fashion' | 'lifestyle' | 'accessories';
