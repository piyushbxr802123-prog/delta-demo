import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QrCode, Send, History, Wallet } from 'lucide-react';

export default function StudentDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [history, setHistory] = useState([]);
  const [payAmount, setPayAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRoll, setTransferRoll] = useState('');
  const [activeTab, setActiveTab] = useState('pay');

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const meRes = await axios.get('http://localhost:4005/api/users/me', config);
      setBalance(meRes.data.balance);
      setUser({ ...user, balance: meRes.data.balance });
      
      const histRes = await axios.get('http://localhost:4005/api/transactions/history', config);
      setHistory(histRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token]);

  useEffect(() => {
    if (socket) {
      socket.on('studentCalled', (calledStudent) => {
        if (calledStudent.rollNumber === user.rollNumber) {
          toast.success('Your food is ready! Please collect at the counter.', { duration: 5000, icon: '🥣' });
        }
      });
    }
    return () => {
      if (socket) socket.off('studentCalled');
    };
  }, [socket, user]);

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('http://localhost:4005/api/transactions/pay', { amount: Number(payAmount) }, config);
      toast.success('Payment successful! Added to queue.');
      setBalance(res.data.newBalance);
      setPayAmount('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post('http://localhost:4005/api/transactions/transfer', { 
        amount: Number(transferAmount),
        receiverRollNumber: transferRoll
      }, config);
      toast.success('Transfer successful!');
      setBalance(res.data.newBalance);
      setTransferAmount('');
      setTransferRoll('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  // Progress Bar calculation (Assuming ₹2000 is monthly allowance max for visuals)
  const maxBalance = 2000;
  const progressPercent = Math.min((balance / maxBalance) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Balance Card */}
      <div className="glass-card mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex items-center space-x-4 mb-4">
          <Wallet className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-medium text-foreground/80">Available Balance</h2>
        </div>
        <p className="text-5xl font-bold text-foreground mb-6">₹{balance}</p>
        
        <div className="w-full bg-secondary rounded-full h-3 mb-2 overflow-hidden border border-white/5">
          <div 
            className="animated-gradient h-3 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-sm border-white/60 text-right text-foreground/60">{progressPercent.toFixed(0)}% of monthly budget</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex space-x-2 bg-secondary/50 p-1 rounded-xl backdrop-blur-md border border-white/5">
            <button 
              onClick={() => setActiveTab('pay')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'pay' ? 'bg-primary text-white shadow-md' : 'text-foreground/70 hover:text-foreground'}`}
            >
              Scan & Pay
            </button>
            <button 
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'transfer' ? 'bg-primary text-white shadow-md' : 'text-foreground/70 hover:text-foreground'}`}
            >
              Transfer
            </button>
          </div>

          <div className="glass-card">
            {activeTab === 'pay' ? (
              <form onSubmit={handlePay} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 animate-pulse">
                    <QrCode className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <p className="text-center text-sm text-foreground/60 mb-4">Simulated QR Scanner. Enter amount below.</p>
                <div>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-center text-xl font-semibold"
                    placeholder="₹ Amount"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95">
                  Confirm Payment
                </button>
              </form>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                    <Send className="h-16 w-16 text-accent" />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={transferRoll}
                    onChange={(e) => setTransferRoll(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none mb-3"
                    placeholder="Recipient Roll Number"
                    required
                  />
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    placeholder="₹ Amount"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95">
                  Send Money
                </button>
              </form>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="glass-card h-full">
            <div className="flex items-center space-x-2 mb-6">
              <History className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
            </div>
            
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-foreground/50 text-center py-8">No recent transactions</p>
              ) : (
                history.map((tx) => {
                  const isSender = tx.sender?._id === user._id || tx.sender === user._id;
                  const isCredit = tx.type === 'credit';
                  const isPayment = tx.type === 'payment';
                  
                  let title = '';
                  if (isCredit) title = 'Monthly Credit';
                  else if (isPayment) title = 'Mess Payment';
                  else if (isSender) title = `Transfer to ${tx.receiver?.rollNumber}`;
                  else title = `Received from ${tx.sender?.rollNumber}`;

                  const amountSign = isSender && !isCredit ? '-' : '+';
                  const amountColor = isSender && !isCredit ? 'text-foreground' : 'text-success';

                  return (
                    <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition">
                      <div>
                        <p className="font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-foreground/50">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <div className={`font-bold ${amountColor}`}>
                        {amountSign}₹{tx.amount}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
