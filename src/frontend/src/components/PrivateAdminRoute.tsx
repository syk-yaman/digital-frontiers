import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateAdminRouteProps {
    children: JSX.Element;
}

export function PrivateAdminRoute({ children }: PrivateAdminRouteProps) {
    const token = localStorage.getItem('authToken');
    const authContext = useContext(AuthContext);
    const isAdmin = authContext?.user?.isAdmin ?? false;
    console.log('isAdmin:', token);
    if (token && !isAdmin) {
        // Redirect to the login page if the user is not authenticated
        return <Navigate to="/" replace />;
    }

    return children;
}
