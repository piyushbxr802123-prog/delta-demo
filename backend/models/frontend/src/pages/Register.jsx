import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    password: '',
    role: 'student'
  });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(formData);
      toast.success('Registration successful!');
      if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/student');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
          <p className="text-foreground/60 mt-2">Get started with SmartMess</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1">
              Roll Number
            </label>
            <input
              type="text"
              value={formData.rollNumber}
              onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="e.g. 2023CS101"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground tracking-wide mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-foreground"
            >
              <option value="student" className="bg-secondary text-foreground">Student</option>
              <option value="manager" className="bg-secondary text-foreground">Mess Manager</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-foreground/60">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
