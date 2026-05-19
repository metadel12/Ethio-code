import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";

const API = "/api/v1/proctoring";

const DEFAULT_QUESTION = { text: "", type: "multiple_choice", options: ["", "", "", ""], correct_answer: "", points: 10, code_language: "", initial_code: "" };

export default function CreateTestPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    questions: [{ ...DEFAULT_QUESTION, options: ["", "", "", ""] }],
    proctoring_rules: {
      require_webcam: true,
      require_screen_sharing: true,
      require_microphone: true,
      allow_tab_switching: false,
      allow_copy_paste: false,
      max_violations_allowed: 3,
      auto_submit_on_violation: true,
      notify_on_flag: true,
    },
    ai_settings: {
      face_detection_enabled: true,
      multiple_faces_detection: true,
      object_detection_enabled: true,
      eye_tracking_enabled: false,
      audio_monitoring_enabled: true,
      sensitivity_level: "medium",
    },
  });

  const setField = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      path.reduce((obj, key, i) => (i === path.length - 1 ? (obj[key] = value) : obj[key]), next);
      return next;
    });
  };

  const addQuestion = () =>
    setForm((p) => ({ ...p, questions: [...p.questions, { ...DEFAULT_QUESTION, options: ["", "", "", ""] }] }));

  const removeQuestion = (i) =>
    setForm((p) => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }));

  const setQuestion = (i, field, value) =>
    setForm((p) => {
      const qs = [...p.questions];
      qs[i] = { ...qs[i], [field]: value };
      return { ...p, questions: qs };
    });

  const setOption = (qi, oi, value) =>
    setForm((p) => {
      const qs = [...p.questions];
      const opts = [...qs[qi].options];
      opts[oi] = value;
      qs[qi] = { ...qs[qi], options: opts };
      return { ...p, questions: qs };
    });

  const handleSave = async (publish = false) => {
    if (!form.title.trim()) return alert("Title is required.");
    setSaving(true);
    try {
      const { data } = await axios.post(`${API}/tests`, form, { headers });
      if (publish) {
        await axios.post(`${API}/tests/${data._id}/publish`, null, { headers });
      }
      navigate("/proctoring/monitor");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save test.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Create Proctored Test</h1>
            <p className="text-slate-400 text-sm">Build a test with AI-powered proctoring</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Test Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-400 mb-1 block">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setField(["title"], e.target.value)}
                  placeholder="e.g. Frontend Developer Assessment"
                  className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField(["description"], e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  min={5}
                  value={form.duration_minutes}
                  onChange={(e) => setField(["duration_minutes"], Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Questions */}
          <section className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Questions ({form.questions.length})</h2>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition"
              >
                <FiPlus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {form.questions.map((q, qi) => (
              <div key={qi} className="bg-slate-700/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Question {qi + 1}</span>
                  {form.questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      value={q.text}
                      onChange={(e) => setQuestion(qi, "text", e.target.value)}
                      placeholder="Question text"
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <select
                      value={q.type}
                      onChange={(e) => setQuestion(qi, "type", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="essay">Essay</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) => setQuestion(qi, "points", Number(e.target.value))}
                      placeholder="Points"
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {q.type === "multiple_choice" && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">Options (mark correct answer)</p>
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correct_answer === opt && opt !== ""}
                          onChange={() => setQuestion(qi, "correct_answer", opt)}
                          className="accent-purple-500 shrink-0"
                        />
                        <input
                          value={opt}
                          onChange={(e) => setOption(qi, oi, e.target.value)}
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1 px-3 py-1.5 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "coding" && (
                  <div className="space-y-2">
                    <input
                      value={q.code_language}
                      onChange={(e) => setQuestion(qi, "code_language", e.target.value)}
                      placeholder="Language (e.g. javascript, python)"
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                      value={q.initial_code}
                      onChange={(e) => setQuestion(qi, "initial_code", e.target.value)}
                      placeholder="Starter code template (optional)"
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-900 text-green-400 font-mono text-xs rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Proctoring Rules */}
          <section className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Proctoring Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["require_webcam", "Require Webcam"],
                ["require_screen_sharing", "Require Screen Sharing"],
                ["require_microphone", "Require Microphone"],
                ["allow_tab_switching", "Allow Tab Switching"],
                ["allow_copy_paste", "Allow Copy-Paste"],
                ["auto_submit_on_violation", "Auto-Submit on Max Violations"],
                ["notify_on_flag", "Notify on Flag"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl cursor-pointer">
                  <span className="text-sm text-slate-300">{label}</span>
                  <input
                    type="checkbox"
                    checked={form.proctoring_rules[key]}
                    onChange={(e) => setField(["proctoring_rules", key], e.target.checked)}
                    className="accent-purple-500 w-4 h-4"
                  />
                </label>
              ))}
              <div className="p-3 bg-slate-700/50 rounded-xl">
                <label className="text-sm text-slate-300 block mb-1">Max Violations Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.proctoring_rules.max_violations_allowed}
                  onChange={(e) => setField(["proctoring_rules", "max_violations_allowed"], Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">AI Detection Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ["face_detection_enabled", "Face Detection"],
                ["multiple_faces_detection", "Multiple Faces Detection"],
                ["object_detection_enabled", "Object Detection (Phone, Books)"],
                ["eye_tracking_enabled", "Eye Tracking"],
                ["audio_monitoring_enabled", "Audio Monitoring"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl cursor-pointer">
                  <span className="text-sm text-slate-300">{label}</span>
                  <input
                    type="checkbox"
                    checked={form.ai_settings[key]}
                    onChange={(e) => setField(["ai_settings", key], e.target.checked)}
                    className="accent-purple-500 w-4 h-4"
                  />
                </label>
              ))}
              <div className="p-3 bg-slate-700/50 rounded-xl">
                <label className="text-sm text-slate-300 block mb-1">Sensitivity Level</label>
                <select
                  value={form.ai_settings.sensitivity_level}
                  onChange={(e) => setField(["ai_settings", "sensitivity_level"], e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition disabled:opacity-40"
            >
              <FiSave className="w-4 h-4" /> Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition disabled:opacity-40"
            >
              {saving ? "Publishing…" : "Publish Test"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
