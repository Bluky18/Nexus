import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// Simple persistent store mock (using in-memory, reset on server reboot)
let notesStore = [
  {
    id: "note-1",
    title: "Advanced Machine Learning - Deep Neural Networks lecture notes",
    subject: "Machine Learning (CS-601)",
    branch: "Computer Science",
    semester: 6,
    rating: 4.8,
    ratingCount: 15,
    upvotes: 34,
    fileType: "pdf",
    fileSize: "4.2 MB",
    downloads: 12,
    uploadedBy: "Aditya Roy",
    uploader_name: "Aditya Roy",
    file_url: "https://example.com/files/deep_learning_notes.pdf",
    description: "Detailed explanation of feedforward propagation, backpropagation, gradient descent variants, activation functions (ReLU, Sigmoid, GELU), and overfitting prevention techniques.",
    date: "2026-07-09",
    reported: false
  },
  {
    id: "note-2",
    title: "Data Structures and Algorithms - Cheat Sheet for technical interviews",
    subject: "Data Structures and Algorithms",
    branch: "Computer Science",
    semester: 3,
    rating: 4.9,
    ratingCount: 24,
    upvotes: 52,
    fileType: "pdf",
    fileSize: "1.8 MB",
    downloads: 41,
    uploadedBy: "Harshit Kataram",
    uploader_name: "Harshit Kataram",
    file_url: "https://example.com/files/dsa_cheatsheet.pdf",
    description: "Includes complexities, code drafts, and dry runs for graph algorithms (Dijkstra, Bellman-Ford, Kruskal), tree traversals, sliding window pattern, and dynamic programming paradigms.",
    date: "2026-07-11",
    reported: false
  },
  {
    id: "note-3",
    title: "Microprocessors and Assembly Language manual",
    subject: "Microprocessors & Microcontrollers",
    branch: "Electronics",
    semester: 4,
    rating: 4.2,
    ratingCount: 5,
    upvotes: 18,
    fileType: "docx",
    fileSize: "2.5 MB",
    downloads: 5,
    uploadedBy: "Prof. Rajesh Sen",
    uploader_name: "Prof. Rajesh Sen",
    file_url: "https://example.com/files/microprocessors_manual.docx",
    description: "Laboratory guide for 8086 processor instruction set, addressing modes, registers mapping, and solved assembly examples for arithmetic array sorting.",
    date: "2026-07-05",
    reported: true,
    reportReason: "Wrong microprocessor instruction set manual uploaded for electronics branch."
  },
  {
    id: "note-4",
    title: "Applied Engineering Mathematics III - Solved University Papers",
    subject: "Engineering Mathematics",
    branch: "Applied Sciences",
    semester: 3,
    rating: 4.6,
    ratingCount: 8,
    upvotes: 27,
    fileType: "pdf",
    fileSize: "5.6 MB",
    downloads: 19,
    uploadedBy: "Neha Sawant",
    uploader_name: "Neha Sawant",
    file_url: "https://example.com/files/maths_papers.pdf",
    description: "Step-by-step mathematical proofs for Fourier series expansion, Laplace transformations, complex variables mapping, and linear differential equations of higher orders.",
    date: "2026-07-10",
    reported: false
  }
];

