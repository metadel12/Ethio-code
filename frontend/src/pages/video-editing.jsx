import React from "react";
import {
  FiClock,
  FiFilm,
  FiHeadphones,
  FiLayers,
  FiMonitor,
  FiScissors,
  FiSliders,
} from "react-icons/fi";
import CreativePracticePage from "../components/interview/CreativePracticePage";

const fallbackAnswers = {
  editing_fundamentals:
    "Explain the editing principle, pacing, continuity, story purpose, audience impact, and include a practical timeline example.",
  storytelling:
    "Connect the edit to narrative structure, emotional arc, hooks, sequencing, rhythm, and what the viewer should understand or feel.",
  audio:
    "Discuss dialogue clarity, levels, noise cleanup, music choice, sound effects, mixing, loudness targets, and export considerations.",
  motion_graphics:
    "Explain motion purpose, keyframes, easing, readability, visual hierarchy, brand consistency, and how animation supports the message.",
  color_export:
    "Cover correction, grading, consistency, scopes, delivery platform, codec, resolution, bitrate, captions, and quality checks.",
  workflow_client:
    "Describe file organization, proxies, revisions, feedback handling, deadlines, backups, client communication, and final delivery.",
};

const rawQuestions = [
  ["editing_fundamentals", "Cutting for rhythm", "How do you decide where to cut a clip for natural rhythm?", "beginner", ["cuts", "rhythm", "timeline"]],
  ["editing_fundamentals", "Continuity editing", "What is continuity editing, and how do you avoid confusing the viewer?", "intermediate", ["continuity", "sequence", "viewer"]],
  ["editing_fundamentals", "J-cuts and L-cuts", "When would you use a J-cut or L-cut?", "beginner", ["j-cut", "l-cut", "audio"]],
  ["editing_fundamentals", "B-roll selection", "How do you choose B-roll that strengthens the main story?", "intermediate", ["b-roll", "story", "coverage"]],
  ["editing_fundamentals", "Pacing a short ad", "How would you pace a 30-second social media ad?", "advanced", ["pacing", "ad", "social"]],
  ["editing_fundamentals", "Fixing weak footage", "What can an editor do when the footage is limited or poorly shot?", "advanced", ["problem-solving", "coverage", "structure"]],

  ["storytelling", "Strong opening hook", "What makes a strong first five seconds in a video?", "beginner", ["hook", "retention", "opening"]],
  ["storytelling", "Interview edit", "How would you turn a long interview into a clear three-minute story?", "intermediate", ["interview", "story", "structure"]],
  ["storytelling", "Emotional arc", "How do you create an emotional arc through editing?", "advanced", ["emotion", "arc", "music"]],
  ["storytelling", "Explainer video", "How would you structure an explainer video for a new app?", "intermediate", ["explainer", "structure", "clarity"]],
  ["storytelling", "Viewer retention", "How do you edit to keep viewers watching without making the video feel chaotic?", "advanced", ["retention", "pacing", "clarity"]],
  ["storytelling", "Script vs footage", "What do you do when the available footage does not match the script?", "intermediate", ["script", "footage", "adaptation"]],

  ["audio", "Clean dialogue", "How do you make dialogue sound clean and consistent?", "beginner", ["dialogue", "noise", "levels"]],
  ["audio", "Music selection", "How do you choose music that supports the edit without overpowering it?", "intermediate", ["music", "emotion", "mix"]],
  ["audio", "Sound effects", "When should you add sound effects to a video edit?", "beginner", ["sound-effects", "impact", "timing"]],
  ["audio", "Audio ducking", "What is audio ducking, and when is it useful?", "intermediate", ["ducking", "voiceover", "music"]],
  ["audio", "Loudness", "How do you prepare audio levels for YouTube or social delivery?", "advanced", ["loudness", "export", "platform"]],
  ["audio", "Bad location audio", "How would you rescue noisy location audio?", "advanced", ["noise-reduction", "eq", "repair"]],

  ["motion_graphics", "Lower thirds", "How do you design lower thirds that are readable and on-brand?", "beginner", ["lower-thirds", "branding", "readability"]],
  ["motion_graphics", "Keyframes and easing", "Explain keyframes and easing in motion graphics.", "beginner", ["keyframes", "easing", "animation"]],
  ["motion_graphics", "Title sequence", "How would you create a title sequence for a tech company video?", "intermediate", ["titles", "brand", "motion"]],
  ["motion_graphics", "Kinetic typography", "When does kinetic typography improve a video?", "intermediate", ["typography", "motion", "clarity"]],
  ["motion_graphics", "Template editing", "How do you customize a motion template without making it look generic?", "advanced", ["templates", "customization", "brand"]],
  ["motion_graphics", "Animation restraint", "How do you know when motion graphics are distracting?", "advanced", ["restraint", "focus", "hierarchy"]],

  ["color_export", "Color correction vs grading", "What is the difference between color correction and color grading?", "beginner", ["correction", "grading", "color"]],
  ["color_export", "Matching shots", "How do you match color across shots from different cameras?", "intermediate", ["matching", "scopes", "cameras"]],
  ["color_export", "Export settings", "What export settings would you choose for YouTube, Instagram, and client review?", "intermediate", ["export", "codec", "bitrate"]],
  ["color_export", "Captions", "Why are captions important, and how do you prepare them?", "beginner", ["captions", "accessibility", "delivery"]],
  ["color_export", "Quality control", "What do you check before sending a final video to a client?", "advanced", ["qc", "delivery", "review"]],
  ["color_export", "HDR and SDR", "What delivery problems can happen when working with HDR and SDR footage?", "advanced", ["hdr", "sdr", "color-management"]],

  ["workflow_client", "Organizing project files", "How do you organize footage, audio, graphics, and project files?", "beginner", ["organization", "folders", "assets"]],
  ["workflow_client", "Proxy workflow", "What is a proxy workflow, and when do you need it?", "intermediate", ["proxies", "performance", "workflow"]],
  ["workflow_client", "Client feedback", "How do you handle conflicting feedback from multiple stakeholders?", "advanced", ["feedback", "stakeholders", "communication"]],
  ["workflow_client", "Revision rounds", "How do you keep revisions controlled and clear?", "intermediate", ["revisions", "versions", "client"]],
  ["workflow_client", "Deadline pressure", "A client needs a same-day edit. How do you scope and deliver responsibly?", "advanced", ["deadline", "scope", "delivery"]],
  ["workflow_client", "Backup strategy", "How do you protect a video project from data loss?", "intermediate", ["backup", "storage", "risk"]],
];

