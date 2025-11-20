
import React, { useState, useMemo, useEffect } from 'react';
import { useData, useLanguage, useAuth } from '../contexts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, ShoppingBag, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { bookings, expenses } = useData();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'year'>('month');

  // --- SECURITY GUARD ---
  useEffect(() => {
      if (!isAuthenticated) {
          navigate('/login');
      } else if (user?.role !== 'admin') {
          navigate('/'); // Kick non-admins back home
      }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin') {
      return (
        <div className="h-screen flex items-center justify-center flex-col gap-4">
            <Lock size={48} className="text-gray-300" />
            <p className="text-gray-500">Verifying Access...</p>
        </div>
      );
  }

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const filterDate = timeRange === 'today' ? startOfDay : timeRange === 'month' ? startOfMonth : startOfYear;

      const filteredBookings = bookings.filter(b => 
          new Date(b.date) >= filterDate && 
          (b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress')
      );

      const filteredExpenses = expenses.filter(e => 
          new Date(e.date) >= filterDate
      );

      return { bookings: filteredBookings, expenses: filteredExpenses };
  }, [bookings, expenses, timeRange]);

  // --- Calculation Logic ---
  const totalRevenue = filteredData.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const bookingCount = filteredData.bookings.length;

  // --- Combined Transaction History (Sorted Newest First) ---
  const transactions = [
      ...filteredData.bookings.map(b => ({
          id: b.id,
          date: new Date(b.date),
          title: `Booking: ${b.customerName}`,
          amount: b.totalPrice,
          type: 'income',
          status: b.status
      })),
      ...filteredData.expenses.map(e => ({
          id: e.id,
          date: new Date(e.date),
          title: e.title,
          amount: e.amount,
          type: 'expense',
          status: e.category
      }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // --- Simple Chart Data (Percent) ---
  const maxVal = Math.max(totalRevenue, totalExpenses) || 1;
  const revPercent = (totalRevenue / maxVal) * 100;
  const expPercent = (totalExpenses / maxVal) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold text-brand-dark">{t('admin.title')}</h1>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">ADMIN</span>
              </div>
              <p className="text-gray-500 text-sm">Overview of your business performance.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
              {(['today', 'month', 'year'] as const).map(range => (
                  <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          timeRange === range 
                          ? 'bg-brand-teal text-white shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                      {t(`admin.${range}`)}
                  </button>
              ))}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <TrendingUp size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.revenue')}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">THB</span></h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-red-50 rounded-lg text-red-600">
                      <TrendingDown size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.expenses')}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-gray-400">THB</span></h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-brand-teal/10 text-brand-teal' : 'bg-orange-50 text-orange-600'}`}>
                      <DollarSign size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.profit')}</span>
              </div>
              <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-brand-teal' : 'text-orange-600'}`}>
                  {netProfit.toLocaleString()} <span className="text-sm font-normal text-gray-400">THB</span>
              </h3>
              {netProfit > 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-teal"></div>}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <ShoppingBag size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.bookings')}</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{bookingCount}</h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart / Visual Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-fit">
              <h3 className="font-bold text-gray-800 mb-6">Financial Balance</h3>
              
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Income</span>
                          <span className="font-bold text-green-600">{revPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${revPercent}%` }}></div>
                      </div>
                  </div>

                  <div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Expenses</span>
                          <span className="font-bold text-red-500">{expPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className="bg-red-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${expPercent}%` }}></div>
                      </div>
                  </div>
              </div>

              <div className="mt-8 p-4 bg-brand-sand rounded-lg">
                  <h4 className="font-bold text-sm text-brand-dark mb-2">Quick Tips</h4>
                  <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                      <li>Keep marketing costs below 20% of revenue.</li>
                      <li>Stock up on oils when you see a dip in expenses.</li>
                      <li>Review high-performing therapists monthly.</li>
                  </ul>
              </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                  <button className="text-sm text-brand-teal font-medium hover:underline flex items-center gap-1">
                      <Plus size={14} /> Add Expense
                  </button>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                          <tr>
                              <th className="px-4 py-3 text-left rounded-l-lg">Date</th>
                              <th className="px-4 py-3 text-left">Description</th>
                              <th className="px-4 py-3 text-center">Category</th>
                              <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {transactions.length === 0 ? (
                              <tr>
                                  <td colSpan={4} className="text-center py-8 text-gray-400">No transactions found for this period.</td>
                              </tr>
                          ) : (
                              transactions.map((tx) => (
                                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                              {tx.type === 'income' ? (
                                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                              ) : (
                                                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                              )}
                                              {tx.date.toLocaleDateString()}
                                          </div>
                                      </td>
                                      <td className="px-4 py-3 font-medium text-gray-800">
                                          {tx.title}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                          <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                              tx.type === 'income' 
                                              ? 'bg-green-50 text-green-700' 
                                              : 'bg-red-50 text-red-700'
                                          }`}>
                                              {tx.status}
                                          </span>
                                      </td>
                                      <td className={`px-4 py-3 text-right font-bold ${
                                          tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                          {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
}
