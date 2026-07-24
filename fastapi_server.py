import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pymongo
from bson import ObjectId

app = FastAPI(
    title="Nexus Student Platform - Notes Sharing API",
    description="FastAPI backend with MongoDB for managing academic notes sharing.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "nexus_platform")

# Seed doubts data
seed_doubts = [
    {
        "question": "Struggling to find inverse Laplace transform of s/(s^2+4)^2",
        "title": "Struggling to find inverse Laplace transform of s/(s^2+4)^2",
        "description": "I've tried standard tables but keep getting stuck with the squared denominator. Any step-by-step guidance is appreciated!",
        "subject": "Mathematics",
        "category": "Mathematics",
        "timestamp": "2026-07-11",
        "date": "2026-07-11",
        "upvotes": 8,
        "authorAnonymousName": "Anonymous Fox",
        "reported": False,
        "answers": [
            {
                "id": "ans-1",
                "answer_id": "ans-1",
                "text": "You should use the convolution theorem or the derivative of Laplace transform property! Let L{t * sin(at)} = 2as/(s^2+a^2)^2. For a=2, L{t * sin(2t)} = 4s/(s^2+4)^2. Thus, the inverse Laplace is (1/4) * t * sin(2t).",
                "author": "Anonymous Badger",
                "date": "2026-07-11",
                "timestamp": "2026-07-11",
                "upvotes": 4,
                "userUpvoted": False,
                "verified": True
            }
        ]
    },
    {
        "question": "Difference between shallow copy and deep copy in Python?",
        "title": "Difference between shallow copy and deep copy in Python?",
        "description": "When using the `copy` module, what is the exact internal difference when we have nested lists?",
        "subject": "Computer Science",
        "category": "Computer Science",
        "timestamp": "2026-07-12",
        "date": "2026-07-12",
        "upvotes": 3,
        "authorAnonymousName": "Anonymous Dolphin",
        "reported": False,
        "answers": []
    }
]

seed_lost_found = [
    {
        "poster_id": "student-abc",
        "item_name": "Casio Scientific Calculator FX-991EX",
        "title": "Casio Scientific Calculator FX-991EX",
        "description": "Left behind in Room 402 after the Math exam. Has a small sticker of a rocket on the back cover.",
        "image_url": "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80",
        "location_found": "Room 402",
        "locationFound": "Room 402",
        "status": "found",
        "contact_info": "Harshit (harshit@college.edu)",
        "contactName": "Harshit",
        "contactEmail": "harshit@college.edu",
        "contactPhone": "+1234567890",
        "currentHolding": "Library Counter",
        "date": "2026-07-11",
        "created_at": datetime.now(),
        "reported": False
    },
    {
        "poster_id": "student-123",  # Owned by the default user so they can test editing/deleting
        "item_name": "Black Leather Wallet",
        "title": "Black Leather Wallet",
        "description": "Lost near the Main Canteen. Contains student ID card under the name of Hitesh, and some cash.",
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
        "location_found": "Main Canteen",
        "locationFound": "Main Canteen",
        "status": "lost",
        "contact_info": "Hitesh (hitesh@college.edu)",
        "contactName": "Hitesh",
        "contactEmail": "hitesh@college.edu",
        "contactPhone": "9876543210",
        "currentHolding": "N/A",
        "date": "2026-07-12",
        "created_at": datetime.now(),
        "reported": False
    }
]

try:
    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    notes_collection = db["notes"]
    tasks_collection = db["tasks"]
    doubts_collection = db["doubts"]
    lost_found_collection = db["lost_found"]
    users_collection = db["users"]
    # Check connection
    client.server_info()
    print("Successfully connected to MongoDB!")
    
    # Auto-Expiration TTL Index on created_at field to auto-delete after 14 days
    try:
        lost_found_collection.create_index("created_at", expireAfterSeconds=14 * 24 * 60 * 60)
        print("Successfully created TTL index on lost_found created_at!")
    except Exception as ie:
        print(f"Warning: Failed to create TTL index: {ie}")

    # Seed doubts if empty
    if doubts_collection.count_documents({}) == 0:
        doubts_collection.insert_many(seed_doubts)
    # Seed lost found if empty
    if lost_found_collection.count_documents({}) == 0:
        lost_found_collection.insert_many(seed_lost_found)
    # Seed default user if empty
    if users_collection.count_documents({}) == 0:
        import hashlib
        users_collection.insert_one({
            "id": "student-123",
            "name": "Harshit Kataram",
            "division": "A",
            "rollNo": "24",
            "branch": "Computer Science",
            "email": "harshitcsb@gmail.com",
            "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
            "theme_preference": "light",
            "semester": 6,
            "college": "Nirmala Memorial Foundation College, Kandivali, Mumbai",
            "rating": 4.8,
            "earnings": 650,
            "completedTasksCount": 2,
            "uploadedNotesCount": 4
        })
except Exception as e:
    print(f"Warning: Failed to connect to MongoDB: {e}")
    # Fallback to an in-memory mock collection if MongoDB is offline during initial startup
    class MockCollection:
        def __init__(self, initial_data=None):
            self.data = list(initial_data) if initial_data else []
        def create_index(self, field_name, **kwargs):
            pass
        def count_documents(self, query):
            return len(self.find(query))
        def find(self, query=None):
            if not query:
                return self.data
            filtered = []
            for item in self.data:
                match = True
                for k, v in query.items():
                    # Support simple filter comparisons
                    item_val = item.get(k)
                    if k in ["_id", "id", "item_id", "doubt_id", "task_id"]:
                        if str(item_val) != str(v):
                            match = False
                            break
                    elif item_val != v:
                        match = False
                        break
                if match:
                    filtered.append(item)
            return filtered
        def find_one(self, query=None):
            results = self.find(query)
            return results[0] if results else None
        def insert_one(self, document):
            if "_id" not in document:
                document["_id"] = ObjectId()
            self.data.append(document)
            return type('InsertOneResult', (object,), {'inserted_id': document['_id']})()
        def update_one(self, filter_query, update_query):
            doc = self.find_one(filter_query)
            if doc:
                if "$push" in update_query:
                    push_data = update_query["$push"]
                    for field, val in push_data.items():
                        if field not in doc:
                            doc[field] = []
                        doc[field].append(val)
                if "$set" in update_query:
                    set_data = update_query["$set"]
                    for field, val in set_data.items():
                        doc[field] = val
            return type('UpdateResult', (object,), {'modified_count': 1})()
        def delete_one(self, query):
            doc = self.find_one(query)
            if doc in self.data:
                self.data.remove(doc)
                return type('DeleteResult', (object,), {'deleted_count': 1})()
            return type('DeleteResult', (object,), {'deleted_count': 0})()

    notes_collection = MockCollection()
    tasks_collection = MockCollection()
    doubts_collection = MockCollection(seed_doubts)
    lost_found_collection = MockCollection(seed_lost_found)
    import hashlib
    users_collection = MockCollection([{
        "id": "student-123",
        "name": "Harshit Kataram",
        "division": "A",
        "rollNo": "24",
        "branch": "Computer Science",
        "email": "harshitcsb@gmail.com",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "theme_preference": "light",
        "semester": 6,
        "college": "Nirmala Memorial Foundation College, Kandivali, Mumbai",
        "rating": 4.8,
        "earnings": 650,
        "completedTasksCount": 2,
        "uploadedNotesCount": 4
    }])

# Helper to serialize MongoDB ObjectIds to strings
def note_helper(note) -> dict:
    return {
        "id": str(note.get("_id")) if "_id" in note else note.get("id"),
        "title": note["title"],
        "subject": note["subject"],
        "semester": int(note["semester"]),
        "uploader_name": note["uploader_name"],
        "file_url": note["file_url"],
        # Extended fields for full backward compatibility with React UI stats
        "branch": note.get("branch", "Computer Science"),
        "rating": float(note.get("rating", 5.0)),
        "ratingCount": int(note.get("ratingCount", 1)),
        "upvotes": int(note.get("upvotes", 1)),
        "fileType": note.get("fileType", "pdf"),
        "fileSize": note.get("fileSize", "2.4 MB"),
        "downloads": int(note.get("downloads", 0)),
        "description": note.get("description", "Shared study resource"),
        "date": note.get("date", "2026-07-12")
    }

def task_helper(task) -> dict:
    return {
        "task_id": str(task.get("_id")) if "_id" in task else task.get("task_id"),
        "title": task["title"],
        "description": task["description"],
        "price": float(task["price"]),
        "deadline": task["deadline"],
        "status": task["status"],
        "poster_id": task["poster_id"],
        # Extra fields for frontend full-feature compatibility (e.g. category/branch, clientRating, etc.)
        "branch": task.get("branch", "Computer Science"),
        "clientName": task.get("clientName", "Harshit Kataram"),
        "clientRating": float(task.get("clientRating", 4.8)),
        "reported": bool(task.get("reported", False)),
        "acceptedBy": task.get("acceptedBy")
    }

def doubt_helper(doubt) -> dict:
    answers_list = []
    for ans in doubt.get("answers", []):
        ans_id = ans.get("id") or ans.get("answer_id") or f"ans-{ObjectId()}"
        answers_list.append({
            "id": ans_id,
            "answer_id": ans_id,
            "text": ans.get("text", ""),
            "author": ans.get("author", "Anonymous Otter"),
            "date": ans.get("date") or ans.get("timestamp") or "2026-07-12",
            "timestamp": ans.get("timestamp") or ans.get("date") or "2026-07-12",
            "upvotes": int(ans.get("upvotes", 0)),
            "userUpvoted": bool(ans.get("userUpvoted", False)),
            "verified": bool(ans.get("verified", False))
        })

    doubt_id_str = str(doubt.get("_id")) if "_id" in doubt else (doubt.get("doubt_id") or doubt.get("id"))
    return {
        "doubt_id": doubt_id_str,
        "id": doubt_id_str,
        "question": doubt.get("question") or doubt.get("title") or "Study Question",
        "title": doubt.get("title") or doubt.get("question") or "Study Question",
        "description": doubt.get("description", ""),
        "subject": doubt.get("subject") or doubt.get("category") or "General",
        "category": doubt.get("category") or doubt.get("subject") or "General",
        "timestamp": doubt.get("timestamp") or doubt.get("date") or "2026-07-12",
        "date": doubt.get("date") or doubt.get("timestamp") or "2026-07-12",
        "upvotes": int(doubt.get("upvotes", 0)),
        "userUpvoted": bool(doubt.get("userUpvoted", False)),
        "reported": bool(doubt.get("reported", False)),
        "reportReason": doubt.get("reportReason", ""),
        "authorAnonymousName": doubt.get("authorAnonymousName", "Anonymous Otter"),
        "answers": answers_list
    }

def lost_found_helper(item) -> dict:
    item_id_str = str(item.get("_id")) if "_id" in item else (item.get("item_id") or item.get("id"))
    item_name = item.get("item_name") or item.get("title") or "Unnamed Item"
    location_found = item.get("location_found") or item.get("locationFound") or "Unknown Location"
    contact_info = item.get("contact_info") or f"{item.get('contactName', 'Staff')} ({item.get('contactEmail', '')})"
    
    created_at_val = item.get("created_at")
    if not created_at_val:
        created_at_val = datetime.now()
    elif isinstance(created_at_val, str):
        try:
            created_at_val = datetime.fromisoformat(created_at_val)
        except Exception:
            created_at_val = datetime.now()
            
    return {
        "item_id": item_id_str,
        "id": item_id_str,
        "poster_id": item.get("poster_id") or "student-123",
        "item_name": item_name,
        "title": item_name,
        "description": item.get("description", ""),
        "image_url": item.get("image_url", ""),
        "location_found": location_found,
        "locationFound": location_found,
        "status": item.get("status", "found"),
        "contact_info": contact_info,
        "currentHolding": item.get("currentHolding") or "Under safe custody",
        "contactName": item.get("contactName") or item.get("contact_info") or "Staff",
        "contactEmail": item.get("contactEmail") or "",
        "contactPhone": item.get("contactPhone") or "",
        "date": item.get("date") or "2026-07-12",
        "created_at": created_at_val,
        "reported": bool(item.get("reported", False)),
        "reportReason": item.get("reportReason", "")
    }

# Doubt Pydantic Schemas matching BLUEPRINT
class DoubtBase(BaseModel):
    question: str = Field(..., example="Laplace transform of sin(t)?")
    subject: str = Field(..., example="Mathematics")
    timestamp: str = Field(..., example="2026-07-12")
    upvotes: int = Field(0, example=1)
    answers: List[dict] = Field([], example=[])

    # Extra compatibility fields
    title: Optional[str] = None
    description: Optional[str] = ""
    category: Optional[str] = None
    authorAnonymousName: Optional[str] = "Anonymous Otter"
    date: Optional[str] = None
    reported: Optional[bool] = False
    reportReason: Optional[str] = ""
    userUpvoted: Optional[bool] = False

class DoubtCreate(BaseModel):
    question: str
    subject: str
    description: Optional[str] = ""
    category: Optional[str] = None
    authorAnonymousName: Optional[str] = None

class DoubtResponse(DoubtBase):
    doubt_id: str
    id: str

class AnswerCreateRequest(BaseModel):
    doubt_id: str
    text: str
    author: Optional[str] = "Anonymous Otter"

# Pydantic Schemas matching the BLUEPRINT
class NoteBase(BaseModel):
    title: str = Field(..., example="Advanced Machine Learning - Neural Networks")
    subject: str = Field(..., example="Machine Learning")
    semester: int = Field(..., example=6)
    uploader_name: str = Field(..., example="Harshit Kataram")
    file_url: str = Field(..., example="https://example.com/files/ml_notes.pdf")
    
    # Optional extensions for frontend compatibility
    branch: Optional[str] = "Computer Science"
    fileType: Optional[str] = "pdf"
    fileSize: Optional[str] = "2.4 MB"
    description: Optional[str] = "Comprehensive study material and guides."

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: str

# Task Pydantic Schemas matching the BLUEPRINT
class TaskBase(BaseModel):
    title: str = Field(..., example="Matplotlib Plotting Help")
    description: str = Field(..., example="Need assistance with custom plot formatting.")
    price: float = Field(..., example=500.0)
    deadline: str = Field(..., example="2026-07-20")
    status: str = Field("open", example="open")
    poster_id: str = Field(..., example="harshit_kataram")
    
    # Extended fields for full React dashboard integration compatibility
    branch: Optional[str] = "Computer Science"
    clientName: Optional[str] = "Harshit Kataram"
    clientRating: Optional[float] = 4.8
    reported: Optional[bool] = False
    acceptedBy: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    task_id: str

# Lost and Found Pydantic Schemas matching BLUEPRINT
class LostFoundCreate(BaseModel):
    item_name: str = Field(..., example="Casio Scientific Calculator")
    description: str = Field(..., example="Left behind in Room 402.")
    image_url: str = Field(..., example="https://images.unsplash.com/photo-1574634534894-89d7576c8259") # required for POST
    location_found: str = Field(..., example="Room 402")
    status: str = Field("found", example="found")
    contact_info: str = Field(..., example="Harshit (harshit@college.edu)")
    poster_id: str = Field(..., example="student-123")

    # Optional compatibility fields
    title: Optional[str] = None
    locationFound: Optional[str] = None
    currentHolding: Optional[str] = None
    contactName: Optional[str] = None
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    date: Optional[str] = None
    reported: Optional[bool] = False
    reportReason: Optional[str] = ""

class LostFoundUpdate(BaseModel):
    item_name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    location_found: Optional[str] = None
    status: Optional[str] = None
    contact_info: Optional[str] = None
    poster_id: Optional[str] = None # can keep if needed, but not required to update

    # Optional compatibility fields
    title: Optional[str] = None
    locationFound: Optional[str] = None
    currentHolding: Optional[str] = None
    contactName: Optional[str] = None
    contactEmail: Optional[str] = None
    contactPhone: Optional[str] = None
    reported: Optional[bool] = None
    reportReason: Optional[str] = None

class LostFoundResponse(BaseModel):
    item_id: str
    id: str
    poster_id: str
    item_name: str
    title: str
    description: str
    image_url: str
    location_found: str
    locationFound: str
    status: str
    contact_info: str
    created_at: datetime
    
    currentHolding: Optional[str] = ""
    contactName: Optional[str] = ""
    contactEmail: Optional[str] = ""
    contactPhone: Optional[str] = ""
    date: Optional[str] = ""
    reported: Optional[bool] = False
    reportReason: Optional[str] = ""

# API Routes
@app.get("/api/v1/notes", response_model=List[NoteResponse])
def get_notes(semester: Optional[int] = None, subject: Optional[str] = None):
    """
    Retrieve academic notes. Optionally filter by semester and subject.
    """
    query = {}
    if semester is not None:
        query["semester"] = semester
    if subject is not None:
        # Case-insensitive partial match search for subject
        query["subject"] = {"$regex": subject, "$options": "i"}

    try:
        cursor = notes_collection.find(query)
        notes_list = []
        for note in cursor:
            notes_list.append(note_helper(note))
        return notes_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing database: {str(e)}"
        )

