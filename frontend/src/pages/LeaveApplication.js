import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Send, History, Clock } from 'lucide-react';

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/employee/leaves');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching leave history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/employee/leave/request', formData);
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchHistory();
      alert('Leave request submitted successfully!');
    } catch (err) {
      const msg = err?.response?.data || 'Error applying for leave';
      alert(typeof msg === 'string' ? msg : 'Error applying for leave');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING_HR: 'bg-orange-100 text-orange-700 border-orange-200',
    PENDING_MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 sticky top-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-bold">Apply Leave</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reason</label>
              <textarea
                required
                rows={4}
                placeholder="e.g. Family emergency, Vacation..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-8">
            <History size={24} className="text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800">My Leave History</h2>
        </div>
        <div className="space-y-4">
          {history.map((leave) => (
            <div key={leave.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${statusColors[leave.status]?.split(' ')[0] || 'bg-slate-100'}`}>
                   <Clock size={20} className={statusColors[leave.status]?.split(' ')[1] || 'text-slate-500'} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{leave.startDate} to {leave.endDate}</h4>
                  <p className="text-sm text-slate-500">{leave.reason}</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusColors[leave.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {leave.status?.replace('_', ' ')}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
               <p className="text-slate-400 font-medium">No leave history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;
