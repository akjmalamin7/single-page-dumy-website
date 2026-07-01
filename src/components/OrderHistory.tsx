import { motion } from 'motion/react';
import { ShoppingBag, Eye, Calendar, Clock, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  lang: 'bn' | 'en';
}

export default function OrderHistory({ orders, onSelectOrder, lang }: OrderHistoryProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    if (lang === 'bn') {
      switch (status) {
        case 'pending': return 'অপেক্ষমান';
        case 'processing': return 'প্রসেসিং হচ্ছে';
        case 'shipped': return 'পাঠানো হয়েছে';
        case 'delivered': return 'ডেলিভারি সম্পন্ন';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'cod': return lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery';
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      default: return method;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <motion.div
          animate={{ scale: [0.97, 1.03, 0.97] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3"
        >
          <ShoppingBag className="w-6 h-6" />
        </motion.div>
        <h3 className="text-xs font-bold text-slate-800 mb-0.5">
          {lang === 'bn' ? 'কোনো পূর্ববর্তী অর্ডার নেই!' : 'No previous orders found!'}
        </h3>
        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
          {lang === 'bn' 
            ? 'আপনি যখন কোনো পণ্য অর্ডার করবেন, তখন সেই অর্ডারের ইতিহাস এখানে দেখতে পাবেন।' 
            : 'Your order history will appear here once you make your first purchase.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
        <ShoppingBag className="w-4 h-4 text-indigo-600" />
        {lang === 'bn' ? `আপনার মোট অর্ডারসমূহ (${orders.length})` : `Your Orders (${orders.length})`}
      </h3>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            id={`history-order-${order.id}`}
            whileHover={{ scale: 1.005, x: 1 }}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group cursor-pointer"
            onClick={() => onSelectOrder(order)}
          >
            <div className="space-y-1">
              {/* Order ID & Date */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  #{order.id}
                </span>
                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${getStatusBadgeColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Products preview summary */}
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                {order.items.map(item => `${lang === 'bn' ? item.product.nameBn : item.product.name} (x${item.quantity})`).join(', ')}
              </p>

              {/* Mini detail indicators */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap font-medium">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(order.orderDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(order.orderDate).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {order.customerInfo.city}
                </span>
                <span className="flex items-center gap-0.5">
                  <CreditCard className="w-3 h-3 text-slate-400" />
                  {getPaymentName(order.customerInfo.paymentMethod)}
                </span>
              </div>
            </div>

            {/* Price & View CTA */}
            <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">{lang === 'bn' ? 'পরিশোধিত মূল্য' : 'Amount'}</span>
                <span className="text-xs font-black text-slate-900">৳{order.finalAmount}</span>
              </div>
              <button
                id={`view-order-btn-${order.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOrder(order);
                }}
                className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                title={lang === 'bn' ? 'ইনভয়েস দেখুন' : 'View Invoice'}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
