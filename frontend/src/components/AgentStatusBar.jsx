import React, { useState } from 'react';
import { motion } from 'framer-motion';

const agents = [
  { id: 'paper-reader', label: 'Paper Reader', color: '#38bdf8', status: 'Ready' },
  { id: 'comparator', label: 'Comparator', color: '#818cf8', status: 'Idle' },
  { id: 'contradiction', label: 'Contradiction', color: '#fbbf24', status: 'Ready' },
];

const statusColors = {
  Active: '#34d399',
  Idle: '#6b7280',
  Ready: '#38bdf8',
  Processing: '#fbbf24',
};

export default function AgentStatusBar({ activeAgents = [] }) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 glass border-b border-white/5 text-xs overflow-x-auto flex-shrink-0">
      <span className="text-gray-600 font-medium mr-2 flex-shrink-0">AGENTS</span>
      {agents.map((agent) => {
        const isActive = activeAgents.includes(agent.id);
        const status = isActive ? 'Processing' : agent.status;
        const dotColor = statusColors[status];
        return (
          <div key={agent.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 flex-shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'animate-pulse-dot' : ''}`}
              style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
            />
            <span className="text-gray-400 font-medium">{agent.label}</span>
            <span style={{ color: dotColor }} className="font-semibold">{status}</span>
          </div>
        );
      })}
      <div className="ml-auto flex items-center gap-1 text-gray-600 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-accentGreen" style={{ boxShadow: '0 0 6px #34d399' }} />
        System Online
      </div>
    </div>
  );
}
