"use client";

import React, { useEffect, useState } from "react";
import { fetchXpPerMonth, formatXp } from "@/lib/auditApi";

type Props = {
  userId?: number;
  width?: number;
  height?: number;
};

const DailyXP: React.FC<Props> = ({ width = 550, height = 300 }) => {
  const [data, setData] = useState<{ date: string; xp: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      const xpData = await fetchXpPerMonth();
      setData(xpData);
    }
    loadData();
  }, []);

  if (data.length === 0) {
    return <p className="text-gray-500 text-center mt-10">Loading chart...</p>;
  }

  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxXp = Math.max(...data.map((d) => d.xp), 1);
  const barWidth = chartWidth / data.length;

  return (
    <div className="flex flex-col items-center p-6 bg-[#fff4f1] rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily XP</h2>
      <svg width={width} height={height}>
        {/* Background */}
        <rect width={width} height={height} rx={16} fill="#fff4f1" />

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          const xpValue = Math.round(maxXp * (1 - ratio));
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth={1}
              />
              <text
                x={padding - 10}
                y={y + 4}
                fontSize={10}
                textAnchor="end"
                fill="#6b7280"
              >
                {formatXp(xpValue)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.xp / maxXp) * chartHeight;
          const x = padding + i * barWidth;
          const y = height - padding - barHeight;
          return (
            <g key={d.date}>
              <rect
                x={x + barWidth * 0.1}
                y={y}
                width={barWidth * 0.8}
                height={barHeight}
                fill="#7dd3fc"
                rx={6}
              />
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                fontSize={10}
                textAnchor="middle"
                fill="#6b7280"
              >
                {d.date}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5e1"
        />
      </svg>
    </div>
  );
};

export default DailyXP;
