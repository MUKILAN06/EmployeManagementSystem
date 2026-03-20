import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Users, Building, Calendar, AlertCircle, Shield, Workflow, UserCheck, Mail, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <div className="p-10 text-center animate-pulse">Loading Analytics...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  const roleData = stats ? Object.entries(stats.roleDistribution).map(([name, value]) => ({ name, value })) : [];

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );

  const UserTable = ({ title, icon: Icon, data, columns, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              {columns.map(col => (
                <th key={col} className="text-left py-4 px-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? data.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {item.username.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700">{item.username}</span>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Mail size={14} />
                    {item.email}
                  </div>
                </td>
                {item.manager && (
                  <td className="py-4 px-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold ring-1 ring-blue-100">
                      {item.manager}
                    </span>
                  </td>
                )}
                {item.department && (
                  <td className="py-4 px-2">
                    <span className="text-slate-500 font-semibold text-sm">{item.department}</span>
                  </td>
                )}
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Clock size={14} />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400 font-medium">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Building} label="Departments" value={stats.totalDepartments} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Calendar} label="Pending Leaves" value={stats.pendingLeaves} color="bg-orange-50 text-orange-600" />
        <StatCard icon={AlertCircle} label="System Users" value={stats.totalUsers} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
           <h3 className="text-xl font-bold mb-8 text-slate-800">Role Distribution</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
           </div>
           <div className="flex justify-center gap-6 mt-4">
              {roleData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-500">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
           <h3 className="text-xl font-bold mb-8 text-slate-800">Growth Overview</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <UserTable 
              title="HR Personnel" 
              icon={Shield} 
              data={stats.hrList} 
              columns={['Name', 'Email', 'Created Date']} 
              color="bg-blue-50 text-blue-600"
            />
            <UserTable 
              title="Managers" 
              icon={Workflow} 
              data={stats.managerList} 
              columns={['Name', 'Email', 'Created Date']} 
              color="bg-indigo-50 text-indigo-600"
            />
          </div>
          <UserTable 
            title="Employee Directory" 
            icon={UserCheck} 
            data={stats.employeeList} 
            columns={['Name', 'Email', 'Manager', 'Department', 'Created Date']} 
            color="bg-emerald-50 text-emerald-600"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
