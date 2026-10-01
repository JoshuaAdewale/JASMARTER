import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Wrap a route to require auth (and optionally a specific role).
 *   <ProtectedRoute roles={['admin']}><AdminPage/></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
