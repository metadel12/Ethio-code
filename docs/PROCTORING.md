# 🎥 EthioCode Proctoring System

Complete AI-powered proctoring system for secure online screening tests with real-time monitoring, cheating detection, and session recording.

---

## 🎯 Features

### For Companies/Admins (Proctors)
- ✅ Create proctored tests with custom questions (multiple choice, essay, coding)
- ✅ Configure proctoring rules (webcam, screen share, tab switching, copy-paste)
- ✅ AI detection settings (face detection, object detection, audio monitoring)
- ✅ Real-time monitoring dashboard with live candidate feeds
- ✅ Automatic flagging of suspicious activity
- ✅ Session recording and playback
- ✅ Generate violation reports
- ✅ Invite candidates via email
- ✅ Terminate sessions remotely

### For Candidates (Test Takers)
- ✅ Device check (camera, microphone, screen share)
- ✅ Take proctored tests with real-time monitoring
- ✅ Real-time warnings for violations
- ✅ View assigned tests and session history
- ✅ Resume interrupted sessions

### AI Detection Features
- 🤖 Face detection (multiple faces, face not visible)
- 🤖 Object detection (mobile phone, books, notes) via YOLO
- 🤖 Tab/window switching detection
- 🤖 Copy-paste prevention
- 🤖 Audio monitoring (background noise, conversations)
- 🤖 Automatic violation flagging with severity levels

---

## 📋 Database Schema

### Collections

#### `proctoring_tests`
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  company_id: ObjectId,
  duration_minutes: Number,
  questions: [{
    id: String,
    text: String,
    type: String, // "multiple_choice", "coding", "essay"
    options: [String],
    correct_answer: String,
    points: Number,
    code_language: String,
    initial_code: String
  }],
  proctoring_rules: {
    require_webcam: Boolean,
    require_screen_sharing: Boolean,
    require_microphone: Boolean,
    allow_tab_switching: Boolean,
    allow_copy_paste: Boolean,
    max_violations_allowed: Number,
    auto_submit_on_violation: Boolean,
    notify_on_flag: Boolean
  },
  ai_settings: {
    face_detection_enabled: Boolean,
    multiple_faces_detection: Boolean,
    object_detection_enabled: Boolean,
    eye_tracking_enabled: Boolean,
    audio_monitoring_enabled: Boolean,
    sensitivity_level: String // "low", "medium", "high"
  },
  status: String, // "draft", "active", "paused", "completed", "archived"
  created_at: Date,
  updated_at: Date
}
```

#### `proctoring_sessions`
```javascript
{
  _id: ObjectId,
  test_id: ObjectId,
  user_id: String,
  user_name: String,
  user_email: String,
  status: String, // "pending", "active", "completed", "terminated"
  started_at: Date,
  completed_at: Date,
  current_question_index: Number,
  answers: [{
    question_id: String,
    answer: String,
    code: String,
    submitted_at: Date,
    time_taken_seconds: Number
  }],
  flags: [{ type: String, severity: String, timestamp: Date }],
  total_flags: Number,
  last_heartbeat: Date,
  created_at: Date,
  updated_at: Date
}
```

#### `proctoring_flags`
```javascript
{
  _id: ObjectId,
  session_id: ObjectId,
  test_id: ObjectId,
  user_id: String,
  type: String, // "tab_switch", "multiple_faces", "face_not_visible", "prohibited_object", "copy_paste"
  severity: String, // "low", "medium", "high"
  timestamp: Date,
  details: String,
  screenshot_url: String,
  is_resolved: Boolean
}
```

---

## 🔌 API Endpoints

### Company/Proctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/proctoring/tests` | Create a new proctored test |
| GET | `/api/v1/proctoring/tests` | List all company tests |
| GET | `/api/v1/proctoring/tests/{test_id}` | Get test details |
| PUT | `/api/v1/proctoring/tests/{test_id}` | Update test |
| POST | `/api/v1/proctoring/tests/{test_id}/publish` | Publish test (make active) |
| POST | `/api/v1/proctoring/tests/{test_id}/invite` | Invite candidate by email |
| DELETE | `/api/v1/proctoring/tests/{test_id}` | Delete test |
| GET | `/api/v1/proctoring/sessions/active` | Get all active sessions |
| GET | `/api/v1/proctoring/sessions/{session_id}` | Get session details |
| GET | `/api/v1/proctoring/sessions/{session_id}/live` | Get real-time session data |
| POST | `/api/v1/proctoring/sessions/{session_id}/terminate` | Terminate session |
| GET | `/api/v1/proctoring/sessions/{session_id}/report` | Get full session report |

### Candidate Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/proctoring/candidate/tests` | Get assigned tests |
| POST | `/api/v1/proctoring/candidate/tests/{test_id}/start` | Start test session |
| POST | `/api/v1/proctoring/candidate/sessions/{session_id}/answer` | Submit answer |
| POST | `/api/v1/proctoring/candidate/sessions/{session_id}/flag` | Report violation |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| WS `/api/v1/proctoring/ws/session/{session_id}?token={token}` | Real-time proctoring monitoring |

**WebSocket Messages:**
- `heartbeat` - Keep session alive
- `frame` - Send video frame for AI analysis
- `client_flag` - Report client-side violation (tab switch, copy-paste)

