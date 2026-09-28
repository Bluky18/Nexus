import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'NEXUS_JWT_SECRET_KEY_2026';

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper for SHA-256 hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// --- INITIAL IN-MEMORY DATA STORE ---

interface User {
  id: string;
  name: string;
  division: string;
  rollNo: string;
  seatNo: string;
  branch: string;
  email: string;
  password_hash: string;
  theme_preference: 'light' | 'dark' | string;
  semester: number;
  college: string;
  rating: number;
  earnings: number;
  completedTasksCount: number;
  uploadedNotesCount: number;
  isAdmin: boolean;
}

const users: User[] = [
  {
    id: 'student-123',
    name: 'Harshit Kataram',
    division: 'A',
    rollNo: '24',
    seatNo: '24TCS192',
    branch: 'Computer Science',
    email: 'harshitcsb@gmail.com',
    password_hash: hashPassword('password123'),
    theme_preference: 'light',
    semester: 6,
    college: 'Nirmala Memorial Foundation College, Kandivali, Mumbai',
    rating: 4.8,
    earnings: 650,
    completedTasksCount: 2,
    uploadedNotesCount: 4,
    isAdmin: true
  }
];

let notes = [
  {
    id: 'note-1',
    title: 'Advanced Machine Learning - Deep Neural Networks lecture notes',
    subject: 'Machine Learning (CS-601)',
    branch: 'Computer Science',
    semester: 6,
    rating: 4.8,
    ratingCount: 15,
    upvotes: 34,
    userUpvoted: false,
    fileType: 'pdf',
    fileSize: '4.2 MB',
    downloads: 12,
    uploadedBy: 'Aditya Roy',
    uploader_name: 'Aditya Roy',
    file_url: 'https://example.com/files/ml_notes.pdf',
    description: 'Detailed explanation of feedforward propagation, backpropagation, gradient descent variants, activation functions (ReLU, Sigmoid, GELU), and overfitting prevention techniques.',
    date: '2026-07-09',
    reported: false,
    reportReason: ''
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
    userUpvoted: false,
    fileType: 'pdf',
    fileSize: '1.8 MB',
    downloads: 41,
    uploadedBy: 'Harshit Kataram',
    uploader_name: 'Harshit Kataram',
    file_url: 'https://example.com/files/dsa_cheatsheet.pdf',
    description: 'Includes complexities, code drafts, and dry runs for graph algorithms (Dijkstra, Bellman-Ford, Kruskal), tree traversals, sliding window pattern, and dynamic programming paradigms.',
    date: '2026-07-11',
    reported: false,
    reportReason: ''
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
    userUpvoted: false,
    fileType: 'docx',
    fileSize: '2.5 MB',
    downloads: 5,
    uploadedBy: 'Prof. Rajesh Sen',
    uploader_name: 'Prof. Rajesh Sen',
    file_url: 'https://example.com/files/microprocessor_manual.docx',
    description: 'Laboratory guide for 8086 processor instruction set, addressing modes, registers mapping, and solved assembly examples for arithmetic array sorting.',
    date: '2026-07-05',
    reported: false,
    reportReason: ''
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
    userUpvoted: false,
    fileType: 'pdf',
    fileSize: '5.6 MB',
    downloads: 19,
    uploadedBy: 'Neha Sawant',
    uploader_name: 'Neha Sawant',
    file_url: 'https://example.com/files/math_solved_papers.pdf',
    description: 'Step-by-step mathematical proofs for Fourier series expansion, Laplace transformations, complex variables mapping, and linear differential equations of higher orders.',
    date: '2026-07-10',
    reported: false,
    reportReason: ''
  }
];

