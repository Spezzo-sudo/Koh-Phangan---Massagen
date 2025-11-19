import React from 'react';
import { PRODUCTS } from '../constants';
import { ShoppingBag, Plus } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-200 pb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-brand-dark mb-2">Wellness Shop</h1>
          <p className="text-gray-600">Take a piece of Koh Phangan home with you.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-teal">
                <option>All Categories</option>
                <option>Oils</option>
                <option>Balms</option>
                <option>Accessories</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
            <div className="h-64 overflow-hidden relative bg-gray-50 p-4 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-lg mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
              <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-md text-brand-dark hover:bg-brand-teal hover:text-white transition-colors translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                <Plus size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</div>
              <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{product.price} THB</span>
                <button className="text-sm font-medium text-brand-teal hover:text-brand-dark flex items-center gap-1">
                   Add to Cart <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}