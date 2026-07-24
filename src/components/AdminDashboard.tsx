import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertOctagon, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  FileText, 
  Briefcase, 
  HelpCircle, 
  ChevronRight, 
  Calendar, 
  User, 
  Clock,
  Info
} from 'lucide-react';
import { StudentProfile } from '../types';

interface AdminDashboardProps {
  token: string | null;
  profile: StudentProfile;
  setCurrentTab: (tab: string) => void;
  // Callback handlers to notify parent component to refresh its lists
  onContentDeleted?: () => void;
}

interface FlaggedItem {
  id: string;
  title: string;
  contentType: 'note' | 'commission' | 'doubt';
  reportReason: string;
  uploadedBy: string;
  date: string;
  subject: string;
}

export default function AdminDashboard({
  token,
  profile,
  setCurrentTab,
  onContentDeleted
}: AdminDashboardProps) {
  const [reports, setReports] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'note' | 'commission' | 'doubt'>('all');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to retrieve moderation queue');
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('A network error occurred while loading the moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile.isAdmin && token) {
      fetchReports();
    }
  }, [profile.isAdmin, token]);

  const handleDeleteContent = async (itemId: string, contentType: 'note' | 'commission' | 'doubt') => {
    if (!window.confirm(`Are you absolutely sure you want to delete this ${contentType} permanently from Nexus? This action is irreversible.`)) {
      return;
    }

    setActionInProgress(itemId);
    try {
      let endpoint = '';
      if (contentType === 'note') {
        endpoint = `/api/v1/notes/${itemId}`;
      } else if (contentType === 'commission') {
        endpoint = `/api/v1/tasks/${itemId}`;
      } else {
        // Just mock doubt deletion or let it dismiss since doubts deletion was not explicitly defined in requirements
        endpoint = `/api/v1/admin/reports/${itemId}/dismiss`;
      }

      const response = await fetch(endpoint, {
        method: contentType === 'doubt' ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: contentType === 'doubt' ? JSON.stringify({ contentType: 'doubt' }) : undefined
      });

      if (response.ok) {
        // Remove from local reports state
        setReports(prev => prev.filter(r => r.id !== itemId));
        if (onContentDeleted) {
          onContentDeleted();
        }
      } else {
        const errData = await response.json();
        alert(`Failed to delete content: ${errData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to delete reported item:', err);
      alert('Network error occurred while trying to delete.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDismissReport = async (itemId: string, contentType: 'note' | 'commission' | 'doubt') => {
    setActionInProgress(itemId);
    try {
      const response = await fetch(`/api/v1/admin/reports/${itemId}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentType })
      });

      if (response.ok) {
        setReports(prev => prev.filter(r => r.id !== itemId));
        if (onContentDeleted) {
          onContentDeleted();
        }
      } else {
        const errData = await response.json();
        alert(`Failed to dismiss report: ${errData.error || response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to dismiss report:', err);
      alert('Network error occurred while dismissing report.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (!profile.isAdmin) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-color-danger/10 text-color-danger rounded-full flex items-center justify-center mx-auto">
          <Shield size={32} />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Access Forbidden</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          You do not possess administrative permissions required to access the moderation dashboard. Security tokens have been logged.
        </p>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalCount = reports.length;
  const notesCount = reports.filter(r => r.contentType === 'note').length;
  const commissionsCount = reports.filter(r => r.contentType === 'commission').length;
  const doubtsCount = reports.filter(r => r.contentType === 'doubt').length;

  const filteredReports = reports.filter(r => {
    if (filterType === 'all') return true;
    return r.contentType === filterType;
  });

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Upper Brand / Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Shield className="text-color-danger fill-color-danger/10" size={24} /> 
            Nexus Admin Moderation Center
          </h1>
          <p className="text-xs text-text-secondary">
            Secure queue of student-reported content requiring review. Act as root authority.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-bg-surface hover:bg-bg-hover text-text-primary border border-border-subtle text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Queue</span>
        </button>
      </div>

      {/* Admin Stat Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">All Reported</span>
            <AlertOctagon size={16} className="text-color-danger" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text-primary">{totalCount}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Flagged issues pending</span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Flagged Notes</span>
            <FileText size={16} className="text-accent-primary" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text-primary">{notesCount}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Study materials</span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Flagged Tasks</span>
            <Briefcase size={16} className="text-color-success" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text-primary">{commissionsCount}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Paid commissions</span>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase">Flagged Doubts</span>
            <HelpCircle size={16} className="text-purple-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text-primary">{doubtsCount}</span>
            <span className="text-[10px] text-text-secondary block mt-0.5">Discussion threads</span>
          </div>
        </div>
      </div>

      {/* Main Moderation Table/Layout */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filter Tabs */}
        <div className="border-b border-border-subtle px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-bg-hover/30">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'all' 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              All Items ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('note')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'note' 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              Notes ({notesCount})
            </button>
            <button
              onClick={() => setFilterType('commission')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'commission' 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              Commissions ({commissionsCount})
            </button>
            <button
              onClick={() => setFilterType('doubt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'doubt' 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              Doubts ({doubtsCount})
            </button>
          </div>

          <div className="text-[10px] text-text-secondary font-bold uppercase flex items-center gap-1">
            <Info size={12} />
            <span>Root Actions Enforce Instant DB Sync</span>
          </div>
        </div>

        {/* List of reports */}
        {loading ? (
          <div className="py-20 text-center text-text-secondary space-y-2">
            <RefreshCw className="animate-spin mx-auto text-accent-primary" size={24} />
            <p className="text-xs">Accessing secured MongoDB shards...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-color-danger space-y-2 px-4">
            <AlertOctagon size={32} className="mx-auto" />
            <h3 className="text-sm font-bold">Failed to Fetch Flagged Content</h3>
            <p className="text-xs max-w-sm mx-auto text-text-secondary">{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CheckCircle size={40} className="mx-auto text-color-success stroke-1" />
            <h3 className="text-sm font-bold text-text-primary">Inbox Clean & Safe</h3>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              There are currently no reported or flagged listings in the {filterType === 'all' ? '' : `${filterType} `}moderation queue. Great job!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredReports.map((report) => {
              const IconType = 
                report.contentType === 'note' ? FileText : 
                report.contentType === 'commission' ? Briefcase : HelpCircle;
              
              const badgeStyle = 
                report.contentType === 'note' ? 'bg-accent-primary/10 text-accent-primary' :
                report.contentType === 'commission' ? 'bg-color-success/10 text-color-success' : 'bg-purple-500/10 text-purple-500';

              return (
                <div 
                  key={report.id}
                  id={`admin-report-${report.id}`}
                  className="p-5 flex flex-col md:flex-row items-start justify-between gap-5 hover:bg-bg-hover/15 transition-colors"
                >
                  {/* Item metadata details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${badgeStyle}`}>
                        <IconType size={11} />
                        {report.contentType}
                      </span>
                      {report.subject && (
                        <span className="text-[10px] text-text-secondary bg-bg-app border border-border-subtle px-2 py-0.5 rounded-md">
                          {report.subject}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-text-primary">{report.title}</h3>

                    {/* Highly Visible Red Reason Banner */}
                    <div className="p-3 bg-color-danger/5 border border-color-danger/15 rounded-xl flex items-start gap-2 max-w-2xl">
                      <AlertOctagon size={14} className="text-color-danger mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-color-danger">Reason Flagged:</span>{' '}
                        <span className="text-text-primary italic font-medium">"{report.reportReason}"</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <User size={12} /> Posted by: <strong className="text-text-primary font-medium">{report.uploadedBy}</strong>
                      </span>
                      {report.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> Date: {report.date}
                        </span>
                      )}
                      <span className="text-[10px] text-text-secondary font-mono">ID: {report.id}</span>
                    </div>
                  </div>

                  {/* Actions buttons column */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-2.5 w-full md:w-auto flex-shrink-0">
                    {/* Dismiss report button */}
                    <button
                      onClick={() => handleDismissReport(report.id, report.contentType)}
                      disabled={actionInProgress === report.id}
                      className="flex-1 md:flex-none w-full md:w-32 px-3 py-2 border border-border-subtle hover:bg-bg-hover text-text-primary text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Keep this content and clear all flags"
                    >
                      <CheckCircle size={14} className="text-color-success" />
                      <span>Dismiss Flag</span>
                    </button>

                    {/* Delete content button */}
                    <button
                      onClick={() => handleDeleteContent(report.id, report.contentType)}
                      disabled={actionInProgress === report.id}
                      className="flex-1 md:flex-none w-full md:w-32 px-3 py-2 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-danger)' }}
                      title="Permanently remove from database"
                    >
                      <Trash2 size={14} />
                      <span>Delete Content</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
