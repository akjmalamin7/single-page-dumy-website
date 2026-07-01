import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  lang: 'bn' | 'en';
}

export default function ProductCard({ product, onAddToCart, onQuickView, lang }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 transition-all duration-200 flex flex-col h-full relative group hover:-translate-y-1"
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          {lang === 'bn' ? `${discountPercentage}% ছাড়!` : `-${discountPercentage}% OFF`}
        </div>
      )}

      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 group-hover:cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 bg-white text-slate-800 rounded-full hover:bg-white hover:text-indigo-600 transition-colors shadow-md hover:scale-105 transform duration-150"
            title={lang === 'bn' ? 'দ্রুত দেখুন' : 'Quick View'}
            aria-label={lang === 'bn' ? 'দ্রুত দেখুন' : 'Quick View'}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
              {lang === 'bn' 
                ? (product.category === 'gadgets' ? 'গ্যাজেট' : product.category === 'fashion' ? 'ফ্যাশন' : product.category === 'lifestyle' ? 'লাইফস্টাইল' : 'অ্যাক্সেসরিজ')
                : product.category}
            </span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-slate-700">{product.rating}</span>
              <span className="text-[9px] text-slate-500">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1 cursor-pointer" onClick={() => onQuickView(product)}>
            {lang === 'bn' ? product.nameBn : product.name}
          </h3>

          {/* Short Description */}
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight mb-2">
            {lang === 'bn' ? product.descriptionBn : product.description}
          </p>
        </div>

        <div>
          {/* Price and Add to Cart Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-[10px] text-slate-500 line-through leading-none mb-0.5">
                  ৳{product.originalPrice}
                </span>
              )}
              <span className="text-sm font-black text-slate-900 leading-none">
                ৳{product.price}
              </span>
            </div>

            <button
              id={`add-to-cart-btn-${product.id}`}
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isOutOfStock 
                ? (lang === 'bn' ? 'স্টক শেষ' : 'Stock Out') 
                : (lang === 'bn' ? 'কার্ট' : 'Add')}
            </button>
          </div>

          {/* Low Stock Indicator */}
          {!isOutOfStock && product.stock <= 5 && (
            <div className="mt-1.5 text-[9px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded text-center">
              {lang === 'bn' ? `মাত্র ${product.stock} টি আছে!` : `Only ${product.stock} left!`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