---

## 🎨 Frontend Pages

### Company/Proctor Pages

1. **`/proctoring/tests`** - Test management hub
   - List all tests (draft, active, completed)
   - Create new test button
   - Publish, invite, monitor, delete actions

2. **`/proctoring/create`** - Test creation form
   - Basic info (title, description, duration)
   - Add/remove questions (multiple choice, essay, coding)
   - Configure proctoring rules
   - Configure AI detection settings
   - Save as draft or publish

3. **`/proctoring/monitor`** - Real-time monitoring dashboard
   - Sidebar: Active sessions list
   - Main: Live webcam + screen share feeds
   - Bottom: Recent alerts, session info, controls
   - Terminate session button

4. **`/proctoring/report/:sessionId`** - Session report
   - Candidate info
   - Session duration, status
   - Flag summary (high/medium/low)
   - Full violation log with timestamps

### Candidate Pages

1. **`/proctoring/my-tests`** - Assigned tests list
   - View all assigned tests
   - See session status (pending, active, completed, terminated)
   - Start/resume test button

2. **`/proctoring/test/:testId`** - Test taking page
   - Device check (camera, mic, screen share)
   - Question display (multiple choice, essay, coding)
   - Timer countdown
   - Proctoring status sidebar
   - Real-time violation warnings
   - Submit answers

---

## 🚀 Setup & Installation

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Install AI libraries (optional, for advanced detection):**
```bash
pip install opencv-python face-recognition ultralytics
```

3. **Configure MongoDB:**
Ensure MongoDB is running and `MONGODB_URL` is set in `.env`:
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=ethiocode
```

4. **Run backend:**
```bash
python run.py
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure WebSocket URL:**
In `.env`:
```env
VITE_WS_URL=ws://localhost:8000
```

3. **Run frontend:**
```bash
npm run dev
```

---

## 📖 Usage Guide

### For Companies

1. **Create a Test:**
   - Navigate to `/proctoring/tests`
   - Click "Create Test"
   - Fill in test details, add questions
   - Configure proctoring rules and AI settings
   - Click "Publish Test"

2. **Invite Candidates:**
   - From test list, click "Invite" on an active test
   - Enter candidate email
   - System creates a pending session

3. **Monitor Sessions:**
   - Navigate to `/proctoring/monitor`
   - Select active session from sidebar
   - View live feeds and alerts
   - Terminate if needed

4. **Review Reports:**
   - Click "View Report" on any session
   - See full violation history
   - Export for audit

### For Candidates

1. **View Assigned Tests:**
   - Navigate to `/proctoring/my-tests`
   - See all tests assigned to you

2. **Take a Test:**
   - Click "Start Test"
   - Complete device check (allow camera, mic, screen share)
   - Answer questions
   - Submit when done

3. **During Test:**
   - Keep face visible in camera
   - Don't switch tabs
   - Don't copy-paste
   - Follow all proctoring rules

---

## 🔒 Security Features

- ✅ JWT authentication for all endpoints
- ✅ WebSocket token validation
- ✅ Company-scoped test access
- ✅ User-scoped session access
- ✅ Real-time violation detection
- ✅ Automatic session termination on max violations
- ✅ Audit trail with timestamps

---

## 🤖 AI Detection Details

### Face Detection
- Uses `face_recognition` library
- Detects: no face, multiple faces
- Severity: medium-high

### Object Detection
- Uses YOLOv8 (`ultralytics`)
- Detects: cell phone, book, laptop
- Severity: high

### Client-Side Detection
- Tab switching via `visibilitychange` event
- Copy-paste via clipboard events
- Right-click prevention
- Severity: medium

---

## 📊 Violation Severity Levels

| Severity | Examples | Action |
|----------|----------|--------|
| **High** | Multiple faces, prohibited objects, session terminated | Immediate flag, count towards max violations |
| **Medium** | Face not visible, tab switching, copy-paste | Flag with warning, count towards max violations |
| **Low** | Looking away, background noise | Flag for review, may not count towards max |

---

## 🎯 Future Enhancements

- [ ] Video recording upload to cloud storage (AWS S3)
- [ ] Screen recording with activity log
- [ ] Eye tracking with gaze detection
- [ ] Automated test scoring
- [ ] Candidate identity verification (photo ID + selfie)
- [ ] Email/SMS notifications on violations
- [ ] Bulk candidate invitation
- [ ] Test templates library
- [ ] Analytics dashboard (pass rates, violation trends)
- [ ] Integration with ATS systems

---

## 🐛 Troubleshooting

### Camera/Mic Not Working
- Ensure browser permissions are granted
- Check device is not in use by another app
- Try different browser (Chrome recommended)

### WebSocket Connection Failed
- Verify `VITE_WS_URL` is correct
- Check backend is running
- Ensure token is valid

### AI Detection Not Working
- Install optional dependencies: `pip install opencv-python face-recognition ultralytics`
- Download YOLO model: `yolov8n.pt` (auto-downloads on first use)
- Check camera feed is clear

---

## 📝 License

Part of the EthioCode platform. All rights reserved.

---

**Built with ❤️ for secure online assessments** 🇪🇹