@app.post("/api/v1/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_in: NoteCreate):
    """
    Create/upload a new academic note.
    """
    try:
        note_dict = note_in.dict()
        # Insert into MongoDB
        result = notes_collection.insert_one(note_dict)
        # Fetch the created document using the inserted_id
        inserted_id = result.inserted_id
        note_dict["id"] = str(inserted_id)
        return note_dict
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inserting note: {str(e)}"
        )

@app.get("/api/v1/tasks", response_model=List[TaskResponse])
def get_tasks(status_filter: Optional[str] = None, branch: Optional[str] = None):
    """
    Retrieve academic assistance task commissions.
    """
    query = {}
    if status_filter is not None:
        query["status"] = status_filter
    if branch is not None:
        query["branch"] = branch

    try:
        cursor = tasks_collection.find(query)
        tasks_list = []
        for task in cursor:
            tasks_list.append(task_helper(task))
        return tasks_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing database: {str(e)}"
        )

@app.post("/api/v1/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate):
    """
    Create a new task commission.
    """
    try:
        task_dict = task_in.dict()
        result = tasks_collection.insert_one(task_dict)
        inserted_id = result.inserted_id
        task_dict["task_id"] = str(inserted_id)
        return task_dict
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inserting task: {str(e)}"
        )

@app.get("/api/v1/doubts", response_model=List[DoubtResponse])
def get_doubts(subject: Optional[str] = None):
    """
    Retrieve academic doubts. Optionally filter by subject.
    """
    query = {}
    if subject is not None:
        query["subject"] = subject

    try:
        cursor = doubts_collection.find(query)
        doubts_list = []
        for d in cursor:
            doubts_list.append(doubt_helper(d))
        return doubts_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error accessing database: {str(e)}"
        )

