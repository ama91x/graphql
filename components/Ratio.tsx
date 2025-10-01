"use client";

import React, { useEffect, useState } from "react";
import { fetchXpUp, fetchXpDown, calculateXpRatio } from "@/lib/auditApi";

type Props = {
  userId?: number;
};

const formatMB = (value: number) => (value / 1_000_000).toFixed(2) + " MB";

const Ratio: React.FC<Props> = ({ userId }) => {
  const [done, setDone] = useState(0);
  const [received, setReceived] = useState(0);
  const [ratio, setRatio] = useState("0");

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      const xpUp = await fetchXpUp(userId);
      const xpDown = await fetchXpDown(userId);
      const r = await calculateXpRatio(userId);

      setDone(xpUp);
      setReceived(xpDown);
      setRatio(r.ratio);
    };

    loadData();
  }, [userId]);

  const total = done + received || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-white rounded-xl shadow-md h-[390px]">
      <h2 className="text-2xl font-bold text-gray-800">Audit Ratio</h2>

      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Background Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="20"
          fill="none"
        />
        {/* Done Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#22c55e"
          strokeWidth="20"
          fill="none"
          strokeDasharray={`${(done / total) * circumference} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
        />
        {/* Received Circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#3b82f6"
          strokeWidth="20"
          fill="none"
          strokeDasharray={`${
            (received / total) * circumference
          } ${circumference}`}
          strokeDashoffset={-((done / total) * circumference)}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
        />
        {/* Ratio Text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize="18"
          fontWeight="bold"
          fill="#374151"
        >
          {ratio}
        </text>
      </svg>

      <div className="flex justify-around w-full mt-4">
        <div className="flex flex-col items-center">
          <span className="text-green-500 font-semibold">Done</span>
          <span className="text-gray-700">{formatMB(done)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-blue-500 font-semibold">Received</span>
          <span className="text-gray-700">{formatMB(received)}</span>
        </div>
      </div>
    </div>
  );
};

export default Ratio;
