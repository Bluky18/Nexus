export interface Note {
  id: string;
  title: string;
  subject: string;
  branch: string;
  semester: number;
  rating: number;
  ratingCount: number;
  upvotes: number;
  userUpvoted?: boolean;
  fileType: string;
  fileSize: string;
  downloads: number;
  uploadedBy: string;
  uploader_name?: string;
  file_url?: string;
  description: string;
  date: string;
  reported: boolean;
  reportReason?: string;
}

export interface Commission {
  id: string;
  task_id?: string;
  title: string;
  description: string;
  budget: number;
  price?: number;
  deadline: string;
  branch: string;
  status: 'open' | 'accepted' | 'completed';
  clientName: string;
  clientRating: number;
  acceptedBy?: string;
  workerRating?: number;
  reported: boolean;
  reportReason?: string;
  poster_id?: string;
}

export interface Answer {
  id: string;
  answer_id?: string;
  text: string;
  author: string;
  date: string;
  timestamp?: string;
  upvotes: number;
  userUpvoted?: boolean;
  verified: boolean;
}

export interface Doubt {
  id: string;
  doubt_id?: string;
  title: string;
  question?: string;
  description: string;
  category: string;
  subject?: string;
  authorAnonymousName: string;
  answers: Answer[];
  upvotes: number;
  userUpvoted?: boolean;
  date: string;
  timestamp?: string;
  reported: boolean;
  reportReason?: string;
}

export interface LostFoundItem {
  id: string;
  item_id?: string;
  poster_id?: string;
  item_name?: string;
  title: string;
  description: string;
  image_url?: string;
  location_found?: string;
  locationFound: string;
  currentHolding: string;
  contact_info?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'lost' | 'found' | 'claimed' | string;
  date: string;
  created_at?: string;
  reported: boolean;
  reportReason?: string;
}

export interface StudentProfile {
  id?: string;
  name: string;
  division: string;
  rollNo: string;
  seatNo: string;
  branch: string;
  semester: number;
  college: string;
  rating: number;
  earnings: number;
  completedTasksCount: number;
  uploadedNotesCount: number;
  theme_preference?: 'light' | 'dark' | string;
  email?: string;
  isAdmin?: boolean;
}
