import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  Plus, 
  X, 
  ShieldCheck,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  Bookmark,
  Flag,
  MessageSquarePlus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Doubt, Answer, StudentProfile } from '../types';

interface DoubtBoxViewProps {
  doubts: Doubt[];
  setDoubts: React.Dispatch<React.SetStateAction<Doubt[]>>;
  searchQuery: string;
  token?: string | null;
  profile?: StudentProfile;
}

export default function DoubtBoxView({
  doubts,
  setDoubts,
  searchQuery,
  token,
  profile
}: DoubtBoxViewProps) {
  // Navigation: null shows the main feed, a doubt ID shows the thread details (Reddit Master-Detail)
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Question Creation Form State
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Computer Science');
  const [newDescription, setNewDescription] = useState('');

  // Answer Creation State
  const [newAnswerText, setNewAnswerText] = useState('');

  // Report State
  const [reportingDoubtId, setReportingDoubtId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState('Off-topic');
  const [reportOtherText, setReportOtherText] = useState('');

  const categories = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Electronics', 'Humanities'];
  const animalAliases = [
    'Anonymous Owl', 'Anonymous Dolphin', 'Anonymous Fox', 'Anonymous Tiger', 
    'Anonymous Bear', 'Anonymous Koala', 'Anonymous Badger', 'Anonymous Otter', 'Anonymous Falcon'
  ];

  // Sync parent search query if any
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Fetch doubts from backend on mount
  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/v1/doubts', { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDoubts(data);
          }
        }
      } catch (error) {
        console.error('Error fetching doubts from server, using local store:', error);
      }
    };
    fetchDoubts();
  }, [setDoubts, token]);

  const getUserAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getSubjectBadgeStyle = (categoryName: string) => {
    const styles: { [key: string]: string } = {
      'Computer Science': 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400',
      'Mathematics': 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400',
      'Physics': 'bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400',
      'Chemistry': 'bg-pink-500/10 text-pink-600 border border-pink-500/20 dark:text-pink-400',
      'Electronics': 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:text-cyan-400',
      'Humanities': 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400',
      'General': 'bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-400'
    };
    return styles[categoryName] || 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
  };

  const handleUpvoteDoubt = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDoubts(prev => prev.map(doubt => {
      const matchId = doubt.doubt_id || doubt.id;
      if (matchId === id) {
        const upvoted = !doubt.userUpvoted;
        return {
          ...doubt,
          userUpvoted: upvoted,
          upvotes: upvoted ? doubt.upvotes + 1 : doubt.upvotes - 1
        };
      }
      return doubt;
    }));
  };

  const handleUpvoteAnswer = (doubtId: string, answerId: string) => {
    setDoubts(prev => prev.map(doubt => {
      const dId = doubt.doubt_id || doubt.id;
      if (dId === doubtId) {
        return {
          ...doubt,
          answers: doubt.answers.map(ans => {
            const aId = ans.answer_id || ans.id;
            if (aId === answerId) {
              const upvoted = !ans.userUpvoted;
              return {
                ...ans,
                userUpvoted: upvoted,
                upvotes: upvoted ? ans.upvotes + 1 : ans.upvotes - 1
              };
            }
            return ans;
          })
        };
      }
      return doubt;
    }));
  };

  const handleVerifyAnswer = (doubtId: string, answerId: string) => {
    setDoubts(prev => prev.map(doubt => {
      const dId = doubt.doubt_id || doubt.id;
      if (dId === doubtId) {
        return {
          ...doubt,
          answers: doubt.answers.map(ans => {
            const aId = ans.answer_id || ans.id;
            if (aId === answerId) {
              return { ...ans, verified: !ans.verified };
            }
            return ans;
          })
        };
      }
      return doubt;
    }));
  };

  const handleReport = (id: string | null) => {
    if (!id) return;
    const finalReason = reportCategory === 'Other' ? reportOtherText : reportCategory;
    if (!finalReason.trim()) return;

    setDoubts(prev => prev.map(doubt => {
      const dId = doubt.doubt_id || doubt.id;
      if (dId === id) {
        return { ...doubt, reported: true, reportReason: finalReason };
      }
      return doubt;
    }));
    setReportingDoubtId(null);
    setReportCategory('Off-topic');
    setReportOtherText('');
    setActiveDoubtId(null);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const randomAlias = animalAliases[Math.floor(Math.random() * animalAliases.length)];

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/v1/doubts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: newTitle,
          subject: newCategory,
          description: newDescription,
          category: newCategory,
          authorAnonymousName: randomAlias
        })
      });

      if (res.ok) {
        const createdDoubt = await res.json();
        setDoubts(prev => [createdDoubt, ...prev]);
        setActiveDoubtId(createdDoubt.doubt_id || createdDoubt.id);
      } else {
        throw new Error('Failed to post doubt to server');
      }
    } catch (error) {
      console.warn('Backend API error, falling back to local creation:', error);
      const newDoubt: Doubt = {
        id: `doubt-${Date.now()}`,
        doubt_id: `doubt-${Date.now()}`,
        title: newTitle,
        description: newDescription,
        category: newCategory,
        authorAnonymousName: randomAlias,
        answers: [],
        upvotes: 1,
        userUpvoted: true,
        date: new Date().toISOString().split('T')[0],
        reported: false
      };
      setDoubts(prev => [newDoubt, ...prev]);
      setActiveDoubtId(newDoubt.id);
    }

    setNewTitle('');
    setNewDescription('');
    setIsAskOpen(false);
  };

  const handleAddAnswer = async (doubtId: string) => {
    if (!newAnswerText.trim()) return;

    const randomAlias = animalAliases[Math.floor(Math.random() * animalAliases.length)];

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/v1/doubts/answer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          doubt_id: doubtId,
          text: newAnswerText,
          author: randomAlias
        })
      });

      if (res.ok) {
        const updatedDoubt = await res.json();
        setDoubts(prev => prev.map(d => {
          const matchId = d.doubt_id || d.id;
          if (matchId === doubtId) {
            return updatedDoubt;
          }
          return d;
        }));
      } else {
        throw new Error('Failed to save answer to server');
      }
    } catch (error) {
      console.warn('Backend API error, falling back to local addition:', error);
      const newAnswer: Answer = {
        id: `ans-${Date.now()}`,
        answer_id: `ans-${Date.now()}`,
        text: newAnswerText,
        author: randomAlias,
        date: new Date().toISOString().split('T')[0],
        upvotes: 0,
        verified: false
      };

      setDoubts(prev => prev.map(doubt => {
        const dId = doubt.doubt_id || doubt.id;
        if (dId === doubtId) {
          return {
            ...doubt,
            answers: [...doubt.answers, newAnswer]
          };
        }
        return doubt;
      }));
    }

    setNewAnswerText('');
  };

  // Filter & Search Logic
  const filteredDoubts = doubts.filter(doubt => {
    if (doubt.reported) return false;

    const matchesSearch = 
      (doubt.question || doubt.title || '').toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      (doubt.description || '').toLowerCase().includes(localSearchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || 
      (doubt.subject || doubt.category || '').toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const activeDoubt = doubts.find(d => (d.doubt_id || d.id) === activeDoubtId);

  return (
    <div id="doubt-box-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Dynamic Navigation Indicator or Back Button */}
      {activeDoubtId ? (
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <button 
            onClick={() => setActiveDoubtId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-subtle hover:bg-bg-hover text-text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Doubt Feed
          </button>
          <div className="flex items-center gap-1 text-xs text-text-secondary font-mono">
            <span>Doubt Box</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-accent-primary truncate max-w-[200px]">
              {activeDoubt?.question || activeDoubt?.title}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <HelpCircle className="text-yellow-500" size={22} /> Anonymous Doubt Box
            </h1>
          </div>
          <button
            id="open-doubt-modal-btn"
            onClick={() => setIsAskOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} /> Post a Doubt
          </button>
        </div>
      )}

      {/* RENDER REDDIT MASTER-DETAIL LAYOUTS */}
      {!activeDoubtId ? (
        /* --- MASTER VIEW: MAIN FEED OF PARENT THREADS --- */
        <div className="space-y-6">
          {/* INLINE HEADER ROW LAYOUT: Search Bar on the Left, Category Dropdown on the Right */}
          <div className="bg-surface border border-border-subtle rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                <Search size={15} />
              </span>
              <input
                id="doubts-search-input-inline"
                type="text"
                placeholder="Search queries, technical terms, or descriptions..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <select
                id="doubt-category-filter-inline"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Subjects' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PARENT THREADS STREAM */}
          <div className="space-y-3">
            {filteredDoubts.map(doubt => {
              const dId = doubt.doubt_id || doubt.id;
              return (
                <div
                  key={dId}
                  id={`doubt-thread-${dId}`}
                  onClick={() => setActiveDoubtId(dId)}
                  className="bg-surface border border-border-subtle hover:border-yellow-500 p-5 rounded-xl cursor-pointer transition-all flex items-start gap-4"
                >
                  {/* Upvote side banner (Reddit style) */}
                  <div className="hidden sm:flex flex-col items-center gap-1 px-2 py-1 bg-app/40 rounded-lg select-none">
                    <button
                      onClick={(e) => handleUpvoteDoubt(dId, e)}
                      className={`p-0.5 transition-colors ${doubt.userUpvoted ? 'text-orange-500' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      <ArrowBigUp size={18} className={doubt.userUpvoted ? 'fill-orange-500' : ''} />
                    </button>
                    <span className="text-xs font-bold text-text-primary">{doubt.upvotes}</span>
                  </div>

                  {/* Main Card Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${getSubjectBadgeStyle(doubt.subject || doubt.category || 'General')}`}>
                        {doubt.subject || doubt.category || 'General'}
                      </span>
                      <span className="text-[10px] text-text-secondary">• Posted by {doubt.authorAnonymousName}</span>
                      <span className="text-[10px] text-text-secondary font-mono">{doubt.timestamp || doubt.date}</span>
                    </div>

                    <h3 className="text-sm font-bold text-text-primary leading-snug hover:text-accent-primary transition-colors">
                      {doubt.question || doubt.title}
                    </h3>

                    <p className="text-xs text-text-secondary line-clamp-2">
                      {doubt.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-accent-primary flex items-center gap-1.5 font-bold">
                        <MessageSquare size={13} />
                        {doubt.answers.length} {doubt.answers.length === 1 ? 'Answer' : 'Answers'}
                      </span>
                      
                      {/* Flag action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingDoubtId(dId);
                        }}
                        className="p-1 text-text-secondary hover:text-color-danger rounded"
                        title="Report Thread"
                      >
                        <Flag size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDoubts.length === 0 && (
              <div className="text-center py-12 bg-surface border border-border-subtle rounded-xl w-full">
                <HelpCircle size={40} className="mx-auto text-text-secondary/40" />
                <h3 className="text-sm font-semibold text-text-primary mt-3">No doubt threads found</h3>
                <p className="text-xs text-text-secondary mt-1">Be the first to post a query in this category!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* --- DETAIL VIEW: INDIVIDUAL THREAD PAGE WITH COMMENTS --- */
        <div className="bg-surface border border-border-subtle rounded-xl shadow-xs overflow-hidden flex">
          {/* Reddit Vertical Vote Panel (Desktop Only) */}
          <div className="hidden md:flex flex-col items-center gap-1 p-3.5 bg-app/20 w-12 border-r border-border-subtle/30 text-center select-none">
            <button
              onClick={(e) => handleUpvoteDoubt(activeDoubt?.doubt_id || activeDoubt?.id || '', e)}
              className={`p-1 rounded-md hover:bg-bg-hover transition-colors ${
                activeDoubt?.userUpvoted ? 'text-orange-500' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ArrowBigUp size={22} className={activeDoubt?.userUpvoted ? 'fill-orange-500' : ''} />
            </button>
            <span className="text-xs font-extrabold text-text-primary">
              {activeDoubt?.upvotes}
            </span>
            <button
              onClick={(e) => handleUpvoteDoubt(activeDoubt?.doubt_id || activeDoubt?.id || '', e)}
              className="p-1 rounded-md hover:bg-bg-hover transition-colors text-text-secondary"
            >
              <ArrowBigDown size={22} />
            </button>
          </div>

          {/* Main Reddit Thread Container */}
          <div className="flex-1 p-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getSubjectBadgeStyle(activeDoubt?.subject || activeDoubt?.category || 'General')}`}>
                  {activeDoubt?.subject || activeDoubt?.category || 'General'}
                </span>
                <span className="text-text-secondary">• Posted by <strong>{activeDoubt?.authorAnonymousName}</strong></span>
                <span className="text-text-secondary font-mono">{activeDoubt?.timestamp || activeDoubt?.date}</span>
              </div>

              <h2 className="text-base font-extrabold text-text-primary leading-snug">
                {activeDoubt?.question || activeDoubt?.title}
              </h2>

              <p className="text-xs text-text-secondary whitespace-pre-line leading-relaxed bg-app/30 p-4 rounded-xl border border-border-subtle/40">
                {activeDoubt?.description}
              </p>
            </div>

            {/* Thread Action Bar */}
            <div className="flex items-center justify-between border-b border-border-subtle/50 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex md:hidden items-center gap-1 bg-app border border-border-subtle rounded-full px-2 py-0.5">
                  <button
                    onClick={(e) => handleUpvoteDoubt(activeDoubt?.doubt_id || activeDoubt?.id || '', e)}
                    className={`p-0.5 ${activeDoubt?.userUpvoted ? 'text-orange-500' : 'text-text-secondary'}`}
                  >
                    <ArrowBigUp size={16} className={activeDoubt?.userUpvoted ? 'fill-orange-500' : ''} />
                  </button>
                  <span className="text-xs font-bold text-text-primary">{activeDoubt?.upvotes}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-app border border-border-subtle rounded-lg text-xs font-semibold text-text-secondary">
                  <MessageSquare size={13} />
                  <span>{activeDoubt?.answers.length} Comments</span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Thread link copied to clipboard!');
                  }}
                  className="flex items-center gap-1 px-3 py-1 hover:bg-bg-hover border border-border-subtle rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={() => setReportingDoubtId(activeDoubt?.doubt_id || activeDoubt?.id || null)}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-color-danger transition-colors cursor-pointer"
              >
                <Flag size={12} />
                <span>Report Thread</span>
              </button>
            </div>

            {/* Post an Answer - Input Editor Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <MessageSquarePlus size={12} className="text-yellow-500" />
                  Comment anonymously
                </label>
                <span className="text-[10px] text-text-secondary italic">Your identity is completely hidden</span>
              </div>
              <div className="border border-border-subtle rounded-xl overflow-hidden focus-within:border-yellow-500 transition-colors bg-app/10">
                <textarea
                  id="answer-text-area"
                  rows={3}
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  placeholder="What are your thoughts or steps? Be precise and helpful..."
                  className="w-full p-3 bg-transparent text-xs text-text-primary focus:outline-hidden resize-none leading-relaxed"
                />
                <div className="bg-app/40 border-t border-border-subtle px-3 py-2 flex justify-end">
                  <button
                    id="submit-answer-btn"
                    onClick={() => handleAddAnswer(activeDoubt?.doubt_id || activeDoubt?.id || '')}
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-extrabold rounded-lg transition-all cursor-pointer"
                  >
                    Post Answer
                  </button>
                </div>
              </div>
            </div>

            {/* Answer streams */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider border-b border-border-subtle pb-2">
                Discussion & Solutions
              </h3>

              <div className="space-y-3">
                {activeDoubt?.answers.map(ans => {
                  const ansId = ans.answer_id || ans.id;
                  return (
                    <div 
                      key={ansId}
                      className={`relative flex gap-3 p-4 rounded-xl border ${
                        ans.verified 
                          ? 'bg-color-success/[0.02] border-color-success' 
                          : 'border-border-subtle bg-app/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border flex-none flex items-center justify-center text-xs font-bold font-mono shadow-xs ${getUserAvatarColor(ans.author)}`}>
                        {ans.author.split(' ').pop()?.charAt(0) || 'A'}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-text-primary">{ans.author}</span>
                            {ans.verified && (
                              <span className="flex items-center gap-0.5 text-[9px] bg-color-success/15 text-color-success px-1.5 py-0.5 rounded-full font-bold">
                                <ShieldCheck size={10} /> Verified Solution
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-secondary font-mono">{ans.timestamp || ans.date}</span>
                        </div>

                        <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line pt-1 pr-2">
                          {ans.text}
                        </p>

                        <div className="flex items-center gap-3 pt-2 text-[11px] text-text-secondary">
                          <div className="flex items-center gap-1 bg-app border border-border-subtle/50 rounded-full px-2 py-0.2">
                            <button
                              onClick={() => handleUpvoteAnswer(activeDoubt.doubt_id || activeDoubt.id, ansId)}
                              className={`p-0.5 hover:text-orange-500 transition-colors ${ans.userUpvoted ? 'text-orange-500' : ''}`}
                            >
                              <ArrowBigUp size={15} className={ans.userUpvoted ? 'fill-orange-500' : ''} />
                            </button>
                            <span className="font-bold text-text-primary">{ans.upvotes}</span>
                          </div>

                          <button
                            onClick={() => handleVerifyAnswer(activeDoubt.doubt_id || activeDoubt.id, ansId)}
                            className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                              ans.verified 
                                ? 'bg-color-success/15 text-color-success border-color-success' 
                                : 'text-text-secondary hover:text-color-success hover:border-color-success border-transparent'
                            }`}
                          >
                            <ShieldCheck size={11} />
                            <span>{ans.verified ? 'Verified' : 'Verify Solution'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activeDoubt?.answers.length === 0 && (
                  <div className="text-center py-8 bg-app/10 rounded-xl border border-dashed border-border-subtle p-4">
                    <MessageSquare className="mx-auto text-text-secondary/30 mb-2" size={24} />
                    <p className="text-xs text-text-secondary italic">
                      No solutions yet. Offer some help to this classmate!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Doubt Modal */}
      {isAskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <HelpCircle size={18} className="text-yellow-500" /> Post Anonymous Query
              </h2>
              <button 
                onClick={() => setIsAskOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                  Question Headline / Query
                </label>
                <input
                  id="doubt-title-input"
                  type="text"
                  required
                  placeholder="e.g., Struggling to find inverse Laplace transform of s/(s^2+4)^2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                  Subject Category
                </label>
                <select
                  id="doubt-cat-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                  Full Description / Mathematical Steps
                </label>
                <textarea
                  id="doubt-desc-input"
                  rows={4}
                  required
                  placeholder="Paste equation details, what methods you've tried so far, or attach reference code/text..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-[10px] text-text-secondary leading-normal">
                Your question will be posted using a completely random alias (e.g. <strong>Anonymous Dolphin</strong>). No real-name profiles, Divisions, or Seat Numbers will be leaked.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAskOpen(false)}
                  className="px-4 py-2 text-xs font-bold border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-doubt-btn"
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black rounded-lg transition-colors cursor-pointer"
                >
                  Post Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING MD3 REPORT MODAL */}
      {reportingDoubtId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle size={16} className="text-color-danger animate-pulse" /> Report Doubt Thread
              </h3>
              <button 
                onClick={() => {
                  setReportingDoubtId(null);
                  setReportCategory('Off-topic');
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
                  <option value="Off-topic">Off-topic or Irrelevant</option>
                  <option value="Academic Dishonesty">Academic Dishonesty / Direct Exam Copying</option>
                  <option value="Spam or Advertising">Spam or Advertising</option>
                  <option value="Abusive Language">Abusive Language or Harassment</option>
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
                  setReportingDoubtId(null);
                  setReportCategory('Off-topic');
                  setReportOtherText('');
                }}
                className="px-4 py-2 border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportingDoubtId)}
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
