import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Coffee } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              SmartMess
            </span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground opacity-80">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-secondary/80 transition flex items-center shadow-sm"
              >
                <LogOut className="h-5 w-5 text-destructive" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
