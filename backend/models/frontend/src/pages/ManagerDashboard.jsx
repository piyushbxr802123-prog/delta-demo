import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, BellRing, History, Search } from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useContext(AuthContext);
  const { socket, queue } = useContext(SocketContext);
  const [history, setHistory] = useState([]);
  const [searchRoll, setSearchRoll] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const fetchHistory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:4005/api/transactions/manager/history', config);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load history');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchHistory();
    }
  }, [user?.token]);

  const handleCallNext = () => {
    if (socket && queue.length > 0) {
      socket.emit('callNext');
      toast.success('Next student called!');
      // fetchHistory doesn't necessarily change with call Next, but wait, payments are recorded on student click.
    } else {
      toast.error('Queue is empty');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRoll) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`http://localhost:4005/api/users/search/${searchRoll}`, config);
      setSearchResult(res.data);
    } catch (err) {
      setSearchResult(null);
      toast.error('Student not found');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-foreground/60 mt-1">Live Mess Counter Queue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Active Queue Section */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Active Queue</h2>
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold ml-2">
                {queue.length}
              </span>
            </div>
            <button 
              onClick={handleCallNext}
              disabled={queue.length === 0}
              className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg font-medium hover:bg-success/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BellRing className="h-4 w-4" />
              <span>Call Next</span>
            </button>
          </div>

          <div className="space-y-3">
            {queue.length === 0 ? (
              <p className="text-center text-foreground/50 py-8">No students in queue currently.</p>
            ) : (
              queue.map((item, index) => (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition ${index === 0 ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-secondary/30 border-white/5'}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-white ${index === 0 ? 'bg-primary' : 'bg-secondary border border-white/10'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.studentName}</p>
                      <p className="text-xs text-foreground/60">{item.rollNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{item.amount}</p>
                    <p className="text-xs text-foreground/40">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student Search Section */}
        <div className="glass-card h-full">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Student Search</h2>
          </div>
          
          <form onSubmit={handleSearch} className="flex space-x-2 mb-6">
            <input
              type="text"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="flex-1 px-4 py-2 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter Roll Number"
            />
            <button type="submit" className="px-4 py-2 bg-secondary border border-white/10 rounded-xl hover:bg-secondary/80 transition">
              Search
            </button>
          </form>

          {searchResult && (
            <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-bold text-lg">{searchResult.name}</h3>
              <p className="text-sm text-foreground/70">Role: <span className="capitalize">{searchResult.role}</span></p>
              <p className="text-sm text-foreground/70">Roll No: {searchResult.rollNumber}</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-foreground/70 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-primary">₹{searchResult.balance}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Transaction History */}
      <div className="glass-card">
        <div className="flex items-center space-x-2 mb-6">
          <History className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">All Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 font-medium text-foreground/70 text-sm">Date/Time</th>
                <th className="py-3 px-4 font-medium text-foreground/70 text-sm">Type</th>
                <th className="py-3 px-4 font-medium text-foreground/70 text-sm">Amount</th>
                <th className="py-3 px-4 font-medium text-foreground/70 text-sm">Sender</th>
                <th className="py-3 px-4 font-medium text-foreground/70 text-sm">Receiver</th>
              </tr>
            </thead>
            <tbody>
              {history.map((tx) => (
                <tr key={tx._id} className="border-b border-white/5 hover:bg-secondary/20 transition">
                  <td className="py-3 px-4 text-sm text-foreground/80">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize
                      ${tx.type === 'payment' ? 'bg-primary/20 text-primary' : 
                        tx.type === 'transfer' ? 'bg-accent/20 text-accent' : 
                        'bg-success/20 text-success'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">₹{tx.amount}</td>
                  <td className="py-3 px-4 text-sm">{tx.sender?.rollNumber || 'SYSTEM'}</td>
                  <td className="py-3 px-4 text-sm">{tx.receiver?.rollNumber || 'MESS'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
