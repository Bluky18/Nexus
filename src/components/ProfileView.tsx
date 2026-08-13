import React from 'react';
import { 
  User, 
  Award, 
  BookMarked,
  Shield,
  Edit3
} from 'lucide-react';
import { StudentProfile, Note, Commission } from '../types';

interface ProfileViewProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  notes: Note[];
  tasks: Commission[];
  theme: 'light' | 'dark';
  onThemeToggle: (newTheme: 'light' | 'dark') => void;
  onLogout: () => void;
  setCurrentTab?: (tab: string) => void;
}

export default function ProfileView({
  profile,
  notes,
  tasks,
  setCurrentTab
}: ProfileViewProps) {
  // Filter lists to items owned or worked on by this user
  const userUploadedNotes = notes.filter(n => n.uploadedBy === 'Harshit Kataram');
  const userClaimedCommissions = tasks.filter(t => t.acceptedBy === 'Me');

  const ratingHistory = [
    { id: 1, rater: "Aditya Roy (IT Sem 4)", rating: 5, date: "2026-07-09", comment: "Excellent documentation on Dijkstra calculations!" },
    { id: 2, rater: "Neha Sawant (CS Sem 6)", rating: 5, date: "2026-07-11", comment: "Completed the React component suite way ahead of deadline." },
    { id: 3, rater: "Rahul G. (Applied Sci)", rating: 4.8, date: "2026-07-12", comment: "Solves Physics lab calculations with detailed steps." }
  ];

  return (
    <div id="profile-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Profile/Settings MD3 Header */}
      <div className="flex border-b border-border-subtle items-center justify-between pb-3 gap-2 flex-wrap">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <User className="text-accent-primary" size={22} /> Student Academic Profile
        </h1>

        {/* Global Admin hub indicator (visible only if isAdmin) */}
        {profile.isAdmin && (
          <span className="flex items-center gap-1 bg-color-danger/10 text-color-danger border border-color-danger/25 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <Shield size={11} className="fill-color-danger/5" /> Admin Account
          </span>
        )}
      </div>

      <div className="space-y-6 animate-fade-in">
        
        {/* Profile Header card */}
        <div className="bg-surface border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary flex items-center justify-center text-white text-2xl font-black shadow-xs animate-pulse">
              {profile.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 flex-wrap">
                {profile.name}
                <span className="text-[10px] bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Gold Student Contributor
                </span>
              </h2>
              <p className="text-xs text-text-secondary">
                {profile.college} • Roll No: {profile.rollNo} • Division: {profile.division}
              </p>
              <p className="text-[10px] font-mono text-text-secondary bg-app border border-border-subtle inline-block px-1.5 py-0.5 rounded">
                Board Seat No: {profile.seatNo}
              </p>
            </div>
          </div>

          <button
            id="profile-goto-settings-btn"
            onClick={() => setCurrentTab && setCurrentTab('settings')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border-subtle bg-app hover:bg-bg-hover text-text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95"
          >
            <Edit3 size={13} /> Update Academic Record
          </button>
        </div>

        {/* Grid of Profile Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Total Income</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold text-color-success">₹{profile.earnings}</span>
              <span className="text-[10px] text-text-secondary">earned</span>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Academic Help Rating</span>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xl font-bold text-text-primary">★ {profile.rating}</span>
              <span className="text-[10px] text-text-secondary">(Verified)</span>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Commissions Done</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold text-text-primary">{profile.completedTasksCount}</span>
              <span className="text-[10px] text-text-secondary">jobs done</span>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Repository Uploads</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xl font-bold text-text-primary">{profile.uploadedNotesCount}</span>
              <span className="text-[10px] text-text-secondary">files shared</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: reputation reviews */}
          <div className="lg:col-span-1 bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 pb-3 border-b border-border-subtle">
              <Award size={15} className="text-yellow-500" /> Reputation feedback
            </h2>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
              {ratingHistory.map(review => (
                <div key={review.id} className="space-y-1.5 p-3 bg-app/40 rounded-lg border border-border-subtle/50 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary">
                    <span className="font-semibold text-text-primary">{review.rater}</span>
                    <span>{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-500 font-bold">
                    ★ {review.rating}
                  </div>
                  <p className="text-text-secondary italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: personal contributions logs */}
          <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 pb-3 border-b border-border-subtle">
              <BookMarked size={15} className="text-accent-primary" /> Personal Contribution Logs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* My Uploaded Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary border-b border-border-subtle pb-1">Notes Shared ({userUploadedNotes.length})</h3>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {userUploadedNotes.map(n => (
                    <div key={n.id} className="p-2.5 bg-app rounded-md border border-border-subtle text-xs flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-primary truncate">{n.title}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{n.subject} • {n.downloads} DLs</p>
                      </div>
                    </div>
                  ))}
                  {userUploadedNotes.length === 0 && (
                    <p className="text-xs text-text-secondary italic py-4">No notes shared yet.</p>
                  )}
                </div>
              </div>

              {/* My Claimed Commissions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-primary border-b border-border-subtle pb-1">Commissions Taken ({userClaimedCommissions.length})</h3>
                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {userClaimedCommissions.map(c => (
                    <div key={c.id} className="p-2.5 bg-app rounded-md border border-border-subtle text-xs flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-primary truncate">{c.title}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Budget: ₹{c.budget} • Status: <strong className="text-accent-primary capitalize">{c.status}</strong></p>
                      </div>
                    </div>
                  ))}
                  {userClaimedCommissions.length === 0 && (
                    <p className="text-xs text-text-secondary italic py-4">No commission contracts active.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
