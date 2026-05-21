# AI-Based Smart Interview Preparation System

## Project Overview
A web-based application designed to help students and job seekers prepare for interviews using AI-powered mock interviews with instant feedback, speech-to-text functionality, and performance tracking.

## Features
✅ User Authentication (Signup/Login)
✅ Student Profile Management
✅ Role-Based Interview Questions (Software Developer, DevOps Engineer, Data Analyst, Web Developer)
✅ Question Categories (Technical, Behavioral, Problem Solving)
✅ Speech-to-Text Input
✅ AI-Powered Feedback (Enhanced with 4-metric analysis)
✅ Performance Tracking & History
✅ Performance Reporting (Interview Summary)
✅ **💡 AI Q&A During Interview** (NEW - Ask questions on Docker, React, Microservices, etc.)
✅ **📊 Platform Statistics** (NEW - Landing page with social proof)
✅ Theme Toggle (Dark/Light Mode)
✅ Logout Functionality
✅ Demo Login (student@gmail.com / student@123)

## 📚 Documentation
- **[FEATURES_UPDATE.md](FEATURES_UPDATE.md)** - NEW! Details on Q&A feature and enhanced landing page
- **[QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)** - NEW! Step-by-step testing guide for new features
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Complete project status and feature overview
- **[ENHANCEMENTS.md](ENHANCEMENTS.md)** - Detailed information about system enhancements
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Step-by-step testing instructions and quality checks

## Project Structure
```
AI/
├── public/
│   ├── index.html
│   ├── signup.html
│   ├── profile.html
│   ├── dashboard.html
│   ├── style.css
│   ├── signup.css
│   ├── profile.css
│   ├── dashboard.css
│   ├── script.js
│   ├── signup.js
│   ├── profile.js
│   └── dashboard.js
├── backend/
│   └── server.js
├── .env
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Edit the `.env` file (already created):
```
OPENAI_API_KEY=your_api_key_here (optional - not required for basic functionality)
MONGO_URI=your_mongodb_uri_here (optional - not required for basic functionality)
```

### Step 3: Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 4: Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

## How to Use

### Demo Login (Fastest Way to Get Started)
1. On the home page, click the **"Demo Login"** button
2. You'll be instantly logged in with demo credentials:
   - Email: `student@gmail.com`
   - Password: `student@123`
3. A sample profile will be created
4. You'll be redirected to the Dashboard

### Regular Signup/Login
1. Click **"Signup"** on the home page
2. Enter your details:
   - Full Name
   - Email
   - Password
3. Click **"Create Account"**
4. Complete your student profile with:
   - College/University name
   - Branch/Stream
   - Year of study
   - Preferred Job Role
   - Skills & Interests
   - GitHub & LinkedIn profiles (optional)
5. Click **"Let's Begin Now"**
6. Start practicing mock interviews

### Using the Dashboard
1. **Choose Role**: Select your target job role
2. **Select Category**: Choose between Technical, Behavioral, or Problem Solving questions
3. **Start Interview**: Click "Start Interview" button
4. **Answer Questions**: 
   - Type your answer in the text area
   - OR click "🎙 Start Recording" to use voice input
5. **Get Feedback**: 
   - Click "Submit Answer" to get AI feedback
   - View your scores for Clarity, Confidence, and Keyword Match
6. **Track Progress**: Check "Score History" panel on the right
7. **Logout**: Click "Logout" button in the top right corner

## Demo Credentials
```
Email: student@gmail.com
Password: student@123
```

## Technical Stack

### Frontend
- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript
- Web Speech API (for speech-to-text)

### Backend
- Node.js
- Express.js
- Body-Parser (for request parsing)

### Data Storage
- LocalStorage (for client-side data)
- Optional: MongoDB (for production use)

### AI Integration (Optional)
- OpenAI API (for advanced feedback)
- Google Speech Recognition API

## Troubleshooting

### Button Not Working
✅ Fixed! All null checks have been added to event listeners

### Can't See Demo Login Button
✅ It's visible on the home page (index.html) with demo credentials displayed below

### Speech Recognition Not Working
- Works only in Google Chrome and Edge browsers
- Make sure microphone permissions are granted
- Check that you're using HTTPS in production

### Server Not Starting
```bash
# Make sure dependencies are installed
npm install

# Check if port 3000 is available
# If not, edit backend/server.js and change the port number
```

### localStorage Issues
- Clear browser cache or use Incognito Mode
- Data is stored per domain/browser

## Browser Compatibility
- ✅ Chrome/Edge (Full support including speech recognition)
- ✅ Firefox (Support except speech recognition)
- ✅ Safari (Basic support)

## Future Enhancements
- MongoDB database integration for persistent storage
- OpenAI/Gemini API for advanced AI feedback
- Video recording of answers
- Real-time scoring analytics
- Interview session scheduling
- Peer comparison and leaderboards
- Mobile app development

## License
ISC

## Support
For issues or suggestions, please contact the development team.

---

**Happy Interviewing! 🎯**
