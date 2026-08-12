import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import NotesView from './components/NotesView';
import TasksView from './components/TasksView';
import DoubtBoxView from './components/DoubtBoxView';
import LostFoundView from './components/LostFoundView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import { Note, Commission, Doubt, LostFoundItem, StudentProfile } from './types';

// --- INITIAL SEED DATA ---
const INITIAL_PROFILE: StudentProfile = {
  id: 'student-123',
  name: 'Harshit Kataram',
  division: 'A',
  rollNo: '24',
  seatNo: '24TCS192',
  branch: 'Computer Science',
  semester: 6,
  college: 'Nirmala Memorial Foundation College, Kandivali, Mumbai',
  rating: 4.8,
  earnings: 650,
  completedTasksCount: 2,
  uploadedNotesCount: 4
};

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Advanced Machine Learning - Deep Neural Networks lecture notes',
    subject: 'Machine Learning (CS-601)',
    branch: 'Computer Science',
    semester: 6,
    rating: 4.8,
    ratingCount: 15,
    upvotes: 34,
    fileType: 'pdf',
    fileSize: '4.2 MB',
    downloads: 12,
    uploadedBy: 'Aditya Roy',
    description: 'Detailed explanation of feedforward propagation, backpropagation, gradient descent variants, activation functions (ReLU, Sigmoid, GELU), and overfitting prevention techniques.',
    date: '2026-07-09',
    reported: false
  },
  {
    id: 'note-2',
    title: 'Data Structures and Algorithms - Cheat Sheet for technical interviews',
    subject: 'Data Structures and Algorithms',
    branch: 'Computer Science',
    semester: 3,
    rating: 4.9,
    ratingCount: 24,
    upvotes: 52,
    fileType: 'pdf',
    fileSize: '1.8 MB',
    downloads: 41,
    uploadedBy: 'Harshit Kataram', // Uploaded by current student
    description: 'Includes complexities, code drafts, and dry runs for graph algorithms (Dijkstra, Bellman-Ford, Kruskal), tree traversals, sliding window pattern, and dynamic programming paradigms.',
    date: '2026-07-11',
    reported: false
  },
  {
    id: 'note-3',
    title: 'Microprocessors and Assembly Language manual',
    subject: 'Microprocessors & Microcontrollers',
    branch: 'Electronics',
    semester: 4,
    rating: 4.2,
    ratingCount: 5,
    upvotes: 18,
    fileType: 'docx',
    fileSize: '2.5 MB',
    downloads: 5,
    uploadedBy: 'Prof. Rajesh Sen',
    description: 'Laboratory guide for 8086 processor instruction set, addressing modes, registers mapping, and solved assembly examples for arithmetic array sorting.',
    date: '2026-07-05',
    reported: false
  },
  {
    id: 'note-4',
    title: 'Applied Engineering Mathematics III - Solved University Papers',
    subject: 'Engineering Mathematics',
    branch: 'Applied Sciences',
    semester: 3,
    rating: 4.6,
    ratingCount: 8,
    upvotes: 27,
    fileType: 'pdf',
    fileSize: '5.6 MB',
    downloads: 19,
    uploadedBy: 'Neha Sawant',
    description: 'Step-by-step mathematical proofs for Fourier series expansion, Laplace transformations, complex variables mapping, and linear differential equations of higher orders.',
    date: '2026-07-10',
    reported: false
  }
];

const INITIAL_TASKS: Commission[] = [
  {
    id: 'task-1',
    title: 'Implement state-managed React To-Do Application with local persistence',
    description: 'Need a beautiful React component with input field validations, custom list transitions, status check boxes, clear complete triggers, and persistent browser sync.',
    budget: 450,
    deadline: '2026-07-15',
    branch: 'Computer Science',
    status: 'open',
    clientName: 'Aarav Sharma',
    clientRating: 4.7,
    reported: false
  },
  {
    id: 'task-2',
    title: 'Technical analytical report comparing cloud infrastructure cost policies',
    description: 'A 5-page PDF draft evaluating GCP, AWS, and Azure cost structures for Kubernetes cluster scaling, load balancers, and egress data costs.',
    budget: 800,
    deadline: '2026-07-20',
    branch: 'Information Technology',
    status: 'open',
    clientName: 'Pooja Patil',
    clientRating: 4.9,
    reported: false
  },
  {
    id: 'task-3',
    title: 'Laser Wavelength experiment lab calculations with error graph',
    description: 'Complete the trigonometric calculation sheet and graph for the helium-neon diffraction grating laser experiment. Must compile tabular logs accurately.',
    budget: 300,
    deadline: '2026-07-13',
    branch: 'Applied Sciences',
    status: 'accepted',
    acceptedBy: 'Me', // Accepted by current student
    clientName: 'Kabir Mehta',
    clientRating: 4.5,
    reported: false
  },
  {
    id: 'task-4',
    title: 'Write Python data parsing script for CSV spreadsheets',
    description: 'Parse student attendance sheet records from CSV. Handle missing fields, calculate aggregates, and export to visual charts using pandas and matplotlib.',
    budget: 500,
    deadline: '2026-07-08',
    branch: 'Computer Science',
    status: 'completed',
    acceptedBy: 'Me',
    clientName: 'Anaya Roy',
    clientRating: 4.9,
    reported: false
  }
];

