import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/auth.store.js';

export const ProtectedRoute = ({ children }) => {
    const { user, isAuthChecked } = useAuthStore();

    if (!isAuthChecked) return null;

    if (!user) return <Navigate to="/login" replace />;

    return children;
};