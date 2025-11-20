
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState<'select' | 'login' | 'signup'>('select');
  const [role, setRole] = useState<'customer' | 'therapist' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      const dashboardMap = {
        customer: '/customer/dashboard',
        therapist: '/therapist/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardMap[role]);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signUp(email, password, { fullName, role });
      // After signup, log them in automatically
      await login(email, password);
      const dashboardMap = {
        customer: '/customer/dashboard',
        therapist: '/therapist/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardMap[role]);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-brand-sand/30">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-brand-dark mb-2">Welcome to Phangan Serenity</h1>
          <p className="text-gray-600">Please select your account type</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
          {/* Customer */}
          <button
            onClick={() => { setRole('customer'); setMode('login'); }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-teal transition-all group text-left"
          >
            <div className="w-14 h-14 bg-brand-light rounded-full flex items-center justify-center text-brand-teal mb-4 group-hover:scale-110 transition-transform">
              <User size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Customer</h2>
            <p className="text-sm text-gray-500">Book massages, manage bookings, and view history.</p>
          </button>

          {/* Therapist */}
          <button
            onClick={() => { setRole('therapist'); setMode('login'); }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-teal transition-all group text-left"
          >
            <div className="w-14 h-14 bg-brand-dark rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Therapist</h2>
            <p className="text-sm text-gray-500">Manage your schedule and booking requests.</p>
          </button>
        </div>

        {/* Admin Link */}
        <button
          onClick={() => { setRole('admin'); setMode('login'); }}
          className="text-gray-400 text-xs hover:text-brand-dark flex items-center gap-1 transition-colors"
        >
          <Shield size={12} /> Admin Access
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-brand-sand/30 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <button
          onClick={() => setMode('select')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <h1 className="font-serif text-3xl font-bold text-brand-dark mb-2">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {role === 'customer' && 'Customer account'}
          {role === 'therapist' && 'Therapist account'}
          {role === 'admin' && 'Admin account'}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">Min 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-brand-teal/90 disabled:opacity-50 transition mt-6"
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <>
              <p className="text-gray-600 text-sm">Don't have an account?</p>
              <button
                onClick={() => setMode('signup')}
                className="text-brand-teal font-medium hover:underline text-sm mt-2"
              >
                Sign up here
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm">Already have an account?</p>
              <button
                onClick={() => setMode('login')}
                className="text-brand-teal font-medium hover:underline text-sm mt-2"
              >
                Sign in instead
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
