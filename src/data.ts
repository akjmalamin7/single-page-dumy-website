import { Product } from './types';

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'M10 TWS Wireless Earbuds',
    nameBn: 'এম১০ টিডব্লিউএস ওয়্যারলেস ইয়ারবাডস',
    description: 'Ultra-low latency wireless gaming earbuds with deep bass and high fidelity sound. LED digital battery indicator.',
    descriptionBn: 'এলইডি ডিসপ্লে এবং চমৎকার সাউন্ড কোয়ালিটি সম্পন্ন মিনি টিডব্লিউএস ওয়্যারলেস ইয়ারবাডস। দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ।',
    price: 380,
    originalPrice: 850,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
    category: 'gadgets',
    rating: 4.8,
    reviewsCount: 124,
    stock: 15,
    featured: true
  },
  {
    id: 'prod-2',
    name: 'T800 Ultra Smartwatch',
    nameBn: 'টি৮০০ আল্ট্রা স্মার্টওয়াচ',
    description: 'Premium active fitness smartwatch with heart rate tracker, Bluetooth calling, and multiple sports modes.',
    descriptionBn: 'হার্ট রেট মনিটর, ব্লুটুথ কলিং এবং একাধিক স্পোর্টস মোড সহ প্রিমিয়াম কোয়ালিটির ফিটনেস ট্র্যাকার স্মার্টওয়াচ।',
    price: 850,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60',
    category: 'gadgets',
    rating: 4.7,
    reviewsCount: 98,
    stock: 8,
    featured: true
  },
  {
    id: 'prod-3',
    name: 'Premium Leather Wallet',
    nameBn: 'প্রিমিয়াম লেদার ওয়ালেট',
    description: '100% Genuine leather minimalist bi-fold wallet for men. Elegant stitch and compact compartments.',
    descriptionBn: '১০০% খাঁটি চামড়ার তৈরি আকর্ষণীয় ও টেকসই পুরুষদের দ্বifold মানিব্যাগ। জেনুইন লেদার গ্যারান্টি।',
    price: 650,
    originalPrice: 1200,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60',
    category: 'fashion',
    rating: 4.9,
    reviewsCount: 156,
    stock: 22,
    featured: true
  },
  {
    id: 'prod-4',
    name: 'Anti-Glare Classic Sunglasses',
    nameBn: 'অ্যান্টি-গ্লেয়ার ক্ল্যাসিক সানগ্লাস',
    description: 'Polarized UV400 protection retro design square sunglasses. Durable frame and crystal clear view.',
    descriptionBn: 'ক্ষতিকারক অতিবেগুনী রশ্মি থেকে চোখকে সুরক্ষিত রাখতে পোলারাইজড ইউভি৪০০ সানগ্লাস। আড়ম্বরপূর্ণ ডিজাইন।',
    price: 450,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
    category: 'fashion',
    rating: 4.6,
    reviewsCount: 64,
    stock: 18,
    featured: false
  },
  {
    id: 'prod-5',
    name: '20,000mAh Fast Charging Power Bank',
    nameBn: '২০,০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক',
    description: 'High capacity external battery charger with dual USB-C ports. 22.5W fast delivery technology.',
    descriptionBn: 'ডুয়াল পোর্ট সমৃদ্ধ অত্যন্ত শক্তিশালী ২০,০০০ এমএএইচ ফাস্ট চার্জিং পাওয়ার ব্যাংক। লাইটওয়েট ডিজাইন।',
    price: 1250,
    originalPrice: 2200,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=500&auto=format&fit=crop&q=60',
    category: 'gadgets',
    rating: 4.8,
    reviewsCount: 112,
    stock: 5,
    featured: false
  },
  {
    id: 'prod-6',
    name: 'Mechanical RGB Gaming Keyboard',
    nameBn: 'মেকানিক্যাল আরজিবি গেমিং কিবোর্ড',
    description: 'Tactile blue switches mechanical keyboard with fully customizable backlighting modes.',
    descriptionBn: 'শব্দহীন ও অত্যন্ত আরামদায়ক টাইপিংয়ের জন্য মেকানিক্যাল কিবোর্ড। এতে রয়েছে আকর্ষণীয় আরজিবি লাইটিং।',
    price: 1850,
    originalPrice: 3200,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?w=500&auto=format&fit=crop&q=60',
    category: 'accessories',
    rating: 4.9,
    reviewsCount: 84,
    stock: 4,
    featured: true
  },
  {
    id: 'prod-7',
    name: 'Portable Bluetooth Waterproof Speaker',
    nameBn: 'পোর্টেবল ব্লুটুথ ওয়াটারপ্রুফ স্পিকার',
    description: 'IPX7 waterproof wireless speaker with rich 360-degree stereo sound and heavy deep bass.',
    descriptionBn: 'ওয়াটারপ্রুফ শক্তিশালী পোর্টেবল স্পিকার। ইনডোর এবং আউটডোরে গানের দারুণ অভিজ্ঞতা দিতে সক্ষম।',
    price: 990,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
    category: 'lifestyle',
    rating: 4.7,
    reviewsCount: 77,
    stock: 12,
    featured: false
  },
  {
    id: 'prod-8',
    name: 'Smart Temperature Water Bottle',
    nameBn: 'স্মার্ট টেম্পারেচার ওয়াটার বোতল',
    description: 'Stainless steel vacuum insulated flask with LED smart temperature display screen.',
    descriptionBn: 'এলইডি ডিসপ্লে সহ স্মার্ট থার্মাল ওয়াটার বোতল, যা পানির সঠিক তাপমাত্রা প্রদর্শন করে। দীর্ঘস্থায়ী ফ্লাস্ক।',
    price: 520,
    originalPrice: 950,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    category: 'lifestyle',
    rating: 4.5,
    reviewsCount: 42,
    stock: 25,
    featured: false
  }
];

export const shippingCharges = {
  dhaka: 60,
  outsideDhaka: 120
};

export const promoCodes: Record<string, number> = {
  'FREE50': 50,
  'SAVE100': 100,
  'DUMMY': 30
};
