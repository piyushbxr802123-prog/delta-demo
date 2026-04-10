import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'manager' ? '/manager' : '/student'} replace />;

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to={user ? (user.role === 'manager' ? '/manager' : '/student') : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
