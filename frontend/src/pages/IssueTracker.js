import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Plus, Send, MessageSquare, ShieldCheck, CheckCircle2, RefreshCw, X, Clock, Calendar, Search } from 'lucide-react';

const IssueTracker = () => {
  const { user } = useAuth();
  const [reportedIssues, setReportedIssues] = useState([]);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetRole: 'HR' // Default
  });
  const [loading, setLoading] = useState(false);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState(null);

  const [showAllReported, setShowAllReported] = useState(false);

  useEffect(() => {
    fetchIssues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIssues = async () => {
    try {
      const myRes = await api.get('/issues/my-reported');
      setReportedIssues(myRes.data);

      if (user?.role !== 'EMPLOYEE') {
        const assignedRes = await api.get('/issues/assigned-to-me');
        setAssignedIssues(assignedRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.post(`/issues/update-status/${id}?status=${status}`);
      fetchIssues();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const openCompleteModal = (id) => {
    setActiveIssueId(id);
    setCompleteModalOpen(true);
  };

  const handleCompleteIssue = async (e) => {
    e.preventDefault();
    if (!resolutionAction.trim()) return;
    try {
      await api.post(`/issues/update-status/${activeIssueId}?status=COMPLETED&resolutionAction=${encodeURIComponent(resolutionAction)}`);
      setCompleteModalOpen(false);
      setResolutionAction('');
      fetchIssues();
    } catch (err) {
      alert('Error completing issue');
    }
  };

  const openDetailModal = (issue) => {
    setActiveIssue(issue);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/issues/create', formData);
      setFormData({ title: '', description: '', targetRole: 'HR' });
      fetchIssues();
    } catch (err) {
      alert('Error creating issue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      case 'VERIFYING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'PENDING': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTargetRoles = () => {
    switch (user?.role) {
      case 'EMPLOYEE': return ['HR', 'MANAGER', 'ADMIN'];
      case 'HR': return ['MANAGER', 'ADMIN'];
      case 'MANAGER': return ['ADMIN'];
      case 'ADMIN': return ['HR', 'MANAGER', 'EMPLOYEE'];
      default: return [];
    }
  };

  const targetRoles = getTargetRoles();

  useEffect(() => {
    if (targetRoles.length > 0) {
      setFormData(prev => ({ ...prev, targetRole: targetRoles[0] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Issue Tracker</h1>
          <p className="text-slate-500 font-medium tracking-tight">Report concerns and track resolution status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl text-white">
              <Plus size={20} />
            </div>
            <span className="text-slate-900">New Entry</span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
              <input
                type="text"
                required
                placeholder="What's the issue?"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assign To (Role)</label>
              <select
                required
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              >
                {targetRoles.map(role => (
                   <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
              <textarea
                required
                rows={4}
                placeholder="Provide more details..."
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
              disabled={loading}
            >
              <Send size={18} />
              <span>Report Issue</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Assigned Issues for HR/Admin/Manager */}
          {user?.role !== 'EMPLOYEE' && assignedIssues.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 px-2 flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-xl text-white">
                  <ShieldCheck size={20} />
                </div>
                <span>Issues For My Role</span>
              </h3>
              <div className="grid gap-6">
                {assignedIssues.map(issue => (
                  <div key={issue.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 group transition-all hover:border-blue-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className={`p-5 rounded-2xl self-start ${issue.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        <AlertCircle size={28} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-extrabold text-xl text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{issue.title}</h4>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border uppercase ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed">{issue.description}</p>
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                          <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                             Reported by: {issue.reportedBy.username}
                          </div>
                          <div className="flex items-center gap-2">
                            {issue.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateStatus(issue.id, 'VERIFYING')}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all"
                              >
                                <RefreshCw size={14} /> Start Verifying
                              </button>
                            )}
                            {issue.status === 'VERIFYING' && (
                              <button 
                                onClick={() => openCompleteModal(issue.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all"
                              >
                                <CheckCircle2 size={14} /> Complete Issue
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reported Issues (History) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 px-2 flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl text-white">
                <MessageSquare size={20} />
              </div>
              <span>My Reported Issues</span>
            </h3>
            <div className="grid gap-6">
              {(showAllReported ? reportedIssues : reportedIssues.slice(-3)).map(issue => (
                <div 
                  key={issue.id} 
                  onClick={() => issue.status === 'COMPLETED' ? openDetailModal(issue) : null}
                  className={`bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col md:flex-row items-start gap-6 ${issue.status === 'COMPLETED' ? 'cursor-pointer hover:border-blue-200 transition-all group' : ''}`}
                >
                   <div className={`p-5 rounded-2xl ${issue.status === 'COMPLETED' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      <AlertCircle size={28} />
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={`font-extrabold text-xl text-slate-900 ${issue.status === 'COMPLETED' ? 'text-slate-400 line-through' : ''}`}>{issue.title}</h4>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest border uppercase ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium leading-relaxed">{issue.description}</p>
                       <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex gap-4 items-center">
                            <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                               Assigned to: {issue.targetRole}
                            </div>
                            {issue.status === 'COMPLETED' && (
                              <div className="text-[11px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Search size={12} /> View Details
                              </div>
                            )}
                         </div>
                         {issue.assignedTo && (
                           <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                             Resolver: {issue.assignedTo.username}
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
              
              {!showAllReported && reportedIssues.length > 3 && (
                <button 
                  onClick={() => setShowAllReported(true)}
                  className="w-full py-4 mt-2 bg-slate-50 text-slate-600 font-bold rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
                >
                  <MessageSquare size={16} /> View Issue History
                </button>
              )}

              {showAllReported && reportedIssues.length > 3 && (
                <button 
                  onClick={() => setShowAllReported(false)}
                  className="w-full py-4 mt-2 bg-slate-50 text-slate-600 font-bold rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
                >
                  Show Less
                </button>
              )}

              {reportedIssues.length === 0 && assignedIssues.length === 0 && (
                <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No recorded issues found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Issue Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">Complete Issue</h3>
                <button onClick={() => setCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCompleteIssue} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Resolution Action Taken</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how the issue was resolved..."
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                    value={resolutionAction}
                    onChange={(e) => setResolutionAction(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200"
                >
                  <CheckCircle2 size={18} />
                  <span>Submit Completion</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Detail Modal (for issuer) */}
      {detailModalOpen && activeIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Issue Details</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Status Report</p>
                </div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-2 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</h4>
                <p className="text-xl font-bold text-slate-900">{activeIssue.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle size={12}/> Target Role</h4>
                  <p className="font-bold text-slate-800">{activeIssue.targetRole}</p>
                </div>
                {activeIssue.assignedTo && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle size={12}/> Resolver</h4>
                    <p className="font-bold text-slate-800">{activeIssue.assignedTo.username}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Reported At</span>
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 py-2 px-3 rounded-xl inline-block border border-slate-100 shadow-sm">
                      {activeIssue.reportedAt ? new Date(activeIssue.reportedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Verifying At</span>
                    <p className="text-sm font-semibold text-slate-800 bg-amber-50 py-2 px-3 rounded-xl inline-block border border-amber-100 shadow-sm text-amber-900">
                      {activeIssue.verifyingAt ? new Date(activeIssue.verifyingAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Resolved At</span>
                    <p className="text-sm font-semibold text-slate-800 bg-green-50 py-2 px-3 rounded-xl inline-block border border-green-100 shadow-sm text-green-900">
                      {activeIssue.resolvedAt ? new Date(activeIssue.resolvedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {activeIssue.resolutionAction && (
                <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100">
                  <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1"><MessageSquare size={12}/> Resolution Action</h4>
                  <p className="text-blue-900 font-medium whitespace-pre-wrap">{activeIssue.resolutionAction}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTracker;
