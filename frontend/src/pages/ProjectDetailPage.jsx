import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as projectsService from "../services/projectsService";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectsService.getProject(id);
      setProject(data.project);
      setComments(data.comments ?? []);
      setSimilar(data.similar_projects ?? []);
      setLikesCount(data.project.likes ?? 0);
    } catch (e) {
      showToast("Project not found");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { showToast("Login to like projects"); return; }
    try {
      const res = await projectsService.likeProject(id);
      setLiked(res.liked);
      setLikesCount(c => res.liked ? c + 1 : c - 1);
      showToast(res.liked ? "❤️ Liked!" : "Unliked");
    } catch (e) { showToast(e.message); }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { showToast("Login to save projects"); return; }
    try {
      const res = await projectsService.saveProject(id);
      setSaved(res.saved);
      showToast(res.saved ? "🔖 Saved!" : "Removed from saved");
    } catch (e) { showToast(e.message); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { showToast("Login to comment"); return; }
    if (!commentText.trim()) return;
    setCommenting(true);
    try {
      const newComment = await projectsService.addComment(id, commentText.trim());
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      showToast("💬 Comment posted!");
    } catch (e) { showToast(e.message); }
    finally { setCommenting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading project...</p>
      </div>
    </div>
  );

  if (!project) return null;

  const DIFF_COLORS = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-blue-100 text-blue-700",
    advanced: "bg-orange-100 text-orange-700",
    expert: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/projects" className="text-sm text-slate-500 hover:text-purple-600">← Back to Projects</Link>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Featured image */}
            {project.featured_image && (
              <img src={project.featured_image} alt={project.title}
                className="w-full h-64 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                onError={e => e.target.style.display = "none"} />
            )}

            {/* Title & meta */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[project.difficulty_level] ?? "bg-slate-100 text-slate-600"}`}>
                  {project.difficulty_level}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full capitalize">
                  {project.project_type?.replace(/-/g, " ")}
                </span>
                <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                  {project.category?.replace(/-/g, " ")}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{project.title}</h1>
              <p className="text-sm text-slate-500 mb-4">by {project.creator_name}</p>

              {/* Like / Save / Share */}
              <div className="flex gap-3">
                <button onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${liked ? "bg-red-500 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200"}`}>
                  {liked ? "❤️" : "🤍"} {likesCount} Likes
                </button>
                <button onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${saved ? "bg-purple-600 text-white" : "border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600"}`}>
                  {saved ? "🔖 Saved" : "🔖 Save"}
                </button>
                <div className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500">
                  👁 {project.views ?? 0} views
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">About this project</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
              </div>
            )}

            {/* Key features */}
            {project.key_features?.filter(Boolean).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">✨ Key Features</h2>
                <ul className="space-y-2">
                  {project.key_features.filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-emerald-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {project.challenges_faced?.filter(Boolean).length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">🧩 Challenges Faced</h2>
                <ul className="space-y-2">
                  {project.challenges_faced.filter(Boolean).map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-orange-400 mt-0.5">→</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">💬 Comments ({comments.length})</h2>

              {/* Comment form */}
              {isAuthenticated ? (
                <form onSubmit={handleComment} className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600 shrink-0">
                      {user?.full_name?.[0] ?? "U"}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button type="submit" disabled={commenting || !commentText.trim()}
                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                        {commenting ? "Posting…" : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center">
                  <p className="text-sm text-slate-500 mb-2">Login to like and comment</p>
                  <Link to="/login" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700">Sign In</Link>
                </div>
              )}

              {/* Comments list */}
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c, i) => (
                    <div key={c.id ?? i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                        {c.user_name?.[0] ?? "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.user_name ?? "User"}</span>
                          <span className="text-xs text-slate-400">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Links */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">🔗 Links</h3>
              <div className="space-y-2">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
                    GitHub Repository →
                  </a>
                )}
                {project.live_demo_url && (
                  <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    Live Demo →
                  </a>
                )}
                {project.documentation_url && (
                  <a href={project.documentation_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Documentation →
                  </a>
                )}
              </div>
            </div>

            {/* Tech stack */}
            {project.tech_stack?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">🛠 Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map(t => (
                    <span key={t} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {project.team_members?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">👥 Team</h3>
                <div className="space-y-3">
                  {project.team_members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
                        {m.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-xs text-slate-500">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar projects */}
            {similar.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">🔍 Similar Projects</h3>
                <div className="space-y-3">
                  {similar.map(s => (
                    <Link key={s.id} to={`/projects/${s.id}`}
                      className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                        {s.featured_image
                          ? <img src={s.featured_image} alt={s.title} className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
                          : <div className="w-full h-full flex items-center justify-center text-lg">💻</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.title}</p>
                        <p className="text-xs text-slate-500">by {s.creator_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