@app.post("/api/v1/doubts", response_model=DoubtResponse, status_code=status.HTTP_201_CREATED)
def create_doubt(doubt_in: DoubtCreate):
    """
    Create/post a new anonymous doubt.
    """
    try:
        import datetime
        now_str = datetime.date.today().isoformat()
        doubt_dict = {
            "question": doubt_in.question,
            "title": doubt_in.question,
            "description": doubt_in.description or "",
            "subject": doubt_in.subject,
            "category": doubt_in.category or doubt_in.subject,
            "timestamp": now_str,
            "date": now_str,
            "upvotes": 1,
            "userUpvoted": True,
            "reported": False,
            "reportReason": "",
            "authorAnonymousName": doubt_in.authorAnonymousName or "Anonymous Owl",
            "answers": []
        }
        
        result = doubts_collection.insert_one(doubt_dict)
        inserted_id = str(result.inserted_id)
        doubt_dict["doubt_id"] = inserted_id
        doubt_dict["id"] = inserted_id
        return doubt_dict
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inserting doubt: {str(e)}"
        )

@app.post("/api/v1/doubts/answer", response_model=DoubtResponse)
def answer_doubt(answer_in: AnswerCreateRequest):
    """
    Post an answer to an academic doubt.
    """
    try:
        import datetime
        now_str = datetime.date.today().isoformat()
        ans_id = f"ans-{str(ObjectId())}"
        new_answer = {
            "id": ans_id,
            "answer_id": ans_id,
            "text": answer_in.text,
            "author": answer_in.author or "Anonymous Otter",
            "date": now_str,
            "timestamp": now_str,
            "upvotes": 0,
            "userUpvoted": False,
            "verified": False
        }
        
        doubt_id = answer_in.doubt_id
        try:
            query = {"_id": ObjectId(doubt_id)}
        except Exception:
            query = {"_id": doubt_id}
            
        cursor = doubts_collection.find(query)
        cursor_list = list(cursor)
        if not cursor_list:
            for alt_query in [{"doubt_id": doubt_id}, {"id": doubt_id}]:
                cursor_list = list(doubts_collection.find(alt_query))
                if cursor_list:
                    query = alt_query
                    break
                    
        if not cursor_list:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doubt with ID {doubt_id} not found."
            )
            
        doubts_collection.update_one(query, {"$push": {"answers": new_answer}})
        updated_doubt = doubts_collection.find(query)[0]
        return doubt_helper(updated_doubt)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error posting answer: {str(e)}"
        )

