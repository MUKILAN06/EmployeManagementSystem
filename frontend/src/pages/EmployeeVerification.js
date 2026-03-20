import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, Check } from 'lucide-react';

const EmployeeVerification = () => {
  const [unverified, setUnverified] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    managerId: '',
    departmentId: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [uRes, mRes, dRes] = await Promise.all([
      api.get('/hr/verification/pending'),
      api.get('/hr/managers'),
      api.get('/departments')
    ]);
    setUnverified(uRes.data);
    setManagers(mRes.data);
    setDepartments(dRes.data);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!formData.managerId || !formData.departmentId || !formData.designation) {
      alert('Please fill in all fields: Manager, Department, and Designation.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/hr/verification/approve', {
        userId: selectedUser.id,
        managerId: parseInt(formData.managerId, 10),
        departmentId: parseInt(formData.departmentId, 10),
        designation: formData.designation
      });
      alert(`Employee "${selectedUser.username}" verified successfully!`);
      setSelectedUser(null);
      setFormData({ managerId: '', departmentId: '', designation: '' });
      fetchData();
    } catch (err) {
      const msg = err?.response?.data || 'Error verifying employee';
      alert(typeof msg === 'string' ? msg : 'Error verifying employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Verification Queue</h1>
        <p className="text-slate-500">Approve pending employee registrations and assign managers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-700 px-2">Pending Requests ({unverified.length})</h3>
          {unverified.map((user) => (
            <div 
                key={user.id} 
                className={`bg-white p-6 rounded-3xl shadow-sm border transition-all cursor-pointer ${
                    selectedUser?.id === user.id ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-bold text-xl">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{user.username}</h4>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                {selectedUser?.id === user.id && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">SELECTED</div>
                )}
              </div>
            </div>
          ))}
          {unverified.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-medium">No pending verifications</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 sticky top-8">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Approval Details</h3>
            {selectedUser ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl mb-6">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Verifying</p>
                    <p className="font-bold text-slate-800">{selectedUser.username}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Assign Manager</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Department</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  <span>{loading ? 'Processing...' : 'Approve & Create'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p>Select an employee from the queue to process their registration.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeVerification;
