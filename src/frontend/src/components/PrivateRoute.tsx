import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: JSX.Element;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Redirect to the login page if the user is not authenticated
        return <Navigate to="/signin" replace />;
    }

    return children;
}