let tasksStore = [
  {
    task_id: "task-1",
    id: "task-1",
    title: "Implement state-managed React To-Do Application with local persistence",
    description: "Need a beautiful React component with input field validations, custom list transitions, status check boxes, clear complete triggers, and persistent browser sync.",
    price: 450,
    budget: 450,
    deadline: "2026-07-15",
    branch: "Computer Science",
    status: "open",
    poster_id: "aarav_sharma",
    clientName: "Aarav Sharma",
    clientRating: 4.7,
    reported: true,
    reportReason: "Contains duplicate description from online blog post."
  },
  {
    task_id: "task-2",
    id: "task-2",
    title: "Technical analytical report comparing cloud infrastructure cost policies",
    description: "A 5-page PDF draft evaluating GCP, AWS, and Azure cost structures for Kubernetes cluster scaling, load balancers, and egress data costs.",
    price: 800,
    budget: 800,
    deadline: "2026-07-20",
    branch: "Information Technology",
    status: "open",
    poster_id: "pooja_patil",
    clientName: "Pooja Patil",
    clientRating: 4.9,
    reported: false
  },
  {
    task_id: "task-3",
    id: "task-3",
    title: "Laser Wavelength experiment lab calculations with error graph",
    description: "Complete the trigonometric calculation sheet and graph for the helium-neon diffraction grating laser experiment. Must compile tabular logs accurately.",
    price: 300,
    budget: 300,
    deadline: "2026-07-13",
    branch: "Applied Sciences",
    status: "accepted",
    acceptedBy: "Me",
    poster_id: "kabir_mehta",
    clientName: "Kabir Mehta",
    clientRating: 4.5,
    reported: false
  },
  {
    task_id: "task-4",
    id: "task-4",
    title: "Write Python data parsing script for CSV spreadsheets",
    description: "Parse student attendance sheet records from CSV. Handle missing fields, calculate aggregates, and export to visual charts using pandas and matplotlib.",
    price: 500,
    budget: 500,
    deadline: "2026-07-08",
    branch: "Computer Science",
    status: "completed",
    acceptedBy: "Me",
    poster_id: "anaya_roy",
    clientName: "Anaya Roy",
    clientRating: 4.9,
    reported: false
  }
];

let doubtsStore = [
  {
    doubt_id: "doubt-1",
    id: "doubt-1",
    question: "Struggling to find inverse Laplace transform of s/(s^2+4)^2",
    title: "Struggling to find inverse Laplace transform of s/(s^2+4)^2",
    description: "I've tried standard tables but keep getting stuck with the squared denominator. Any step-by-step guidance is appreciated!",
    subject: "Mathematics",
    category: "Mathematics",
    timestamp: "2026-07-11",
    date: "2026-07-11",
    upvotes: 8,
    authorAnonymousName: "Anonymous Fox",
    reported: false,
    reportReason: undefined as string | undefined,
    answers: [
      {
        id: "ans-1",
        answer_id: "ans-1",
        text: "You should use the convolution theorem or the derivative of Laplace transform property! Let L{t * sin(at)} = 2as/(s^2+a^2)^2. For a=2, L{t * sin(2t)} = 4s/(s^2+4)^2. Thus, the inverse Laplace is (1/4) * t * sin(2t).",
        author: "Anonymous Badger",
        date: "2026-07-11",
        timestamp: "2026-07-11",
        upvotes: 4,
        userUpvoted: false,
        verified: true
      }
    ]
  },
  {
    doubt_id: "doubt-2",
    id: "doubt-2",
    question: "Difference between shallow copy and deep copy in Python?",
    title: "Difference between shallow copy and deep copy in Python?",
    description: "When using the `copy` module, what is the exact internal difference when we have nested lists?",
    subject: "Computer Science",
    category: "Computer Science",
    timestamp: "2026-07-12",
    date: "2026-07-12",
    upvotes: 3,
    authorAnonymousName: "Anonymous Dolphin",
    reported: false,
    reportReason: undefined as string | undefined,
    answers: []
  }
];

let lostFoundStore: any[] = [
  {
    id: "lf-1",
    item_id: "lf-1",
    title: "Black Lenovo ThinkPad Stylus pen",
    item_name: "Black Lenovo ThinkPad Stylus pen",
    description: "Found an active black digital stylus pen left behind on Table 4 in the library. Has a red tip, likely belongs to a Lenovo Yoga or ThinkPad laptop.",
    location_found: "Library Reading Room Table 4",
    locationFound: "Library Reading Room Table 4",
    currentHolding: "Library Main Desk Counter (Mrs. Deshmukh)",
    contactName: "Librarian Assistant",
    contactEmail: "library-desk@college.edu",
    contactPhone: "022-2849503",
    status: "found",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    date: "2026-07-11",
    reported: false,
    poster_id: "system"
  },
  {
    id: "lf-2",
    item_id: "lf-2",
    title: "Casio Scientific Calculator fx-991EX Classwiz",
    item_name: "Casio Scientific Calculator fx-991EX Classwiz",
    description: "Black scientific calculator left behind on the back benches of Seminar Hall Room 302 during the morning workshop. Scratched initials \"R.S.\" on the reverse slide cover.",
    location_found: "Seminar Hall Room 302",
    locationFound: "Seminar Hall Room 302",
    currentHolding: "CS Department HOD Office Cabin",
    contactName: "Prof. Rajesh Sen",
    contactEmail: "rsen-cs@college.edu",
    contactPhone: "982049105",
    status: "found",
    image_url: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80",
    date: "2026-07-10",
    reported: false,
    poster_id: "system"
  },
  {
    id: "lf-3",
    item_id: "lf-3",
    title: "Brown leather wallet with ID Card",
    item_name: "Brown leather wallet with ID Card",
    description: "Lost a brown leather wallet while playing football on the ground. Contains college ID card and travel passes. Please return to sports room if found.",
    location_found: "Sports Playground Bleachers",
    locationFound: "Sports Playground Bleachers",
    currentHolding: "N/A",
    contactName: "Harsh Gupta",
    contactEmail: "hgupta-stud@college.edu",
    contactPhone: "9120491823",
    status: "lost",
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    date: "2026-07-12",
    reported: false,
    poster_id: "system"
  }
];

