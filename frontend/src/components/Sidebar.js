import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserPlus,
  Calendar, 
  Briefcase, 
  AlertCircle, 
  Banknote,
  LogOut,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = {
    ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/employee-creation', label: 'Create Employee', icon: UserPlus },
      { path: '/admin/hr-creation', label: 'Create HR', icon: UserCheck },
      { path: '/admin/departments', label: 'Departments', icon: Briefcase },
      { path: '/admin/issues', label: 'Issues', icon: AlertCircle },
      { path: '/chat', label: 'Community Chat', icon: MessageCircle },
      { path: '/calendar', label: 'Calendar', icon: Calendar },
    ],
    HR: [
      { path: '/hr', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/hr/verification', label: 'Verification', icon: UserCheck },
      { path: '/hr/manager-creation', label: 'Add Manager', icon: UserPlus },
      { path: '/hr/leaves', label: 'Leaves', icon: Calendar },
      { path: '/hr/salaries', label: 'Salaries', icon: Banknote },
      { path: '/hr/issues', label: 'Issues', icon: AlertCircle },
      { path: '/chat', label: 'Community Chat', icon: MessageCircle },
      { path: '/calendar', label: 'Calendar', icon: Calendar },
    ],
    MANAGER: [
      { path: '/manager', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/manager/tasks', label: 'Assign Tasks', icon: Briefcase },
      { path: '/manager/leaves', label: 'Leave Requests', icon: Calendar },
      { path: '/manager/issues', label: 'Issues', icon: AlertCircle },
      { path: '/chat', label: 'Community Chat', icon: MessageCircle },
      { path: '/calendar', label: 'Calendar', icon: Calendar },
    ],
    EMPLOYEE: [
      { path: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/employee/apply-leave', label: 'Apply Leave', icon: Calendar },
      { path: '/employee/tasks', label: 'My Tasks', icon: Briefcase },
      { path: '/employee/salary', label: 'My Salary', icon: Banknote },
      { path: '/employee/issues', label: 'Issues', icon: AlertCircle },
      { path: '/chat', label: 'Community Chat', icon: MessageCircle },
      { path: '/calendar', label: 'Calendar', icon: Calendar },
    ]
  };

  const navItems = menuItems[user?.role] || [];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">E</div>
        <span className="text-xl font-bold tracking-tight">EMS Pro</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
