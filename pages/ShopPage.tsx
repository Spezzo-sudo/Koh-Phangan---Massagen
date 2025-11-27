import React, { useState } from 'react';
import { Search, ShoppingBag, Plus, X, MapPin, Minus, Truck, CheckCircle, AlertCircle, Trash2, ArrowRight, Package, CreditCard, Loader2 } from 'lucide-react';
import { useAuth, useData } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { Product, PaymentMethod } from '../types';
import { formatPrice } from '../lib/utils';

import { useProducts } from '../lib/queries';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import PaymentModal from '../components/PaymentModal';

export default function ShopPage() {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cart, removeFromCart, updateCartQuantity, cartTotal, clearCart, createOrder } = useData();
  const navigate = useNavigate();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);

  // Form State
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: 'Delivered at appointment'
  });

  const categories = ['All', 'Oils', 'Balms', 'Scrub', 'Aroma'];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true); // Open cart to show feedback
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=shop');
      return;
    }

    setPaymentStatus('processing');
    setPaymentError(undefined);

    try {
      await createOrder({
        ...customerDetails,
        paymentMethod: selectedPaymentMethod
      });

      setPaymentStatus('success');
      // Cart is cleared by createOrder
      // Don't close immediately so user sees success message
    } catch (err: any) {
      console.error(err);
      setPaymentStatus('error');
      setPaymentError(err.message || 'Failed to process order');
    }
  };

  const closePaymentModal = () => {
    if (paymentStatus === 'success') {
      setPaymentStatus('idle');
      setIsCartOpen(false);
      setCustomerDetails({ name: user?.name || '', email: user?.email || '', phone: '', address: 'Delivered at appointment' });
    } else {
      setPaymentStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Hero Section */}
      <div className="relative bg-brand-dark text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/hero_background.png" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Wellness Shop</h1>
            <p className="text-brand-light/80 text-lg mb-6">
              Bring the spa experience home. Authentic oils, balms, and beauty products used by our professionals.
            </p>
            <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm p-3 rounded-lg inline-block">
              <Truck size={18} className="text-brand-gold" />
              <span>Delivered by your therapist at your next appointment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Category Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex bg-white p-1 rounded-full shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cart Trigger Button (Mobile) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-white text-brand-dark rounded-full shadow-md md:hidden border border-gray-100"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100">
                <div className="h-64 overflow-hidden relative bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-brand-dark hover:bg-brand-teal hover:text-white transition-all translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300 z-10"
                    aria-label="Add to cart"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs text-brand-teal font-bold uppercase tracking-wider mb-2">{product.category}</div>
                  <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="font-bold text-xl text-brand-dark">{product.price} THB</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-sm font-medium text-gray-500 hover:text-brand-teal flex items-center gap-1 transition-colors"
                    >
                      Add to Cart <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART DRAWER (Slide Over) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsCartOpen(false)}
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-sand/30">
              <h2 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
                <ShoppingBag className="text-brand-teal" /> Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <ShoppingBag size={64} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-sm max-w-xs mt-2 text-gray-400">Browse our oils, balms, and beauty products.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-8 px-8 py-3 bg-brand-teal text-white rounded-full hover:bg-brand-dark transition-colors shadow-lg shadow-brand-teal/20"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                paymentStatus === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in px-6">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="font-bold text-2xl text-brand-dark mb-2">Added to Account!</h3>
                    <p className="text-gray-600 mb-6">
                      These items have been reserved.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm text-yellow-800 mb-8 text-left flex gap-3">
                      <AlertCircle className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <strong>Important:</strong> Please ensure you have an active booking. Your therapist/artist will check this list and bring the items to your next appointment.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setPaymentStatus('idle');
                      }}
                      className="text-brand-teal font-bold hover:underline flex items-center gap-2"
                    >
                      Continue Browsing <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 border border-blue-100">
                      <Truck size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Free Delivery:</strong> Items will be brought by your specialist at your next appointment.
                      </div>
                    </div>

                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white p-2 rounded-xl border border-gray-50 shadow-sm">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1 py-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-brand-teal font-medium mb-3">{item.price} THB</p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="p-1 hover:bg-white rounded-l-lg text-gray-600 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="p-1 hover:bg-white rounded-r-lg text-gray-600 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && paymentStatus !== 'success' && (
              <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
                <form onSubmit={handleCheckout}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500">Total to Pay on Arrival</span>
                    <span className="font-bold text-2xl text-brand-dark">{formatPrice(cartTotal)}</span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="mb-8">
                    <PaymentMethodSelector
                      selectedMethod={selectedPaymentMethod}
                      onSelect={setSelectedPaymentMethod}
                      amount={cartTotal}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={paymentStatus === 'processing'}
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentStatus === 'processing' ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Place Order <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={paymentStatus !== 'idle'}
        onClose={closePaymentModal}
        status={paymentStatus}
        error={paymentError}
        successMessage="Your order has been placed successfully! We will contact you shortly to confirm shipping."
      />
    </div>
  );
}
