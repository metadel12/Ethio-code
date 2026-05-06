import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
// import ModernNavbar from "./components/ModernNavbar";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";
import "./App.css";

import TemplateListPage from "./pages/TemplateListPage";
import TemplateDetailPage from "./pages/TemplateDetailPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import AdminPanel from "./pages/AdminPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/not-found";
import UltimateHomePage from "./pages/UltimateHomePageNew";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import CompanyDashboardPage from "./pages/CompanyDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PostJobPage from "./pages/PostJobPage";
import ProjectListingsPage from "./pages/ProjectListingsPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import MyProjectsPage from "./pages/MyProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

import Footer from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
        <Router>
          <Navbar />
          <div className="App pt-16">
            <Routes>
              <Route path="/" element={<UltimateHomePage />} />
              <Route path="/templates" element={<TemplateListPage />} />
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
              <Route path="/marketplace" element={<TemplateListPage />} />
              <Route path="/templates/:id" element={<TemplateDetailPage />} />
              <Route path="/creator" element={
                <ProtectedRoute>
                  <CreatorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/templates" element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/saved" element={<SavedJobsPage />} />
              <Route path="/jobs/applications" element={<MyApplicationsPage />} />
              <Route path="/jobs/company" element={<CompanyDashboardPage />} />
              <Route path="/jobs/post" element={<PostJobPage />} />
              <Route path="/projects" element={<ProjectListingsPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/mine" element={<MyProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/jobs/admin" element={<AdminDashboardPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
