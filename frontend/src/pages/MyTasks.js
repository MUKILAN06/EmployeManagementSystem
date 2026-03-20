import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, Clock } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/employee/tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      await api.post(`/employee/task/complete/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Error marking task as complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">My Assignment Board</h1>
        <p className="text-slate-500">Track and complete your assigned responsibilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Clock size={14} />
            <span>Active Tasks ({tasks.filter(t => !t.completed).length})</span>
          </h3>
          <div className="space-y-4">
            {tasks.filter(t => !t.completed).map(task => (
              <div key={task.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 group hover:ring-4 hover:ring-blue-500/5 transition-all">
                <h4 className="text-xl font-bold text-slate-800 mb-2">{task.title}</h4>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{task.description}</p>
                <button
                  onClick={() => handleComplete(task.id)}
                  disabled={loading}
                  className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>Mark as Completed</span>
                </button>
              </div>
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                 <p className="text-slate-400">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            <span>Completed</span>
          </h3>
          <div className="space-y-4">
            {tasks.filter(t => t.completed).map(task => (
              <div key={task.id} className="bg-white/50 p-6 rounded-[2rem] border border-slate-200 opacity-70">
                <h4 className="text-lg font-bold text-slate-400 line-through mb-1">{task.title}</h4>
                <p className="text-xs text-slate-400">Completed at {task.assignedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
