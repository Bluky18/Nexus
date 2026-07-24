import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Coins, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  X, 
  CheckCircle,
  FileText,
  User,
  ShieldAlert,
  Grid,
  List,
  Trash2
} from 'lucide-react';
import { Commission, StudentProfile } from '../types';

interface TasksViewProps {
  tasks: Commission[];
  setTasks: React.Dispatch<React.SetStateAction<Commission[]>>;
  searchQuery: string;
  onIncreaseCompletedTasks: (earnings: number) => void;
  token?: string | null;
  profile?: StudentProfile;
}

export default function TasksView({
  tasks,
  setTasks,
  searchQuery,
  onIncreaseCompletedTasks,
  token,
  profile
}: TasksViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posted' | 'my-accepted'>('feed');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newBranch, setNewBranch] = useState('Computer Science');
  const [newDescription, setNewDescription] = useState('');

  // Report Modal
  const [reportingTaskId, setReportingTaskId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState('Academic Dishonesty');
  const [reportOtherText, setReportOtherText] = useState('');

  const branches = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Applied Sciences', 'Mechanical'];

  // Sync parent search query if any
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Load tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch('/api/v1/tasks', { headers });
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((t: any) => ({
            ...t,
            id: t.task_id || t.id,
            budget: t.price || t.budget,
            clientName: t.clientName || 'Harshit Kataram',
            clientRating: t.clientRating || 4.8,
            reported: t.reported || false
          }));
          setTasks(formatted);
        }
      } catch (err) {
        console.warn('API fetch tasks failed, falling back to local state:', err);
      }
    };
    fetchTasks();
  }, [setTasks, token]);

  const handleAcceptTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status: 'accepted',
          acceptedBy: 'Me'
        };
      }
      return task;
    }));
  };

  const handleCompleteTask = (id: string, budget: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return {
          ...task,
          status: 'completed'
        };
      }
      return task;
    }));
    onIncreaseCompletedTasks(budget);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this commission task as an administrator?")) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId && t.task_id !== taskId));
      } else {
        const errData = await response.json();
        alert(`Failed to delete commission task: ${errData.error || response.statusText}`);
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleReport = async (id: string | null) => {
    if (!id) return;
    const finalReason = reportCategory === 'Other' ? reportOtherText : reportCategory;
    if (!finalReason.trim()) return;

    if (token) {
      try {
        await fetch(`/api/v1/tasks/${id}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: finalReason })
        });
      } catch (err) {
        console.error("Failed to post report to backend:", err);
      }
    }

    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return { ...task, reported: true, reportReason: finalReason };
      }
      return task;
    }));
    setReportingTaskId(null);
    setReportCategory('Academic Dishonesty');
    setReportOtherText('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetVal = parseInt(newBudget);
    if (!newTitle.trim() || isNaN(budgetVal) || !newDeadline) return;

    const payload = {
      title: newTitle,
      description: newDescription || 'Need assistance with structured code review and analytical diagram preparation.',
      price: budgetVal,
      deadline: newDeadline,
      status: 'open' as const,
      poster_id: profile?.id || 'harshit_kataram',
      branch: newBranch,
      clientName: profile?.name || 'Harshit Kataram',
      clientRating: 4.9
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const createdTask = await response.json();
        const formatted = {
          ...createdTask,
          id: createdTask.task_id || createdTask.id,
          budget: createdTask.price || createdTask.budget
        };
        setTasks(prev => [formatted, ...prev]);
      } else {
        const fallbackTask: Commission = {
          id: `task-${Date.now()}`,
          task_id: `task-${Date.now()}`,
          ...payload,
          budget: budgetVal,
          reported: false
        };
        setTasks(prev => [fallbackTask, ...prev]);
      }
    } catch (err) {
      console.warn('API Post task failed, using local fallback:', err);
      const fallbackTask: Commission = {
        id: `task-${Date.now()}`,
        task_id: `task-${Date.now()}`,
        ...payload,
        budget: budgetVal,
        reported: false
      };
      setTasks(prev => [fallbackTask, ...prev]);
    }

    setNewTitle('');
    setNewBudget('');
    setNewDeadline('');
    setNewDescription('');
    setIsCreateOpen(false);
  };

  // Derived filtered tasks according to 3-way tab privacy layout rules:
  // - Feed: Publicly available open tasks (hide accepted ones to make them private as requested)
  // - My Posted: Tasks created by current user
  // - My Accepted: Tasks accepted by current user
  const visibleTasks = tasks.filter(task => {
    // Hide reported tasks unless created by current user
    const isOwner = task.poster_id === profile?.id || task.clientName === profile?.name || task.poster_id === 'harshit_kataram';
    if (task.reported && !isOwner) return false;

    if (activeTab === 'feed') {
      return task.status === 'open';
    } else if (activeTab === 'my-posted') {
      return isOwner;
    } else if (activeTab === 'my-accepted') {
      return task.acceptedBy === 'Me' || task.acceptedBy === profile?.id;
    }
    return true;
  });

  const searchedAndFilteredTasks = visibleTasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(localSearchQuery.toLowerCase());

    const matchesBranch = selectedBranch === 'All' || task.branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  // Calculate counts for badges
  const feedCount = tasks.filter(t => t.status === 'open' && (!t.reported || t.clientName === 'Harshit Kataram')).length;
  const postedCount = tasks.filter(t => t.poster_id === profile?.id || t.clientName === profile?.name || t.poster_id === 'harshit_kataram').length;
  const acceptedCount = tasks.filter(t => t.acceptedBy === 'Me' || t.acceptedBy === profile?.id).length;

  return (
    <div id="tasks-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* MD3 Header and Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="text-color-success" size={22} /> Student Commission Board
          </h1>
        </div>
        <button
          id="open-task-modal-btn"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={16} /> Post Task Commission
        </button>
      </div>

      {/* SEARCH BAR & FILTER DROPDOWN AT THE TOP */}
      <div className="bg-surface border border-border-subtle rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 w-full">
        {/* Search Bar (Left) */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <Search size={15} />
          </span>
          <input
            id="tasks-search-input-inline"
            type="text"
            placeholder="Search commissions, skills, or clients..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            id="task-branch-filter-inline"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full sm:w-auto px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
          >
            {branches.map(b => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Domains' : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-WAY TAB NAVIGATION BAR WITH MD3 STYLE & RESPONSIVE LAYOUT */}
      <div className="border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 sm:pb-0">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-2 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'feed'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Available Jobs
            <span className="text-[10px] bg-bg-app border border-border-subtle text-text-secondary px-1.5 py-0.2 rounded-full font-semibold">
              {feedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my-posted')}
            className={`px-3 py-2 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'my-posted'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            My Posted
            <span className="text-[10px] bg-bg-app border border-border-subtle text-text-secondary px-1.5 py-0.2 rounded-full font-semibold">
              {postedCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('my-accepted')}
            className={`px-3 py-2 text-xs font-bold transition-all relative flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'my-accepted'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            My Accepted
            <span className="text-[10px] bg-bg-app border border-border-subtle text-text-secondary px-1.5 py-0.2 rounded-full font-semibold">
              {acceptedCount}
            </span>
          </button>
        </div>

        {/* List/Grid toggler */}
        <div className="flex rounded-lg border border-border-subtle p-0.5 bg-surface mb-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Grid view"
          >
            <Grid size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* COMMISSIONS VIEW CARDS / LIST */}
      {viewMode === 'list' ? (
        /* HIGH-DENSITY LIST LAYOUT */
        <div className="space-y-3">
          {searchedAndFilteredTasks.map((task) => {
            const priceVal = task.price || task.budget;
            return (
              <div
                key={task.id}
                id={`task-list-item-${task.id}`}
                className="bg-surface border border-border-subtle hover:border-accent-primary/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Left Side: Title, Meta, and Desc */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary rounded-md">
                      {task.branch}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      task.status === 'open' 
                        ? 'bg-color-success/10 text-color-success' 
                        : task.status === 'accepted' 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'bg-text-secondary/10 text-text-secondary'
                    }`}>
                      {task.status === 'open' ? 'Open' : task.status === 'accepted' ? 'Claimed' : 'Completed'}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-text-primary">{task.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-1">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary flex items-center gap-1">
                      <User size={12} /> {task.clientName}
                    </span>
                    <span>• ★ {task.clientRating} rating</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Deadline: <strong className="text-text-primary">{task.deadline}</strong>
                    </span>
                    {task.acceptedBy && (
                      <span className="text-xs">Worker: <strong className="text-text-primary">{task.acceptedBy === 'Me' ? 'You' : task.acceptedBy}</strong></span>
                    )}
                  </div>
                </div>

                {/* Right Side: Price Badge and Accept Button */}
                <div className="flex items-center gap-4 justify-between md:justify-end flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-color-success/10 text-color-success text-sm font-extrabold border border-color-success/25">
                    ₹{priceVal}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Report action button */}
                    <button
                      id={`report-task-btn-${task.id}`}
                      onClick={() => setReportingTaskId(task.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-color-danger hover:bg-color-danger/10 transition-colors border border-border-subtle cursor-pointer"
                      title="Report Task"
                    >
                      <AlertTriangle size={14} />
                    </button>

                    {/* Accept/Action states */}
                    {task.status === 'open' && task.clientName !== 'Harshit Kataram' && (
                      <button
                        id={`accept-task-btn-${task.id}`}
                        onClick={() => handleAcceptTask(task.id)}
                        className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        Accept Task
                      </button>
                    )}

                    {task.status === 'accepted' && task.acceptedBy === 'Me' && (
                      <button
                        id={`complete-task-btn-${task.id}`}
                        onClick={() => handleCompleteTask(task.id, priceVal)}
                        className="flex items-center gap-1 px-4 py-2 bg-color-success hover:bg-opacity-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle size={14} /> Mark as Completed
                      </button>
                    )}

                    {task.status === 'completed' && (
                      <div className="text-xs text-text-secondary flex items-center gap-1 py-1 px-2.5 bg-bg-app border border-border-subtle rounded-lg">
                        <CheckCircle size={12} className="text-color-success" /> Settled
                      </div>
                    )}

                    {task.clientName === 'Harshit Kataram' && task.status === 'open' && (
                      <span className="text-xs text-text-secondary italic px-2 py-1 bg-bg-app border border-border-subtle rounded-lg">
                        Your post
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {searchedAndFilteredTasks.length === 0 && (
            <div className="text-center py-12 bg-surface border border-border-subtle rounded-xl w-full">
              <Briefcase size={40} className="mx-auto text-text-secondary/40" />
              <h3 className="text-sm font-semibold text-text-primary mt-3">No commissions match active filters</h3>
              <p className="text-xs text-text-secondary mt-1">Try switching tabs or adjusting search query.</p>
            </div>
          )}
        </div>
      ) : (
        /* GRID CARDS LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchedAndFilteredTasks.map((task) => (
            <div 
              key={task.id}
              id={`task-card-${task.id}`}
              className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary rounded-md">
                    {task.branch}
                  </span>
                  
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    task.status === 'open' 
                      ? 'bg-color-success/10 text-color-success' 
                      : task.status === 'accepted' 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-text-secondary/10 text-text-secondary'
                  }`}>
                    {task.status === 'open' ? 'Open for Bid' : task.status === 'accepted' ? 'Assigned' : 'Completed'}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4 mt-3">
                  <h3 className="text-base font-bold text-text-primary line-clamp-2">{task.title}</h3>
                  <span className="text-lg font-black text-color-success flex-shrink-0">₹{task.price || task.budget}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary flex items-center gap-1">
                    <User size={12} /> {task.clientName}
                  </span>
                  <span>• ★ {task.clientRating} rating</span>
                </div>

                <p className="text-xs text-text-secondary mt-3 leading-relaxed">{task.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Deadline: <strong className="text-text-primary">{task.deadline}</strong>
                  </span>
                  {task.acceptedBy && (
                    <span className="text-xs">Worker: <strong className="text-text-primary">{task.acceptedBy === 'Me' ? 'You' : task.acceptedBy}</strong></span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4">
                  {/* Report button */}
                  <button
                    id={`report-task-${task.id}`}
                    onClick={() => setReportingTaskId(task.id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-color-danger hover:bg-color-danger/10 transition-colors border border-border-subtle cursor-pointer"
                    title="Report Task"
                  >
                    <AlertTriangle size={14} />
                  </button>

                  {/* State-driven Task Actions */}
                  {task.status === 'open' && task.clientName !== 'Harshit Kataram' && (
                    <button
                      id={`accept-task-btn-${task.id}`}
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Accept Task
                    </button>
                  )}

                  {task.status === 'accepted' && task.acceptedBy === 'Me' && (
                    <button
                      id={`complete-task-btn-${task.id}`}
                      onClick={() => handleCompleteTask(task.id, task.price || task.budget)}
                      className="flex items-center gap-1 px-4 py-2 bg-color-success hover:bg-opacity-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <CheckCircle size={14} /> Mark as Completed
                    </button>
                  )}

                  {task.status === 'completed' && (
                    <div className="text-xs text-text-secondary flex items-center gap-1.5 py-1.5">
                      <CheckCircle size={14} className="text-color-success" /> Commission successfully settled.
                    </div>
                  )}

                  {task.clientName === 'Harshit Kataram' && task.status === 'open' && (
                    <span className="text-xs text-text-secondary italic py-1">Your posted listing</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {searchedAndFilteredTasks.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-surface border border-border-subtle rounded-xl">
              <Briefcase size={40} className="mx-auto text-text-secondary/40" />
              <h3 className="text-sm font-semibold text-text-primary mt-3">No commissions match active filters</h3>
              <p className="text-xs text-text-secondary mt-1">Try switching tabs or adjusting search query.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Briefcase size={18} className="text-color-success" /> Post Task Commission
              </h2>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Task Title</label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  placeholder="e.g., Python Matplotlib Graphs & calculations lab helper"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Compensation (INR)</label>
                  <input
                    id="task-budget-input"
                    type="number"
                    required
                    placeholder="e.g., 500"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Deadline Date</label>
                  <input
                    id="task-deadline-input"
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Academic Department / Branch</label>
                <select
                  id="task-branch-input"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  {branches.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Detailed Task Instructions</label>
                <textarea
                  id="task-desc-input"
                  rows={4}
                  placeholder="Specify files provided, expected output format, and academic restrictions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-text-secondary leading-normal">
                  Nexus promotes peer learning help. Committing plagiarism, copy-pasting code directly, or listing exam-cheating tasks violate college policies and will lead to an immediate ban.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-task-btn"
                  type="submit"
                  className="px-4 py-2 bg-color-success hover:bg-opacity-95 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Broadcast Commission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MD3 REPORT CLASSIFICATION MODAL */}
      {reportingTaskId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle size={16} className="text-color-danger animate-pulse" /> Report Listing
              </h3>
              <button 
                onClick={() => {
                  setReportingTaskId(null);
                  setReportCategory('Academic Dishonesty');
                  setReportOtherText('');
                }}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Select Infraction Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full p-2 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  <option value="Academic Dishonesty">Academic Dishonesty / Cheating</option>
                  <option value="Spam or Scam">Spam or Scam</option>
                  <option value="Fake Budget or Underpaying">Fake Budget or Underpaying</option>
                  <option value="Inappropriate Language">Inappropriate Language</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>

              {reportCategory === 'Other' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Additional Context</label>
                  <textarea
                    rows={3}
                    value={reportOtherText}
                    onChange={(e) => setReportOtherText(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full p-2 text-xs bg-app border border-border-subtle rounded-lg focus:outline-hidden text-text-primary placeholder-text-secondary"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setReportingTaskId(null);
                  setReportCategory('Academic Dishonesty');
                  setReportOtherText('');
                }}
                className="px-4 py-2 border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportingTaskId)}
                className="px-4 py-2 bg-color-danger hover:opacity-90 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
