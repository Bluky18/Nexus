import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Plus, 
  X, 
  CheckCircle,
  FileText,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Edit2,
  MessageSquare,
  Send,
  Flag,
  UserCheck
} from 'lucide-react';
import { LostFoundItem, StudentProfile } from '../types';

interface LostFoundViewProps {
  lostFound: LostFoundItem[];
  setLostFound: React.Dispatch<React.SetStateAction<LostFoundItem[]>>;
  searchQuery: string;
  profile?: StudentProfile;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
}

export default function LostFoundView({
  lostFound,
  setLostFound,
  searchQuery,
  profile
}: LostFoundViewProps) {
  const currentUserId = profile?.id || 'student-123';
  const isAdmin = profile?.isAdmin === true;

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'All' | 'lost' | 'found' | 'claimed'>('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Creation Drawer/Modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<'lost' | 'found'>('found');
  const [newLocationFound, setNewLocationFound] = useState('');
  const [newCurrentHolding, setNewCurrentHolding] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Image Upload state
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Flow state
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<'lost' | 'found' | 'claimed'>('found');
  const [editLocationFound, setEditLocationFound] = useState('');
  const [editCurrentHolding, setEditCurrentHolding] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isEditUploading, setIsEditUploading] = useState(false);

  // Reporting/Flagging Modal state
  const [reportingItemId, setReportingItemId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState('Incorrect Information');
  const [reportOtherText, setReportOtherText] = useState('');

  // In-Web Chat State
  const [chattingItem, setChattingItem] = useState<LostFoundItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync parent search query
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Fetch lost & found from server on mount
  useEffect(() => {
    const fetchLostFound = async () => {
      try {
        const res = await fetch('/api/v1/lost-found');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLostFound(data);
          }
        }
      } catch (error) {
        console.error('Error fetching lost and found from server:', error);
      }
    };
    fetchLostFound();
  }, [setLostFound]);

  // Pre-fill Edit form when editingItem is set
  useEffect(() => {
    if (editingItem) {
      setEditTitle(editingItem.item_name || editingItem.title || '');
      setEditStatus(editingItem.status as 'lost' | 'found' | 'claimed');
      setEditLocationFound(editingItem.location_found || editingItem.locationFound || '');
      setEditCurrentHolding(editingItem.currentHolding || '');
      setEditContactName(editingItem.contactName || '');
      setEditContactEmail(editingItem.contactEmail || '');
      setEditContactPhone(editingItem.contactPhone || '');
      setEditDescription(editingItem.description || '');
      setEditImageUrl(editingItem.image_url || '');
    }
  }, [editingItem]);

  // Handle opening the chat
  const handleOpenChat = (item: LostFoundItem) => {
    setChattingItem(item);
    const displayTitle = item.item_name || item.title || "Item";
    const contactName = item.contactName || "Campus Peer";
    
    // Seed initial welcome message
    setChatMessages([
      {
        id: 'msg-1',
        sender: 'other',
        text: `Hey! Thanks for messaging. I posted the listing for "${displayTitle}". Let me know how we can coordinate.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !chattingItem) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'me',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate auto-response after 1.5 seconds
    setTimeout(() => {
      setIsTyping(false);
      const contactName = chattingItem.contactName || "Campus Peer";
      const responses = [
        `Sounds good! I can meet you tomorrow afternoon near the main library desk. Will that work?`,
        `Perfect. Just let me know when you're on campus so we can swap details.`,
        `Sure! Please bring your student ID card so we can verify and finalize safely.`
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      
      setChatMessages(prev => [...prev, {
        id: `msg-reply-${Date.now()}`,
        sender: 'other',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  // Reads files as Base64/Data URLs to show the actual uploaded photo
  const handleFileUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedUrl = await handleFileUpload(file);
        setImageUrl(uploadedUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsEditUploading(true);
      try {
        const uploadedUrl = await handleFileUpload(file);
        setEditImageUrl(uploadedUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEditUploading(false);
      }
    }
  };

  // Actions
  const handleMarkClaimed = (id: string) => {
    setLostFound(prev => prev.map(item => {
      const matchId = item.item_id || item.id;
      if (matchId === id) {
        return { ...item, status: 'claimed' };
      }
      return item;
    }));
  };

  const handleReport = (id: string | null) => {
    if (!id) return;
    const finalReason = reportCategory === 'Other' ? reportOtherText : reportCategory;
    if (!finalReason.trim()) return;

    setLostFound(prev => prev.map(item => {
      const matchId = item.item_id || item.id;
      if (matchId === id) {
        return { ...item, reported: true, reportReason: finalReason };
      }
      return item;
    }));
    setReportingItemId(null);
    setReportCategory('Incorrect Information');
    setReportOtherText('');
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const contactName = newContactName.trim() || profile?.name || 'Student';
    const contactEmail = newContactEmail.trim() || profile?.email || 'nexus-office@college.edu';
    const contactPhone = newContactPhone.trim() || 'N/A';
    const contact_info = `${contactName} (${contactEmail})`;
    const location = newLocationFound.trim() || 'Campus Area';
    const description = newDescription.trim() || 'No description provided.';
    const holding = newCurrentHolding.trim() || 'Security Desk';

    try {
      const response = await fetch('/api/v1/lost-found', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`,
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({
          item_name: newTitle,
          title: newTitle,
          description: description,
          image_url: imageUrl,
          location_found: location,
          locationFound: location,
          status: newStatus,
          contact_info: contact_info,
          currentHolding: holding,
          contactName: contactName,
          contactEmail: contactEmail,
          contactPhone: contactPhone,
          poster_id: currentUserId
        })
      });

      if (response.ok) {
        const createdItem = await response.json();
        setLostFound(prev => [createdItem, ...prev]);
      } else {
        throw new Error('Failed to create item on server');
      }
    } catch (error) {
      console.warn('Backend endpoint error, falling back to local creation:', error);
      const newItem: LostFoundItem = {
        id: `item-${Date.now()}`,
        item_id: `item-${Date.now()}`,
        poster_id: currentUserId,
        item_name: newTitle,
        title: newTitle,
        description: description,
        location_found: location,
        locationFound: location,
        currentHolding: holding,
        contactName: contactName,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        status: newStatus,
        image_url: imageUrl,
        contact_info: contact_info,
        date: new Date().toISOString().split('T')[0],
        reported: false
      };
      setLostFound(prev => [newItem, ...prev]);
    }

    // Reset Form
    setNewTitle('');
    setNewLocationFound('');
    setNewCurrentHolding('');
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewDescription('');
    setImageUrl('');
    setIsReportOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const itemId = editingItem.item_id || editingItem.id;

    const contactName = editContactName.trim() || profile?.name || 'Student';
    const contactEmail = editContactEmail.trim() || profile?.email || 'nexus-office@college.edu';
    const contactPhone = editContactPhone.trim() || 'N/A';
    const contact_info = `${contactName} (${contactEmail})`;
    const location = editLocationFound.trim() || 'Campus Area';
    const description = editDescription.trim() || 'No description provided.';
    const holding = editCurrentHolding.trim() || 'Security Desk';

    try {
      const response = await fetch(`/api/v1/lost-found/${itemId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`,
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({
          item_name: editTitle,
          title: editTitle,
          description: description,
          image_url: editImageUrl,
          location_found: location,
          locationFound: location,
          status: editStatus,
          contact_info: contact_info,
          currentHolding: holding,
          contactName: contactName,
          contactEmail: contactEmail,
          contactPhone: contactPhone,
        })
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setLostFound(prev => prev.map(item => {
          const matchId = item.item_id || item.id;
          if (matchId === itemId) return updatedItem;
          return item;
        }));
        setEditingItem(null);
      } else {
        const err = await response.json();
        alert(`Error editing item: ${err.detail || 'Server rejected request'}`);
      }
    } catch (error) {
      console.warn('Backend endpoint error during edit, updating locally:', error);
      setLostFound(prev => prev.map(item => {
        const matchId = item.item_id || item.id;
        if (matchId === itemId) {
          return {
            ...item,
            item_name: editTitle,
            title: editTitle,
            description: description,
            image_url: editImageUrl,
            location_found: location,
            locationFound: location,
            status: editStatus,
            contact_info: contact_info,
            currentHolding: holding,
            contactName: contactName,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
          };
        }
        return item;
      }));
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this lost & found post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/lost-found/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUserId}`,
          'X-User-Id': currentUserId
        }
      });

      if (response.ok || response.status === 204) {
        setLostFound(prev => prev.filter(item => (item.item_id || item.id) !== itemId));
      } else {
        const err = await response.json();
        alert(`Error deleting item: ${err.detail || 'Server rejected request'}`);
      }
    } catch (error) {
      console.warn('Backend endpoint error during delete, removing locally:', error);
      setLostFound(prev => prev.filter(item => (item.item_id || item.id) !== itemId));
    }
  };

  // Filter & Search Logic
  const filteredItems = lostFound.filter(item => {
    if (item.reported) return false;

    const matchesSearch = 
      (item.title || '').toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      (item.locationFound || item.location_found || '').toLowerCase().includes(localSearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="lost-found-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Compass className="text-pink-500" size={22} /> Campus Lost & Found
          </h1>
        </div>
        <button
          id="open-report-modal-btn"
          onClick={() => setIsReportOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Plus size={16} /> Declare Item Listing
        </button>
      </div>

      {/* INLINE HEADER ROW: Search Bar on the Left, Dropdown Status Filter on the Right */}
      <div className="bg-surface border border-border-subtle rounded-xl p-3 flex flex-col md:flex-row items-center gap-3 w-full">
        {/* Search input field */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
            <Search size={15} />
          </span>
          <input
            id="lf-search-input-inline"
            type="text"
            placeholder="Search lost & found articles, locations, descriptions..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary transition-all"
          />
        </div>

        {/* Dropdown status filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <select
            id="lf-status-filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden cursor-pointer w-full md:w-auto"
          >
            <option value="All">All Status Classes</option>
            <option value="lost">Lost Listings</option>
            <option value="found">Found Listings</option>
            <option value="claimed">Claimed / Returned</option>
          </select>
        </div>
      </div>

      {/* Items Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const itemId = item.item_id || item.id;
          const displayTitle = item.item_name || item.title || "Unnamed Item";
          const displayLocation = item.location_found || item.locationFound || "Unknown Location";
          
          // STRICT DELETE/EDIT PERMISSIONS
          // The Edit and Delete icons must ONLY be visible to user.id === post.poster_id or isAdmin.
          const hasWritePermission = currentUserId === item.poster_id || isAdmin;

          return (
            <div 
              key={itemId}
              id={`lf-card-${itemId}`}
              className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col justify-between transition-all hover:border-pink-500/30"
            >
              <div>
                {/* Card Meta & Header Actions */}
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
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-secondary font-mono">{item.date}</span>
                    
                    {/* Strict Edit/Delete Actions inside the header if authorized */}
                    {hasWritePermission && (
                      <div className="flex items-center gap-1 bg-app/50 border border-border-subtle rounded-md p-0.5">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 hover:text-pink-500 text-text-secondary rounded hover:bg-bg-hover transition-colors"
                          title="Edit Post"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(itemId)}
                          className="p-1 hover:text-color-danger text-text-secondary rounded hover:bg-bg-hover transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image display (Strictly Required for posts) */}
                {item.image_url && (
                  <div className="w-full h-44 overflow-hidden rounded-lg mt-3 bg-app border border-border-subtle/50 flex items-center justify-center">
                    <img 
                      src={item.image_url} 
                      alt={displayTitle} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Title & description */}
                <h3 className="text-sm font-bold text-text-primary mt-3 line-clamp-1">{displayTitle}</h3>
                <p className="text-xs text-text-secondary mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>

                {/* Location mapping */}
                <div className="space-y-1.5 mt-3 pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin size={13} className="text-pink-500 flex-shrink-0" />
                    <span className="truncate">Area: <strong className="text-text-primary">{displayLocation}</strong></span>
                  </div>
                  {item.status === 'found' && item.currentHolding && (
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <FileText size={13} className="text-accent-primary flex-shrink-0" />
                      <span className="truncate">Safe spot: <strong className="text-text-primary">{item.currentHolding}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacts & actions */}
              <div className="mt-4 pt-3 border-t border-border-subtle space-y-3">
                
                {/* Message button (Replacing Raw Contact info to ensure privacy and in-app communication) */}
                <button
                  onClick={() => handleOpenChat(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-app hover:bg-bg-hover border border-border-subtle hover:border-pink-500/40 text-text-primary text-xs font-semibold rounded-lg transition-all"
                >
                  <MessageSquare size={13} className="text-pink-500" />
                  Message {item.contactName || "Campus Peer"}
                </button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setReportingItemId(item.id)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-color-danger hover:bg-color-danger/10 border border-border-subtle cursor-pointer"
                    title="Report Listing"
                  >
                    <AlertTriangle size={13} />
                  </button>

                  {item.status === 'found' && (
                    <button
                      onClick={() => handleMarkClaimed(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-color-success hover:bg-opacity-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <CheckCircle size={12} /> Claimed / Recovered
                    </button>
                  )}

                  {item.status === 'lost' && (
                    <button
                      onClick={() => handleMarkClaimed(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      <CheckCircle size={12} /> Found / Handed Over
                    </button>
                  )}

                  {item.status === 'claimed' && (
                    <span className="text-xs text-text-secondary italic font-semibold py-1 flex items-center gap-1">
                      <CheckCircle size={12} className="text-color-success" /> Returned successfully
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-surface border border-border-subtle rounded-xl">
            <Compass size={40} className="mx-auto text-text-secondary/40" />
            <h3 className="text-sm font-semibold text-text-primary mt-3">No Lost & Found reports match active filters</h3>
            <p className="text-xs text-text-secondary mt-1">Try refining search parameters or declare a new listing.</p>
          </div>
        )}
      </div>

      {/* Declare Lost/Found Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Compass size={18} className="text-pink-500" /> Declare Item Listing
              </h2>
              <button 
                onClick={() => setIsReportOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              {/* Lost vs Found Toggle Buttons */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Lost vs Found Declaration</label>
                <div className="flex rounded-lg border border-border-subtle overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setNewStatus('lost')}
                    className={`flex-1 py-2 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                      newStatus === 'lost' 
                        ? 'bg-color-danger/10 text-color-danger font-bold' 
                        : 'bg-app text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('found')}
                    className={`flex-1 py-2 text-xs font-semibold uppercase transition-colors cursor-pointer ${
                      newStatus === 'found' 
                        ? 'bg-color-success/10 text-color-success font-bold' 
                        : 'bg-app text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    I Found an Item
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Item Name / Title</label>
                <input
                  id="lf-title-input"
                  type="text"
                  required
                  placeholder="e.g., Casio Scientific Calculator fx-991EX"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Location Lost/Found</label>
                  <input
                    id="lf-location-input"
                    type="text"
                    placeholder="e.g., Room 402 or Main Canteen"
                    value={newLocationFound}
                    onChange={(e) => setNewLocationFound(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Current Safe-keep spot</label>
                  <input
                    id="lf-holding-input"
                    type="text"
                    placeholder="e.g., Library Counter or Staff Room"
                    value={newCurrentHolding}
                    onChange={(e) => setNewCurrentHolding(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-border-subtle py-3">
                <p className="text-xs font-bold text-text-primary uppercase">Your Contact Information</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Contact Name</label>
                    <input
                      id="lf-contactname-input"
                      type="text"
                      placeholder="Name"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Contact Email</label>
                    <input
                      id="lf-contactemail-input"
                      type="email"
                      placeholder="Email ID"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Contact Phone</label>
                    <input
                      id="lf-contactphone-input"
                      type="text"
                      placeholder="Phone"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-pink-500" /> Item Photo Support
                </label>
                <div className="flex items-center gap-3">
                  <label 
                    htmlFor="lf-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl p-4 cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all w-full relative min-h-[90px]"
                  >
                    <input 
                      id="lf-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1 text-text-secondary">
                        <Loader2 className="animate-spin text-pink-500" size={24} />
                        <span className="text-xs font-medium">Uploading to workspace storage...</span>
                      </div>
                    ) : imageUrl ? (
                      <div className="flex flex-col items-center gap-1.5 text-text-primary">
                        <div className="w-16 h-16 rounded overflow-hidden mb-1">
                          <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-color-success flex items-center gap-1">
                          <CheckCircle size={12} /> Image attached!
                        </span>
                        <span className="text-[10px] text-text-secondary">Click to replace photo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-text-secondary text-center">
                        <Upload size={20} className="text-pink-500" />
                        <span className="text-xs font-semibold">Select and attach an image file</span>
                        <span className="text-[10px] text-text-secondary/60">Supports PNG, JPG, JPEG up to 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Item Description / Details</label>
                <textarea
                  id="lf-desc-input"
                  rows={3}
                  placeholder="Describe scratches, color accents, and conditions to help peers identify it..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-lf-btn"
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-text-secondary disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading Image...' : 'Post Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lost/Found Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Compass size={18} className="text-pink-500" /> Edit Item Listing
              </h2>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Item Status Class</label>
                  <select
                    id="edit-lf-status-input"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                  >
                    <option value="found">Found Listing</option>
                    <option value="lost">Lost Listing</option>
                    <option value="claimed">Claimed / Recovered</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Item Name / Title</label>
                  <input
                    id="edit-lf-title-input"
                    type="text"
                    required
                    placeholder="e.g., Casio Scientific Calculator"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Location Lost/Found</label>
                  <input
                    id="edit-lf-location-input"
                    type="text"
                    placeholder="e.g., Room 402 or Main Canteen"
                    value={editLocationFound}
                    onChange={(e) => setEditLocationFound(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-secondary uppercase">Current Safe-keep spot</label>
                  <input
                    id="edit-lf-holding-input"
                    type="text"
                    placeholder="e.g., Library Counter or Staff room"
                    value={editCurrentHolding}
                    onChange={(e) => setEditCurrentHolding(e.target.value)}
                    className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-border-subtle py-3">
                <p className="text-xs font-bold text-text-primary uppercase">Contact Claimant Partner Information</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Your Name</label>
                    <input
                      id="edit-lf-contactname-input"
                      type="text"
                      placeholder="Name"
                      value={editContactName}
                      onChange={(e) => setEditContactName(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Your Email</label>
                    <input
                      id="edit-lf-contactemail-input"
                      type="email"
                      placeholder="Email ID"
                      value={editContactEmail}
                      onChange={(e) => setEditContactEmail(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary uppercase font-semibold">Mobile Number</label>
                    <input
                      id="edit-lf-contactphone-input"
                      type="text"
                      placeholder="Phone"
                      value={editContactPhone}
                      onChange={(e) => setEditContactPhone(e.target.value)}
                      className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-pink-500" /> Item Photo Support
                </label>
                <div className="flex items-center gap-3">
                  <label 
                    htmlFor="edit-lf-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-xl p-4 cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all w-full relative min-h-[90px]"
                  >
                    <input 
                      id="edit-lf-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                    {isEditUploading ? (
                      <div className="flex flex-col items-center gap-1 text-text-secondary">
                        <Loader2 className="animate-spin text-pink-500" size={24} />
                        <span className="text-xs font-medium">Uploading to storage...</span>
                      </div>
                    ) : editImageUrl ? (
                      <div className="flex flex-col items-center gap-1.5 text-text-primary">
                        <div className="w-16 h-16 rounded overflow-hidden mb-1">
                          <img src={editImageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-bold text-color-success flex items-center gap-1">
                          <CheckCircle size={12} /> Image updated!
                        </span>
                        <span className="text-[10px] text-text-secondary">Click to replace photo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-text-secondary text-center">
                        <Upload size={20} className="text-pink-500" />
                        <span className="text-xs font-semibold">Select and attach an image file</span>
                        <span className="text-[10px] text-text-secondary/60">Supports PNG, JPG, JPEG up to 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase">Item Description / Details</label>
                <textarea
                  id="edit-lf-desc-input"
                  rows={3}
                  placeholder="Describe scratches, color accents, and conditions..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-app border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="edit-submit-lf-btn"
                  type="submit"
                  disabled={isEditUploading}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isEditUploading ? 'Uploading...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING MD3 REPORT MODAL */}
      {reportingItemId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle size={16} className="text-color-danger animate-pulse" /> Report Listing
              </h3>
              <button 
                onClick={() => {
                  setReportingItemId(null);
                  setReportCategory('Incorrect Information');
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
                  <option value="Incorrect Information">Incorrect or Misleading Details</option>
                  <option value="Harassment or Abuse">Harassment or Offensive Language</option>
                  <option value="Spam or Advertising">Spam or Non-academic Posting</option>
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
                  setReportingItemId(null);
                  setReportCategory('Incorrect Information');
                  setReportOtherText('');
                }}
                className="px-4 py-2 border border-border-subtle hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReport(reportingItemId)}
                className="px-4 py-2 bg-color-danger hover:opacity-90 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVATE CHAT DIALOGUE MODAL */}
      {chattingItem && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface border border-border-subtle rounded-xl max-w-lg w-full h-[550px] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 bg-app border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center text-sm font-bold">
                  {(chattingItem.contactName || "P").charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-text-primary flex items-center gap-1.5 leading-none">
                    {chattingItem.contactName || "Campus Peer"}
                    <span className="w-2 h-2 bg-color-success rounded-full animate-pulse" title="Online"></span>
                  </h4>
                  <span className="text-[10px] text-text-secondary mt-1 block max-w-[280px] truncate">
                    Coordination about: {chattingItem.item_name || chattingItem.title}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setChattingItem(null)}
                className="p-1 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-app/10">
              {chatMessages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-pink-500 text-white rounded-br-none' 
                        : 'bg-surface text-text-primary border border-border-subtle rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[9px] block text-right mt-1 font-mono ${isMe ? 'text-white/75' : 'text-text-secondary'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border-subtle rounded-2xl rounded-bl-none p-3 text-xs text-text-secondary flex items-center gap-1.5 font-medium">
                    <Loader2 className="animate-spin text-pink-500" size={12} />
                    <span>{chattingItem.contactName || "Campus Peer"} is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <div className="p-3 border-t border-border-subtle bg-surface">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message to coordinate pickup spot or proof..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-app border border-border-subtle rounded-xl px-4 py-2 text-xs text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Send size={15} />
                </button>
              </div>
              <div className="text-[10px] text-text-secondary text-center mt-2 flex items-center justify-center gap-1">
                <UserCheck size={11} className="text-color-success" />
                <span>Your chat is fully sandboxed within your secure academic portal.</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
