import React from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  roles?: string[];
  children: React.ReactElement;
};

function getAuth() {
  try {
    const raw = localStorage.getItem('sirg_auth');
    if (!raw) return null;
    return JSON.parse(raw) as { token?: string; roles?: string[] } | null;
  } catch {
    return null;
  }
}

export const PrivateRoute: React.FC<Props> = ({ roles, children }) => {
  const auth = getAuth();
  if (!auth || !auth.token) return <Navigate to="/login" replace />;
  if (!roles || roles.length === 0) return children;
  const userRoles = Array.isArray(auth.roles) ? auth.roles : [];
  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
