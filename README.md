# 📸 SmartAttend – Smart Attendance System Using Facial Recognition & Location

SmartAttend is a comprehensive web application designed to automate student attendance in educational institutions using facial recognition and geolocation. It ensures secure, accurate, and transparent attendance management for students, teachers, and administrators.

---

## 🔍 Overview

This project solves the common problem of proxy attendance by combining **AI-powered face detection** and **GPS-based location verification**. It provides role-based dashboards for:

- **Admin** – to manage departments, courses, groups, students, and teachers.
- **Teachers** – to schedule and manage classes, control attendance, and share resources.
- **Students** – to mark attendance, access notes, and view their attendance reports.

---

## 🚀 Live Demo

🌐 **Frontend (Vercel):** [Visit Live Site](https://smartattend-rho.vercel.app/)  
🔗 **Backend (Render):** [Live API Link](https://project-52z2.onrender.com)  
📂 **GitHub Repo:** [https://github.com/ishika2236/SmartAttend](https://github.com/ishika2236/SmartAttend)

---

## 🧑‍💼 User Roles & Working Flow

The system operates in a structured step-by-step flow based on user roles:

### 1️⃣ Admin Workflow
1. **Department Management**: Create departments (e.g., Computer Science).
2. **Course Management**: Create courses and assign them to departments.
3. **Group Management**: Create student groups (e.g., CSE-2A).
4. **User Registration**: Register teachers and students (or they can sign up manually).
5. **Classroom Assignment**: Assign a teacher to a specific course and group to create a complete "classroom" setting.

### 2️⃣ Teacher Workflow
1. **View Classrooms**: View assigned classrooms from the teacher dashboard.
2. **Schedule Classes**: Schedule regular or extra classes under an assigned classroom.
3. **Attendance Control**: Open or close the attendance window for students for a specific class.
4. **Location / Coordinates**: Set classroom coordinates to allow GPS validation for the session.
5. **Manual Attendance**: Manually mark or bulk update attendance for edge cases (e.g., late arrivals).

### 3️⃣ Student Workflow
1. **View Schedules**: Check active and upcoming classes assigned to their group.
2. **Mark Attendance**: When the teacher’s window is open, click "Mark Attendance".
3. **Verification Process**: 
   - **Facial Recognition**: The camera scans your face.
   - **Geolocation**: Your GPS coordinates are verified against the predefined class radius.
4. **View History**: Access individual attendance history in chart and table formats.

---

## ✨ Key Features

- ✅ **Facial Recognition** for student verification (camera-based)
- 🌍 **Geolocation Matching** ensures students are physically present in class
- 📅 **Class Scheduling** by teachers
- 👨‍👩‍👧‍👦 **Group Management** by Admin
- 📊 **Attendance Analytics & Charts** for all users
- 🧠 **Role-based Dashboards** with custom UI
- 📁 **Resource Sharing** (notes & announcements)

---

## 🛠️ Tech Stack

| Frontend     | Backend      | Database   | AI Module    | Others           |
|--------------|--------------|------------|--------------|------------------|
| React.js     | Express.js   | MongoDB    | face-api.js  | Cloudinary, MUI  |
| Tailwind CSS | Node.js      | Mongoose   | FastAPI (Py) | Vercel, Render   |

---

## 📦 Installation, Setup & Commands

### Prerequisites
- **Node.js**
- **Python** (for the AI Microservice)
- **MongoDB** instance (local or Cloud Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/ishika2236/SmartAttend.git
cd SmartAttend
```

### 2. Environment Variables Setup
Create a `.env` file in the `backend/` folder with the following structure:
```env
PORT=5000
MONGO_URI=your_mongodb_url_here
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create a `.env` file in the `frontend/` folder (optional usually, but useful if backend is hosted):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Quick Start (Windows Only)
A batch script is provided to quickly launch all 3 major services at once on Windows:
```bash
run_all.bat
```
*This command will open three separate command prompts starting the Backend, Frontend, and AI Microservice simultaneously.*

### 4. Manual Start Commands (Cross-Platform)

**A. Start the Node.js Backend:**
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:5000
```

**B. Start the React Frontend:**
```bash
cd frontend
npm install
npm run dev
# App will strictly run on http://localhost:5173
```

**C. Start the Python AI Microservice:**
```bash
cd ai_module

# 1. Create and activate a virtual environment
python -m venv venv

# Windows Activation:
venv\Scripts\activate
# Linux/Mac Activation:
# source venv/bin/activate

# 2. Install dependencies
# Note: insightface and onnxruntime currently require numpy 1.x for binary compatibility
pip install "numpy<2.0.0" 
pip install -r requirements.txt

# ⚠️ Windows Users Note: If you get an installation error regarding "Windows Long paths" 
# or MAX_PATH length, try moving the project to a shorter directory path (e.g., C:\SmartAttend)
# before running pip install.

# 3. Download required AI Models (ONNX files)
# This will download the Face Detection, Recognition, and Anti-spoofing models into ai_module/models/
python download_models.py

# 4. Start the server
python -m uvicorn app:app --host 0.0.0.0 --port 8000
# AI Service runs on http://localhost:8000
```
---

## 🧪 Test Credentials

You can create new accounts via Admin or use these pre-existing sample accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@mail.com` | `123456Aa` |
| Teacher | `testteacher@gmail.com` | `Aa123456` |
| Student | `test123@gmail.com` | `Aa123456` |

---

## 📈 Future Enhancements

- 🔒 OTP-based secure sign-up
- 📲 Mobile app version with React Native
- 🧠 AI-based attendance trend prediction
- 📢 Real-time notifications

---

## 🙋‍♀️ About Me

Hi! I’m **Ishika Gulati**, a passionate CSE student and developer.  
I love building smart solutions for real-world problems.

🔗 [Connect with me on LinkedIn](https://www.linkedin.com/in/ishika-gulati-b8a64b249/)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
