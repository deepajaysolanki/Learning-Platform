# 📚 VibeStudy — Web-Based AI Learning Platform

VibeStudy is an intelligent, full-stack AI study companion designed to transform course materials into interactive learning workspaces. Upload your PDFs, Word documents (.docx), or PowerPoint presentations (.pptx), and VibeStudy unifies them into a single workspace featuring contextual chat, audio overviews, video recommendations, and automated quizzes.

---

## ✨ Features

- 💬 **Contextual AI Chat:** Ask questions, synthesize key definitions, and resolve gaps grounded strictly in your uploaded materials.
- 🎧 **Audio Overviews:** Convert notes into studio-quality audio scripts for hands-free listening on the go.
- 🎥 **Video Insights:** Automatically fetch relevant YouTube video lessons matching your specific notebook content.
- 🎯 **Interactive Quizzes:** Generate 10-question multiple-choice quizzes with dynamic scoring, answer tracking, and explanations.
- 📄 **Multi-Format Document Viewer:** Preview PDF, `.docx`, and slide deck presentations directly inside the browser.
- 🔖 **Community Notebook Marketplace:** Discover, save, and study public notebooks curated by other students.
- 🛡️ **Admin Panel & Moderation:** Full administrative controls for platform analytics, user management, content moderation, and HuggingFace API metrics.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, GSAP (Animations), React Router DOM, React Helmet Async, CSS3
- **Backend:** Node.js, Express.js, JWT Authentication, OAuth 2.0 (Google Sign-In)
- **Database:** MongoDB (Mongoose ORM)
- **AI & Services:** HuggingFace Inference API, Web Speech API, YouTube Data API
- **Deployment:** Render

---

## 🚀 Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git.scm.com/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) or local MongoDB instance

---

### Installation

1. **Clone the repository:**
   git clone [https://github.com/deepajaysolanki/vibestudy](https://github.com/deepajaysolanki/vibestudy)
   cd vibestudy

2. Set up the Backend:
   cd backend
   npm install
3. Set up environment variables
   .env,
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    HUGGINGFACE_API_KEY=your_huggingface_api_key
    YOUTUBE_API_KEY=your_youtube_api_key
4. Start the Backend Server:
  npm start
5. Set up the Frontend:
   Set up the Frontend:
6. Start the React Frontend:
   npm run dev

### Author
  Deep Solanki — Founder & Lead Full-Stack Developer
  - portfolio: deepsolanki.onrender.com