const INITIAL_DOUBTS: Doubt[] = [
  {
    id: 'doubt-1',
    title: 'How to prove that the Turing Halting Problem is undecidable?',
    description: "I understand the basic definition of Turing machines, but I am struggling to formulate the diagonalisation argument in simple layman terms. Can someone present the proof logically without heavy notation?",
    category: 'Computer Science',
    authorAnonymousName: 'Anonymous Owl',
    answers: [
      {
        id: 'ans-1',
        text: "Assume there exists a machine H that decides Halting for any program. If we create a custom program D that takes another program's code, asks H if it halts, and then does the EXACT OPPOSITE (halts if H says loop, loops if H says halt). If we feed D's code into D itself, H(D,D) is forced to contradict itself. Thus, H cannot exist.",
        author: 'Anonymous Fox',
        date: '2026-07-11',
        upvotes: 8,
        verified: true
      }
    ],
    upvotes: 12,
    date: '2026-07-11',
    reported: false
  },
  {
    id: 'doubt-2',
    title: 'What is the practical difference between Debounce and Throttle in React?',
    description: 'They both limit execution rates, but I get confused when building high-frequency scrolling trackers versus interactive global search inputs. Which one fits where?',
    category: 'Computer Science',
    authorAnonymousName: 'Anonymous Dolphin',
    answers: [
      {
        id: 'ans-2',
        text: 'Debouncing delays execution until a set delay has elapsed since the last trigger event. Perfect for Search autocomplete inputs where you want to wait for typing silence. Throttling limits execution to at most once per delay window, regardless of triggers. Perfect for scroll/resize logging.',
        author: 'Anonymous Bear',
        date: '2026-07-12',
        upvotes: 11,
        verified: true
      }
    ],
    upvotes: 15,
    date: '2026-07-12',
    reported: false
  }
];

