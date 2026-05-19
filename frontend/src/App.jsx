import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

import TemplatesPage from "./pages/templates";
import CodeEditorPage from "./pages/code-editor";
import WhiteboardPage from "./pages/whiteboard";
import SecurityPage from "./pages/security";
import InterviewPage from "./pages/interview";
import FrontendInterviewPage from "./pages/frontend-interview";
import BackendInterviewPage from "./pages/backend-interview";
import GraphicsInterviewPage from "./pages/graphics-interview";
import VideoEditingPage from "./pages/video-editing";
import LanguagesPage from "./pages/languages";
import SignupPage from "./pages/signup";
import AudioVideoPage from "./pages/audiovideo";
import InterviewQuestionsPage from "./pages/interview-questions";
import ScreenTestPage from "./pages/screentest";
import AmharicTranslatorPage from "./pages/amharics-translator";
import ProctoringPage from "./pages/proctoring for screening test";
import PricingPage from "./pages/pricing";
import TestimonialsPage from "./pages/testimonials";
import BlogsPage from "./pages/blogs";
import ContactPage from "./pages/contact";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import NotFound from "./pages/not-found";
import UltimateHomePage from "./pages/UltimateHomePageNew";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<UltimateHomePage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/code-editor" element={<CodeEditorPage />} />
              <Route path="/whiteboard" element={<WhiteboardPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/frontend-interview" element={<FrontendInterviewPage />} />
              <Route path="/backend-interview" element={<BackendInterviewPage />} />
              <Route path="/graphics-interview" element={<GraphicsInterviewPage />} />
              <Route path="/video-editing" element={<VideoEditingPage />} />
              <Route path="/languages" element={<LanguagesPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/audiovideo" element={<AudioVideoPage />} />
              <Route path="/interview-questions" element={<InterviewQuestionsPage />} />
              <Route path="/screentest" element={<ScreenTestPage />} />
              <Route path="/amharic-translator" element={<AmharicTranslatorPage />} />
              <Route path="/proctoring" element={<ProctoringPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
