import {
  LineChart as ReLineChart, Line,
  BarChart as ReBarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  RadarChart as ReRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap as ReTreemap,
  Sankey, Layer, Rectangle,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ── Shared palette ────────────────────────────────────────────
const COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16"];

const tooltipStyle = {
  contentStyle: {
    background: "var(--tw-bg, #1e293b)",
    border: "1px solid #334155",
    borderRadius: 12,
    fontSize: 12,
    color: "#e2e8f0",
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

function ChartWrap({ title, subtitle, children, height = 220 }) {
  return (
    <div className="w-full">
      {title && (
        <div className="mb-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. LINE CHART  — XP / progress over time
// ─────────────────────────────────────────────────────────────
export function LineChart({ data = [], title, subtitle, dataKey = "value", xKey = "date", color = COLORS[0] }) {
  const sample = data.length ? data : [
    { date: "Mon", value: 120 }, { date: "Tue", value: 180 },
    { date: "Wed", value: 150 }, { date: "Thu", value: 220 },
    { date: "Fri", value: 190 }, { date: "Sat", value: 280 },
    { date: "Sun", value: 310 },
  ];
  return (
    <ChartWrap title={title} subtitle={subtitle}>
      <ReLineChart data={sample} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Line
          type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color }}
        />
      </ReLineChart>
    </ChartWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. BAR CHART  — challenges / activity stats
// ─────────────────────────────────────────────────────────────
export function BarChart({ data = [], title, subtitle, dataKey = "value", xKey = "name", color = COLORS[1] }) {
  const sample = data.length ? data : [
    { name: "Mon", value: 4 }, { name: "Tue", value: 7 },
    { name: "Wed", value: 3 }, { name: "Thu", value: 9 },
    { name: "Fri", value: 6 }, { name: "Sat", value: 11 },
    { name: "Sun", value: 8 },
  ];
  return (
    <ChartWrap title={title} subtitle={subtitle}>
      <ReBarChart data={sample} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.4} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={32}>
          {sample.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ChartWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PIE CHART  — time distribution / category breakdown
// ─────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function PieChart({ data = [], title, subtitle }) {
  const sample = data.length ? data : [
    { name: "Learning", value: 40 }, { name: "Challenges", value: 25 },
    { name: "Projects", value: 20 }, { name: "Community", value: 15 },
  ];
  return (
    <ChartWrap title={title} subtitle={subtitle} height={200}>
      <RePieChart>
        <Pie
          data={sample} cx="50%" cy="50%" outerRadius={80} innerRadius={40}
          dataKey="value" labelLine={false} label={PieLabel}
        >
          {sample.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
      </RePieChart>
    </ChartWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. RADAR CHART  — skill proficiency
// ─────────────────────────────────────────────────────────────
export function RadarChart({ data = [], title, subtitle }) {
  const sample = data.length ? data : [
    { skill: "Python",     level: 80 }, { skill: "React",      level: 70 },
    { skill: "SQL",        level: 65 }, { skill: "Docker",     level: 55 },
    { skill: "AWS",        level: 50 }, { skill: "TypeScript", level: 75 },
  ];
  return (
    <ChartWrap title={title} subtitle={subtitle} height={220}>
      <ReRadarChart cx="50%" cy="50%" outerRadius={80} data={sample}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#64748b" }} />
        <Radar name="Level" dataKey="level" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip {...tooltipStyle} />
      </ReRadarChart>
    </ChartWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HEAT MAP  — activity calendar (pure CSS, no Recharts)
// ─────────────────────────────────────────────────────────────
function heatColor(value, max) {
  if (!value) return "bg-slate-100 dark:bg-slate-700";
  const pct = value / max;
  if (pct < 0.25) return "bg-emerald-200 dark:bg-emerald-900";
  if (pct < 0.5)  return "bg-emerald-400 dark:bg-emerald-700";
  if (pct < 0.75) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

export function HeatMap({ data = [], title, subtitle, weeks = 26 }) {
  // Generate sample 26-week grid if no data
  const grid = data.length ? data : Array.from({ length: weeks * 7 }, (_, i) => ({
    date: new Date(Date.now() - (weeks * 7 - i) * 86400000).toISOString().slice(0, 10),
    value: Math.random() > 0.4 ? Math.floor(Math.random() * 10) : 0,
  }));

  const max = Math.max(...grid.map(d => d.value), 1);
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    cols.push(grid.slice(w * 7, w * 7 + 7));
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="w-full">
      {title && <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{title}</p>}
      {subtitle && <p className="text-xs text-slate-400 mb-3">{subtitle}</p>}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {cols.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.date}: ${day.value} activities`}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.value, max)} cursor-pointer hover:ring-1 hover:ring-emerald-400 transition-all`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-slate-400">Less</span>
        {["bg-slate-100 dark:bg-slate-700","bg-emerald-200","bg-emerald-400","bg-emerald-500","bg-emerald-600"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. GAUGE CHART  — progress percentage (SVG arc)
// ─────────────────────────────────────────────────────────────
export function GaugeChart({ value = 0, max = 100, title, subtitle, color = COLORS[0], label }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180; // 0–180 degrees
  const r = 70;
  const cx = 100, cy = 90;

  function polarToXY(deg, radius) {
    const rad = (deg - 180) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const start = polarToXY(0, r);
  const end   = polarToXY(angle, r);
  const large = angle > 90 ? 1 : 0;

  return (
    <div className="w-full flex flex-col items-center">
      {title && <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</p>}
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path
          d={`M ${polarToXY(0, r).x} ${polarToXY(0, r).y} A ${r} ${r} 0 0 1 ${polarToXY(180, r).x} ${polarToXY(180, r).y}`}
          fill="none" stroke="#334155" strokeWidth={14} strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
            fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
            style={{ transition: "all 0.8s ease" }}
          />
        )}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={22} fontWeight={800} fill={color}>
          {Math.round(pct * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {label || `${value} / ${max}`}
        </text>
      </svg>
      {subtitle && <p className="text-xs text-slate-400 -mt-2">{subtitle}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. TREEMAP  — category breakdown
// ─────────────────────────────────────────────────────────────
function TreemapContent({ x, y, width, height, name, value, depth, index }) {
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect
        x={x + 1} y={y + 1} width={width - 2} height={height - 2}
        fill={COLORS[index % COLORS.length]} fillOpacity={depth === 1 ? 0.85 : 0.6}
        rx={6}
      />
      {width > 50 && height > 30 && (
        <>
          <text x={x + 8} y={y + 18} fill="#fff" fontSize={11} fontWeight={700} className="select-none">
            {name}
          </text>
          {height > 44 && (
            <text x={x + 8} y={y + 32} fill="rgba(255,255,255,0.7)" fontSize={10} className="select-none">
              {value}
            </text>
          )}
        </>
      )}
    </g>
  );
}

export function Treemap({ data = [], title, subtitle }) {
  const sample = data.length ? data : [
    { name: "JavaScript", size: 420 }, { name: "Python",     size: 380 },
    { name: "React",      size: 290 }, { name: "SQL",        size: 210 },
    { name: "Docker",     size: 160 }, { name: "AWS",        size: 140 },
    { name: "TypeScript", size: 120 }, { name: "Git",        size: 100 },
  ];
  return (
    <ChartWrap title={title} subtitle={subtitle} height={200}>
      <ReTreemap
        data={sample} dataKey="size" aspectRatio={4 / 3}
        content={<TreemapContent />}
      >
        <Tooltip {...tooltipStyle} formatter={(v) => [v, "Hours"]} />
      </ReTreemap>
    </ChartWrap>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. SANKEY DIAGRAM  — user flow
// ─────────────────────────────────────────────────────────────
function SankeyNode({ x, y, width, height, index, payload }) {
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x} y={y} width={width} height={height}
        fill={COLORS[index % COLORS.length]} fillOpacity={0.9} rx={4}
      />
      <text
        x={x + width + 6} y={y + height / 2} textAnchor="start"
        dominantBaseline="middle" fontSize={10} fill="#94a3b8"
      >
        {payload.name}
      </text>
    </Layer>
  );
}

function SankeyLink({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index }) {
  return (
    <Layer key={`link-${index}`}>
      <path
        d={`M${sourceX},${sourceY + linkWidth / 2} C${sourceControlX},${sourceY + linkWidth / 2} ${targetControlX},${targetY + linkWidth / 2} ${targetX},${targetY + linkWidth / 2}`}
        fill="none" stroke={COLORS[index % COLORS.length]} strokeWidth={linkWidth} strokeOpacity={0.3}
      />
    </Layer>
  );
}

export function SankeyDiagram({ data, title, subtitle }) {
  const sample = data || {
    nodes: [
      { name: "Homepage" }, { name: "Courses" }, { name: "Challenges" },
      { name: "Jobs" }, { name: "Enrolled" }, { name: "Solved" }, { name: "Applied" },
    ],
    links: [
      { source: 0, target: 1, value: 800 },
      { source: 0, target: 2, value: 600 },
      { source: 0, target: 3, value: 400 },
      { source: 1, target: 4, value: 500 },
      { source: 2, target: 5, value: 450 },
      { source: 3, target: 6, value: 300 },
    ],
  };
  return (
    <ChartWrap title={title} subtitle={subtitle} height={220}>
      <Sankey
        data={sample} nodePadding={20} nodeWidth={10} margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
        node={<SankeyNode />} link={<SankeyLink />}
      >
        <Tooltip {...tooltipStyle} />
      </Sankey>
    </ChartWrap>
  );
}
