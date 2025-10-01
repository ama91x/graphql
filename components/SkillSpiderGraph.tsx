"use client";

import { graphqlFetch } from "@/lib/graphql";
import React, { useEffect, useState } from "react";

type Skill = {
  type: string;
  totalAmount: number;
};

type Transaction = {
  type: string;
  amount: number;
};

const SkillSpiderGraph: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      const query = `
        query {
          transaction(
            where: { type: { _like: "%skill_%" } }
            order_by: { id: asc }
          ) {
            amount
            type
          }
        }
      `;
      try {
        const data: { transaction: Transaction[] } = await graphqlFetch(query);
        const transactions = data.transaction || [];

        const summedSkills: Record<string, number> = {};
        transactions.forEach(({ type, amount }) => {
          summedSkills[type] = (summedSkills[type] || 0) + amount;
        });

        const topSkills: Skill[] = Object.entries(summedSkills)
          .map(([type, totalAmount]) => ({ type, totalAmount }))
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 6);

        setSkills(topSkills);
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading)
    return <div className="text-center p-10 text-gray-500">Loading...</div>;
  if (!skills.length)
    return <div className="text-center p-10 text-gray-500">No skill data</div>;

  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 50;
  const numAxes = skills.length;
  const maxAmount = Math.max(...skills.map((s) => s.totalAmount));

  const points = skills
    .map((s, i) => {
      const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
      const r = (s.totalAmount / maxAmount) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  const axes = skills.map((s, i) => {
    const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#e0e0e0"
        strokeWidth={1}
      />
    );
  });

  const labels = skills.map((s, i) => {
    const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
    const x = center + (radius + 25) * Math.cos(angle);
    const y = center + (radius + 25) * Math.sin(angle);
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor={x > center ? "start" : x < center ? "end" : "middle"}
        alignmentBaseline="middle"
        fontSize={12}
        className="fill-gray-700 font-semibold"
      >
        {s.type.replace("skill_", "")}
      </text>
    );
  });

  const levels = 5;
  const backgroundRings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const ringPoints = skills
      .map((_, j) => {
        const angle = (j / numAxes) * 2 * Math.PI - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <polygon
        key={i}
        points={ringPoints}
        fill="none"
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-white rounded-xl h-[390px]">
      <h2 className="text-2xl font-bold text-gray-800">Skill</h2>
      <svg width={size} height={size} className="overflow-visible">
        {backgroundRings}
        {axes}
        <polygon
          points={points}
          fill="url(#gradient)"
          stroke="#22caec"
          strokeWidth={2}
          className="transition-all duration-700 ease-out"
        />
        {labels}

        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22caec" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
          </linearGradient>
        </defs>

        {skills.map((s, i) => {
          const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
          const r = (s.totalAmount / maxAmount) * radius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={6}
              fill="#22caec"
              className="cursor-pointer transition-all hover:scale-125"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}

        {hoveredIndex !== null && (
          <text
            x={center}
            y={size + 20}
            textAnchor="middle"
            fontSize={14}
            className="fill-gray-700 font-semibold"
          >
            {skills[hoveredIndex].type.replace("skill_", "")}:{" "}
            {skills[hoveredIndex].totalAmount}
          </text>
        )}
      </svg>
    </div>
  );
};

export default SkillSpiderGraph;
