
import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import { ShoppingBag, Plus, X, Minus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import { useData, useAuth } from '../contexts';
import { useNavigate } from 'react-router-dom';

export default function ShopPage() {
  const { addToCart, cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } = useData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const categories = ['All', 'Oils', 'Balms', 'Aroma'];

  const filteredProducts = selectedCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setIsCartOpen(true); // Open cart to show feedback
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=shop');
      return;
    }

    setCheckoutStatus('processing');
    setTimeout(() => {
      setCheckoutStatus('success');
      clearCart();
      setTimeout(() => {
        setCheckoutStatus('idle');
        setIsCartOpen(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-12 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-brand-dark mb-2">Wellness Shop</h1>
          <p className="text-gray-600">Authentic oils and balms, delivered to your room.</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                            selectedCategory === cat 
                            ? 'bg-white text-brand-dark shadow-sm' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* Cart Trigger Button (Mobile) */}
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-brand-teal text-white rounded-full shadow-lg md:hidden"
            >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                )}
            </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group flex flex-col">
            <div className="h-64 overflow-hidden relative bg-gray-50 p-4 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-lg mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
              <button 
                onClick={() => handleAddToCart(product)}
                className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg text-brand-dark hover:bg-brand-teal hover:text-white transition-all translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300 z-10"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</div>
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-lg">{product.price} THB</span>
                <button 
                    onClick={() => handleAddToCart(product)}
                    className="text-sm font-medium text-brand-teal hover:text-brand-dark flex items-center gap-1 transition-colors"
                >
                   Add to Cart <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
                <ShoppingBag /> Your Cart
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
                  <p className="text-sm max-w-xs mt-2">Looks like you haven't added any wellness products yet.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2 border border-brand-teal text-brand-teal rounded-full hover:bg-brand-teal hover:text-white transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                 checkoutStatus === 'success' ? (
                   <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} />
                      </div>
                      <h3 className="font-bold text-2xl text-brand-dark mb-2">Order Placed!</h3>
                      <p className="text-gray-600">We will deliver your items to your location within 60 minutes.</p>
                   </div>
                 ) : (
                    <div className="space-y-6">
                        {cart.map(item => (
                        <div key={item.id} className="flex gap-4">
                            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover bg-gray-50" />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                <p className="text-sm text-gray-500 mb-2">{item.price} THB</p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                        <button 
                                            onClick={() => updateCartQuantity(item.id, -1)}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateCartQuantity(item.id, 1)}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                 )
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && checkoutStatus !== 'success' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-xl text-brand-dark">{cartTotal} THB</span>
                </div>
                <p className="text-xs text-gray-400 mb-4 text-center">Shipping calculated at delivery (usually free)</p>
                
                <button 
                    onClick={handleCheckout}
                    disabled={checkoutStatus === 'processing'}
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {checkoutStatus === 'processing' ? (
                        <>Processing Order...</>
                    ) : (
                        <>Checkout Now <ShoppingBag size={18} /></>
                    )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
