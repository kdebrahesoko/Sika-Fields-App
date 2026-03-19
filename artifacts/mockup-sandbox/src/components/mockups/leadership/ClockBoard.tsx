import { useState, useEffect } from "react";

const TIMEZONES = [
  {
    label: "Accra",
    country: "Ghana",
    flag: "🇬🇭",
    offset: 0,
    color: "#16a34a",
    members: [
      { name: "Daniel Asare-Kyei", suffix: "PhD", role: "CEO", bgPos: "0% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "William Osei Agyemang", role: "CFO", bgPos: "50% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Charlotte Owusu-Ansah", role: "CTAO", bgPos: "0% 82%", bgSize: "320% 265%", img: "leadership" },
    ],
  },
  {
    label: "Amsterdam",
    country: "Netherlands",
    flag: "🇳🇱",
    offset: 1,
    color: "#7c3aed",
    members: [
      { name: "Valentijn Venus", role: "CPRO", bgPos: "100% 6%", bgSize: "320% 265%", img: "leadership" },
      { name: "Dr. Cheryl Sterling", role: "Advisor", bgPos: "50% 42%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    label: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    offset: 1,
    color: "#b45309",
    members: [
      { name: "Olubgenga O. Awe", role: "Advisor", bgPos: "100% 90%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    label: "Dubai",
    country: "UAE — DIFC",
    flag: "🇦🇪",
    offset: 4,
    color: "#0891b2",
    members: [
      { name: "Vijay Palat", role: "CSSO", bgPos: "47% 82%", bgSize: "320% 265%", img: "leadership" },
      { name: "Derrick Adu Gyamfi", role: "Advisor", bgPos: "0% 42%", bgSize: "320% 340%", img: "advisory" },
      { name: "Nana Ama Boateng-Kagyah", role: "Advisor", bgPos: "0% 90%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
  {
    label: "New Delhi",
    country: "India",
    flag: "🇮🇳",
    offset: 5.5,
    color: "#ca8a04",
    members: [
      { name: "Festus W. Amoyaw", role: "Advisor", bgPos: "100% 42%", bgSize: "320% 340%", img: "advisory" },
      { name: "Valentijn Venus", role: "Advisor", bgPos: "50% 90%", bgSize: "320% 340%", img: "advisory" },
    ],
  },
];

function getLocalTime(offsetHours: number, now: Date) {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const localMs = utcMs + offsetHours * 3600000;
  const local = new Date(localMs);
  const h = local.getHours();
  const m = String(local.getMinutes()).padStart(2, "0");
  const s = String(local.getSeconds()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return { display: `${h12}:${m}:${s}`, ampm, hour24: h, minute: local.getMinutes() };
}

function isDaytime(hour: number) { return hour >= 7 && hour < 20; }

function ClockFace({ hour, minute, color }: { hour: number; minute: number; color: string }) {
  const hAngle = (hour % 12) / 12 * 360 + minute / 60 * 30 - 90;
  const mAngle = minute / 60 * 360 - 90;
  const r = 28;
  const cx = 32, cy = 32;
  const hx = cx + Math.cos(hAngle * Math.PI / 180) * 16;
  const hy = cy + Math.sin(hAngle * Math.PI / 180) * 16;
  const mx = cx + Math.cos(mAngle * Math.PI / 180) * 22;
  const my = cy + Math.sin(mAngle * Math.PI / 180) * 22;

  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}30`} strokeWidth="2" />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = i / 12 * 2 * Math.PI - Math.PI / 2;
        return <circle key={i} cx={cx + Math.cos(a) * 24} cy={cy + Math.sin(a) * 24} r={i % 3 === 0 ? 2 : 1} fill={`${color}60`} />;
      })}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={2.5} fill={color} />
    </svg>
  );
}

export function ClockBoard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#060d08] font-['Inter'] flex flex-col text-[#e2f0e8]">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-[#1a3a22]">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[#16a34a] text-xs font-bold uppercase tracking-widest mb-1">Live Operations</p>
            <h2 className="text-3xl font-['Sora'] font-black text-white">11 People. 5 Time Zones. Always On.</h2>
            <p className="text-[#4a7a5a] text-sm mt-1.5">Someone at SikaFields is working right now. Geography isn't a limitation — it's coverage.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#4a7a5a] text-xs font-mono">UTC {new Date().toISOString().slice(11,19)}</p>
            <p className="text-[#16a34a] text-xs font-bold">● LIVE</p>
          </div>
        </div>
      </div>

      {/* Clock cards */}
      <div className="flex-1 px-8 py-6 flex gap-4">
        {TIMEZONES.map((tz) => {
          const time = getLocalTime(tz.offset, now);
          const daytime = isDaytime(time.hour24);
          return (
            <div
              key={tz.label}
              className="flex-1 rounded-2xl border flex flex-col overflow-hidden transition-all hover:border-opacity-100"
              style={{
                backgroundColor: daytime ? `${tz.color}08` : `${tz.color}04`,
                borderColor: `${tz.color}30`,
              }}
            >
              {/* Clock + time */}
              <div className="p-5 pb-4 flex flex-col items-center border-b" style={{ borderColor: `${tz.color}20` }}>
                <ClockFace hour={time.hour24} minute={parseInt(time.display.split(":")[1])} color={tz.color} />
                <p className="font-mono font-black text-xl mt-3" style={{ color: tz.color }}>
                  {time.display.slice(0, 5)} <span className="text-sm">{time.ampm}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-lg">{tz.flag}</span>
                  <div>
                    <p className="text-white text-xs font-bold leading-tight">{tz.label}</p>
                    <p className="text-[10px] font-semibold" style={{ color: tz.color }}>{tz.country}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: daytime ? "#16a34a" : "#4a7a5a" }} />
                  <span className="text-[10px]" style={{ color: daytime ? "#16a34a" : "#4a7a5a" }}>
                    {daytime ? "Business hours" : "Off hours"}
                  </span>
                </div>
              </div>

              {/* Members */}
              <div className="flex-1 p-4 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#4a7a5a] mb-1">{tz.members.length} {tz.members.length === 1 ? "person" : "people"} here</p>
                {tz.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg shrink-0"
                      style={{
                        backgroundImage: `url('/__mockup/images/${m.img === "advisory" ? "advisory-board" : "leadership-team"}.png')`,
                        backgroundSize: m.bgSize,
                        backgroundPosition: m.bgPos,
                        backgroundRepeat: "no-repeat",
                        outline: `2px solid ${tz.color}40`,
                        outlineOffset: "1px",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-[#e2f0e8] text-[11px] font-bold truncate leading-tight">
                        {m.name.split(" ").slice(0, 2).join(" ")}
                        {(m as any).suffix && <sup className="text-[9px] ml-0.5" style={{ color: tz.color }}>{(m as any).suffix}</sup>}
                      </p>
                      <p className="text-[9px]" style={{ color: tz.color }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* UTC tag */}
              <div className="px-4 pb-4">
                <span className="text-[9px] font-mono text-[#4a7a5a]">UTC{tz.offset >= 0 ? "+" : ""}{tz.offset}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar: coverage visualization */}
      <div className="px-8 pb-6">
        <div className="rounded-xl border border-[#1a3a22] bg-[#0a1a0d] p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#4a7a5a] mb-2">24-Hour Coverage — Team Active Windows (Local Business Hours)</p>
          <div className="relative h-5 rounded-full overflow-hidden bg-[#1a3a22]">
            {TIMEZONES.map((tz, i) => {
              const startPct = ((7 + tz.offset) % 24) / 24 * 100;
              const widthPct = 13 / 24 * 100;
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 rounded-sm opacity-70"
                  style={{ left: `${startPct}%`, width: `${widthPct}%`, backgroundColor: tz.color, mixBlendMode: "screen" }}
                  title={`${tz.label} active hours`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5 text-[8px] font-mono text-[#4a7a5a]">
            {Array.from({ length: 9 }, (_, i) => i * 3).map(h => (
              <span key={h}>{String(h).padStart(2, "0")}:00</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
