import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get authentication state from Redux store
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user is not authorized for this route, redirect to their home
    const homePaths = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      parent: '/parent/dashboard'
    };

    return <Navigate to={homePaths[user?.role] || '/'} replace />;
  }
  
  return children;
};

export default ProtectedRoute;