let tasks = [
  {
    id: 'task-1',
    task_id: 'task-1',
    title: 'Implement state-managed React To-Do Application with local persistence',
    description: 'Need a beautiful React component with input field validations, custom list transitions, status check boxes, clear complete triggers, and persistent browser sync.',
    budget: 450,
    price: 450,
    deadline: '2026-07-15',
    branch: 'Computer Science',
    status: 'open',
    clientName: 'Aarav Sharma',
    clientRating: 4.7,
    poster_id: 'student-aarav',
    reported: false,
    reportReason: ''
  },
  {
    id: 'task-2',
    task_id: 'task-2',
    title: 'Technical analytical report comparing cloud infrastructure cost policies',
    description: 'A 5-page PDF draft evaluating GCP, AWS, and Azure cost structures for Kubernetes cluster scaling, load balancers, and egress data costs.',
    budget: 800,
    price: 800,
    deadline: '2026-07-20',
    branch: 'Information Technology',
    status: 'open',
    clientName: 'Pooja Patil',
    clientRating: 4.9,
    poster_id: 'student-pooja',
    reported: false,
    reportReason: ''
  },
  {
    id: 'task-3',
    task_id: 'task-3',
    title: 'Laser Wavelength experiment lab calculations with error graph',
    description: 'Complete the trigonometric calculation sheet and graph for the helium-neon diffraction grating laser experiment. Must compile tabular logs accurately.',
    budget: 300,
    price: 300,
    deadline: '2026-07-13',
    branch: 'Applied Sciences',
    status: 'accepted',
    acceptedBy: 'Me',
    clientName: 'Kabir Mehta',
    clientRating: 4.5,
    poster_id: 'student-kabir',
    reported: false,
    reportReason: ''
  },
  {
    id: 'task-4',
    task_id: 'task-4',
    title: 'Write Python data parsing script for CSV spreadsheets',
    description: 'Parse student attendance sheet records from CSV. Handle missing fields, calculate aggregates, and export to visual charts using pandas and matplotlib.',
    budget: 500,
    price: 500,
    deadline: '2026-07-08',
    branch: 'Computer Science',
    status: 'completed',
    acceptedBy: 'Me',
    clientName: 'Anaya Roy',
    clientRating: 4.9,
    poster_id: 'student-anaya',
    reported: false,
    reportReason: ''
  }
];

let doubts = [
  {
    id: 'doubt-1',
    doubt_id: 'doubt-1',
    title: 'How to prove that the Turing Halting Problem is undecidable?',
    question: 'How to prove that the Turing Halting Problem is undecidable?',
    description: "I understand the basic definition of Turing machines, but I am struggling to formulate the diagonalisation argument in simple layman terms. Can someone present the proof logically without heavy notation?",
    category: 'Computer Science',
    subject: 'Computer Science',
    authorAnonymousName: 'Anonymous Owl',
    answers: [
      {
        id: 'ans-1',
        answer_id: 'ans-1',
        text: "Assume there exists a machine H that decides Halting for any program. If we create a custom program D that takes another program's code, asks H if it halts, and then does the EXACT OPPOSITE (halts if H says loop, loops if H says halt). If we feed D's code into D itself, H(D,D) is forced to contradict itself. Thus, H cannot exist.",
        author: 'Anonymous Fox',
        date: '2026-07-11',
        timestamp: '2026-07-11',
        upvotes: 8,
        userUpvoted: false,
        verified: true
      }
    ],
    upvotes: 12,
    userUpvoted: false,
    date: '2026-07-11',
    timestamp: '2026-07-11',
    reported: false,
    reportReason: ''
  },
  {
    id: 'doubt-2',
    doubt_id: 'doubt-2',
    title: 'What is the practical difference between Debounce and Throttle in React?',
    question: 'What is the practical difference between Debounce and Throttle in React?',
    description: 'They both limit execution rates, but I get confused when building high-frequency scrolling trackers versus interactive global search inputs. Which one fits where?',
    category: 'Computer Science',
    subject: 'Computer Science',
    authorAnonymousName: 'Anonymous Dolphin',
    answers: [
      {
        id: 'ans-2',
        answer_id: 'ans-2',
        text: 'Debouncing delays execution until a set delay has elapsed since the last trigger event. Perfect for Search autocomplete inputs where you want to wait for typing silence. Throttling limits execution to at most once per delay window, regardless of triggers. Perfect for scroll/resize logging.',
        author: 'Anonymous Bear',
        date: '2026-07-12',
        timestamp: '2026-07-12',
        upvotes: 11,
        userUpvoted: false,
        verified: true
      }
    ],
    upvotes: 15,
    userUpvoted: false,
    date: '2026-07-12',
    timestamp: '2026-07-12',
    reported: false,
    reportReason: ''
  }
];

