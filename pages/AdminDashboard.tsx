
import React, { useState, useMemo, useEffect } from 'react';
import { useData, useLanguage, useAuth } from '../contexts';
import { useTherapists, useOrders } from '../lib/queries';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Plus, ShoppingBag, User, Lock, Users, CheckCircle, Power, X, Save, Paperclip, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { Expense } from '../types';

export default function AdminDashboard() {
    // --- ALL HOOKS MUST BE CALLED FIRST (before any conditional logic) ---
    const { bookings, expenses, updateTherapist, addExpense, isLoading } = useData();
    const { user, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Fetch therapists from Supabase (real-time data, not context state)
    const { data: dbTherapists = [], isLoading: therapistsLoading, refetch: refetchTherapists } = useTherapists();
    const [timeRange, setTimeRange] = useState<'today' | 'month' | 'year'>('month');
    const [activeTab, setActiveTab] = useState<'financial' | 'team' | 'orders'>('financial');
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch Orders
    const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useOrders();

    // --- ADD EXPENSE MODAL STATE ---
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'other' as Expense['category']
    });
    // State for the file attachment
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

    // --- SECURITY GUARD (MUST be in useEffect, not early return) ---
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user?.role !== 'admin') {
            navigate('/'); // Kick non-admins back home
        }
    }, [isAuthenticated, user, navigate]);

    // --- Filtering Logic (MUST be before early return) ---
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

    // --- NOW we can do conditional rendering (after all hooks) ---
    if (!user || user.role !== 'admin') {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4">
                <Lock size={48} className="text-gray-300" />
                <p className="text-gray-500">Verifying Access...</p>
            </div>
        );
    }

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
            status: b.status,
            attachment: null
        })),
        ...filteredData.expenses.map(e => ({
            id: e.id,
            date: new Date(e.date),
            title: e.title,
            amount: e.amount,
            type: 'expense',
            status: e.category,
            attachment: e.attachmentUrl
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // --- Simple Chart Data (Percent) ---
    const maxVal = Math.max(totalRevenue, totalExpenses) || 1;
    const revPercent = (totalRevenue / maxVal) * 100;
    const expPercent = (totalExpenses / maxVal) * 100;

    // --- Handlers ---
    const handleExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseForm.title || !expenseForm.amount) return;

        // Simulate File Upload (Create Local URL)
        // In a real app, this would upload to Supabase Storage and return a remote URL
        let attachmentUrl = undefined;
        if (receiptFile) {
            attachmentUrl = URL.createObjectURL(receiptFile);
        }

        await addExpense({
            title: expenseForm.title,
            amount: parseFloat(expenseForm.amount),
            category: expenseForm.category,
            date: new Date().toISOString(),
            attachmentUrl
        });

        // Reset & Close
        setExpenseForm({ title: '', amount: '', category: 'other' });
        setReceiptFile(null);
        setShowExpenseModal(false);
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setFeedbackMessage({ type: 'success', text: 'Order status updated' });
            refetchOrders();
            setTimeout(() => setFeedbackMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setFeedbackMessage({ type: 'error', text: 'Failed to update order status' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-serif text-3xl font-bold text-brand-dark">{t('admin.title')}</h1>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">ADMIN</span>
                    </div>
                    <p className="text-gray-500 text-sm">Mission Control Center</p>
                </div>

                <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'financial'
                            ? 'bg-brand-dark text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <DollarSign size={16} /> Financials
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'team'
                            ? 'bg-brand-dark text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Users size={16} /> Team Management
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'orders'
                            ? 'bg-brand-dark text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <ShoppingBag size={16} /> Shop Orders
                    </button>
                </div>
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
                <div className={`mb-6 p-4 rounded-lg border ${feedbackMessage.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <p className={feedbackMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                        {feedbackMessage.text}
                    </p>
                </div>
            )}

            {activeTab === 'financial' && (
                <>
                    {/* Time Range Selector */}
                    <div className="flex justify-end mb-6">
                        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                            {(['today', 'month', 'year'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range
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
                                <button
                                    onClick={() => setShowExpenseModal(true)}
                                    className="text-sm text-brand-teal font-medium hover:underline flex items-center gap-1"
                                >
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
                                            <th className="px-4 py-3 text-center">Receipt</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-gray-400">No transactions found for this period.</td>
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
                                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${tx.type === 'income'
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-red-50 text-red-700'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {tx.attachment ? (
                                                            <a
                                                                href={tx.attachment}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-brand-teal hover:text-white transition-colors text-gray-500"
                                                                title="View Receipt"
                                                            >
                                                                <Paperclip size={14} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                </>
            )}

            {activeTab === 'team' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800">Staff Overview</h3>
                        <p className="text-sm text-gray-500">Manage availability and verification status of your team.</p>
                    </div>
                    <div className="overflow-x-auto">
                        {therapistsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : dbTherapists.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No therapists found. Create profiles with role "therapist" in Supabase.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Therapist</th>
                                        <th className="px-6 py-3 text-left">Location</th>
                                        <th className="px-6 py-3 text-center">Verification</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dbTherapists.map(t => {
                                        // Map Supabase fields to Therapist interface (handle both naming conventions)
                                        const therapist = {
                                            ...t,
                                            name: (t as any).full_name || (t as any).name || 'Unknown',
                                            image: (t as any).avatar_url || (t as any).image || '/default-avatar.png',
                                            skills: (t as any).skills || [],
                                            locationBase: (t as any).location_base || (t as any).locationBase || 'Not specified',
                                            available: (t as any).available ?? true,
                                            verified: (t as any).is_verified || (t as any).verified || false
                                        };

                                        return (
                                            <tr key={t.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={therapist.image} alt={therapist.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.currentTarget.src = '/default-avatar.png' }} />
                                                        <div>
                                                            <div className="font-bold text-gray-900">{therapist.name}</div>
                                                            <div className="text-xs text-gray-500">{therapist.skills?.length || 0} Skills</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{therapist.locationBase}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {therapist.verified ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                            <CheckCircle size={12} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                                            Unverified
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {therapist.available ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                                            <Power size={12} /> Online
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                                                            <Power size={12} /> Offline
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await updateTherapist(t.id, { verified: !therapist.verified });
                                                                    refetchTherapists();
                                                                    const status = !therapist.verified ? 'verified' : 'unverified';
                                                                    setFeedbackMessage({
                                                                        type: 'success',
                                                                        text: `${therapist.name} is now ${status}`
                                                                    });
                                                                    setTimeout(() => setFeedbackMessage(null), 3000);
                                                                } catch (err) {
                                                                    setFeedbackMessage({
                                                                        type: 'error',
                                                                        text: 'Failed to update verification status'
                                                                    });
                                                                }
                                                            }}
                                                            className="text-xs px-3 py-1 border rounded hover:bg-gray-50"
                                                        >
                                                            Toggle Verify
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await updateTherapist(t.id, { available: !therapist.available });
                                                                    refetchTherapists();
                                                                    const status = !therapist.available ? 'online' : 'offline';
                                                                    setFeedbackMessage({
                                                                        type: 'success',
                                                                        text: `${therapist.name} is now ${status}`
                                                                    });
                                                                    setTimeout(() => setFeedbackMessage(null), 3000);
                                                                } catch (err) {
                                                                    setFeedbackMessage({
                                                                        type: 'error',
                                                                        text: 'Failed to update availability'
                                                                    });
                                                                }
                                                            }}
                                                            className={`text-xs px-3 py-1 border rounded text-white ${therapist.available ? 'bg-red-500 hover:bg-red-600 border-red-600' : 'bg-green-500 hover:bg-green-600 border-green-600'}`}
                                                        >
                                                            {therapist.available ? 'Disable' : 'Enable'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800">Shop Orders</h3>
                        <p className="text-sm text-gray-500">Manage customer orders and shipments.</p>
                    </div>
                    <div className="overflow-x-auto">
                        {ordersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No orders found.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Order ID</th>
                                        <th className="px-6 py-3 text-left">Customer</th>
                                        <th className="px-6 py-3 text-left">Items</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {order.id.slice(0, 8)}...
                                                <div className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{order.customer?.full_name || 'Guest'}</div>
                                                <div className="text-xs text-gray-500">{order.contact_email}</div>
                                                <div className="text-xs text-gray-400">{order.shipping_address}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {order.items?.map(item => (
                                                        <div key={item.id} className="text-xs flex justify-between gap-4">
                                                            <span>{item.quantity}x {item.product?.name || 'Unknown Product'}</span>
                                                            <span className="text-gray-400">{item.price_at_purchase} THB</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-brand-dark">
                                                {order.total_amount.toLocaleString()} THB
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    className="text-xs border border-gray-300 rounded p-1 outline-none focus:border-brand-teal"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ADD EXPENSE MODAL */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl font-bold text-brand-dark">Add New Expense</h3>
                            <button onClick={() => setShowExpenseModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleExpenseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-teal outline-none"
                                    placeholder="e.g. Stock refill"
                                    value={expenseForm.title}
                                    onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (THB)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-brand-teal outline-none"
                                        placeholder="0.00"
                                        value={expenseForm.amount}
                                        onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                    />
                                    <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-teal outline-none bg-white"
                                    value={expenseForm.category}
                                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                                >
                                    <option value="other">Other</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="supplies">Supplies</option>
                                    <option value="salary">Salary</option>
                                    <option value="commission">Commission</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attach Receipt</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setReceiptFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        {receiptFile ? (
                                            <>
                                                <CheckCircle className="text-green-500" size={24} />
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                                    {receiptFile.name}
                                                </span>
                                                <span className="text-xs text-green-600">File selected</span>
                                            </>
                                        ) : (
                                            <>
                                                <FileText size={24} />
                                                <span className="text-sm">Click to upload image or PDF</span>
                                                <span className="text-xs text-gray-400">(Required for Tax deduction)</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-brand-teal text-white rounded-lg font-bold hover:bg-brand-dark flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? <LoadingSpinner /> : <><Save size={18} /> Save Expense</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
