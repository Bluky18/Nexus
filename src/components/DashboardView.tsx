import React from 'react';
import { 
  BookOpen, 
  Briefcase, 
  HelpCircle, 
  Compass, 
  TrendingUp, 
  Coins, 
  MessageSquare, 
  ChevronRight,
  Plus,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Note, Commission, Doubt, LostFoundItem, StudentProfile } from '../types';

interface DashboardViewProps {
  notes: Note[];
  tasks: Commission[];
  doubts: Doubt[];
  lostFound: LostFoundItem[];
  profile: StudentProfile;
  setCurrentTab: (tab: string) => void;
  onOpenUploadNote: () => void;
  onOpenCreateTask: () => void;
  onOpenAskDoubt: () => void;
  onOpenPostItem: () => void;
}

export default function DashboardView({
  notes,
  tasks,
  doubts,
  lostFound,
  profile,
  setCurrentTab,
  onOpenUploadNote,
  onOpenCreateTask,
  onOpenAskDoubt,
  onOpenPostItem
}: DashboardViewProps) {
  // Toggle between student's personal activity metrics and campus-wide totals
  const [viewScope, setViewScope] = React.useState<'my' | 'campus'>('my');

  // Campus-wide stats calculations
  const openTasks = tasks.filter(t => t.status === 'open').length;
  const unansweredDoubts = doubts.filter(d => d.answers.length === 0).length;
  const pendingLostFound = lostFound.filter(i => i.status === 'found').length;

  // Student's personal activity metrics (isolated strictly to the authenticated student)
  const myNotes = notes.filter(n => 
    (profile?.id && (n.uploadedByUserId === profile.id || (n as any).uploader_id === profile.id)) ||
    (!n.uploadedByUserId && !(n as any).uploader_id && profile?.name && 
      (n.uploadedBy?.trim().toLowerCase() === profile.name.trim().toLowerCase() || 
       n.uploader_name?.trim().toLowerCase() === profile.name.trim().toLowerCase()) &&
      !n.uploadedBy?.includes('(Alumn') && !n.uploadedBy?.includes('(Faculty)')
    )
  );
  const myTasks = tasks.filter(t => 
    (profile?.id && (t.poster_id === profile.id || (t as any).acceptedBy_id === profile.id)) ||
    (!t.poster_id && !(t as any).acceptedBy_id && profile?.name && 
      (t.clientName?.trim().toLowerCase() === profile.name.trim().toLowerCase() || 
       t.acceptedBy?.trim().toLowerCase() === profile.name.trim().toLowerCase()) &&
      !t.acceptedBy?.includes('(Alumn')
    )
  );
  const myDoubts = doubts.filter(d => 
    (profile?.id && ((d as any).authorId === profile.id || (d as any).author_id === profile.id)) ||
    (!((d as any).authorId) && profile?.name && d.authorAnonymousName?.trim().toLowerCase() === profile.name.trim().toLowerCase())
  );
  const myLostFound = lostFound.filter(i => 
    (profile?.id && i.poster_id === profile.id) ||
    (!i.poster_id && profile?.email && i.contactEmail?.trim().toLowerCase() === profile.email.trim().toLowerCase())
  );

  const myTotalActivity = myNotes.length + myTasks.length + myDoubts.length + myLostFound.length;

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner section */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back, {profile.name}!</h1>
          <p className="text-xs text-text-secondary mt-1">
            {profile.college} • {profile.branch} • Semester {profile.semester}
          </p>

          {/* Activity Scope Switcher (My Activity vs Campus Community) */}
          <div className="mt-3.5 inline-flex items-center bg-bg-app border border-border-subtle p-0.5 rounded-lg text-xs font-medium">
            <button
              id="dash-scope-personal-btn"
              onClick={() => setViewScope('my')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'my'
                  ? 'bg-accent-primary text-white font-semibold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              My Activity ({myTotalActivity})
            </button>
            <button
              id="dash-scope-campus-btn"
              onClick={() => setViewScope('campus')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'campus'
                  ? 'bg-accent-primary text-white font-semibold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Campus Hub ({notes.length + openTasks})
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            id="dash-quick-note"
            onClick={onOpenUploadNote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} /> Upload Note
          </button>
          <button
            id="dash-quick-task"
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-bg-app hover:bg-bg-hover text-text-primary text-xs font-semibold rounded-lg border border-border-subtle shadow-xs hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} /> Post Task
          </button>
          <button
            id="dash-quick-doubt"
            onClick={onOpenAskDoubt}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-bg-app hover:bg-bg-hover text-text-primary text-xs font-semibold rounded-lg border border-border-subtle shadow-xs hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} /> Ask Doubt
          </button>
          <button
            id="dash-quick-lostfound"
            onClick={onOpenPostItem}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-bg-app hover:bg-bg-hover text-text-primary text-xs font-semibold rounded-lg border border-border-subtle shadow-xs hover:shadow-md hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <Plus size={14} /> Report Lost/Found
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Notes */}
        <div 
          onClick={() => setCurrentTab('notes')}
          className="bg-bg-surface border border-border-subtle rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 cursor-pointer hover:border-accent-primary/55 transition-all hover:shadow-xs group"
        >
          <div className="p-2 sm:p-2.5 rounded-lg bg-accent-primary/10 text-accent-primary shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              {viewScope === 'my' ? 'My Shared Notes' : 'Shared Notes'}
            </p>
            <h3 className="text-sm sm:text-lg font-bold text-text-primary truncate">
              {viewScope === 'my' ? `${myNotes.length} Files` : `${notes.length} Files`}
            </h3>
            <span className="text-[10px] text-text-secondary block mt-0.5 truncate">
              {viewScope === 'my' ? `${notes.length} campus files` : `${myNotes.length} by you`}
            </span>
          </div>
        </div>

        {/* Card 2: Tasks */}
        <div 
          onClick={() => setCurrentTab('tasks')}
          className="bg-bg-surface border border-border-subtle rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 cursor-pointer hover:border-color-success/55 transition-all hover:shadow-xs group"
        >
          <div className="p-2 sm:p-2.5 rounded-lg bg-color-success/10 text-color-success shrink-0 group-hover:scale-105 transition-transform">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              {viewScope === 'my' ? 'My Active Tasks' : 'Active Tasks'}
            </p>
            <h3 className="text-sm sm:text-lg font-bold text-text-primary truncate">
              {viewScope === 'my' ? `${myTasks.length} Active` : `${openTasks} Open`}
            </h3>
            <span className="text-[10px] text-text-secondary block mt-0.5 truncate">
              {viewScope === 'my' ? `${openTasks} open on board` : `${myTasks.length} by you`}
            </span>
          </div>
        </div>

        {/* Card 3: Doubts */}
        <div 
          onClick={() => setCurrentTab('doubt-box')}
          className="bg-bg-surface border border-border-subtle rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 cursor-pointer hover:border-yellow-500/55 transition-all hover:shadow-xs group"
        >
          <div className="p-2 sm:p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0 group-hover:scale-105 transition-transform">
            <HelpCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              {viewScope === 'my' ? 'My Asked Doubts' : 'Open Doubts'}
            </p>
            <h3 className="text-sm sm:text-lg font-bold text-text-primary truncate">
              {viewScope === 'my' ? `${myDoubts.length} Threads` : `${unansweredDoubts} Threads`}
            </h3>
            <span className="text-[10px] text-text-secondary block mt-0.5 truncate">
              {viewScope === 'my' ? `${unansweredDoubts} open on campus` : `${myDoubts.length} by you`}
            </span>
          </div>
        </div>

        {/* Card 4: Lost & Found */}
        <div 
          onClick={() => setCurrentTab('lost-found')}
          className="bg-bg-surface border border-border-subtle rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 cursor-pointer hover:border-pink-500/55 transition-all hover:shadow-xs group"
        >
          <div className="p-2 sm:p-2.5 rounded-lg bg-pink-500/10 text-pink-500 shrink-0 group-hover:scale-105 transition-transform">
            <Compass size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold text-text-secondary truncate">
              {viewScope === 'my' ? 'My Lost & Found' : 'Lost & Found'}
            </p>
            <h3 className="text-sm sm:text-lg font-bold text-text-primary truncate">
              {viewScope === 'my' ? `${myLostFound.length} Reports` : `${pendingLostFound} Unclaimed`}
            </h3>
            <span className="text-[10px] text-text-secondary block mt-0.5 truncate">
              {viewScope === 'my' ? `${pendingLostFound} at campus desk` : `${myLostFound.length} by you`}
            </span>
          </div>
        </div>
      </div>

      {/* User Stats/Reputation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">My Student Profile</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <span className="text-xs text-text-secondary">Academic Standing</span>
              <span className="text-xs font-semibold text-text-primary">{profile.branch} • Sem {profile.semester}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Award size={14} className="text-yellow-500" /> Platform Rating
              </span>
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                ★ {profile.rating} <span className="text-[10px] text-text-secondary font-normal">(5.0 max)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Coins size={14} className="text-color-success" /> Commission Earnings
              </span>
              <span className="text-xs font-semibold text-color-success">₹{profile.earnings}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <span className="text-xs text-text-secondary">Tasks Completed</span>
              <span className="text-xs font-semibold text-text-primary">{profile.completedTasksCount} Jobs</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-text-secondary">Uploaded Notes</span>
              <span className="text-xs font-semibold text-text-primary">{profile.uploadedNotesCount} Uploads</span>
            </div>
          </div>

          <button
            id="dash-view-full-profile"
            onClick={() => setCurrentTab('profile')}
            className="w-full text-center py-2 border border-border-subtle hover:bg-bg-hover text-xs font-semibold rounded-lg text-accent-primary transition-colors cursor-pointer"
          >
            View Full Profile History
          </button>
        </div>

        {/* Central Dashboard feed: Commission Board Overview */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Briefcase size={16} className="text-accent-primary" /> Active Commission Board
              </h2>
              <button 
                id="dash-goto-tasks"
                onClick={() => setCurrentTab('tasks')}
                className="text-xs text-accent-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                All tasks <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => setCurrentTab('tasks')}
                  className="p-3 bg-bg-app hover:bg-bg-hover rounded-lg border border-border-subtle flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary rounded">
                        {task.branch}
                      </span>
                      <span className="text-xs text-text-secondary">By {task.clientName}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-primary mt-1.5 truncate">{task.title}</h4>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{task.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-color-success block">₹{task.budget}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">Due {task.deadline}</span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-xs text-text-secondary py-4 text-center">No active commissions posted yet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center text-xs">
            <span className="text-text-secondary flex items-center gap-1">
              <ShieldCheck size={14} className="text-color-success" /> Commission terms are peer-regulated.
            </span>
            <button
              id="dash-post-commission-btn"
              onClick={onOpenCreateTask}
              className="text-accent-primary font-bold hover:underline cursor-pointer"
            >
              Post a commission +
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Note repository & Anonymous doubt box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Repository Snippet */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <BookOpen size={16} className="text-accent-primary" /> Premium Shared Notes
              </h2>
              <button 
                id="dash-goto-notes"
                onClick={() => setCurrentTab('notes')}
                className="text-xs text-accent-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Browse all <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notes.slice(0, 3).map((note) => (
                <div 
                  key={note.id}
                  onClick={() => setCurrentTab('notes')}
                  className="p-3 bg-bg-app hover:bg-bg-hover rounded-lg border border-border-subtle flex justify-between items-start transition-colors cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-text-primary truncate max-w-[200px] md:max-w-[250px]">{note.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-1">
                      {note.subject} • Sem {note.semester} • {note.fileType.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-accent-primary block">★ {note.rating}</span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">{note.upvotes} Upvotes</span>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-xs text-text-secondary py-4 text-center">No notes uploaded yet.</p>
              )}
            </div>
          </div>
          
          <button
            id="dash-upload-note-footer"
            onClick={onOpenUploadNote}
            className="w-full mt-4 text-center py-2 bg-bg-app hover:bg-bg-hover border border-border-subtle text-xs font-semibold rounded-lg text-text-primary transition-colors cursor-pointer"
          >
            Upload study materials +
          </button>
        </div>

        {/* Anonymous Doubt Box Snippet */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <HelpCircle size={16} className="text-yellow-500" /> Judgment-Free Doubt Box
              </h2>
              <button 
                id="dash-goto-doubts"
                onClick={() => setCurrentTab('doubt-box')}
                className="text-xs text-accent-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View details <ChevronRight size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {doubts.slice(0, 3).map((doubt) => (
                <div 
                  key={doubt.id}
                  onClick={() => setCurrentTab('doubt-box')}
                  className="p-3 bg-bg-app hover:bg-bg-hover rounded-lg border border-border-subtle flex justify-between items-center transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-bold text-text-primary truncate">{doubt.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-1">
                      By {doubt.authorAnonymousName} • {doubt.category}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <MessageSquare size={10} /> {doubt.answers.length}
                    </span>
                  </div>
                </div>
              ))}
              {doubts.length === 0 && (
                <p className="text-xs text-text-secondary py-4 text-center">No doubts posted yet.</p>
              )}
            </div>
          </div>

          <button
            id="dash-ask-doubt-footer"
            onClick={onOpenAskDoubt}
            className="w-full mt-4 text-center py-2 bg-bg-app hover:bg-bg-hover border border-border-subtle text-xs font-semibold rounded-lg text-text-primary transition-colors cursor-pointer"
          >
            Post an anonymous question +
          </button>
        </div>
      </div>

      {/* Lost and Found Bar Section */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <Compass size={16} className="text-pink-500" /> Recent Campus Lost & Found
          </h2>
          <button 
            id="dash-goto-lostfound"
            onClick={() => setCurrentTab('lost-found')}
            className="text-xs text-accent-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Browse Board <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {lostFound.slice(0, 3).map((item) => (
            <div 
              key={item.id}
              onClick={() => setCurrentTab('lost-found')}
              className="p-3.5 bg-bg-app hover:bg-bg-hover border border-border-subtle rounded-lg flex flex-col justify-between transition-all duration-150 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    item.status === 'found' 
                      ? 'bg-color-success/10 text-color-success' 
                      : item.status === 'lost' 
                      ? 'bg-color-danger/10 text-color-danger' 
                      : 'bg-text-secondary/10 text-text-secondary'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-text-secondary">{item.date}</span>
                </div>
                <h4 className="text-sm font-bold text-text-primary mt-2 truncate">{item.title}</h4>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between items-center text-[10px] text-text-secondary">
                <span className="truncate">At: {item.locationFound}</span>
                <span className="font-semibold text-accent-primary">{item.contactName}</span>
              </div>
            </div>
          ))}
          {lostFound.length === 0 && (
            <div className="col-span-3 text-xs text-text-secondary py-4 text-center">No campus lost or found items reported.</div>
          )}
        </div>
      </div>
    </div>
  );
}