let lostFound = [
  {
    id: 'lf-1',
    item_id: 'lf-1',
    poster_id: 'student-abc',
    title: 'Black Lenovo ThinkPad Stylus pen',
    item_name: 'Black Lenovo ThinkPad Stylus pen',
    description: 'Found an active black digital stylus pen left behind on Table 4 in the library. Has a red tip, likely belongs to a Lenovo Yoga or ThinkPad laptop.',
    image_url: 'https://images.unsplash.com/photo-1585336261026-77864380eb0b?auto=format&fit=crop&w=600&q=80',
    location_found: 'Library Reading Room Table 4',
    locationFound: 'Library Reading Room Table 4',
    currentHolding: 'Library Main Desk Counter (Mrs. Deshmukh)',
    contact_info: 'Librarian Assistant (library-desk@college.edu)',
    contactName: 'Librarian Assistant',
    contactEmail: 'library-desk@college.edu',
    contactPhone: '022-2849503',
    status: 'found',
    date: '2026-07-11',
    created_at: '2026-07-11T10:00:00.000Z',
    reported: false,
    reportReason: ''
  },
  {
    id: 'lf-2',
    item_id: 'lf-2',
    poster_id: 'student-abc',
    title: 'Casio Scientific Calculator fx-991EX Classwiz',
    item_name: 'Casio Scientific Calculator fx-991EX Classwiz',
    description: 'Black scientific calculator left behind on the back benches of Seminar Hall Room 302 during the morning workshop. Scratched initials "R.S." on the reverse slide cover.',
    image_url: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80',
    location_found: 'Seminar Hall Room 302',
    locationFound: 'Seminar Hall Room 302',
    currentHolding: 'CS Department HOD Office Cabin',
    contact_info: 'Prof. Rajesh Sen (rsen-cs@college.edu)',
    contactName: 'Prof. Rajesh Sen',
    contactEmail: 'rsen-cs@college.edu',
    contactPhone: '982049105',
    status: 'found',
    date: '2026-07-10',
    created_at: '2026-07-10T14:30:00.000Z',
    reported: false,
    reportReason: ''
  },
  {
    id: 'lf-3',
    item_id: 'lf-3',
    poster_id: 'student-123',
    title: 'Brown leather wallet with ID Card',
    item_name: 'Brown leather wallet with ID Card',
    description: 'Lost a brown leather wallet while playing football on the ground. Contains college ID card and travel passes. Please return to sports room if found.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    location_found: 'Sports Playground Bleachers',
    locationFound: 'Sports Playground Bleachers',
    currentHolding: 'N/A',
    contact_info: 'Harsh Gupta (hgupta-stud@college.edu)',
    contactName: 'Harsh Gupta',
    contactEmail: 'hgupta-stud@college.edu',
    contactPhone: '9120491823',
    status: 'lost',
    date: '2026-07-12',
    created_at: '2026-07-12T08:15:00.000Z',
    reported: false,
    reportReason: ''
  }
];

// Helper function to extract user from Authorization header
function getCurrentUser(req: express.Request): User {
  const authHeader = req.headers.authorization;
  const xUserId = req.headers['x-user-id'] as string;
  let userId = xUserId;

  if (!userId && authHeader) {
    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : authHeader;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.sub;
    } catch {
      userId = token;
    }
  }

  if (userId) {
    const user = users.find(u => u.id === userId || u.email === userId);
    if (user) return user;
  }

  return users[0];
}