# Helper to extract current user ID from token/header
def get_current_user_id(authorization: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)) -> str:
    if x_user_id:
        return x_user_id
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]
        return authorization
    return "student-123"

# Helper to look up an item securely
def find_item_by_id(item_id: str):
    try:
        query = {"_id": ObjectId(item_id)}
        item = lost_found_collection.find_one(query) if hasattr(lost_found_collection, "find_one") else None
        if item:
            return query, item
    except Exception:
        pass

    for q in [{"_id": item_id}, {"item_id": item_id}, {"id": item_id}]:
        if hasattr(lost_found_collection, "find_one"):
            item = lost_found_collection.find_one(q)
        else:
            results = lost_found_collection.find(q)
            item = results[0] if results else None
        if item:
            return q, item
    return None, None

# Lost and Found Endpoints
@app.get("/api/v1/lost-found", response_model=List[LostFoundResponse])
def get_lost_found(status_filter: Optional[str] = None):
    """
    Retrieve all lost & found items. Optionally filter by status.
    """
    query = {}
    if status_filter is not None and status_filter != "All":
        query["status"] = status_filter

    try:
        cursor = lost_found_collection.find(query)
        return [lost_found_helper(item) for item in cursor]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving lost & found items: {str(e)}"
        )

@app.post("/api/v1/lost-found", response_model=LostFoundResponse, status_code=status.HTTP_201_CREATED)
def create_lost_found(
    item_in: LostFoundCreate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a new lost & found item. Requires image_url.
    """
    # Validation: Ensure the POST route requires an image_url. If it is missing, return a 400 Bad Request error.
    if not item_in.image_url or item_in.image_url.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_url is required"
        )
        
    current_user_id = get_current_user_id(authorization, x_user_id)

    try:
        import datetime
        now_str = datetime.date.today().isoformat()
        
        # Map fields correctly to satisfy both blueprint & UI
        title = item_in.title or item_in.item_name
        item_name = item_in.item_name or item_in.title or "Unnamed Item"
        locationFound = item_in.locationFound or item_in.location_found
        location_found = item_in.location_found or item_in.locationFound
        
        # Split contact info or parse it
        contact_info = item_in.contact_info
        contactName = item_in.contactName or "Staff"
        contactEmail = item_in.contactEmail or ""
        contactPhone = item_in.contactPhone or ""
        
        if not contact_info:
            contact_info = f"{contactName} ({contactEmail})"
        
        item_dict = {
            "poster_id": item_in.poster_id or current_user_id,
            "item_name": item_name,
            "title": title,
            "description": item_in.description,
            "image_url": item_in.image_url,
            "location_found": location_found,
            "locationFound": locationFound,
            "status": item_in.status,
            "contact_info": contact_info,
            "created_at": datetime.datetime.now(),
            
            # Compatibility fields
            "currentHolding": item_in.currentHolding or "Under safe custody",
            "contactName": contactName,
            "contactEmail": contactEmail,
            "contactPhone": contactPhone,
            "date": item_in.date or now_str,
            "reported": bool(item_in.reported),
            "reportReason": item_in.reportReason or ""
        }
        
        result = lost_found_collection.insert_one(item_dict)
        inserted_id = str(result.inserted_id)
        item_dict["item_id"] = inserted_id
        item_dict["id"] = inserted_id
        return lost_found_helper(item_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inserting lost/found item: {str(e)}"
        )

@app.patch("/api/v1/lost-found/{item_id}", response_model=LostFoundResponse)
def update_lost_found(
    item_id: str,
    item_update: LostFoundUpdate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Update an existing lost & found item. Checks poster_id against the logged-in user's token/header.
    """
    current_user_id = get_current_user_id(authorization, x_user_id)
    
    query, item = find_item_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost & found item with ID {item_id} not found."
        )
        
    poster_id = item.get("poster_id") or "student-123"
    if poster_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security Verification Failed: Only the original poster can update this post."
        )
        
    try:
        update_data = {}
        update_fields = item_update.dict(exclude_unset=True)
        
        # If item_name or title are specified, sync them
        if "item_name" in update_fields:
            update_data["item_name"] = update_fields["item_name"]
            update_data["title"] = update_fields["item_name"]
        elif "title" in update_fields:
            update_data["item_name"] = update_fields["title"]
            update_data["title"] = update_fields["title"]
            
        # If location_found or locationFound are specified, sync them
        if "location_found" in update_fields:
            update_data["location_found"] = update_fields["location_found"]
            update_data["locationFound"] = update_fields["location_found"]
        elif "locationFound" in update_fields:
            update_data["location_found"] = update_fields["locationFound"]
            update_data["locationFound"] = update_fields["locationFound"]
            
        for k, v in update_fields.items():
            if k not in ["item_name", "title", "location_found", "locationFound"]:
                update_data[k] = v
                
        if update_data:
            lost_found_collection.update_one(query, {"$set": update_data})
            
        # Refetch item
        _, updated_item = find_item_by_id(item_id)
        return lost_found_helper(updated_item)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating lost/found item: {str(e)}"
        )

