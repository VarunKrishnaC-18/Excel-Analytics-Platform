# 📊 Excel Analytics Platform

A full-featured web application developed as part of a group internship project at **Zidio Development**. This platform allows users to upload Excel files, analyze data through dynamic 2D/3D charts, download visualizations, and even generate smart AI-powered summaries.

---

## 🚀 Project Overview
The Excel Analytics Platform is built with the MERN stack and provides a powerful, user-friendly interface to turn raw Excel data into meaningful insights. This collaborative effort aimed to mimic real-world enterprise dashboard functionalities using modern web technologies.

---

## 🔧 Features

- ✅ Excel File Upload & Parsing (.xlsx)
- ✅ Dynamic Column Mapping for X and Y axes
- ✅ 2D Chart Generation (Bar, Line, Pie, Scatter) using Chart.js
- ✅ 3D Chart Visualization using Three.js + React-Three-Fiber
- ✅ JWT-based Authentication (Login/Signup)
- ✅ Personalized User Dashboard with Upload History
- ✅ Download Charts as PNG/PDF
- ✅ Optional AI Integration for Smart Insights (OpenAI API)
- ✅ Responsive UI with Smooth Animations (Pure CSS)

---

## 🛠 Tech Stack

### Frontend:
- React.js
- Chart.js
- Three.js (React-Three-Fiber)
- SheetJS (xlsx)
- TailwindCSS

### Backend:
- Node.js
- Express.js
- MongoDB
- JWT (Authentication)
- Multer (File Upload Handling)

### APIs and Libraries:
- Gemini API 

---

## 👨‍👩‍👧‍👦 Team Members

This project was developed as a team collaboration during our internship at **Zidio Development**:

- **Honey** - Make Fullfront-end 
- **Iqbal** – API integration  
- **Varun Krishna** – Data visualization 
- **Amruta** – Make Full back-end Interation 

We worked together to plan, develop, test, and deploy this platform with shared responsibilities and weekly progress syncs.

---

## 📦 Installation & Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/VarunKrishnaC-18/Excel-Analytics-Platform.git
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. **Configure environment variables:**
   - Create `.env` in `/backend` with:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     OPENAI_API_KEY=your_openai_key (optional)
     ```

4. **Run the development servers:**
   ```bash
   # In /backend
   npm run dev
   # In /frontend
   npm start
   ```

---


## ✨ Learning Experience

This group project helped us understand how to collaborate in a real-world tech environment, divide tasks efficiently, and build a scalable, full-stack application. We gained experience with data visualization, file parsing, authentication, API integration, and frontend performance optimization.

Special thanks to **Zidio Development** for mentoring us and giving us this opportunity to apply and grow our skills.

---