// User without password
function sanitizeUser(user: User) {
  const { password_hash, ...rest } = user;
  return rest;
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth: Signup
app.post('/api/v1/auth/signup', (req, res) => {
  const { name, division, rollNo, branch, email, password } = req.body;
  if (!name || !division || !rollNo || !branch || !email || !password) {
    return res.status(400).json({ error: 'All fields are required', detail: 'All fields are required' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered', detail: 'Email already registered' });
  }

  const newUser: User = {
    id: `student-${Date.now()}`,
    name,
    division,
    rollNo,
    seatNo: `${division}${rollNo}TCS${Math.floor(100 + Math.random() * 900)}`,
    branch,
    email,
    password_hash: hashPassword(password),
    theme_preference: 'light',
    semester: 6,
    college: 'Nirmala Memorial Foundation College, Kandivali, Mumbai',
    rating: 5.0,
    earnings: 0,
    completedTasksCount: 0,
    uploadedNotesCount: 0,
    isAdmin: email.toLowerCase() === 'harshitcsb@gmail.com'
  };

  users.push(newUser);
  const token = jwt.sign({ sub: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    token,
    user: sanitizeUser(newUser)
  });
});

// Auth: Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password', detail: 'Please enter both email and password' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password', detail: 'Invalid email or password' });
  }

  const hashed = hashPassword(password);
  if (user.password_hash && user.password_hash !== hashed) {
    return res.status(401).json({ error: 'Invalid email or password', detail: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    status: 'success',
    token,
    user: sanitizeUser(user)
  });
});

// Auth: Google Login
app.post('/api/v1/auth/google-login', (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required', detail: 'idToken is required' });
  }

  try {
    let email = '';
    let name = 'Google User';

    const decoded: any = jwt.decode(idToken);
    if (decoded && decoded.email) {
      email = decoded.email;
      name = decoded.name || email.split('@')[0];
    } else {
      email = 'harshitcsb@gmail.com';
      name = 'Harshit Kataram';
    }

    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `student-g-${Date.now()}`,
        name,
        division: 'A',
        rollNo: '24',
        seatNo: '24TCS192',
        branch: 'Computer Science',
        email,
        password_hash: '',
        theme_preference: 'light',
        semester: 6,
        college: 'Nirmala Memorial Foundation College, Kandivali, Mumbai',
        rating: 4.8,
        earnings: 650,
        completedTasksCount: 2,
        uploadedNotesCount: 4,
        isAdmin: email.toLowerCase() === 'harshitcsb@gmail.com'
      };
      users.push(user);
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      status: 'success',
      token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

// User Profile
app.get('/api/v1/user/profile', (req, res) => {
  const user = getCurrentUser(req);
  return res.json(sanitizeUser(user));
});

// User Profile Settings
app.put('/api/v1/user/profile/settings', (req, res) => {
  const user = getCurrentUser(req);
  const { theme_preference } = req.body;
  if (theme_preference) {
    user.theme_preference = theme_preference;
  }
  return res.json({
    status: 'success',
    message: 'Theme preference updated successfully',
    theme_preference: user.theme_preference
  });
});

// Notes: Get all (supports filtering)
app.get('/api/v1/notes', (req, res) => {
  const { semester, subject, branch } = req.query;
  let filtered = [...notes];
  if (semester && semester !== 'All') {
    filtered = filtered.filter(n => n.semester === Number(semester));
  }
  if (subject && subject !== 'All') {
    filtered = filtered.filter(n => n.subject.toLowerCase().includes(String(subject).toLowerCase()));
  }
  if (branch && branch !== 'All') {
    filtered = filtered.filter(n => n.branch.toLowerCase() === String(branch).toLowerCase());
  }
  return res.json(filtered);
});

// Notes: Create note
app.post('/api/v1/notes', (req, res) => {
  const user = getCurrentUser(req);
  const { title, subject, semester, branch, fileType, fileSize, description, file_url } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: 'Title and subject are required' });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    title,
    subject,
    branch: branch || 'Computer Science',
    semester: Number(semester) || 6,
    rating: 5.0,
    ratingCount: 1,
    upvotes: 1,
    userUpvoted: true,
    fileType: fileType || 'pdf',
    fileSize: fileSize || '2.4 MB',
    downloads: 0,
    uploadedBy: user.name,
    uploader_name: user.name,
    file_url: file_url || `https://example.com/files/${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_notes.pdf`,
    description: description || 'Study material uploaded to Nexus.',
    date: new Date().toISOString().split('T')[0],
    reported: false,
    reportReason: ''
  };

  notes.unshift(newNote);
  user.uploadedNotesCount = (user.uploadedNotesCount || 0) + 1;
  return res.status(201).json(newNote);
});

