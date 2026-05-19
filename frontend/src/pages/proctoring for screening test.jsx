import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FiShield, FiVideo, FiMonitor, FiAlertTriangle, FiUsers,
  FiArrowRight, FiCamera, FiMic, FiCpu, FiFlag, FiClipboard, FiPlusCircle, FiBookOpen,
} from "react-icons/fi";

export default function ProctoringPage() {
  const { user } = useAuth();
  const isCompany = user?.role === "company" || user?.role === "admin" || user?.role === "employer";

  return (
    <div className="text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
          <FiShield className="w-4 h-4" /> AI-Powered Proctoring
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
          Secure Online Testing<br />
          <span className="text-purple-400">for EthioCode</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Real-time AI monitoring, face detection, and violation alerts — ensuring test integrity for every screening session.
        </p>

        {/* Quick actions based on role */}
        <div className="flex flex-wrap gap-4 justify-center">
          {isCompany ? (
            <>
              <Link to="/proctoring/tests" className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition">
                <FiClipboard className="w-4 h-4" /> Manage Tests <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/proctoring/create" className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl font-semibold transition">
                <FiPlusCircle className="w-4 h-4" /> Create Test
              </Link>
              <Link to="/proctoring/monitor" className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl font-semibold transition">
                <FiMonitor className="w-4 h-4" /> Live Monitor
              </Link>
            </>
          ) : (
            <Link to="/proctoring/my-tests" className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition">
              <FiBookOpen className="w-4 h-4" /> My Tests <FiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-4xl mx-auto px-6 pb-14">
        <h2 className="text-xl font-bold text-center mb-8">Everything you need for secure testing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: FiCamera,        title: "Face Detection",    desc: "Detects multiple faces or when candidate leaves frame." },
            { icon: FiMonitor,       title: "Screen Monitoring", desc: "Live screen share with tab-switch detection." },
            { icon: FiMic,           title: "Audio Monitoring",  desc: "Background noise and conversation detection." },
            { icon: FiCpu,           title: "Object Detection",  desc: "YOLOv8 detects phones, books, and unauthorized items." },
            { icon: FiAlertTriangle, title: "Real-Time Alerts",  desc: "Proctors receive instant alerts for every violation." },
            { icon: FiFlag,          title: "Violation Reports", desc: "Full session reports with timestamps and severity." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm">{title}</h3>
              <p className="text-slate-400 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA split */}
      <div className="max-w-4xl mx-auto px-6 pb-14 grid sm:grid-cols-2 gap-5">
        <div className="bg-purple-600/10 border border-purple-500/30 rounded-2xl p-7">
          <FiUsers className="w-7 h-7 text-purple-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">For Companies</h3>
          <p className="text-slate-400 text-sm mb-5">Create proctored tests, invite candidates, and monitor sessions in real-time.</p>
          <Link to="/proctoring/tests" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-sm font-semibold transition">
            Manage Tests <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-7">
          <FiShield className="w-7 h-7 text-green-400 mb-3" />
          <h3 className="text-lg font-bold mb-2">For Candidates</h3>
          <p className="text-slate-400 text-sm mb-5">View assigned tests, complete device check, and take proctored assessments.</p>
          <Link to="/proctoring/my-tests" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-semibold transition">
            My Tests <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
