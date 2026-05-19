import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiCopy,
  FiLink,
  FiPlus,
  FiShield,
  FiUsers,
  FiVideo,
  FiWifi,
} from "react-icons/fi";
import DeviceTestPanel from "../components/video/DeviceTestPanel";
import { getVideoUser, saveVideoUser, videoChatService } from "../services/videoChatService";

const defaultSettings = {
  title: "EthioCode Interview Call",
  type: "interview",
  max_participants: 50,
  recording_enabled: false,
  waiting_room_enabled: false,
  mute_on_join: false,
  video_off_on_join: false,
};

const VideoChatPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const existingUser = getVideoUser();
  const [form, setForm] = useState({
    user_name: existingUser.user_name,
    user_email: existingUser.user_email,
    ...defaultSettings,
  });
  const [joinId, setJoinId] = useState(sessionId || "");
  const [createdLink, setCreatedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createSession = async () => {
    setLoading(true);
    setError("");
    try {
      const user = saveVideoUser(form);
      const result = await videoChatService.createSession({ ...form, ...user });
      const link = `${window.location.origin}/video-chat/join/${result.session_id}`;
      setCreatedLink(link);
      setJoinId(result.session_id);
    } catch (err) {
      setError(err.message || "Could not create session");
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async () => {
    if (!joinId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const user = saveVideoUser(form);
      await videoChatService.joinSession(joinId.trim(), user);
      navigate(`/video-chat/join/${joinId.trim()}/call`);
    } catch (err) {
      setError(err.message || "Could not join session");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (createdLink) await navigator.clipboard.writeText(createdLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8 text-white">
      <main className="mx-auto max-w-7xl">
        <section className="mb-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-400/10 px-4 py-2 text-sm font-medium text-purple-200">
              <FiShield />
              WebRTC secure media, adaptive controls, no download
            </div>
            <h1 className="max-w-4xl bg-gradient-to-r from-purple-300 to-emerald-300 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              EthioCode Real-Time Video & Audio Chat
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-slate-300">
              Create interview rooms, join with one click, test devices, share screen, chat in real time,
              and run calls across desktop, tablet, and mobile browsers.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                [<FiVideo />, "Video/audio calls"],
                [<FiUsers />, "Group rooms"],
                [<FiWifi />, "Poor-network controls"],
                [<FiCalendar />, "Interview ready"],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-lg bg-slate-800/70 p-4">
                  <div className="mb-2 text-2xl text-emerald-300">{icon}</div>
                  <div className="text-sm text-slate-200">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-5 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold">Start or Join a Call</h2>
            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Your name</span>
                <input value={form.user_name} onChange={(event) => update("user_name", event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Email</span>
                <input value={form.user_email} onChange={(event) => update("user_email", event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-300">Meeting title</span>
                <input value={form.title} onChange={(event) => update("title", event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Type</span>
                  <select value={form.type} onChange={(event) => update("type", event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400">
                    <option value="interview">Interview</option>
                    <option value="one-on-one">One-on-one</option>
                    <option value="group">Group</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Max participants</span>
                  <input type="number" min="2" max="50" value={form.max_participants} onChange={(event) => update("max_participants", Number(event.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400" />
                </label>
              </div>

              <div className="grid gap-2 rounded-lg bg-slate-800/70 p-3 text-sm text-slate-200">
                {[
                  ["recording_enabled", "Enable recording controls"],
                  ["waiting_room_enabled", "Waiting room"],
                  ["mute_on_join", "Mute participants on join"],
                  ["video_off_on_join", "Video off on join"],
                ].map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2">
                    <input type="checkbox" checked={form[field]} onChange={(event) => update(field, event.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>

              <button onClick={createSession} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-50">
                <FiPlus />
                {loading ? "Working..." : "Create Meeting"}
              </button>

              {createdLink && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3">
                  <div className="mb-2 text-sm text-emerald-100">Meeting ready</div>
                  <div className="flex gap-2">
                    <input readOnly value={createdLink} className="min-w-0 flex-1 rounded bg-slate-950 px-3 py-2 text-sm text-slate-200" />
                    <button onClick={copyLink} className="rounded bg-slate-700 px-3 hover:bg-slate-600" aria-label="Copy meeting link">
                      <FiCopy />
                    </button>
                  </div>
                  <button onClick={joinSession} className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500">
                    Join Now
                  </button>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Join with room ID</span>
                  <div className="flex gap-2">
                    <input value={joinId} onChange={(event) => setJoinId(event.target.value)} placeholder="e.g. ab12cd34" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-purple-400" />
                    <button onClick={joinSession} disabled={loading || !joinId.trim()} className="rounded-lg bg-slate-700 px-4 font-semibold hover:bg-slate-600 disabled:opacity-50">
                      <FiLink />
                    </button>
                  </div>
                </label>
              </div>
              {error && <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-xl font-semibold">Pre-call Device Test</h2>
          <DeviceTestPanel />
        </section>
      </main>
    </div>
  );
};

export default VideoChatPage;