// Notes: Delete note
app.delete('/api/v1/notes/:id', (req, res) => {
  const { id } = req.params;
  notes = notes.filter(n => n.id !== id);
  return res.json({ status: 'success', message: 'Note deleted' });
});

// Notes: Report note
app.post('/api/v1/notes/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const note = notes.find(n => n.id === id);
  if (note) {
    note.reported = true;
    note.reportReason = reason || 'Inappropriate content';
  }
  return res.json({ status: 'success', message: 'Note reported' });
});

// Notes: Rate note
app.post('/api/v1/notes/:id/rate', (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  const note = notes.find(n => n.id === id);
  if (note && typeof score === 'number') {
    const total = note.rating * note.ratingCount + score;
    note.ratingCount += 1;
    note.rating = parseFloat((total / note.ratingCount).toFixed(1));
  }
  return res.json(note || { error: 'Note not found' });
});

// Notes: Upvote note
app.post('/api/v1/notes/:id/upvote', (req, res) => {
  const { id } = req.params;
  const note = notes.find(n => n.id === id);
  if (note) {
    note.userUpvoted = !note.userUpvoted;
    note.upvotes = note.userUpvoted ? note.upvotes + 1 : note.upvotes - 1;
  }
  return res.json(note || { error: 'Note not found' });
});

// Tasks: Get all
app.get('/api/v1/tasks', (req, res) => {
  const { status_filter, branch } = req.query;
  let filtered = [...tasks];
  if (status_filter && status_filter !== 'All') {
    filtered = filtered.filter(t => t.status === status_filter);
  }
  if (branch && branch !== 'All') {
    filtered = filtered.filter(t => t.branch === branch);
  }
  return res.json(filtered);
});

// Tasks: Create task
app.post('/api/v1/tasks', (req, res) => {
  const user = getCurrentUser(req);
  const { title, description, budget, price, deadline, branch } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const finalPrice = Number(budget || price) || 300;
  const newTask = {
    id: `task-${Date.now()}`,
    task_id: `task-${Date.now()}`,
    title,
    description,
    budget: finalPrice,
    price: finalPrice,
    deadline: deadline || '2026-07-20',
    branch: branch || 'Computer Science',
    status: 'open',
    clientName: user.name,
    clientRating: user.rating || 4.8,
    poster_id: user.id,
    reported: false,
    reportReason: ''
  };

  tasks.unshift(newTask);
  return res.status(201).json(newTask);
});

// Tasks: Delete task
app.delete('/api/v1/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id && t.task_id !== id);
  return res.json({ status: 'success', message: 'Task deleted' });
});

// Tasks: Report task
app.post('/api/v1/tasks/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const task = tasks.find(t => t.id === id || t.task_id === id);
  if (task) {
    task.reported = true;
    task.reportReason = reason || 'Academic Dishonesty';
  }
  return res.json({ status: 'success', message: 'Task reported' });
});

// Tasks: Update task (accept / complete)
app.patch('/api/v1/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id || t.task_id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  Object.assign(task, req.body);
  return res.json(task);
});

