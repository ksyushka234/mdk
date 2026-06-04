// src/components/PrivateRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;