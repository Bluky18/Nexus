import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Download, 
  ThumbsUp, 
  AlertTriangle, 
  Plus, 
  Star,
  X,
  Check,
  FileText,
  Grid,
  List,
  Folder,
  Eye,
  Info,
  ExternalLink,
  ChevronRight,
  Sparkles,
  User,
  Clock,
  Filter,
  Trash2,
  Search
} from 'lucide-react';
import { Note, StudentProfile } from '../types';

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  searchQuery: string;
  onIncreaseUploadCount: () => void;
  profile?: StudentProfile;
  token?: string | null;
}

export default function NotesView({
  notes,
  setNotes,
  searchQuery,
  onIncreaseUploadCount,
  profile,
  token
}: NotesViewProps) {
  // Drive Layout State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter States
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'upvotes' | 'downloads'>('rating');

  // Local Search Query
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Sync with global query
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBranch, setNewBranch] = useState('Computer Science');
  const [newSemester, setNewSemester] = useState('6');
  const [newDescription, setNewDescription] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  const [newFileUrl, setNewFileUrl] = useState('');

  // Functional Mock File-Upload Architecture
  const [dragActive, setDragActive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processMockFile = (file: File) => {
    setIsUploadingFile(true);
    setUploadProgress(0);
    
    // Simulate upload progress ticking up to 100%
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Set final metadata
          const extension = file.name.split('.').pop() || 'pdf';
          const sizeMB = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
          
          setAttachedFile({
            name: file.name,
            size: sizeMB,
            type: extension
          });
          
          // Autofill form inputs
          setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
          setNewFileType(extension.toLowerCase());
          setNewFileUrl(`https://nexus-vault.college.edu/drive/S2026/shares/${encodeURIComponent(file.name)}`);
          setIsUploadingFile(false);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processMockFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processMockFile(e.target.files[0]);
    }
  };

  // Reporting State
  const [reportingNoteId, setReportingNoteId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState('Inappropriate Content');
  const [reportOtherText, setReportOtherText] = useState('');

  // Rating State
  const [ratingNoteId, setRatingNoteId] = useState<string | null>(null);
  const [userRatingScore, setUserRatingScore] = useState<number>(5);

  // Active Preview Modal
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  // Load notes from Express API on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/v1/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local state:', err);
      }
    };
    fetchNotes();
  }, [setNotes]);

  // Derived filter options
  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const branches = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Applied Sciences', 'Mechanical'];
  
  // Get unique list of subjects from existing notes
  const uniqueSubjects = ['All', ...Array.from(new Set(notes.map(note => note.subject)))];

  // Actions
  const handleUpvote = (id: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const upvoted = !note.userUpvoted;
        return {
          ...note,
          userUpvoted: upvoted,
          upvotes: upvoted ? note.upvotes + 1 : note.upvotes - 1
        };
      }
      return note;
    }));
  };

  const handleDownload = (id: string, title: string, fileUrl?: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        return { ...note, downloads: note.downloads + 1 };
      }
      return note;
    }));

    // Trigger local simulation text file download
    const element = document.createElement("a");
    const fileContent = `Simulated Nexus Study Material\n=================================\nTitle: ${title}\nSource Link: ${fileUrl || 'Local Asset'}\n=================================\nThis file simulates the notes downloaded via Nexus Platform.`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/ /g, "_")}_nexus_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm("Are you sure you want to delete this study material?")) {
      return;
    }
    try {
      const response = await fetch(`/api/v1/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        if (previewNote && previewNote.id === noteId) {
          setPreviewNote(null);
        }
      } else {
        const errData = await response.json();
        alert(`Failed to delete note: ${errData.error || response.statusText}`);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleReport = async (id: string) => {
    const finalReason = reportCategory === 'Other' ? reportOtherText.trim() : reportCategory;
    if (!finalReason) return;

    if (token) {
      try {
        await fetch(`/api/v1/notes/${id}/report`, {
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

    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        return { ...note, reported: true, reportReason: finalReason };
      }
      return note;
    }));
    setReportingNoteId(null);
    setReportCategory('Inappropriate Content');
    setReportOtherText('');
  };

  const handleRateNote = (id: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const totalScore = (note.rating * note.ratingCount) + userRatingScore;
        const newCount = note.ratingCount + 1;
        return {
          ...note,
          ratingCount: newCount,
          rating: parseFloat((totalScore / newCount).toFixed(1))
        };
      }
      return note;
    }));
    setRatingNoteId(null);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) return;

    // Build URL if not provided
    const defaultUrl = `https://example.com/files/${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.pdf`;
    const finalFileUrl = newFileUrl.trim() || defaultUrl;

    const payload = {
      title: newTitle,
      subject: newSubject,
      semester: parseInt(newSemester, 10),
      uploader_name: profile?.name || 'Harshit Kataram',
      file_url: finalFileUrl,
      branch: newBranch,
      fileType: newFileType,
      fileSize: attachedFile ? attachedFile.size : `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      description: newDescription || 'A helpful compilation of topics studied during classroom hours and references.'
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const createdNote = await response.json();
        setNotes(prev => [createdNote, ...prev]);
      } else {
        // Fallback locally
        const fallbackNote: Note = {
          id: `note-${Date.now()}`,
          ...payload,
          uploadedBy: payload.uploader_name,
          rating: 5.0,
          ratingCount: 1,
          upvotes: 1,
          downloads: 0,
          date: new Date().toISOString().split('T')[0],
          reported: false
        };
        setNotes(prev => [fallbackNote, ...prev]);
      }
    } catch (err) {
      console.warn('API Post failed, using local fallback:', err);
      const fallbackNote: Note = {
        id: `note-${Date.now()}`,
        ...payload,
        uploadedBy: payload.uploader_name,
        rating: 5.0,
        ratingCount: 1,
        upvotes: 1,
        downloads: 0,
        date: new Date().toISOString().split('T')[0],
        reported: false
      };
      setNotes(prev => [fallbackNote, ...prev]);
    }

    onIncreaseUploadCount();

    // Reset Form
    setNewTitle('');
    setNewSubject('');
    setNewDescription('');
    setNewFileUrl('');
    setAttachedFile(null);
    setIsUploadOpen(false);
  };

  // Helper for color-coding file types like Google Drive
  const getFileStyle = (type: string) => {
    const normType = type.toLowerCase();
    if (normType === 'pdf') {
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-900/30',
        iconBg: 'bg-red-100 dark:bg-red-900/40'
      };
    } else if (normType === 'docx' || normType === 'doc') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-900/30',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40'
      };
    } else if (normType === 'pptx' || normType === 'ppt') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900/30',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40'
      };
    } else {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-900/30',
        iconBg: 'bg-purple-100 dark:bg-purple-900/40'
      };
    }
  };

  // Filter & Search Logic
  const filteredNotes = notes.filter(note => {
    if (note.reported && note.uploadedBy !== 'Harshit Kataram') return false;

    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester = selectedSemester === 'All' || note.semester.toString() === selectedSemester;
    const matchesSubject = selectedSubject === 'All' || note.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesBranch = selectedBranch === 'All' || note.branch === selectedBranch;

    return matchesSearch && matchesSemester && matchesSubject && matchesBranch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
    return b.downloads - a.downloads;
  });

  // Recent / Quick Access drive notes (top 3 downloaded or rated)
  const quickAccessNotes = [...notes]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 3);

  return (
    <div id="notes-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Google Drive Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
            <span className="hover:text-text-primary cursor-pointer">Nexus Drive</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-accent-primary">Study Materials</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Folder className="text-accent-primary fill-accent-primary/20" size={22} /> Study Materials Drive
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* List/Grid View Toggle */}
          <div className="flex rounded-lg border border-border-subtle p-0.5 bg-surface">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Grid view"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          <button
            id="open-upload-modal-btn"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={16} /> New File Upload
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER INLINE ROW */}
      <div className="bg-surface border border-border-subtle rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 w-full">
        {/* Search Input (Left) */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <Search size={15} />
          </span>
          <input
            id="notes-search-input-inline"
            type="text"
            placeholder="Search notes, subjects, or descriptions..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
          />
        </div>

        {/* Filters and Sorters immediately to the right */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <select
            id="semester-filter"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
          >
            {semesters.map(sem => (
              <option key={sem} value={sem}>
                {sem === 'All' ? 'All Semesters' : `Sem ${sem}`}
              </option>
            ))}
          </select>

          <select
            id="branch-filter"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden max-w-[120px] truncate cursor-pointer"
          >
            {branches.map(br => (
              <option key={br} value={br}>
                {br === 'All' ? 'All Branches' : br}
              </option>
            ))}
          </select>

          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden max-w-[130px] truncate cursor-pointer"
          >
            {uniqueSubjects.map(sub => (
              <option key={sub} value={sub}>
                {sub === 'All' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>

          <div className="h-4 w-[1px] bg-border-subtle hidden sm:block mx-1" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'upvotes' | 'downloads')}
            className="px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="rating">Sort: Best Rated</option>
            <option value="upvotes">Sort: Most Upvotes</option>
            <option value="downloads">Sort: Most Downloads</option>
          </select>
        </div>
      </div>

      {/* DRIVE GRID / LIST LAYOUT RENDERING */}
      {viewMode === 'grid' ? (
        /* GOOGLE DRIVE GRID LAYOUT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const style = getFileStyle(note.fileType);
            return (
              <div 
                key={note.id}
                id={`note-card-${note.id}`}
                className="bg-surface border border-border-subtle hover:border-accent-primary/40 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between group transition-all"
              >
                {/* 1. Google Drive Thumbnail Preview Area */}
                <div 
                  className={`h-36 ${style.bg} border-b border-border-subtle flex flex-col justify-between p-3.5 relative overflow-hidden cursor-pointer`}
                  onClick={() => setPreviewNote(note)}
                >
                  <div className="flex justify-between items-start z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.border} ${style.text}`}>
                      {note.fileType}
                    </span>
                    <span className="text-[10px] text-text-secondary font-medium bg-surface/80 dark:bg-surface/30 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {note.fileSize}
                    </span>
                  </div>

                  {/* Watermarked stylized background document graphics */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-15 group-hover:scale-105 transition-all">
                    <FileText size={96} className={style.text} />
                  </div>

                  {/* Quick Preview overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[11px] font-semibold flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                      <Eye size={13} /> Quick Details
                    </span>
                  </div>

                  {/* Branch & Semester Details */}
                  <div className="flex justify-between items-end z-10 mt-auto">
                    <span className="text-[9px] uppercase font-bold text-text-secondary bg-surface/90 dark:bg-surface/50 px-2 py-0.5 rounded-md">
                      {note.branch}
                    </span>
                    <span className="text-[9px] font-bold text-text-secondary bg-surface/90 dark:bg-surface/50 px-2 py-0.5 rounded-md">
                      Sem {note.semester}
                    </span>
                  </div>
                </div>

                {/* 2. Google Drive Metadata & Actions Footer */}
                <div className="p-4 space-y-3">
                  {/* File Title and Subject */}
                  <div className="min-h-[52px]">
                    <h3 
                      className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-accent-primary cursor-pointer transition-colors"
                      onClick={() => setPreviewNote(note)}
                    >
                      {note.title}
                    </h3>
                    <p className="text-xs font-semibold text-accent-primary mt-1 flex items-center gap-1.5">
                      <FileText size={13} />
                      <span className="truncate">{note.subject}</span>
                    </p>
                  </div>

                  {/* Rating / Review Stats */}
                  <div className="flex items-center justify-between text-xs py-2 border-t border-b border-border-subtle">
                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-text-primary">{note.rating}</span>
                      <span className="text-[10px] text-text-secondary">({note.ratingCount})</span>
                    </div>
                    <button
                      onClick={() => setRatingNoteId(note.id)}
                      className="text-[10px] text-accent-primary font-semibold hover:underline"
                    >
                      Write Review
                    </button>
                  </div>

                  {/* Inline quick rating selection */}
                  {ratingNoteId === note.id && (
                    <div className="p-2.5 bg-app border border-border-subtle rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(sc => (
                          <button
                            key={sc}
                            onClick={() => setUserRatingScore(sc)}
                            className={`p-0.5 text-xs ${userRatingScore >= sc ? 'text-yellow-500' : 'text-text-secondary'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleRateNote(note.id)}
                        className="bg-accent-primary text-white text-[10px] px-2.5 py-1 rounded-md font-bold cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                  )}

                  {/* Interactive Button row */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1">
                      {/* Upvote button */}
                      <button
                        onClick={() => handleUpvote(note.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                          note.userUpvoted 
                            ? 'bg-accent-primary/10 text-accent-primary border-accent-primary' 
                            : 'bg-app text-text-secondary border-border-subtle hover:text-text-primary'
                        }`}
                        title="Upvote note"
                      >
                        <ThumbsUp size={11} className={note.userUpvoted ? 'fill-accent-primary' : ''} />
                        <span>{note.upvotes}</span>
                      </button>

                      {/* Flag/Report trigger */}
                      <button
                        onClick={() => setReportingNoteId(note.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-color-danger hover:bg-color-danger/10 transition-colors cursor-pointer"
                        title="Report file"
                      >
                        <AlertTriangle size={13} />
                      </button>

                      {/* Delete Button - only visible for posters of the file or admins */}
                      {(profile?.isAdmin || (profile?.name && (note.uploadedBy === profile.name || note.uploader_name === profile.name))) && (
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg text-white transition-opacity hover:opacity-90 flex items-center justify-center cursor-pointer bg-red-600 hover:bg-red-700"
                          title="Delete study material"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Google Drive styled primary download trigger */}
                    <button
                      onClick={() => handleDownload(note.id, note.title, note.file_url)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary hover:bg-accent-primary hover:text-white dark:hover:bg-accent-primary dark:hover:text-black rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download ({note.downloads})</span>
                    </button>
                  </div>

                  {/* File URL direct preview icon */}
                  {note.file_url && (
                    <div className="text-[10px] text-text-secondary truncate pt-1 flex items-center gap-1">
                      <span className="font-semibold text-text-primary">Source Link:</span>
                      <a 
                        href={note.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-accent-primary hover:underline inline-flex items-center gap-0.5 truncate"
                      >
                        {note.file_url} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                  {/* Uploader indicator */}
                  <div className="text-[10px] text-text-secondary flex items-center gap-1">
                    <User size={12} className="text-text-secondary/60" />
                    <span>Uploaded by:</span>
                    <strong className="text-text-primary font-medium">
                      {note.uploader_name || note.uploadedBy}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GOOGLE DRIVE LIST LAYOUT */
        <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-text-secondary bg-app font-bold">
                  <th className="p-3.5 pl-5">Name / Title</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Uploader</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredNotes.map((note) => {
                  const style = getFileStyle(note.fileType);
                  return (
                    <tr key={note.id} className="hover:bg-app/40 transition-colors group">
                      <td className="p-3.5 pl-5 font-bold text-text-primary flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${style.iconBg} ${style.text}`}>
                          <FileText size={16} />
                        </div>
                        <div className="truncate max-w-[240px]">
                          <span 
                            onClick={() => setPreviewNote(note)}
                            className="hover:text-accent-primary cursor-pointer"
                          >
                            {note.title}
                          </span>
                          <div className="text-[10px] text-text-secondary font-medium mt-0.5 flex items-center gap-2">
                            <span className="uppercase text-[8px] font-bold tracking-wider px-1 bg-accent-muted text-accent-hover rounded">
                              {note.fileType}
                            </span>
                            <span>★ {note.rating} ({note.ratingCount})</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-text-secondary font-semibold max-w-[150px] truncate">
                        {note.subject}
                      </td>
                      <td className="p-3.5 text-text-primary font-medium">
                        Semester {note.semester}
                      </td>
                      <td className="p-3.5 text-text-secondary">
                        {note.fileSize}
                      </td>
                      <td className="p-3.5 text-text-secondary font-medium">
                        {note.uploader_name || note.uploadedBy}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-2">
                          {(profile?.isAdmin || (profile?.name && (note.uploadedBy === profile.name || note.uploader_name === profile.name))) && (
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-white px-2 py-1.5 rounded-md hover:opacity-90 text-[11px] font-bold flex items-center gap-1 cursor-pointer bg-red-600 hover:bg-red-700"
                              title="Delete study material"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleUpvote(note.id)}
                            className={`p-1 px-2.5 rounded-md border text-[11px] font-bold flex items-center gap-1 ${
                              note.userUpvoted 
                                ? 'bg-accent-primary/10 text-accent-primary border-accent-primary' 
                                : 'bg-surface text-text-secondary border-border-subtle hover:text-text-primary'
                            }`}
                          >
                            <ThumbsUp size={10} />
                            <span>{note.upvotes}</span>
                          </button>
                          <button
                            onClick={() => handleDownload(note.id, note.title, note.file_url)}
                            className="bg-accent-primary hover:bg-accent-hover text-white px-3 py-1.5 rounded-md font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Download size={11} />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-16 bg-surface border border-border-subtle rounded-xl">
          <Folder size={48} className="mx-auto text-text-secondary/30 stroke-1" />
          <h3 className="text-sm font-semibold text-text-primary mt-3">Empty Folder</h3>
          <p className="text-xs text-text-secondary mt-1">
            No note files match the chosen semester or subject filter.
          </p>
        </div>
      )}

      {/* QUICK PREVIEW / DETAILS SLIDEOVER MODAL */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-xl w-full overflow-hidden shadow-lg flex flex-col">
            <div className={`p-6 ${getFileStyle(previewNote.fileType).bg} border-b border-border-subtle flex items-start justify-between`}>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-surface border border-border-subtle rounded">
                  {previewNote.fileType} Document
                </span>
                <h2 className="text-lg font-bold text-text-primary">{previewNote.title}</h2>
                <p className="text-xs font-semibold text-accent-primary flex items-center gap-1">
                  <FileText size={14} /> {previewNote.subject}
                </p>
              </div>
              <button 
                onClick={() => setPreviewNote(null)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface/80"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Description</span>
                <p className="text-xs text-text-primary bg-app p-3 rounded-lg leading-relaxed">
                  {previewNote.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-app rounded-lg">
                  <span className="text-[9px] font-bold text-text-secondary uppercase block">Uploader</span>
                  <span className="font-semibold text-text-primary mt-0.5 block">
                    {previewNote.uploader_name || previewNote.uploadedBy}
                  </span>
                </div>
                <div className="p-3 bg-app rounded-lg">
                  <span className="text-[9px] font-bold text-text-secondary uppercase block">Date Posted</span>
                  <span className="font-semibold text-text-primary mt-0.5 block">{previewNote.date}</span>
                </div>
                <div className="p-3 bg-app rounded-lg">
                  <span className="text-[9px] font-bold text-text-secondary uppercase block">File Details</span>
                  <span className="font-semibold text-text-primary mt-0.5 block">
                    {previewNote.fileSize} ({previewNote.fileType.toUpperCase()})
                  </span>
                </div>
                <div className="p-3 bg-app rounded-lg">
                  <span className="text-[9px] font-bold text-text-secondary uppercase block">Rating Score</span>
                  <span className="font-semibold text-yellow-500 mt-0.5 block flex items-center gap-1">
                    ★ {previewNote.rating} <span className="text-text-secondary text-[10px] font-normal">({previewNote.ratingCount} reviews)</span>
                  </span>
                </div>
              </div>

              {previewNote.file_url && (
                <div className="p-3.5 bg-accent-muted/10 border border-accent-primary/10 rounded-lg space-y-1.5">
                  <span className="text-[10px] font-bold text-accent-hover dark:text-accent-primary uppercase block">
                    Secured Source Download URL
                  </span>
                  <a 
                    href={previewNote.file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-accent-primary hover:underline font-medium break-all flex items-center gap-1.5"
                  >
                    {previewNote.file_url} <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-app border-t border-border-subtle flex justify-end gap-3">
              {(profile?.isAdmin || (profile?.name && (previewNote.uploadedBy === profile.name || previewNote.uploader_name === profile.name))) && (
                <button
                  onClick={() => {
                    handleDeleteNote(previewNote.id);
                  }}
                  className="text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity mr-auto bg-red-600 hover:bg-red-700"
                  title="Delete note"
                >
                  <Trash2 size={14} />
                  <span>Delete note</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleUpvote(previewNote.id);
                  setPreviewNote(prev => prev ? { ...prev, userUpvoted: !prev.userUpvoted, upvotes: prev.userUpvoted ? prev.upvotes - 1 : prev.upvotes + 1 } : null);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  previewNote.userUpvoted 
                    ? 'bg-accent-primary/10 text-accent-primary border-accent-primary' 
                    : 'bg-surface text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                Upvote ({previewNote.upvotes})
              </button>
              <button
                onClick={() => {
                  handleDownload(previewNote.id, previewNote.title, previewNote.file_url);
                  setPreviewNote(null);
                }}
                className="bg-accent-primary hover:bg-accent-hover text-white px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>Download ({previewNote.downloads})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT FORM MODAL (Mimics Google Drive Upload) */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Folder size={18} className="text-accent-primary fill-accent-primary/15" /> Drive Upload Center
              </h2>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-app"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase block">File Title / Name</label>
                <input
                  id="note-title-input"
                  type="text"
                  required
                  placeholder="e.g., Analysis of Algorithms Lecture Slides"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase block">Subject / Course</label>
                  <input
                    id="note-subject-input"
                    type="text"
                    required
                    placeholder="e.g., Design & Analysis of Algorithms"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase block">File Format</label>
                  <select
                    id="note-filetype-input"
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="pptx">PowerPoint Slides (.pptx)</option>
                    <option value="zip">Compressed Archive (.zip)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase block">Academic Branch</label>
                  <select
                    id="note-branch-input"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                  >
                    {branches.filter(b => b !== 'All').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase block">Target Semester</label>
                  <select
                    id="note-semester-input"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                  >
                    {semesters.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HIGH-FIDELITY DRAG & DROP MOCK UPLOAD AREA */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase block">
                  Attach Academic File
                </label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 transition-all duration-200 text-center relative flex flex-col items-center justify-center min-h-[110px] cursor-pointer ${
                    dragActive 
                      ? 'border-accent-primary bg-accent-primary/5 scale-[1.01]' 
                      : 'border-border-subtle hover:border-accent-primary hover:bg-app/30'
                  }`}
                >
                  <input
                    id="drive-drag-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.zip"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {isUploadingFile ? (
                    <div className="space-y-2 w-full max-w-[240px]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-accent-primary uppercase tracking-wide">
                        <span>Uploading material...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-app border border-border-subtle rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-primary transition-all duration-200 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-text-secondary">Securing link on academic servers...</p>
                    </div>
                  ) : attachedFile ? (
                    <div className="flex items-center gap-3 bg-accent-primary/5 border border-accent-primary/15 rounded-lg p-2.5 w-full text-left">
                      <div className="w-9 h-9 rounded bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0 font-black text-xs uppercase">
                        {attachedFile.type}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-primary truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{attachedFile.size} • Attached</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAttachedFile(null);
                          setNewTitle('');
                          setNewFileUrl('');
                        }}
                        className="p-1 hover:text-color-danger hover:bg-color-danger/10 text-text-secondary rounded-md"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-text-secondary pointer-events-none">
                      <Folder size={20} className="mx-auto text-accent-primary" />
                      <p className="text-xs font-semibold text-text-primary">Drag & drop your study file here, or click to browse</p>
                      <p className="text-[10px] text-text-secondary/60">Supports PDF, DOCX, PPTX, or ZIP (Up to 100MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* BLUEPRINT SECURE URL INPUT FIELD */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase block">
                  Document Storage URL (File Link)
                </label>
                <input
                  id="note-fileurl-input"
                  type="url"
                  placeholder="https://nexus-vault.college.edu/drive/S2026/shares/..."
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                />
                <span className="text-[10px] text-text-secondary block mt-0.5">
                  Autofills upon file attachment. You can edit this link if you want to route elsewhere.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase block">Brief Summary / Contents</label>
                <textarea
                  id="note-desc-input"
                  rows={2}
                  placeholder="e.g., Covered chapters: Greedy algorithms, dynamic programming proofs, Knapsack problem."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-app text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-upload-note-btn"
                  type="submit"
                  className="px-5 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Cloud Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REPORT MODAL */}
      {reportingNoteId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle size={16} className="text-color-danger animate-pulse" /> Report Study Material
              </h3>
              <button 
                onClick={() => {
                  setReportingNoteId(null);
                  setReportCategory('Inappropriate Content');
                  setReportOtherText('');
                }}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Why are you reporting this file?</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full p-2 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Spam or Advertising">Spam or Advertising</option>
                  <option value="Copyright Violation">Copyright Violation</option>
                  <option value="Incorrect / Misleading Information">Incorrect / Misleading Information</option>
                  <option value="Plagiarism">Plagiarism</option>
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
                  setReportingNoteId(null);
                  setReportCategory('Inappropriate Content');
                  setReportOtherText('');
                }}
                className="px-4 py-2 border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportingNoteId)}
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
