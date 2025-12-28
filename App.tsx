
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Simple Route Guard
// Fix: Added optional operator '?' to children to resolve TS error: 
// Property 'children' is missing in type '{ role: "client"; }' but required in type '{ children: React.ReactNode; role: "admin" | "client"; }'
const ProtectedRoute = ({ children, role }: { children?: React.ReactNode, role: 'admin' | 'client' }) => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return <Navigate to="/" replace />;
  
  const user = JSON.parse(userStr);
  if (user.role !== role) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
