import { CheckCircle, MapPin, Phone, User, Calendar, Tag, CreditCard, Printer, ShoppingBag, Truck } from 'lucide-react';
import { Order } from '../types';

interface OrderReceiptProps {
  order: Order;
  onNewShopping: () => void;
  lang: 'bn' | 'en';
}

export default function OrderReceipt({ order, onNewShopping, lang }: OrderReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'cod': return lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery';
      case 'bkash': return 'bKash (বিকাশ)';
      case 'nagad': return 'Nagad (নগদ)';
      case 'rocket': return 'Rocket (রকেট)';
      default: return method;
    }
  };

  return (
    <div
      id={`order-receipt-${order.id}`}
      className="max-w-xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 print:border-0 print:shadow-none my-4 print:my-0"
    >
      {/* Receipt Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-slate-800 p-6 text-white text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-6 -mb-6" />
        
        <div
          className="mx-auto w-12 h-12 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center mb-2.5"
        >
          <CheckCircle className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-lg font-black mb-0.5">
          {lang === 'bn' ? 'অর্ডারটি সফলভাবে গৃহীত হয়েছে!' : 'Order Placed Successfully!'}
        </h2>
        <p className="text-indigo-100 text-xs font-medium">
          {lang === 'bn' 
            ? 'আমাদের শপ থেকে কেনাকাটা করার জন্য আপনাকে ধন্যবাদ।' 
            : 'Thank you for shopping with us.'}
        </p>
        
        <div className="mt-2.5 inline-block bg-white/10 backdrop-blur-xs px-3 py-1 rounded-md text-[10px] font-mono font-medium tracking-wide">
          {lang === 'bn' ? 'অর্ডার আইডি:' : 'Order ID:'} <span className="text-amber-300 font-bold">#{order.id}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-5 space-y-4">
        {/* Order Status Timeline Tracker */}
        <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100/40">
          <h3 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ডেলিভারি ট্র্যাকার (লাইভ)' : 'Delivery Tracker (Live)'}
          </h3>
          <div className="grid grid-cols-4 gap-1 text-center relative">
            {/* Connector Line */}
            <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-200 z-0" />
            <div className="absolute top-3 left-6 w-[25%] h-0.5 bg-indigo-500 z-0" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10 relative">
              <div className="w-6.5 h-6.5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-indigo-100">
                ১
              </div>
              <span className="text-[10px] font-bold mt-1 text-indigo-700">
                {lang === 'bn' ? 'অর্ডার গৃহীত' : 'Placed'}
              </span>
              <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'এইমাত্র' : 'Just now'}</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10 relative">
              <div className="w-6.5 h-6.5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-indigo-100">
                ২
              </div>
              <span className="text-[10px] font-bold mt-1 text-indigo-700">
                {lang === 'bn' ? 'পেমেন্ট যাচাই' : 'Verified'}
              </span>
              <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'চলমান' : 'Verifying'}</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10 relative">
              <div className="w-6.5 h-6.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                ৩
              </div>
              <span className="text-[10px] font-medium mt-1 text-slate-600">
                {lang === 'bn' ? 'প্যাকিং চলছে' : 'Packing'}
              </span>
              <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center z-10 relative">
              <div className="w-6.5 h-6.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px]">
                ৪
              </div>
              <span className="text-[10px] font-medium mt-1 text-slate-600">
                {lang === 'bn' ? 'ডেলিভারড' : 'Delivered'}
              </span>
              <span className="text-[8px] text-slate-500">{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 mb-2.5">
            {lang === 'bn' ? 'অর্ডারকৃত প্রোডাক্টসমূহ' : 'Ordered Products'}
          </h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-xs gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-8 h-8 object-cover rounded border border-slate-200 bg-slate-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 line-clamp-1 text-xs">
                      {lang === 'bn' ? item.product.nameBn : item.product.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ৳{item.product.price} x {item.quantity}
                    </span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800 text-xs">
                  ৳{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Calculations */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
            <span className="font-semibold text-slate-800">৳{order.totalAmount}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Shipping Charge'}</span>
            <span className="font-semibold text-slate-800">৳{order.shippingCharge}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}
              </span>
              <span>-৳{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-dashed border-slate-200">
            <span>{lang === 'bn' ? 'সর্বমোট পরিশোধযোগ্য' : 'Total Payable'}</span>
            <span className="text-indigo-600 text-sm">৳{order.finalAmount}</span>
          </div>
        </div>

        {/* Shipping & Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Customer / Delivery Card */}
          <div className="border border-slate-200 p-3 rounded-xl space-y-1.5">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              {lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Details'}
            </h5>
            <div className="space-y-1 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-bold text-slate-800">{order.customerInfo.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{order.customerInfo.phone}</span>
              </div>
              <div className="flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight text-[11px]">
                  {order.customerInfo.address}, {order.customerInfo.city}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Card */}
          <div className="border border-slate-200 p-3 rounded-xl space-y-1.5 flex flex-col justify-between">
            <div>
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-indigo-600" />
                {lang === 'bn' ? 'পেমেন্ট বিবরণ' : 'Payment Details'}
              </h5>
              <div className="space-y-1 text-xs text-slate-700 font-medium mt-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Method:'}</span>
                  <span className="font-bold text-slate-800">{getPaymentName(order.customerInfo.paymentMethod)}</span>
                </div>
                
                {order.customerInfo.bkashNumber && (
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'ওয়ালেট নম্বর:' : 'Wallet No:'}</span>
                    <span className="font-mono font-bold text-slate-800">{order.customerInfo.bkashNumber}</span>
                  </div>
                )}
                {order.customerInfo.bkashTrxId && (
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-500">{lang === 'bn' ? 'ট্রানজেকশন আইডি:' : 'TrxID:'}</span>
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded uppercase">
                      {order.customerInfo.bkashTrxId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-slate-100 mt-1">
                  <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {lang === 'bn' ? 'তারিখ:' : 'Date:'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(order.orderDate).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Banner */}
        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 space-y-0.5 font-medium leading-normal">
          <p className="font-bold flex items-center gap-1 text-amber-900">
            <span>💡</span> {lang === 'bn' ? 'পেমেন্ট নির্দেশনা এবং সহায়তা:' : 'Instructions & Support:'}
          </p>
          <p>
            {lang === 'bn'
              ? 'পরবর্তী ৩-৫ মিনিটের মধ্যে আমাদের প্রতিনিধি আপনার দেওয়া মোবাইল নম্বরে কল করে অর্ডারটি নিশ্চিত (Confirm) করবেন। যেকোনো প্রয়োজনে আমাদের হটলাইনে কল করতে পারেন: 01999-999999।'
              : 'Our sales executive will call you within 3-5 minutes to verify and confirm your purchase. For instant help, contact our support helpline at 01999-999999.'}
          </p>
        </div>

        {/* Form Action Controls */}
        <div className="flex gap-2.5 pt-1.5 print:hidden">
          <button
            id="print-invoice-btn"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ইনভয়েস প্রিন্ট' : 'Print Invoice'}
          </button>
          
          <button
            id="continue-shopping-btn"
            onClick={onNewShopping}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition-colors shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'আবার শপিং করুন' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
}
