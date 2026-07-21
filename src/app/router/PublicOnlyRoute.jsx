import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/auth.store';

export const PublicOnlyRoute = ({ children }) => {
    const { user, isAuthChecked } = useAuthStore();

    if (!isAuthChecked) return null;

    if (user) return <Navigate to="/" replace />;

    return children;
};