import React from "react";

export const BarChart = ({
  data,
  color = "#499ed7",
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full flex flex-col gap-3 font-semibold text-[10px] text-slate-500">
      <div
        className="w-full flex items-end gap-2.5 pt-4 border-b border-slate-200 dark:border-slate-800 relative"
        style={{ height: `${height}px` }}
      >
        {data.map((d, idx) => {
          const percentage = (d.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
              {/* Tooltip */}
              <div className="absolute mb-1 bg-slate-900 text-white px-2 py-1 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 transform -translate-y-10 z-10 font-bold shadow-md pointer-events-none">
                {d.value}
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-95"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                  minHeight: "4px",
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="w-full flex justify-between px-1 text-[9px] font-bold uppercase tracking-wider">
        {data.map((d, idx) => (
          <span key={idx} className="flex-1 text-center truncate px-0.5">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const DonutChart = ({
  data,
  size = 180,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = 60;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const strokeDashoffset = circumference - (circumference * percentage) / 100;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotationOffset = (accumulatedPercentage / 100) * circumference;

            accumulatedPercentage += percentage;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  strokeDashoffset: strokeDashoffset,
                  transformOrigin: "center",
                  transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                  transition: "stroke-dashoffset 0.6s ease-out",
                }}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{total}</span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Total Tiket</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2.5">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="w-3.5 h-3.5 rounded-md flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col leading-none">
                <span className="text-slate-900 dark:text-white font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{item.value} Pengajuan ({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
