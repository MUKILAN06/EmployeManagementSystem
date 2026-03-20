import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Send, Users, ClipboardList } from 'lucide-react';

const TaskAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToId: '',
    startDate: '',
    endDate: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
        try {
            const res = await api.get('/manager/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/manager/task/assign', formData);
      alert('Task assigned successfully!');
      setFormData({ title: '', description: '', assignedToId: '', startDate: '', endDate: '' });
    } catch (err) {
      alert('Error assigning task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-4 bg-purple-100 text-purple-600 rounded-3xl">
          <Briefcase size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Task Assignment</h1>
          <p className="text-slate-500">Assign workloads to your team members.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList size={20} className="text-purple-400" />
                <span>New Task Details</span>
            </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q1 Financial Report Audit"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Assign To Team Member</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Users size={18} />
                </div>
                <select
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none bg-white"
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                >
                    <option value="">Select an Employee</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.user?.firstName || emp.user?.username} ({emp.department?.name})
                        </option>
                    ))}
                </select>
            </div>
            <p className="text-xs text-slate-400 mt-1 italic">Only employees in your department are listed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Deadline (End Date)</label>
                <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              required
              rows={5}
              placeholder="Provide detailed instructions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Send size={20} />
            <span>{loading ? 'Assigning...' : 'Assign Task to Employee'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskAssignment;
