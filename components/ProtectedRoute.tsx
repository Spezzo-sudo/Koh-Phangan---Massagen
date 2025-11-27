import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { UserRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!isAuthenticated || !user) {
        // Redirect to login, saving the attempted location
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        // Redirect to their appropriate dashboard or home
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'staff') return <Navigate to="/therapist/dashboard" replace />;
        if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;

        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