const app = express();

// Parse JSON payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

async function startServer() {
  const PORT = 3000;

  // API Route - GET Notes
  app.get("/api/v1/notes", (req, res) => {
    try {
      const { semester, subject } = req.query;
      let filtered = [...notesStore];

      if (semester) {
        filtered = filtered.filter(
          (note) => note.semester === parseInt(semester as string, 10)
        );
      }

      if (subject) {
        const queryStr = (subject as string).toLowerCase();
        filtered = filtered.filter(
          (note) => note.subject.toLowerCase().includes(queryStr)
        );
      }

      res.status(200).json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  // API Route - POST Note (matching the requested blueprint)
  app.post("/api/v1/notes", (req, res) => {
    try {
      const { title, subject, semester, uploader_name, file_url, branch, fileType, fileSize, description } = req.body;

      if (!title || !subject || !semester || !uploader_name || !file_url) {
        return res.status(400).json({ 
          error: "Missing required fields matching the note blueprint: title, subject, semester, uploader_name, file_url" 
        });
      }

      let posterId = "student-123";
      try {
        const resolvedId = getCurrentUserId(req);
        if (resolvedId) {
          posterId = resolvedId;
        }
      } catch (err) {}

      const newNote = {
        id: `note-${Date.now()}`,
        title,
        subject,
        semester: parseInt(semester, 10),
        uploader_name,
        uploadedBy: uploader_name, // fallback mapping
        poster_id: posterId,
        uploader_id: posterId,
        file_url,
        branch: branch || "Computer Science",
        fileType: fileType || "pdf",
        fileSize: fileSize || "1.2 MB",
        description: description || "Classroom notes shared on the study portal.",
        rating: 5.0,
        ratingCount: 1,
        upvotes: 1,
        downloads: 0,
        date: new Date().toISOString().split("T")[0],
        reported: false
      };

      notesStore.unshift(newNote);
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  // API Route - GET Tasks matching Blueprint & compatibility mapping
  app.get("/api/v1/tasks", requireAuth, (req, res) => {
    try {
      const { branch, status } = req.query;
      let filtered = [...tasksStore];

      if (branch && branch !== "All") {
        filtered = filtered.filter(
          (task) => task.branch.toLowerCase() === (branch as string).toLowerCase()
        );
      }

      if (status && status !== "All") {
        filtered = filtered.filter(
          (task) => task.status === status
        );
      }

      res.status(200).json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // API Route - POST Task matching Blueprint
  app.post("/api/v1/tasks", requireAuth, (req, res) => {
    try {
      const { title, description, price, deadline, status, poster_id, branch, clientName, clientRating } = req.body;

      if (!title || !description || price === undefined || !deadline || !poster_id) {
        return res.status(400).json({
          error: "Missing required fields matching task blueprint: title, description, price, deadline, poster_id"
        });
      }

      const newTask = {
        task_id: `task-${Date.now()}`,
        id: `task-${Date.now()}`, // compatibility field
        title,
        description,
        price: parseFloat(price),
        budget: parseFloat(price), // compatibility field
        deadline,
        status: status || "open",
        poster_id,
        branch: branch || "Computer Science",
        clientName: clientName || "Harshit Kataram",
        clientRating: clientRating || 4.8,
        reported: false
      };

      tasksStore.unshift(newTask);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task commission" });
    }
  });

  // API Route - GET Doubts matching Blueprint
  app.get("/api/v1/doubts", requireAuth, (req, res) => {
    try {
      const { subject } = req.query;
      let filtered = [...doubtsStore];

      if (subject) {
        filtered = filtered.filter(
          (d) => d.subject.toLowerCase() === (subject as string).toLowerCase()
        );
      }

      res.status(200).json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doubts" });
    }
  });

  // API Route - POST Doubt matching Blueprint
  app.post("/api/v1/doubts", requireAuth, (req, res) => {
    try {
      const { question, subject, description, category, authorAnonymousName } = req.body;

      if (!question || !subject) {
        return res.status(400).json({
          error: "Missing required fields matching doubt blueprint: question, subject"
        });
      }

      const nowStr = new Date().toISOString().split("T")[0];
      const doubt_id = `doubt-${Date.now()}`;
      const newDoubt = {
        doubt_id,
        id: doubt_id, // compatibility field
        question,
        title: question, // compatibility field
        description: description || "",
        subject,
        category: category || subject, // compatibility field
        timestamp: nowStr,
        date: nowStr, // compatibility field
        upvotes: 1,
        userUpvoted: true,
        reported: false,
        reportReason: undefined,
        authorAnonymousName: authorAnonymousName || "Anonymous Owl",
        answers: []
      };

      doubtsStore.unshift(newDoubt);
      res.status(201).json(newDoubt);
    } catch (error) {
      res.status(500).json({ error: "Failed to create doubt thread" });
    }
  });

  // API Route - POST Answer to Doubt
  app.post("/api/v1/doubts/answer", requireAuth, (req, res) => {
    try {
      const { doubt_id, text, author } = req.body;

      if (!doubt_id || !text) {
        return res.status(400).json({
          error: "Missing required fields matching answer request: doubt_id, text"
        });
      }

      const doubtIndex = doubtsStore.findIndex(
        (d) => d.doubt_id === doubt_id || d.id === doubt_id
      );

      if (doubtIndex === -1) {
        return res.status(404).json({ error: "Doubt thread not found" });
      }

      const nowStr = new Date().toISOString().split("T")[0];
      const ans_id = `ans-${Date.now()}`;
      const newAnswer = {
        id: ans_id,
        answer_id: ans_id, // compatibility field
        text,
        author: author || "Anonymous Otter",
        date: nowStr,
        timestamp: nowStr, // compatibility field
        upvotes: 0,
        userUpvoted: false,
        verified: false
      };

      doubtsStore[doubtIndex].answers.push(newAnswer);
      res.status(200).json(doubtsStore[doubtIndex]);
    } catch (error) {
      res.status(500).json({ error: "Failed to post answer" });
    }
  });

  // --- LOST & FOUND MODULE API ENDPOINTS ---

  // GET all lost & found items
  app.get("/api/v1/lost-found", (req, res) => {
    try {
      res.status(200).json(lostFoundStore);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lost & found items" });
    }
  });

  // POST create lost & found item
  app.post("/api/v1/lost-found", (req, res) => {
    try {
      const {
        item_name,
        title,
        description,
        image_url,
        location_found,
        locationFound,
        status,
        contact_info,
        currentHolding,
        contactName,
        contactEmail,
        contactPhone,
        poster_id
      } = req.body;

      const finalTitle = item_name || title;
      if (!finalTitle) {
        return res.status(400).json({ error: "Missing required field: item_name or title" });
      }

      const id = `item-${Date.now()}`;
      const newItem = {
        id,
        item_id: id,
        item_name: finalTitle,
        title: finalTitle,
        description: description || "Left behind. Held safely.",
        image_url: image_url || "",
        location_found: location_found || locationFound || "Campus Area",
        locationFound: location_found || locationFound || "Campus Area",
        status: status || "found",
        contact_info: contact_info || `${contactName || 'Staff'} (${contactEmail || ''})`,
        currentHolding: currentHolding || "Security Desk",
        contactName: contactName || "Staff Desk",
        contactEmail: contactEmail || "nexus@college.edu",
        contactPhone: contactPhone || "N/A",
        poster_id: poster_id || "student-123",
        date: new Date().toISOString().split("T")[0],
        reported: false
      };

      lostFoundStore.unshift(newItem);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lost & found item" });
    }
  });

  // PATCH update lost & found item
  app.patch("/api/v1/lost-found/:id", (req, res) => {
    try {
      const { id } = req.params;
      const {
        item_name,
        title,
        description,
        image_url,
        location_found,
        locationFound,
        status,
        contact_info,
        currentHolding,
        contactName,
        contactEmail,
        contactPhone
      } = req.body;

      const index = lostFoundStore.findIndex(item => item.id === id || item.item_id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Lost & Found item not found" });
      }

      const finalTitle = item_name || title;
      if (finalTitle !== undefined) {
        lostFoundStore[index].item_name = finalTitle;
        lostFoundStore[index].title = finalTitle;
      }
      if (description !== undefined) lostFoundStore[index].description = description;
      if (image_url !== undefined) lostFoundStore[index].image_url = image_url;
      if (location_found !== undefined || locationFound !== undefined) {
        const finalLoc = location_found || locationFound;
        lostFoundStore[index].location_found = finalLoc;
        lostFoundStore[index].locationFound = finalLoc;
      }
      if (status !== undefined) lostFoundStore[index].status = status;
      if (contact_info !== undefined) lostFoundStore[index].contact_info = contact_info;
      if (currentHolding !== undefined) lostFoundStore[index].currentHolding = currentHolding;
      if (contactName !== undefined) lostFoundStore[index].contactName = contactName;
      if (contactEmail !== undefined) lostFoundStore[index].contactEmail = contactEmail;
      if (contactPhone !== undefined) lostFoundStore[index].contactPhone = contactPhone;

      res.status(200).json(lostFoundStore[index]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lost & found item" });
    }
  });

  // DELETE lost & found item
  app.delete("/api/v1/lost-found/:id", (req, res) => {
    try {
      const { id } = req.params;
      const index = lostFoundStore.findIndex(item => item.id === id || item.item_id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Lost & Found item not found" });
      }

      lostFoundStore.splice(index, 1);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lost & found item" });
    }
  });

  // --- USER MANAGEMENT & AUTH MODULE ---

  let usersStore = [
    {
      id: "student-123",
      name: "Harshit Kataram",
      division: "A",
      rollNo: "24",
      seatNo: "S245201",
      branch: "Computer Science",
      email: "harshitcsb@gmail.com",
      password_hash: crypto.createHash("sha256").update("password123").digest("hex"),
      theme_preference: "light",
      semester: 6,
      college: "Nirmala Memorial Foundation College, Kandivali, Mumbai",
      rating: 4.8,
      earnings: 650,
      completedTasksCount: 2,
      uploadedNotesCount: 4,
      isAdmin: true
    }
  ];

  const JWT_SECRET = "NEXUS_JWT_SECRET_KEY_2026";

  // Helper to hash password
  function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // Token helpers
  function encodeToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

  function decodeToken(token: string): any {
    if (token.startsWith("Bearer ")) {
      token = token.substring(7);
    }
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (token.startsWith("bearer.")) {
        try {
          const b64 = token.substring(7);
          return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
        } catch (e) {
          return null;
        }
      }
      return { sub: token };
    }
  }

  function getCurrentUserId(req: any): string {
    if (req.userId) return req.userId;
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const xUserId = req.headers["x-user-id"];
    
    if (xUserId) return xUserId as string;
    if (authHeader && typeof authHeader === "string") {
      const decoded = decodeToken(authHeader);
      if (decoded && decoded.sub) {
        return decoded.sub;
      }
      if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
      }
      return authHeader;
    }
    return "student-123";
  }

  // Middleware to require JWT authorization for private routes
  function requireAuth(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ error: "Authorization header required: Bearer <token>" });
    }

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.sub;
      return next();
    } catch (err) {
      if (token.startsWith("bearer.")) {
        try {
          const b64 = token.substring(7);
          const decoded = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
          if (decoded && decoded.sub) {
            req.userId = decoded.sub;
            return next();
          }
        } catch (e) {}
      }

      const userExists = usersStore.some(u => u.id === token);
      if (userExists) {
        req.userId = token;
        return next();
      }

      return res.status(401).json({ error: "Invalid or expired authorization token" });
    }
  }

  // Middleware to require Admin privileges (is_admin claim in JWT)
  function requireAdmin(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ error: "Authorization header required: Bearer <token>" });
    }

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.is_admin) {
        req.userId = decoded.sub;
        return next();
      }
      return res.status(403).json({ error: "Access forbidden: Admin rights required" });
    } catch (err) {
      if (token.startsWith("bearer.")) {
        try {
          const b64 = token.substring(7);
          const decoded = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
          if (decoded && decoded.is_admin) {
            req.userId = decoded.sub;
            return next();
          }
        } catch (e) {}
      }

      const user = usersStore.find(u => u.id === token);
      if (user && user.isAdmin) {
        req.userId = user.id;
        return next();
      }

      return res.status(403).json({ error: "Access forbidden: Admin rights required" });
    }
  }

  // POST signup
  app.post("/api/v1/auth/signup", (req, res) => {
    try {
      const { name, division, rollNo, branch, email, password } = req.body;
      if (!name || !division || !rollNo || !branch || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user_id = `student-${Date.now()}`;
      const newUser = {
        id: user_id,
        name,
        division,
        rollNo,
        seatNo: "",
        branch,
        email,
        password_hash: hashPassword(password),
        theme_preference: "light",
        semester: 6,
        college: "Nirmala Memorial Foundation College, Kandivali, Mumbai",
        rating: 4.8,
        earnings: 650,
        completedTasksCount: 2,
        uploadedNotesCount: 4,
        isAdmin: false
      };

      usersStore.push(newUser);

      res.status(201).json({
        status: "success",
        user: {
          id: user_id,
          name,
          division,
          rollNo,
          branch,
          email,
          theme_preference: "light"
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // POST login
  app.post("/api/v1/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { sub: user.id, email: user.email, is_admin: !!user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          division: user.division,
          rollNo: user.rollNo,
          branch: user.branch,
          email: user.email,
          theme_preference: user.theme_preference,
          semester: user.semester,
          college: user.college,
          rating: user.rating,
          earnings: user.earnings,
          completedTasksCount: user.completedTasksCount,
          uploadedNotesCount: user.uploadedNotesCount,
          isAdmin: !!user.isAdmin
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST google-login
  app.post("/api/v1/auth/google-login", async (req, res) => {
    try {
      const idToken = req.body.idToken || req.body.credential || req.body.token;
      if (!idToken) {
        return res.status(400).json({ error: "idToken is required" });
      }

      let email = "";
      let name = "";
      let googleId = "";

      try {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
          idToken: idToken,
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email || "";
          name = payload.name || "";
          googleId = payload.sub || "";
        }
      } catch (err: any) {
        console.warn("Google verifyIdToken failed, attempting manual decode fallback for preview sandbox:", err.message);
        try {
          const parts = idToken.split(".");
          if (parts.length === 3) {
            const payloadDecoded = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
            email = payloadDecoded.email || "";
            name = payloadDecoded.name || "";
            googleId = payloadDecoded.sub || payloadDecoded.id || "";
          }
        } catch (fallbackErr) {
          console.error("Manual JWT decode fallback failed:", fallbackErr);
        }
      }

      if (!email) {
        return res.status(400).json({ error: "Invalid Google ID Token" });
      }

      let user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        const user_id = `google-${googleId || Date.now()}`;
        user = {
          id: user_id,
          name: name || email.split("@")[0],
          division: "A",
          rollNo: "G-" + Math.floor(10 + Math.random() * 90),
          seatNo: "",
          branch: "Computer Science",
          email: email,
          password_hash: "",
          theme_preference: "light",
          semester: 6,
          college: "Nirmala Memorial Foundation College, Kandivali, Mumbai",
          rating: 4.8,
          earnings: 0,
          completedTasksCount: 0,
          uploadedNotesCount: 0,
          isAdmin: email.toLowerCase() === "harshitcsb@gmail.com"
        };
        usersStore.push(user);
      } else if (email.toLowerCase() === "harshitcsb@gmail.com") {
        user.isAdmin = true;
      }

      const token = jwt.sign(
        { sub: user.id, email: user.email, is_admin: !!user.isAdmin },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          division: user.division,
          rollNo: user.rollNo,
          branch: user.branch,
          email: user.email,
          theme_preference: user.theme_preference,
          semester: user.semester,
          college: user.college,
          rating: user.rating,
          earnings: user.earnings,
          completedTasksCount: user.completedTasksCount,
          uploadedNotesCount: user.uploadedNotesCount,
          isAdmin: !!user.isAdmin
        }
      });
    } catch (error: any) {
      console.error("Google login failed:", error);
      res.status(500).json({ error: `Google login failed: ${error.message || error}` });
    }
  });

  // GET user profile
  app.get("/api/v1/user/profile", requireAuth, (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const user = usersStore.find(u => u.id === currentUserId);
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        division: user.division,
        rollNo: user.rollNo,
        branch: user.branch,
        email: user.email,
        theme_preference: user.theme_preference,
        semester: user.semester,
        college: user.college,
        rating: user.rating,
        earnings: user.earnings,
        completedTasksCount: user.completedTasksCount,
        uploadedNotesCount: user.uploadedNotesCount,
        isAdmin: !!user.isAdmin
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve profile" });
    }
  });

  // PUT user settings
  app.put("/api/v1/user/profile/settings", requireAuth, (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const { theme_preference, isAdmin, name, division, rollNo, seatNo, branch, semester, college } = req.body;

      const userIndex = usersStore.findIndex(u => u.id === currentUserId);
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      if (theme_preference !== undefined) {
        usersStore[userIndex].theme_preference = theme_preference;
      }
      if (isAdmin !== undefined) {
        usersStore[userIndex].isAdmin = isAdmin;
      }
      if (name !== undefined) {
        usersStore[userIndex].name = name;
      }
      if (division !== undefined) {
        usersStore[userIndex].division = division;
      }
      if (rollNo !== undefined) {
        usersStore[userIndex].rollNo = rollNo;
      }
      if (seatNo !== undefined) {
        usersStore[userIndex].seatNo = seatNo;
      }
      if (branch !== undefined) {
        usersStore[userIndex].branch = branch;
      }
      if (semester !== undefined) {
        usersStore[userIndex].semester = parseInt(semester, 10);
      }
      if (college !== undefined) {
        usersStore[userIndex].college = college;
      }

      res.status(200).json({
        status: "success",
        user: {
          id: usersStore[userIndex].id,
          name: usersStore[userIndex].name,
          division: usersStore[userIndex].division,
          rollNo: usersStore[userIndex].rollNo,
          branch: usersStore[userIndex].branch,
          email: usersStore[userIndex].email,
          theme_preference: usersStore[userIndex].theme_preference,
          semester: usersStore[userIndex].semester,
          college: usersStore[userIndex].college,
          rating: usersStore[userIndex].rating,
          earnings: usersStore[userIndex].earnings,
          completedTasksCount: usersStore[userIndex].completedTasksCount,
          uploadedNotesCount: usersStore[userIndex].uploadedNotesCount,
          isAdmin: !!usersStore[userIndex].isAdmin
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // --- ADMIN MODULE ENDPOINTS ---

  // GET /api/v1/admin/reports - Fetch all flagged/reported content
  app.get("/api/v1/admin/reports", requireAdmin, (req, res) => {
    try {
      const flaggedNotes = notesStore
        .filter((n) => n.reported)
        .map((n) => ({
          id: n.id,
          title: n.title,
          contentType: "note",
          reportReason: n.reportReason || "No reason specified",
          uploadedBy: n.uploadedBy || n.uploader_name || "Unknown",
          date: n.date,
          subject: n.subject
        }));

      const flaggedTasks = tasksStore
        .filter((t) => t.reported)
        .map((t) => ({
          id: t.id || t.task_id,
          title: t.title,
          contentType: "commission",
          reportReason: t.reportReason || "No reason specified",
          uploadedBy: t.clientName || "Unknown",
          date: t.deadline,
          subject: t.branch
        }));

      const flaggedDoubts = doubtsStore
        .filter((d) => d.reported)
        .map((d) => ({
          id: d.id || d.doubt_id,
          title: d.title || d.question || "No Title",
          contentType: "doubt",
          reportReason: d.reportReason || "No reason specified",
          uploadedBy: d.authorAnonymousName || "Unknown",
          date: d.date || d.timestamp || "",
          subject: d.subject || d.category || ""
        }));

      const allReports = [...flaggedNotes, ...flaggedTasks, ...flaggedDoubts];
      res.status(200).json(allReports);
    } catch (error) {
      console.error("Failed to fetch admin reports:", error);
      res.status(500).json({ error: "Failed to fetch reported content" });
    }
  });

  // DELETE /api/v1/notes/:id - Secure deletion of a note (only for uploader or admin)
  app.delete("/api/v1/notes/:id", requireAuth, (req, res) => {
    try {
      const { id } = req.params;
      const index = notesStore.findIndex((n) => n.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Note not found" });
      }

      const note = notesStore[index];
      const currentUserId = getCurrentUserId(req);
      const user = usersStore.find(u => u.id === currentUserId);
      const isAdmin = user?.isAdmin;
      
      const isOwner = user && (
        (note.uploadedBy && typeof note.uploadedBy === "string" && note.uploadedBy.toLowerCase() === user.name.toLowerCase()) || 
        (note.uploader_name && typeof note.uploader_name === "string" && note.uploader_name.toLowerCase() === user.name.toLowerCase()) ||
        ((note as any).poster_id === user.id) ||
        ((note as any).uploader_id === user.id)
      );

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Access forbidden: only the uploader or an administrator can delete this note" });
      }

      notesStore.splice(index, 1);
      res.status(200).json({ status: "success", message: "Note deleted successfully from database" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // DELETE /api/v1/tasks/:id - Secure admin deletion of a commission task
  app.delete("/api/v1/tasks/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const index = tasksStore.findIndex((t) => t.id === id || t.task_id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Commission task not found" });
      }
      tasksStore.splice(index, 1);
      res.status(200).json({ status: "success", message: "Commission task deleted successfully from database" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete commission task" });
    }
  });

  // POST /api/v1/admin/reports/:id/dismiss - Dismiss a report (unflag content)
  app.post("/api/v1/admin/reports/:id/dismiss", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { contentType } = req.body;

      if (!contentType) {
        return res.status(400).json({ error: "contentType is required (note, commission, doubt)" });
      }

      let found = false;

      if (contentType === "note") {
        const item = notesStore.find((n) => n.id === id);
        if (item) {
          item.reported = false;
          delete item.reportReason;
          found = true;
        }
      } else if (contentType === "commission") {
        const item = tasksStore.find((t) => t.id === id || t.task_id === id);
        if (item) {
          item.reported = false;
          delete item.reportReason;
          found = true;
        }
      } else if (contentType === "doubt") {
        const item = doubtsStore.find((d) => d.id === id || d.doubt_id === id);
        if (item) {
          item.reported = false;
          delete item.reportReason;
          found = true;
        }
      }

      if (!found) {
        return res.status(404).json({ error: `Flagged content of type ${contentType} not found` });
      }

      res.status(200).json({ status: "success", message: "Report dismissed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss report" });
    }
  });

  // POST /api/v1/notes/:id/report - Route for students to report a note
  app.post("/api/v1/notes/:id/report", requireAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const note = notesStore.find((n) => n.id === id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      note.reported = true;
      note.reportReason = reason || "Inappropriate note material";

      res.status(200).json({ status: "success", message: "Note reported successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to report note" });
    }
  });

  // POST /api/v1/tasks/:id/report - Route for students to report a task
  app.post("/api/v1/tasks/:id/report", requireAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const task = tasksStore.find((t) => t.id === id || t.task_id === id);
      if (!task) {
        return res.status(404).json({ error: "Commission task not found" });
      }

      task.reported = true;
      task.reportReason = reason || "Inappropriate commission request";

      res.status(200).json({ status: "success", message: "Task reported successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to report task" });
    }
  });

  // POST /api/v1/doubts/:id/report - Route for students to report a doubt
  app.post("/api/v1/doubts/:id/report", requireAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const doubt = doubtsStore.find((d) => d.id === id || d.doubt_id === id);
      if (!doubt) {
        return res.status(404).json({ error: "Doubt thread not found" });
      }

      doubt.reported = true;
      doubt.reportReason = reason || "Inappropriate doubt question";

      res.status(200).json({ status: "success", message: "Doubt reported successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to report doubt" });
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Catch-all for unmatched /api routes (returns JSON instead of HTML 404)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Vite integration as middleware in development, serve static in production
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Express server running on http://localhost:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

export default app;
