import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BarChart3, Crown, Trash2, Loader2, Shield, TrendingUp, Upload, Zap, AlertTriangle, ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [safetyLog, setSafetyLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  if (authLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" />;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, safeRes] = await Promise.all([
        api.get('/admin/users'), 
        api.get('/admin/stats'),
        api.get('/admin/safety')
      ]);
      setUsers(uRes.data);
      setStats(sRes.data);
      setSafetyLog(safeRes.data);
    } catch (_) {}
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const changeSub = async (userId, targetPlan) => {
    try {
      await api.patch(`/admin/users/${userId}/subscription`, { subscriptionType: targetPlan });
      setUsers(u => u.map(x => x._id === userId ? { ...x, subscriptionType: targetPlan } : x));
    } catch (_) {}
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure? This deletes the user and all their data.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(x => x._id !== userId));
    } catch (_) {}
  };

  const toggleBlock = async (userId, currentlyBlocked) => {
    if (!window.confirm(`Are you sure you want to ${currentlyBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/block`, { blocked: !currentlyBlocked });
      setUsers(u => u.map(x => x._id === userId ? { ...x, isBlocked: !currentlyBlocked } : x));
    } catch (_) {}
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-accent' },
    { label: 'Pro / Premium', value: `${stats.proUsers} / ${stats.premiumUsers}`, icon: Crown, color: 'text-accentAmber' },
    { label: 'Free Users', value: stats.freeUsers, icon: Users, color: 'text-gray-400' },
    { label: 'Safety Flags', value: stats.totalSafetyEvents || 0, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Analysis Runs', value: stats.totalResearch, icon: TrendingUp, color: 'text-accentPurple' },
  ] : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center gap-3 px-6 py-4 glass border-b border-white/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accentPurple/15 border border-accentPurple/20 flex items-center justify-center">
          <Shield size={16} className="text-accentPurple" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-gray-500">Logged in as {user.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statCards.map(({ label, value, icon: Icon, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass rounded-xl p-4"
                >
                  <Icon size={16} className={`${color} mb-2`} />
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/8 pb-0">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'safety', label: 'Safety Log', icon: AlertTriangle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all ${tab === id ? 'text-accent bg-accent/8 border-b-2 border-accent' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin text-accent" /> Loading...
            </div>
          ) : tab === 'users' ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status / Role</th>
                      <th>Plan</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td className="font-medium text-white">{u.email}</td>
                        <td>
                          <div className="flex gap-1.5">
                            {u.isBlocked ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-red-300 bg-red-400/10 border border-red-400/20">BLOCKED</span>
                            ) : u.role === 'ADMIN' ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-accentPurple bg-accentPurple/10 border border-accentPurple/20">ADMIN</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-gray-400 bg-white/5 border border-white/5">ACTIVE</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <select 
                            value={u.subscriptionType} 
                            onChange={(e) => changeSub(u._id, e.target.value)}
                            disabled={u.role === 'ADMIN'}
                            className={`text-xs px-2 py-1 rounded bg-dark border ${
                              u.subscriptionType === 'PREMIUM' ? 'text-accentAmber border-accentAmber/30' : 
                              u.subscriptionType === 'PRO' ? 'text-accent border-accent/30' : 'text-gray-400 border-white/10'
                            }`}
                          >
                            <option value="FREE">Free</option>
                            <option value="PRO">Pro</option>
                            <option value="PREMIUM">Premium</option>
                          </select>
                        </td>
                        <td className="text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            {u.role !== 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => toggleBlock(u._id, u.isBlocked)}
                                  className={`text-xs px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                                    u.isBlocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-400/10 text-red-300 hover:bg-red-400/20'
                                  }`}
                                  title={u.isBlocked ? 'Unblock user' : 'Block user'}
                                >
                                  {u.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                  onClick={() => deleteUser(u._id)}
                                  className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User Email</th>
                      <th>Severity & Type</th>
                      <th>Flagged Query</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safetyLog.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-gray-500 py-6">No safety events logged.</td></tr>
                    ) : safetyLog.map((log, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                        <td className="text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="text-gray-300">{log.email}</td>
                        <td>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            log.type === 'suicidal' ? 'text-accentPurple bg-accentPurple/10 border-accentPurple/20' :
                            log.type === 'abusive' ? 'text-accentAmber bg-accentAmber/10 border-accentAmber/20' :
                            'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {log.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-sm text-gray-300 max-w-md truncate" title={log.query}>
                          "{log.query}"
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