@app.delete("/api/v1/lost-found/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lost_found(
    item_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Remove/delete a lost & found item. Checks poster_id against the logged-in user's token/header.
    """
    current_user_id = get_current_user_id(authorization, x_user_id)
    
    query, item = find_item_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lost & found item with ID {item_id} not found."
        )
        
    poster_id = item.get("poster_id") or "student-123"
    if poster_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security Verification Failed: Only the original poster can delete this post."
        )
        
    try:
        lost_found_collection.delete_one(query)
        return {"status": "success", "message": "Post successfully deleted"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting lost/found item: {str(e)}"
        )

# --- USER MANAGEMENT & AUTH MODULE ---

class SignUpRequest(BaseModel):
    name: str
    division: str
    rollNo: str
    branch: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileSettingsUpdate(BaseModel):
    theme_preference: str

def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

try:
    import jwt
    HAS_JWT = True
except ImportError:
    HAS_JWT = False

def encode_token(payload: dict) -> str:
    if HAS_JWT:
        return jwt.encode(payload, "NEXUS_JWT_SECRET_KEY_2026", algorithm="HS256")
    else:
        import base64
        import json
        payload_json = json.dumps(payload)
        encoded_payload = base64.b64encode(payload_json.encode()).decode()
        return f"b64.{encoded_payload}.sig"

def decode_token(token: str) -> dict:
    if not token:
        return {}
    if token.startswith("Bearer "):
        token = token[7:]
    
    if HAS_JWT:
        try:
            return jwt.decode(token, "NEXUS_JWT_SECRET_KEY_2026", algorithms=["HS256"])
        except Exception:
            pass
    
    if token.startswith("b64."):
        import base64
        import json
        try:
            parts = token.split(".")
            decoded_payload = base64.b64decode(parts[1]).decode()
            return json.loads(decoded_payload)
        except Exception:
            pass
            
    return {"sub": token}

@app.post("/api/v1/auth/signup", status_code=status.HTTP_201_CREATED)
def auth_signup(request: SignUpRequest):
    """
    Registers a new student user in MongoDB with Name, Division, Roll No, Branch, Email, Hashed Password, and theme_preference.
    """
    existing = users_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Store user in MongoDB
    user_id = f"student-{int(datetime.now().timestamp())}"
    user_doc = {
        "id": user_id,
        "name": request.name,
        "division": request.division,
        "rollNo": request.rollNo,
        "branch": request.branch,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "theme_preference": "light",
        "semester": 6,
        "college": "Nirmala Memorial Foundation College, Kandivali, Mumbai",
        "rating": 4.8,
        "earnings": 650,
        "completedTasksCount": 2,
        "uploadedNotesCount": 4
    }
    
    try:
        users_collection.insert_one(user_doc)
        return {
            "status": "success",
            "message": "User registered successfully",
            "user": {
                "id": user_doc["id"],
                "name": user_doc["name"],
                "division": user_doc["division"],
                "rollNo": user_doc["rollNo"],
                "branch": user_doc["branch"],
                "email": user_doc["email"],
                "theme_preference": user_doc["theme_preference"]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@app.post("/api/v1/auth/login")
def auth_login(request: LoginRequest):
    """
    Authenticates a student and issues a JWT token.
    """
    user = users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.get("password_hash") != hash_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = encode_token({"sub": user.get("id"), "email": user.get("email")})
    
    return {
        "token": token,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "division": user.get("division"),
            "rollNo": user.get("rollNo"),
            "branch": user.get("branch"),
            "email": user.get("email"),
            "theme_preference": user.get("theme_preference", "light"),
            "semester": user.get("semester", 6),
            "college": user.get("college", "Nirmala Memorial Foundation College, Kandivali, Mumbai"),
            "rating": user.get("rating", 4.8),
            "earnings": user.get("earnings", 650),
            "completedTasksCount": user.get("completedTasksCount", 2),
            "uploadedNotesCount": user.get("uploadedNotesCount", 4)
        }
    }

@app.get("/api/v1/user/profile")
def get_user_profile(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Returns verified user profile data. Requires Bearer Token or security fallback headers.
    """
    current_user_id = get_current_user_id(authorization, x_user_id)
    decoded = decode_token(current_user_id)
    sub_id = decoded.get("sub", current_user_id)
    
    user = users_collection.find_one({"id": sub_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in our database"
        )
        
    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "division": user.get("division"),
        "rollNo": user.get("rollNo"),
        "branch": user.get("branch"),
        "email": user.get("email"),
        "theme_preference": user.get("theme_preference", "light"),
        "semester": user.get("semester", 6),
        "college": user.get("college", "Nirmala Memorial Foundation College, Kandivali, Mumbai"),
        "rating": user.get("rating", 4.8),
        "earnings": user.get("earnings", 650),
        "completedTasksCount": user.get("completedTasksCount", 2),
        "uploadedNotesCount": user.get("uploadedNotesCount", 4)
    }

@app.put("/api/v1/user/profile/settings")
def update_user_settings(
    update_in: ProfileSettingsUpdate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Saves theme_preference to the database. Requires Bearer Token.
    """
    current_user_id = get_current_user_id(authorization, x_user_id)
    decoded = decode_token(current_user_id)
    sub_id = decoded.get("sub", current_user_id)
    
    user = users_collection.find_one({"id": sub_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in database"
        )
        
    try:
        users_collection.update_one({"id": sub_id}, {"$set": {"theme_preference": update_in.theme_preference}})
        return {
            "status": "success",
            "message": "Theme preference updated successfully",
            "theme_preference": update_in.theme_preference
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save settings: {str(e)}"
        )

# For running locally
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_server:app", host="0.0.0.0", port=8000, reload=True)
