import { useMemo, useState } from "react";
import { FaExternalLinkAlt, FaRegStar, FaStar } from "react-icons/fa";

const technologies = [
  ["JavaScript", "Languages", "Beginner", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "https://youtube.com/@freecodecamp", "https://youtube.com/@JomacsIT", "https://freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8", "https://leetcode.com"],
  ["TypeScript", "Languages", "Intermediate", "https://www.typescriptlang.org/docs/", "https://youtube.com/@academind", "https://youtube.com/results?search_query=typescript+amharic", "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html", "https://typehero.dev"],
  ["Python", "Languages", "Beginner", "https://docs.python.org/3/", "https://youtube.com/@programmingwithmosh", "https://youtube.com/@JomacsIT", "https://freecodecamp.org/learn/scientific-computing-with-python", "https://hackerrank.com/domains/python"],
  ["Java", "Languages", "Beginner", "https://docs.oracle.com/en/java/", "https://youtube.com/@Telusko", "https://youtube.com/results?search_query=java+programming+amharic", "https://freecodecamp.org/news/learn-java-free-java-courses-for-beginners/", "https://codingbat.com/java"],
  ["Go", "Languages", "Intermediate", "https://go.dev/doc/", "https://youtube.com/@freecodecamp", "", "https://go.dev/tour/", "https://exercism.org/tracks/go"],
  ["React", "Frontend", "Beginner", "https://react.dev/learn", "https://youtube.com/@TraversyMedia", "https://youtube.com/@JomacsIT", "https://scrimba.com/learn/learnreact", "https://frontendmentor.io"],
  ["Vue.js", "Frontend", "Beginner", "https://vuejs.org/guide/introduction.html", "https://youtube.com/@NetNinja", "", "https://www.vuemastery.com/courses/intro-to-vue-3/intro-to-vue3/", "https://vueschool.io"],
  ["Angular", "Frontend", "Intermediate", "https://angular.dev", "https://youtube.com/@AngularUniversity", "", "https://angular.dev/tutorials", "https://frontendmentor.io"],
  ["Next.js", "Frontend", "Intermediate", "https://nextjs.org/docs", "https://youtube.com/@javascriptmastery", "", "https://nextjs.org/learn", "https://vercel.com/templates"],
  ["Node.js", "Frontend", "Intermediate", "https://nodejs.org/en/docs", "https://youtube.com/@TraversyMedia", "https://youtube.com/results?search_query=node.js+amharic", "https://nodeschool.io", "https://exercism.org/tracks/javascript"],
  ["FastAPI", "Backend", "Intermediate", "https://fastapi.tiangolo.com", "https://youtube.com/@freecodecamp", "", "https://fastapi.tiangolo.com/tutorial/", "https://github.com/tiangolo/full-stack-fastapi-template"],
  ["MongoDB", "Databases", "Beginner", "https://www.mongodb.com/docs/", "https://youtube.com/@MongoDB", "", "https://learn.mongodb.com", "https://learn.mongodb.com"],
  ["PostgreSQL", "Databases", "Beginner", "https://www.postgresql.org/docs/", "https://youtube.com/@freecodecamp", "", "https://www.postgresqltutorial.com", "https://pgexercises.com"],
  ["Redis", "Databases", "Intermediate", "https://redis.io/docs/latest/", "https://youtube.com/results?search_query=redis+freecodecamp", "", "https://university.redis.com", "https://university.redis.com"],
  ["Docker", "DevOps", "Beginner", "https://docs.docker.com", "https://youtube.com/@TechWorldwithNana", "", "https://docs.docker.com/get-started/", "https://labs.play-with-docker.com"],
  ["Kubernetes", "DevOps", "Advanced", "https://kubernetes.io/docs/", "https://youtube.com/@TechWorldwithNana", "", "https://kubernetes.io/training/", "https://killercoda.com/kubernetes"],
  ["AWS", "DevOps", "Beginner", "https://docs.aws.amazon.com", "https://youtube.com/@AWSTutorialsOnline", "", "https://skillbuilder.aws", "https://aws.amazon.com/free"],
  ["Azure", "DevOps", "Beginner", "https://learn.microsoft.com/en-us/azure/", "https://learn.microsoft.com/en-us/shows/", "", "https://learn.microsoft.com/en-us/training/azure/", "https://azure.microsoft.com/free"],
  ["GCP", "DevOps", "Intermediate", "https://cloud.google.com/docs", "https://youtube.com/@googlecloudtech", "", "https://www.cloudskillsboost.google", "https://www.cloudskillsboost.google"],
  ["GitHub Actions", "DevOps", "Intermediate", "https://docs.github.com/actions", "https://youtube.com/@GitHub", "", "https://skills.github.com", "https://github.com/marketplace?type=actions"],
  ["HTML5", "Web", "Beginner", "https://developer.mozilla.org/en-US/docs/Web/HTML", "https://youtube.com/@freecodecamp", "https://youtube.com/results?search_query=html+amharic", "https://freecodecamp.org/learn/2022/responsive-web-design/", "https://www.w3schools.com/html/"],
  ["CSS3", "Web", "Beginner", "https://developer.mozilla.org/en-US/docs/Web/CSS", "https://youtube.com/@freecodecamp", "https://youtube.com/results?search_query=css+amharic", "https://freecodecamp.org/learn/2022/responsive-web-design/", "https://cssbattle.dev"],
  ["Tailwind CSS", "Web", "Beginner", "https://tailwindcss.com/docs", "https://youtube.com/@NetNinja", "", "https://tailwindcss.com/docs/installation", "https://play.tailwindcss.com"],
  ["SCSS/SASS", "Web", "Intermediate", "https://sass-lang.com/documentation/", "https://youtube.com/@freecodecamp", "", "https://sass-lang.com/guide/", "https://sass-lang.com/guide/"],
  ["Figma", "Design", "Beginner", "https://help.figma.com", "https://youtube.com/@DesignCourse", "", "https://help.figma.com/hc/en-us/categories/360002042553", "https://www.figma.com/community"],
].map(([name, category, difficulty, docs, youtube, amharic, course, practice]) => ({
  name,
  category,
  difficulty,
  links: { Docs: docs, YouTube: youtube, Amharic: amharic, Course: course, Practice: practice },
}));

