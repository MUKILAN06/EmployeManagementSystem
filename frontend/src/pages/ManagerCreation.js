import React, { useState } from 'react';
import api from '../services/api';
import { UserPlus, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ManagerCreation = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'MANAGER'
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/hr/manager/create', formData);
      setMessage({ type: 'success', text: 'Manager account created successfully!' });
      setFormData({ username: '', email: '', password: '', role: 'MANAGER' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error creating account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Add New Manager</h1>
            <p className="text-slate-500 font-medium">Create a managerial account for the system.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {message && (
            <div className={`p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {message.type === 'success' ? <CheckCircle size={24} className="flex-shrink-0" /> : <AlertCircle size={24} className="flex-shrink-0" />}
              <span className="font-semibold text-sm leading-tight">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 block uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. john_doe"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 ml-1 block uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 ml-1 block uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400 pr-14"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 tracking-widest uppercase text-sm"
          >
            {loading ? 'Creating Account...' : 'Add Manager Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerCreation;
