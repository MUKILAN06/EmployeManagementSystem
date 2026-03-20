import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter,
  X,
  Briefcase,
  Clock,
  Info
} from 'lucide-react';

const CalendarPage = () => {
  const [view, setView] = useState('monthly'); // monthly, weekly, work-week
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/calendar/tasks');
      setTasks(res.data.tasks || []);
      setLeaves(res.data.leaves || []);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'monthly') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'monthly') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const renderHeader = () => {
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    const weekFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    
    let title = monthFormatter.format(currentDate);
    if (view !== 'monthly') {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        title = weekFormatter.format(start) + " - " + weekFormatter.format(end) + ", " + start.getFullYear();
    }

    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-500" size={32} />
             Scheduler
          </h1>
          <p className="text-slate-500 mt-1">{title}</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setView('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setView('weekly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setView('work-week')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'work-week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Work Week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            Today
          </button>
          <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderMonthly = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-slate-100 bg-slate-50/50"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const dayDate = new Date(year, month, d);
      const dayTasks = tasks.filter(t => {
        const start = new Date(t.startDate);
        const end = new Date(t.endDate);
        const dDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return dDate >= sDate && dDate <= eDate;
      });

      const dayLeaves = leaves.filter(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const dDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return dDate >= sDate && dDate <= eDate;
      });
      
      days.push(
        <div key={d} className="h-32 border-b border-r border-slate-100 p-2 hover:bg-blue-50/30 transition-colors group relative overflow-y-auto">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600'}`}>
            {d}
          </span>
          <div className="mt-1 space-y-1">
            {dayLeaves.map(leave => (
              <div 
                key={`leave-${leave.id}`}
                className="p-1 text-[9px] bg-orange-100 text-orange-700 border border-orange-200 rounded-lg truncate font-bold"
                title={`Leave: ${leave.employee?.user?.firstName || leave.employee?.user?.username} - ${leave.reason}`}
              >
                  🌴 {leave.employee?.user?.firstName || leave.employee?.user?.username} (Leave)
              </div>
            ))}
            {dayTasks.map((task, idx) => {
              const user = task.assignedTo?.user;
              const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'N/A';
              
              return (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className={`p-2 text-[10px] leading-tight rounded-xl border truncate shadow-sm mb-1 cursor-pointer hover:scale-[1.02] transition-transform ${task.completed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-800 border-slate-200'}`}
                  title="Click to view details"
                >
                    <div className="font-bold text-blue-900 truncate">
                        {fullName}
                    </div>
                    <div className="text-[9px] text-slate-500 opacity-70">
                        by {task.assignedBy?.username || 'Admin'}
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {daysOfWeek.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const renderWeekly = (isWorkWeek = false) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const today = new Date();

    const displayDays = isWorkWeek ? daysOfWeek.slice(1, 6) : daysOfWeek;
    const startIndex = isWorkWeek ? 1 : 0;

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`grid ${isWorkWeek ? 'grid-cols-5' : 'grid-cols-7'} bg-slate-50 border-b border-slate-200`}>
          {displayDays.map((day, idx) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + startIndex + idx);
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div key={day} className="py-6 px-4 border-r border-slate-100 text-center flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</span>
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-black ${isToday ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-800'}`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`grid ${isWorkWeek ? 'grid-cols-5' : 'grid-cols-7'} h-[500px]`}>
          {displayDays.map((_, idx) => {
             const date = new Date(startOfWeek);
             date.setDate(startOfWeek.getDate() + startIndex + idx);
             
             const dayTasks = tasks.filter(t => {
                const start = new Date(t.startDate);
                const end = new Date(t.endDate);
                const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                return dDate >= sDate && dDate <= eDate;
             });

             const dayLeaves = leaves.filter(l => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const sDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const eDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                return dDate >= sDate && dDate <= eDate;
             });

             return (
              <div key={idx} className="border-r border-slate-100 p-4 space-y-3 bg-slate-50/20 overflow-y-auto">
                {dayLeaves.map(leave => (
                   <div key={`leave-w-${leave.id}`} className="p-2 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-[10px] font-bold">
                       🌴 {leave.employee?.user?.firstName || leave.employee?.user?.username} (On Leave)
                   </div>
                ))}
                {dayTasks.map(task => {
                  const user = task.assignedTo?.user;
                  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Unknown';

                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${task.completed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-200 shadow-sm'}`}
                    >
                      <div className="flex flex-col gap-0.5 mb-1">
                          <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <span className="text-[11px] font-extrabold text-slate-800 uppercase">
                                 {fullName}
                              </span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 opacity-70">
                              by {task.assignedBy?.username || 'Admin'}
                          </span>
                      </div>
                      <p className="font-bold text-xs truncate text-blue-600 mt-2">{task.title}</p>
                    </div>
                  );
                })}
                {dayTasks.length === 0 && (
                  <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-sm italic">
                    No events
                  </div>
                )}
              </div>
             );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {renderHeader()}
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {view === 'monthly' && renderMonthly()}
        {view === 'weekly' && renderWeekly()}
        {view === 'work-week' && renderWeekly(true)}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <Filter size={24} />
          </div>
          <div>
              <h4 className="font-bold text-blue-900">Custom Filtering Active</h4>
              <p className="text-blue-700 text-sm">Switch between Monthly, Weekly, and Work Week views to manage your schedule efficiently.</p>
          </div>
      </div>

      {/* Modern Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTask(null)}>
            <div 
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative">
                    <button 
                        onClick={() => setSelectedTask(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                            <Briefcase className="text-blue-400" size={24} />
                        </div>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase text-blue-300 border border-white/10">
                            Task Details
                        </span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight mb-2">{selectedTask.title}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Clock size={14} />
                        <span>Deadline: {new Date(selectedTask.endDate).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* User Info */}
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center font-black text-blue-600">
                                {selectedTask.assignedTo?.user?.username?.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Assigned To</p>
                                <p className="font-black text-slate-900">{selectedTask.assignedTo?.user?.firstName ? `${selectedTask.assignedTo.user.firstName} ${selectedTask.assignedTo.user.lastName || ''}` : selectedTask.assignedTo?.user?.username}</p>
                                <p className="text-[10px] text-blue-600 font-bold uppercase">{selectedTask.assignedTo?.department?.name || 'Freelance'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Assigned By</p>
                           <p className="font-bold text-slate-700 italic border-b-2 border-blue-100 inline-block">{selectedTask.assignedBy?.username || 'Admin'}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
                            <Info size={14} className="text-blue-500" />
                            <span>Description</span>
                        </h4>
                        <div className="bg-white border-l-4 border-blue-500 p-4 rounded-r-2xl text-sm text-slate-600 leading-relaxed shadow-sm">
                            {selectedTask.description}
                        </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(selectedTask.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">End Date</p>
                            <p className="text-sm font-bold text-red-700">{new Date(selectedTask.endDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Status Footer */}
                    <div className={`p-4 rounded-2xl text-center font-black uppercase tracking-widest text-xs border ${selectedTask.completed ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                        Status: {selectedTask.completed ? 'Completed' : 'Pending Deployment'}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
