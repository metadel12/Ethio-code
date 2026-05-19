import React from "react";
import {
  FiAperture,
  FiEdit3,
  FiEye,
  FiGrid,
  FiImage,
  FiLayers,
} from "react-icons/fi";
import CreativePracticePage from "../components/interview/CreativePracticePage";

const fallbackAnswers = {
  design_principles:
    "Explain the visual principle, why it matters, how it guides hierarchy and comprehension, and include a real design example.",
  branding:
    "Connect brand goals to audience, positioning, typography, color, logo usage, consistency, and practical delivery assets.",
  ui_ux:
    "Discuss user needs, flows, wireframes, interaction states, accessibility, feedback loops, usability testing, and iteration.",
  tools:
    "Explain the tool workflow, collaboration model, asset handoff, versioning, constraints, and how you keep files organized.",
  color_typography:
    "Cover contrast, hierarchy, readability, emotion, accessibility, spacing, font pairing, and how choices support the message.",
  portfolio:
    "Describe the project context, your role, process, constraints, iterations, measurable outcome, and what you would improve.",
};

const rawQuestions = [
  ["design_principles", "Visual hierarchy", "How do you create visual hierarchy in a poster, landing page, or app screen?", "beginner", ["hierarchy", "layout", "contrast"]],
  ["design_principles", "Whitespace", "Why is whitespace important in graphic and UI design?", "beginner", ["whitespace", "composition", "clarity"]],
  ["design_principles", "Balance", "Explain symmetrical and asymmetrical balance with examples.", "intermediate", ["balance", "composition", "layout"]],
  ["design_principles", "Gestalt principles", "How do Gestalt principles help users understand a design quickly?", "intermediate", ["gestalt", "proximity", "similarity"]],
  ["design_principles", "Critique a design", "How would you critique a design without making it personal?", "intermediate", ["critique", "feedback", "process"]],
  ["design_principles", "Design constraints", "How do constraints improve creative work?", "advanced", ["constraints", "creative-direction", "tradeoffs"]],

  ["branding", "Logo design process", "Walk through your process for designing a logo for a new business.", "intermediate", ["logo", "brand", "process"]],
  ["branding", "Brand consistency", "How do you keep a brand consistent across web, social, print, and product?", "intermediate", ["brand-system", "guidelines", "consistency"]],
  ["branding", "Brand personality", "How do color, type, shape, and imagery communicate brand personality?", "beginner", ["personality", "color", "type"]],
  ["branding", "Rebrand risk", "What risks should a designer consider before changing an established brand identity?", "advanced", ["rebrand", "risk", "audience"]],
  ["branding", "Design guidelines", "What should be included in a practical brand guideline document?", "intermediate", ["guidelines", "assets", "usage"]],
  ["branding", "Local audience", "How would you adapt a brand campaign for an Ethiopian audience without stereotyping?", "advanced", ["audience", "culture", "campaign"]],

  ["ui_ux", "UI vs UX", "Explain the difference between UI and UX using a real product example.", "beginner", ["ui", "ux", "product"]],
  ["ui_ux", "User flow", "How would you design a user flow for signup and onboarding?", "intermediate", ["flow", "onboarding", "friction"]],
  ["ui_ux", "Empty states", "What makes a good empty state in an app?", "beginner", ["empty-state", "copy", "action"]],
  ["ui_ux", "Accessibility in design", "How do you design accessible interfaces before development starts?", "intermediate", ["accessibility", "contrast", "focus"]],
  ["ui_ux", "Usability testing", "How would you run a quick usability test with limited time and budget?", "advanced", ["testing", "users", "iteration"]],
  ["ui_ux", "Design systems", "What is a design system, and when does a team actually need one?", "advanced", ["design-system", "components", "tokens"]],

  ["tools", "Figma collaboration", "How would you organize a Figma file for collaboration with developers?", "intermediate", ["figma", "handoff", "components"]],
  ["tools", "Photoshop vs Illustrator", "When would you choose Photoshop, Illustrator, or Figma?", "beginner", ["photoshop", "illustrator", "figma"]],
  ["tools", "Asset export", "How do you export assets for web and mobile without quality or size problems?", "intermediate", ["export", "assets", "optimization"]],
  ["tools", "Version control", "How do you manage versions and feedback across design iterations?", "intermediate", ["versions", "feedback", "workflow"]],
  ["tools", "Developer handoff", "What information should developers receive from a design handoff?", "advanced", ["handoff", "specs", "tokens"]],
  ["tools", "AI design tools", "How would you use AI tools responsibly in a professional design workflow?", "advanced", ["ai", "ethics", "workflow"]],

  ["color_typography", "Color palette", "How do you create an effective color palette for a product or campaign?", "beginner", ["palette", "brand", "contrast"]],
  ["color_typography", "RGB vs CMYK", "Explain RGB, CMYK, and when each color model matters.", "beginner", ["rgb", "cmyk", "print"]],
  ["color_typography", "Typography hierarchy", "How do you create typographic hierarchy in a dense page?", "intermediate", ["typography", "hierarchy", "readability"]],
  ["color_typography", "Font pairing", "How do you choose fonts that pair well together?", "intermediate", ["fonts", "pairing", "tone"]],
  ["color_typography", "Color accessibility", "How do you ensure color choices are accessible?", "intermediate", ["contrast", "wcag", "accessibility"]],
  ["color_typography", "Expressive type", "When is expressive typography useful, and when does it hurt usability?", "advanced", ["expressive-type", "usability", "brand"]],

  ["portfolio", "Portfolio story", "How do you present a portfolio project in an interview?", "beginner", ["portfolio", "story", "role"]],
  ["portfolio", "Case study structure", "What should a strong design case study include?", "intermediate", ["case-study", "process", "outcome"]],
  ["portfolio", "Failed concept", "Tell me about a design concept that did not work and what you learned.", "intermediate", ["failure", "iteration", "learning"]],
  ["portfolio", "Measuring design", "How can you measure whether a design improved the product?", "advanced", ["metrics", "outcome", "testing"]],
  ["portfolio", "Defending decisions", "How do you defend a design decision when stakeholders disagree?", "advanced", ["stakeholders", "tradeoffs", "communication"]],
  ["portfolio", "No professional experience", "How should a junior designer build a portfolio without client work?", "beginner", ["junior", "portfolio", "practice"]],
];

