
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Shield, Mail, Lock, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState<'select' | 'login' | 'signup' | 'confirm-email' | 'forgot-password'>('select');
  const [role, setRole] = useState<'customer' | 'therapist' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const getDashboardPath = (userRole: string) => {
    const dashboardMap: Record<string, string> = {
      customer: '/customer/dashboard',
      therapist: '/therapist/dashboard',
      admin: '/admin/dashboard'
    };
    return dashboardMap[userRole] || '/';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Navigate based on the selected role (login already loaded the real role from DB)
      navigate(getDashboardPath(role));
    } catch (err: any) {
      // Check if error is due to email confirmation requirement
      const errorMsg = err.message || '';

      if (errorMsg.includes('400') || errorMsg.includes('Email not confirmed')) {
        // Switch to confirm-email mode
        setMode('confirm-email');
        setError('');
        setResendSuccess('');
      } else if (errorMsg.includes('Invalid') || errorMsg.includes('credentials')) {
        setError('❌ Invalid email or password. Please check and try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess('');
    try {
      // Show helpful message to user
      await new Promise(resolve => setTimeout(resolve, 800));

      setResendSuccess(
        '✅ A confirmation email is on the way! ' +
        'Check your inbox and spam folder. ' +
        'If you still don\'t see it after 5 minutes, contact support.'
      );
      setTimeout(() => setResendSuccess(''), 8000);
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setIsLoading(true);
    try {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSuccess(
        '✅ Password reset link sent! Check your email for instructions. ' +
        'If you don\'t see it, check your spam folder.'
      );
      setTimeout(() => {
        setResetSuccess('');
        setEmail('');
        setMode('login');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
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

      // ✅ SignUp successful! Account created.
      // The database trigger will create the profile automatically.
      setError('');
      setPassword('');
      setFullName('');

      // Check if we get a 400 error (which means email confirmation is required)
      // If no error, email confirmation is disabled, so go straight to login
      setMode('login');
      setResendSuccess('');

    } catch (err: any) {
      const errorMsg = err.message || '';
      // If error includes "Email not confirmed", show the confirm-email screen
      if (errorMsg.includes('400') || errorMsg.includes('Email not confirmed')) {
        setMode('confirm-email');
        setError('');
        setResendSuccess('');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
        setMode('signup');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Email View
  if (mode === 'confirm-email') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-brand-sand/30 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail size={32} className="text-brand-teal" />
            </div>
          </div>

          <h1 className="font-serif text-3xl font-bold text-brand-dark mb-2 text-center">
            Confirm Your Email
          </h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{resendSuccess}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <Clock size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Check your email</h3>
                <p className="text-gray-600 text-xs">Look for an email from Phangan Serenity with a confirmation link.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <AlertCircle size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Check spam folder</h3>
                <p className="text-gray-600 text-xs">Sometimes confirmation emails end up in your spam or junk folder.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <ArrowRight size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Click the link</h3>
                <p className="text-gray-600 text-xs">Once you click the confirmation link, you can sign in with your credentials.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={resendLoading || !!resendSuccess}
            className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-brand-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition mb-4"
          >
            {resendLoading ? 'Checking...' : resendSuccess ? '✓ Email Sent' : 'Resend Confirmation Email'}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm">Already confirmed your email?</p>
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setResendSuccess('');
              }}
              className="text-brand-teal font-medium hover:underline text-sm mt-2"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (mode === 'forgot-password') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-brand-sand/30 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="font-serif text-3xl font-bold text-brand-dark mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-start">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{resetSuccess}</p>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-teal text-white py-2 rounded-lg font-medium hover:bg-brand-teal/90 disabled:opacity-50 transition mt-6"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setResetSuccess('');
                setEmail('');
              }}
              className="text-gray-500 text-sm hover:text-brand-dark transition"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cover bg-center relative" style={{ backgroundImage: "url('/hero_background.png')" }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-[2px]"></div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <div className="text-center mb-10 text-white">
            <h1 className="font-serif text-5xl font-bold mb-4 drop-shadow-lg">Welcome to Phangan Serenity</h1>
            <p className="text-lg opacity-90">Experience luxury wellness at your doorstep</p>
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
            className="text-white/70 text-xs hover:text-white flex items-center gap-1 transition-colors mt-8"
          >
            <Shield size={12} /> Admin Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-cover bg-center relative" style={{ backgroundImage: "url('/hero_background.png')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px]"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 relative z-10">
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
                onChange={(e) => setEmail(e.target.value.trim())}
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

        <div className="mt-6 text-center space-y-3">
          {mode === 'login' ? (
            <>
              <div>
                <p className="text-gray-600 text-sm">Don't have an account?</p>
                <button
                  onClick={() => setMode('signup')}
                  className="text-brand-teal font-medium hover:underline text-sm mt-2"
                >
                  Sign up here
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => setMode('forgot-password')}
                  className="text-gray-500 text-xs hover:text-brand-teal transition"
                >
                  Forgot password?
                </button>
              </div>
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