const categories = ["All", "Languages", "Frontend", "Backend", "Databases", "DevOps", "Web", "Design"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

function LinkButton({ label, href }) {
  if (!href) return null;

  return (
    <a
      className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-emerald-300"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <FaExternalLinkAlt className="h-2.5 w-2.5" />
    </a>
  );
}

export default function TechnologiesSection() {
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [selected, setSelected] = useState("JavaScript");
  const [saved, setSaved] = useState(() => new Set());
  const [learning, setLearning] = useState(() => new Set());

  const filtered = useMemo(
    () =>
      technologies.filter((tech) => {
        const categoryMatch = category === "All" || tech.category === category;
        const difficultyMatch = difficulty === "All" || tech.difficulty === difficulty;
        return categoryMatch && difficultyMatch;
      }),
    [category, difficulty]
  );

  const selectedTech = technologies.find((tech) => tech.name === selected) || filtered[0] || technologies[0];

  const toggleSet = (setter, name) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <section className="bg-slate-50 py-6 transition-colors duration-300 dark:bg-slate-800/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            Technologies You'll Master
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
            Pick a technology to access docs, videos, Amharic resources, courses, and practice links.
          </p>
        </div>

        <div className="mb-3 flex flex-wrap justify-center gap-1.5">
          {categories.map((item) => (
            <button
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                category === item
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {difficulties.map((item) => (
            <button
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                difficulty === item
                  ? "border-emerald-500 text-emerald-700 dark:text-emerald-300"
                  : "border-slate-200 text-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400"
              }`}
              key={item}
              onClick={() => setDifficulty(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-1.5">
          {filtered.map((tech) => {
            const active = selectedTech.name === tech.name;
            return (
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                }`}
                key={tech.name}
                onClick={() => setSelected(tech.name)}
                type="button"
              >
                {tech.name}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTech.name}</h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {selectedTech.category}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {selectedTech.difficulty}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Direct learning links open in a new tab.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 hover:text-amber-500 dark:ring-slate-700"
                onClick={() => toggleSet(setSaved, selectedTech.name)}
                type="button"
              >
                {saved.has(selectedTech.name) ? <FaStar className="inline h-3.5 w-3.5 text-amber-500" /> : <FaRegStar className="inline h-3.5 w-3.5" />} Save
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  learning.has(selectedTech.name)
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
                onClick={() => toggleSet(setLearning, selectedTech.name)}
                type="button"
              >
                {learning.has(selectedTech.name) ? "Learning" : "Mark Learning"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(selectedTech.links).map(([label, href]) => (
              <LinkButton href={href} key={label} label={label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