const questions = rawQuestions.map(([category, title, question_text, difficulty, tags], index) => ({
  _id: `graphics-${category}-${index + 1}`,
  title,
  category,
  difficulty,
  question_text,
  answer_text: fallbackAnswers[category],
  time_limit_seconds: difficulty === "advanced" ? 900 : difficulty === "intermediate" ? 720 : 480,
  points: difficulty === "advanced" ? 30 : difficulty === "intermediate" ? 20 : 15,
  success_rate: difficulty === "advanced" ? 0.46 : difficulty === "intermediate" ? 0.64 : 0.8,
  tags,
}));

const config = {
  storageKey: "ethiocode_graphics_interview_attempts",
  title: "Graphics Design Interview Preparation",
  subtitle: "Practice design thinking, UI/UX, branding, typography, tools, and portfolio presentation.",
  kicker: "Design principles, branding, UI/UX, tools, portfolio",
  background: "from-slate-950 via-slate-900 to-zinc-900",
  titleGradient: "from-pink-300 to-emerald-300",
  accent: {
    text: "text-pink-300",
    badge: "bg-pink-400/10 text-pink-200",
    button: "bg-pink-500 text-white",
    focus: "focus:border-pink-400",
  },
  fallbackAnswers,
  questions,
  categories: [
    { id: "design_principles", name: "Principles", icon: <FiGrid />, color: "from-pink-500 to-rose-600" },
    { id: "branding", name: "Branding", icon: <FiAperture />, color: "from-violet-500 to-purple-600" },
    { id: "ui_ux", name: "UI/UX", icon: <FiLayers />, color: "from-cyan-500 to-blue-600" },
    { id: "tools", name: "Tools", icon: <FiEdit3 />, color: "from-emerald-500 to-teal-600" },
    { id: "color_typography", name: "Color & Type", icon: <FiEye />, color: "from-orange-500 to-red-600" },
    { id: "portfolio", name: "Portfolio", icon: <FiImage />, color: "from-yellow-500 to-amber-600" },
  ],
};

const GraphicsInterviewPage = () => <CreativePracticePage config={config} />;

export default GraphicsInterviewPage;