// Doubts: Get all
app.get('/api/v1/doubts', (req, res) => {
  const { subject, category } = req.query;
  let filtered = [...doubts];
  const filterCat = subject || category;
  if (filterCat && filterCat !== 'All') {
    filtered = filtered.filter(d => (d.category || d.subject || '').toLowerCase() === String(filterCat).toLowerCase());
  }
  return res.json(filtered);
});

// Doubts: Create doubt
app.post('/api/v1/doubts', (req, res) => {
  const { question, title, subject, category, description, authorAnonymousName } = req.body;
  const doubtTitle = question || title;
  if (!doubtTitle) {
    return res.status(400).json({ error: 'Question title is required' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const newDoubt = {
    id: `doubt-${Date.now()}`,
    doubt_id: `doubt-${Date.now()}`,
    title: doubtTitle,
    question: doubtTitle,
    description: description || '',
    subject: subject || category || 'General',
    category: category || subject || 'General',
    authorAnonymousName: authorAnonymousName || 'Anonymous Owl',
    answers: [],
    upvotes: 1,
    userUpvoted: true,
    date: todayStr,
    timestamp: todayStr,
    reported: false,
    reportReason: ''
  };

  doubts.unshift(newDoubt);
  return res.status(201).json(newDoubt);
});

// Doubts: Answer doubt
app.post('/api/v1/doubts/answer', (req, res) => {
  const { doubt_id, text, author } = req.body;
  if (!doubt_id || !text) {
    return res.status(400).json({ error: 'doubt_id and text are required' });
  }

  const doubt = doubts.find(d => d.id === doubt_id || d.doubt_id === doubt_id);
  if (!doubt) {
    return res.status(404).json({ error: 'Doubt not found' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const newAns = {
    id: `ans-${Date.now()}`,
    answer_id: `ans-${Date.now()}`,
    text,
    author: author || 'Anonymous Otter',
    date: todayStr,
    timestamp: todayStr,
    upvotes: 0,
    userUpvoted: false,
    verified: false
  };

  doubt.answers.push(newAns);
  return res.json(doubt);
});

// Doubts: Upvote doubt
app.post('/api/v1/doubts/:id/upvote', (req, res) => {
  const { id } = req.params;
  const doubt = doubts.find(d => d.id === id || d.doubt_id === id);
  if (doubt) {
    doubt.userUpvoted = !doubt.userUpvoted;
    doubt.upvotes = doubt.userUpvoted ? doubt.upvotes + 1 : doubt.upvotes - 1;
  }
  return res.json(doubt || { error: 'Doubt not found' });
});

// Doubts: Report doubt
app.post('/api/v1/doubts/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const doubt = doubts.find(d => d.id === id || d.doubt_id === id);
  if (doubt) {
    doubt.reported = true;
    doubt.reportReason = reason || 'Off-topic content';
  }
  return res.json({ status: 'success', message: 'Doubt reported' });
});

// Lost & Found: Get all
app.get('/api/v1/lost-found', (req, res) => {
  const { status_filter } = req.query;
  let filtered = [...lostFound];
  if (status_filter && status_filter !== 'All') {
    filtered = filtered.filter(item => item.status === status_filter);
  }
  return res.json(filtered);
});

// Lost & Found: Create item
app.post('/api/v1/lost-found', (req, res) => {
  const user = getCurrentUser(req);
  const {
    item_name,
    title,
    description,
    image_url,
    location_found,
    locationFound,
    status,
    contact_info,
    contactName,
    contactEmail,
    contactPhone,
    currentHolding,
    poster_id
  } = req.body;

  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ error: 'image_url is required', detail: 'image_url is required' });
  }

  const nameVal = item_name || title || 'Unnamed Item';
  const locVal = location_found || locationFound || 'Campus Area';
  const contactNameVal = contactName || user.name;
  const contactEmailVal = contactEmail || user.email;
  const contactInfoVal = contact_info || `${contactNameVal} (${contactEmailVal})`;
  const todayStr = new Date().toISOString().split('T')[0];

  const newItem = {
    id: `item-${Date.now()}`,
    item_id: `item-${Date.now()}`,
    poster_id: poster_id || user.id,
    item_name: nameVal,
    title: nameVal,
    description: description || 'No description provided.',
    image_url,
    location_found: locVal,
    locationFound: locVal,
    currentHolding: currentHolding || 'Security Desk',
    contact_info: contactInfoVal,
    contactName: contactNameVal,
    contactEmail: contactEmailVal,
    contactPhone: contactPhone || '',
    status: status || 'found',
    date: todayStr,
    created_at: new Date().toISOString(),
    reported: false,
    reportReason: ''
  };

  lostFound.unshift(newItem);
  return res.status(201).json(newItem);
});

// Lost & Found: Update item
app.patch('/api/v1/lost-found/:id', (req, res) => {
  const { id } = req.params;
  const item = lostFound.find(lf => lf.id === id || lf.item_id === id);
  if (!item) {
    return res.status(404).json({ error: 'Lost & found item not found', detail: 'Lost & found item not found' });
  }

  Object.assign(item, req.body);
  if (req.body.item_name) item.title = req.body.item_name;
  if (req.body.title) item.item_name = req.body.title;
  if (req.body.location_found) item.locationFound = req.body.location_found;
  if (req.body.locationFound) item.location_found = req.body.locationFound;

  return res.json(item);
});

// Lost & Found: Delete item
app.delete('/api/v1/lost-found/:id', (req, res) => {
  const { id } = req.params;
  lostFound = lostFound.filter(lf => lf.id !== id && lf.item_id !== id);
  return res.json({ status: 'success', message: 'Post successfully deleted' });
});

// Lost & Found: Report item
app.post('/api/v1/lost-found/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const item = lostFound.find(lf => lf.id === id || lf.item_id === id);
  if (item) {
    item.reported = true;
    item.reportReason = reason || 'Incorrect Information';
  }
  return res.json({ status: 'success', message: 'Item reported' });
});

// Admin: Get all flagged reports
app.get('/api/v1/admin/reports', (req, res) => {
  const reports = [
    ...notes.filter(n => n.reported).map(n => ({
      id: n.id,
      title: n.title,
      contentType: 'note' as const,
      reportReason: n.reportReason || 'Reported by student',
      uploadedBy: n.uploadedBy,
      date: n.date,
      subject: n.subject
    })),
    ...tasks.filter(t => t.reported).map(t => ({
      id: t.id,
      title: t.title,
      contentType: 'commission' as const,
      reportReason: t.reportReason || 'Reported by student',
      uploadedBy: t.clientName,
      date: t.deadline,
      subject: t.branch
    })),
    ...doubts.filter(d => d.reported).map(d => ({
      id: d.id,
      title: d.title,
      contentType: 'doubt' as const,
      reportReason: d.reportReason || 'Reported by student',
      uploadedBy: d.authorAnonymousName,
      date: d.date,
      subject: d.category || d.subject || 'General'
    }))
  ];
  return res.json(reports);
});

// Admin: Dismiss report
app.post('/api/v1/admin/reports/:id/dismiss', (req, res) => {
  const { id } = req.params;
  const note = notes.find(n => n.id === id);
  if (note) {
    note.reported = false;
    note.reportReason = '';
  }
  const task = tasks.find(t => t.id === id || t.task_id === id);
  if (task) {
    task.reported = false;
    task.reportReason = '';
  }
  const doubt = doubts.find(d => d.id === id || d.doubt_id === id);
  if (doubt) {
    doubt.reported = false;
    doubt.reportReason = '';
  }
  return res.json({ status: 'success', message: 'Report dismissed' });
});

// Fallback 404 for unhandled API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.path}`,
    detail: `API route not found: ${req.method} ${req.path}`
  });
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
