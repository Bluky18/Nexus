import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Check, 
  Lock, 
  Moon, 
  Sun, 
  Activity, 
  LogOut,
  Settings as SettingsIcon,
  Shield,
  Key,
  Copy
} from 'lucide-react';
import { StudentProfile } from '../types';
import { API_URL } from '../config';

interface SettingsViewProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  theme: 'light' | 'dark';
  onThemeToggle: (newTheme: 'light' | 'dark') => void;
  onLogout: () => void;
  setCurrentTab?: (tab: string) => void;
}

export default function SettingsView({
  profile,
  setProfile,
  theme,
  onThemeToggle,
  onLogout,
  setCurrentTab
}: SettingsViewProps) {
  // Academic Settings Form State (Prepopulated from profile)
  const [editName, setEditName] = useState(profile.name);
  const [editBranch, setEditBranch] = useState(profile.branch);
  const [editSemester, setEditSemester] = useState(profile.semester.toString());
  const [editSeatNo, setEditSeatNo] = useState(profile.seatNo);
  const [editCollege, setEditCollege] = useState(profile.college);
  const [editDivision, setEditDivision] = useState(profile.division || '');
  const [editRollNo, setEditRollNo] = useState(profile.rollNo || '');
  const [isSavedNotify, setIsSavedNotify] = useState(false);

  // Simulated Security/Account settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPassSavedNotify, setIsPassSavedNotify] = useState(false);
  const [copiedSession, setCopiedSession] = useState(false);

  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Applied Sciences', 'Mechanical'];

  // Sync with profile changes if any
  useEffect(() => {
    setEditName(profile.name);
    setEditBranch(profile.branch);
    setEditSemester(profile.semester.toString());
    setEditSeatNo(profile.seatNo);
    setEditCollege(profile.college);
    setEditDivision(profile.division || '');
    setEditRollNo(profile.rollNo || '');
  }, [profile]);

  const handleSaveAcademicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: StudentProfile = {
      ...profile,
      name: editName,
      branch: editBranch,
      semester: parseInt(editSemester),
      seatNo: editSeatNo,
      college: editCollege,
      division: editDivision.trim(),
      rollNo: editRollNo.trim()
    };
    setProfile(updatedProfile);
    localStorage.setItem('nexus_profile', JSON.stringify(updatedProfile));

    const token = localStorage.getItem('nexus_token');
    if (token) {
      fetch(`${API_URL}/api/v1/user/profile/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          branch: editBranch,
          semester: parseInt(editSemester),
          seatNo: editSeatNo,
          college: editCollege,
          division: editDivision.trim(),
          rollNo: editRollNo.trim()
        })
      }).catch(err => console.error('Failed to sync academic settings to backend:', err));
    }

    setIsSavedNotify(true);
    setTimeout(() => setIsSavedNotify(false), 3000);
  };

  const handleChangePasswordSimulated = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsPassSavedNotify(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setIsPassSavedNotify(false), 3000);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <SettingsIcon className="text-accent-primary" size={22} /> Settings & Preferences
          </h1>
          <p className="text-xs text-text-secondary mt-1">Configure your personal profile, credentials, account security, and visual options.</p>
        </div>
        {profile.isAdmin && (
          <span className="flex items-center gap-1 bg-color-danger/10 text-color-danger border border-color-danger/25 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <Shield size={11} className="fill-color-danger/5" /> Admin Mode
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left Side Settings forms (Col: 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Academic Settings Form */}
          <form onSubmit={handleSaveAcademicSettings} className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-2 border-b border-border-subtle flex items-center gap-1.5">
              <Sliders size={14} className="text-accent-primary" /> Edit Academic Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Full Student Name</label>
                <input
                  id="edit-name-input"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">College / University Name</label>
                <input
                  id="edit-college-input"
                  type="text"
                  required
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Academic Department</label>
                <select
                  id="edit-branch-input"
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Current Semester</label>
                <select
                  id="edit-semester-input"
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Board Seat / Student ID</label>
                <input
                  id="edit-seatno-input"
                  type="text"
                  required
                  value={editSeatNo}
                  onChange={(e) => setEditSeatNo(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Division (Optional)</label>
                <input
                  id="edit-division-input"
                  type="text"
                  placeholder="e.g. A, B, or leave blank"
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Class Roll No (Optional)</label>
                <input
                  id="edit-rollno-input"
                  type="text"
                  placeholder="e.g. 24, 45, or leave blank"
                  value={editRollNo}
                  onChange={(e) => setEditRollNo(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedNotify ? (
                <span className="text-xs text-color-success font-semibold flex items-center gap-1">
                  <Check size={14} /> Student records updated successfully!
                </span>
              ) : <span />}
              
              <button
                id="save-settings-btn"
                type="submit"
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} /> Save Academic Record
              </button>
            </div>
          </form>

          {/* Security Passwords Settings */}
          <form onSubmit={handleChangePasswordSimulated} className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-2 border-b border-border-subtle flex items-center gap-1.5">
              <Lock size={14} className="text-yellow-500" /> Account Security Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">New Secure Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {isPassSavedNotify ? (
                <span className="text-xs text-color-success font-semibold flex items-center gap-1">
                  <Check size={14} /> Password updated successfully!
                </span>
              ) : <span className="text-[10px] text-text-secondary italic">Ensure you use at least 8 characters.</span>}
              
              <button
                type="submit"
                disabled={!currentPassword || !newPassword}
                className="px-4 py-2 bg-app hover:bg-bg-hover disabled:opacity-50 border border-border-subtle text-text-primary text-xs font-bold rounded-lg transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>

        </div>

        {/* Right Side Settings cards (Col: 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Visual Customizations Preference Card */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-2 border-b border-border-subtle flex items-center gap-1.5">
              {theme === 'dark' ? <Moon size={14} className="text-yellow-500" /> : <Sun size={14} className="text-yellow-500" />} Layout & Customization
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-app/40 border border-border-subtle/50 rounded-lg">
                <div>
                  <p className="font-semibold text-text-primary">Material Theme</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">{theme === 'dark' ? 'Slate Dark Mode' : 'Clean Light Mode'}</p>
                </div>
                <div className="tooltip tooltip-left" data-tip={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <button
                    id="settings-theme-toggle"
                    type="button"
                    onClick={() => onThemeToggle(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 bg-app hover:bg-bg-hover border border-border-subtle rounded-lg text-text-primary cursor-pointer transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Role Verification Card - Only visible to authorized administrators */}
          {profile.isAdmin && (
            <div id="admin-root-panel" className="bg-surface border border-color-danger/20 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <h2 className="text-xs font-bold uppercase tracking-wider text-color-danger flex items-center gap-1.5">
                  <Shield size={14} className="text-color-danger fill-color-danger/10" /> Staff Moderation
                </h2>
                <span className="badge badge-error badge-outline text-[10px] font-bold uppercase tracking-wider py-0.5">
                  Verified
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your account has administrative permissions verified via authorized Gmail allowlist ({profile.email || 'harshitcsb@gmail.com'}). You can audit and moderate flagged content across all campus boards.
                </p>
                <div className="p-2.5 rounded-lg bg-app border border-border-subtle text-xs space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-secondary">Access Method:</span>
                    <span className="font-medium text-text-primary">Sidebar &gt; Moderation</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-text-secondary">Role:</span>
                    <span className="font-medium text-color-danger">Content Administrator</span>
                  </div>
                </div>
                <button
                  type="button"
                  id="launch-admin-hub-btn"
                  onClick={() => setCurrentTab && setCurrentTab('admin')}
                  className="w-full py-2 bg-color-danger hover:opacity-90 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Shield size={14} />
                  <span>Open Moderation Hub</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Device Session Card */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-2 border-b border-border-subtle flex items-center gap-1.5">
              <Key size={14} className="text-accent-primary" /> Active Device Session
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                Your authenticated session identifier used for secure token validation and multi-device identity.
              </p>

              <div className="flex items-center justify-between p-2.5 bg-app border border-border-subtle rounded-lg">
                <span className="font-mono text-xs text-text-primary truncate max-w-[200px]" title={profile.sessionId || 'N/A'}>
                  {profile.sessionId || 'Local Session Active'}
                </span>
                <div className="tooltip tooltip-left" data-tip={copiedSession ? "Copied!" : "Copy Token"}>
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.sessionId) {
                        navigator.clipboard.writeText(profile.sessionId);
                        setCopiedSession(true);
                        setTimeout(() => setCopiedSession(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] font-bold text-accent-primary hover:text-accent-hover cursor-pointer px-2 py-1 rounded bg-accent-muted/15"
                  >
                    {copiedSession ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedSession ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Logout / Critical Section Card */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-color-danger pb-2 border-b border-border-subtle flex items-center gap-1.5">
              <LogOut size={14} className="text-color-danger" /> Critical Operations
            </h2>

            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                Signing out will clear local cache and session variables securely from this device.
              </p>

              <button
                id="settings-logout-btn"
                onClick={onLogout}
                className="w-full py-2 bg-color-danger/10 hover:bg-color-danger text-color-danger hover:text-white border border-color-danger/20 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
              >
                Log Out Account
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