const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf-1',
    title: 'Black Lenovo ThinkPad Stylus pen',
    description: 'Found an active black digital stylus pen left behind on Table 4 in the library. Has a red tip, likely belongs to a Lenovo Yoga or ThinkPad laptop.',
    locationFound: 'Library Reading Room Table 4',
    currentHolding: 'Library Main Desk Counter (Mrs. Deshmukh)',
    contactName: 'Librarian Assistant',
    contactEmail: 'library-desk@college.edu',
    contactPhone: '022-2849503',
    status: 'found',
    date: '2026-07-11',
    reported: false
  },
  {
    id: 'lf-2',
    title: 'Casio Scientific Calculator fx-991EX Classwiz',
    description: 'Black scientific calculator left behind on the back benches of Seminar Hall Room 302 during the morning workshop. Scratched initials "R.S." on the reverse slide cover.',
    locationFound: 'Seminar Hall Room 302',
    currentHolding: 'CS Department HOD Office Cabin',
    contactName: 'Prof. Rajesh Sen',
    contactEmail: 'rsen-cs@college.edu',
    contactPhone: '982049105',
    status: 'found',
    date: '2026-07-10',
    reported: false
  },
  {
    id: 'lf-3',
    title: 'Brown leather wallet with ID Card',
    description: 'Lost a brown leather wallet while playing football on the ground. Contains college ID card and travel passes. Please return to sports room if found.',
    locationFound: 'Sports Playground Bleachers',
    currentHolding: 'N/A',
    contactName: 'Harsh Gupta',
    contactEmail: 'hgupta-stud@college.edu',
    contactPhone: '9120491823',
    status: 'lost',
    date: '2026-07-12',
    reported: false
  }
];

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nexus_token');
  });

  const isAuthenticated = !!token;
  const [showAuth, setShowAuth] = useState(false);

  // Global Navigation state
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return localStorage.getItem('nexus_current_tab') || 'dashboard';
  });

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Mode and Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('nexus_theme') as 'light' | 'dark') || 'light';
  });

  // Load / Sync lists with LocalStorage
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('nexus_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('nexus_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [tasks, setTasks] = useState<Commission[]>(() => {
    const saved = localStorage.getItem('nexus_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [doubts, setDoubts] = useState<Doubt[]>(() => {
    const saved = localStorage.getItem('nexus_doubts');
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  const [lostFound, setLostFound] = useState<LostFoundItem[]>(() => {
    const saved = localStorage.getItem('nexus_lostfound');
    return saved ? JSON.parse(saved) : INITIAL_LOST_FOUND;
  });

  // Effect to apply document theme attribute
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem('nexus_current_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    localStorage.setItem('nexus_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nexus_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('nexus_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('nexus_lostfound', JSON.stringify(lostFound));
  }, [lostFound]);

  const handleAuthSuccess = (newToken: string, newProfile: StudentProfile) => {
    localStorage.setItem('nexus_token', newToken);
    localStorage.setItem('nexus_profile', JSON.stringify(newProfile));
    setToken(newToken);
    setProfile(newProfile);
    if (newProfile.theme_preference) {
      setTheme(newProfile.theme_preference as 'light' | 'dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_profile');
    localStorage.removeItem('nexus_current_tab');
    setToken(null);
    setProfile(INITIAL_PROFILE);
    setCurrentTab('dashboard');
    setTheme('light');
  };

  // Periodically fetch and sync profile from backend
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/v1/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
            localStorage.setItem('nexus_profile', JSON.stringify(data));
            if (data.theme_preference) {
              setTheme(data.theme_preference as 'light' | 'dark');
            }
          } else if (response.status === 401) {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to sync profile from server:', err);
        }
      };
      fetchProfile();
    }
  }, [isAuthenticated, token]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    if (isAuthenticated && token) {
      try {
        await fetch('/api/v1/user/profile/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme_preference: nextTheme }),
        });
      } catch (err) {
        console.error('Failed to save theme choice to database settings:', err);
      }
    }
  };

  // Helper action: increase uploaded notes count
  const handleIncreaseUploadCount = () => {
    setProfile(prev => ({
      ...prev,
      uploadedNotesCount: prev.uploadedNotesCount + 1
    }));
  };

  // Helper action: complete task and add to wallet
  const handleCompleteTaskAndPayout = (budget: number) => {
    setProfile(prev => ({
      ...prev,
      earnings: prev.earnings + budget,
      completedTasksCount: prev.completedTasksCount + 1,
      rating: parseFloat(Math.min(5.0, prev.rating + 0.05).toFixed(2)) // Small reward rating boost
    }));
  };

  // Quick Action global redirect and click triggers
  const handleOpenUploadNoteFlow = () => {
    setCurrentTab('notes');
    setTimeout(() => {
      const btn = document.getElementById('open-upload-modal-btn');
      if (btn) btn.click();
    }, 100);
  };

  const handleOpenCreateTaskFlow = () => {
    setCurrentTab('tasks');
    setTimeout(() => {
      const btn = document.getElementById('open-task-modal-btn');
      if (btn) btn.click();
    }, 100);
  };

  const handleOpenAskDoubtFlow = () => {
    setCurrentTab('doubt-box');
    setTimeout(() => {
      const btn = document.getElementById('open-doubt-modal-btn');
      if (btn) btn.click();
    }, 100);
  };

  const handleOpenPostItemFlow = () => {
    setCurrentTab('lost-found');
    setTimeout(() => {
      const btn = document.getElementById('open-report-modal-btn');
      if (btn) btn.click();
    }, 100);
  };

  // Render active tab child component
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            notes={notes}
            tasks={tasks}
            doubts={doubts}
            lostFound={lostFound}
            profile={profile}
            setCurrentTab={setCurrentTab}
            onOpenUploadNote={handleOpenUploadNoteFlow}
            onOpenCreateTask={handleOpenCreateTaskFlow}
            onOpenAskDoubt={handleOpenAskDoubtFlow}
            onOpenPostItem={handleOpenPostItemFlow}
          />
        );
      case 'notes':
        return (
          <NotesView
            notes={notes}
            setNotes={setNotes}
            searchQuery={searchQuery}
            onIncreaseUploadCount={handleIncreaseUploadCount}
            profile={profile}
            token={token}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            setTasks={setTasks}
            searchQuery={searchQuery}
            onIncreaseCompletedTasks={handleCompleteTaskAndPayout}
            token={token}
            profile={profile}
          />
        );
      case 'doubt-box':
        return (
          <DoubtBoxView
            doubts={doubts}
            setDoubts={setDoubts}
            searchQuery={searchQuery}
            token={token}
          />
        );
      case 'lost-found':
        return (
          <LostFoundView
            lostFound={lostFound}
            setLostFound={setLostFound}
            searchQuery={searchQuery}
            profile={profile}
          />
        );
      case 'profile':
        return (
          <ProfileView
            profile={profile}
            setProfile={setProfile}
            notes={notes}
            tasks={tasks}
            theme={theme}
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'settings':
        return (
          <SettingsView
            profile={profile}
            setProfile={setProfile}
            theme={theme}
            onThemeToggle={toggleTheme}
            onLogout={handleLogout}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            token={token}
            profile={profile}
            setCurrentTab={setCurrentTab}
            onContentDeleted={() => {
              const fetchNotes = async () => {
                try {
                  const res = await fetch('/api/v1/notes');
                  if (res.ok) setNotes(await res.json());
                } catch(e) {}
              };
              const fetchTasks = async () => {
                try {
                  const headers: Record<string, string> = {};
                  if (token) headers['Authorization'] = `Bearer ${token}`;
                  const res = await fetch('/api/v1/tasks', { headers });
                  if (res.ok) {
                    const data = await res.json();
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
                } catch(e) {}
              };
              fetchNotes();
              fetchTasks();
            }}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-text-secondary">
            View is under active construction.
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <AuthView 
          onAuthSuccess={handleAuthSuccess} 
          onBack={() => setShowAuth(false)} 
        />
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      theme={theme}
      toggleTheme={toggleTheme}
      profile={profile}
    >
      {renderTabContent()}
    </Layout>
  );
}