const questions = rawQuestions.map(([category, title, question_text, difficulty, tags], index) => ({
  _id: `video-${category}-${index + 1}`,
  title,
  category,
  difficulty,
  question_text,
  answer_text: fallbackAnswers[category],
  time_limit_seconds: difficulty === "advanced" ? 900 : difficulty === "intermediate" ? 720 : 480,
  points: difficulty === "advanced" ? 30 : difficulty === "intermediate" ? 20 : 15,
  success_rate: difficulty === "advanced" ? 0.44 : difficulty === "intermediate" ? 0.61 : 0.79,
  tags,
}));

const config = {
  storageKey: "ethiocode_video_editing_interview_attempts",
  title: "Video Editing Interview Preparation",
  subtitle: "Practice editing craft, storytelling, audio, motion graphics, color, export, and client workflow.",
  kicker: "Editing, storytelling, audio, motion, color, workflow",
  background: "from-slate-950 via-zinc-950 to-slate-900",
  titleGradient: "from-orange-300 to-cyan-300",
  accent: {
    text: "text-orange-300",
    badge: "bg-orange-400/10 text-orange-200",
    button: "bg-orange-500 text-white",
    focus: "focus:border-orange-400",
  },
  fallbackAnswers,
  questions,
  categories: [
    { id: "editing_fundamentals", name: "Editing", icon: <FiScissors />, color: "from-orange-500 to-red-600" },
    { id: "storytelling", name: "Story", icon: <FiFilm />, color: "from-cyan-500 to-blue-600" },
    { id: "audio", name: "Audio", icon: <FiHeadphones />, color: "from-emerald-500 to-teal-600" },
    { id: "motion_graphics", name: "Motion", icon: <FiLayers />, color: "from-violet-500 to-purple-600" },
    { id: "color_export", name: "Color & Export", icon: <FiSliders />, color: "from-yellow-500 to-amber-600" },
    { id: "workflow_client", name: "Workflow", icon: <FiClock />, color: "from-slate-500 to-gray-700" },
  ],
};

const VideoEditingPage = () => <CreativePracticePage config={config} />;

export default VideoEditingPage;
