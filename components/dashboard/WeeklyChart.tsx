"use client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Seg', xp: 50 }, { day: 'Ter', xp: 120 }, { day: 'Qua', xp: 80 },
  { day: 'Qui', xp: 200 }, { day: 'Sex', xp: 150 }, { day: 'Sáb', xp: 0 }, { day: 'Dom', xp: 0 }
];

export function WeeklyChart() {
  return (
    <div className="glass-card p-6 w-full h-72 mt-6">
      <h3 className="text-sm text-zinc-400 mb-6 font-medium uppercase tracking-wider">
        Evolução Semanal (XP)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff' }} 
            itemStyle={{ color: '#a855f7' }}
          />
          <Bar dataKey="xp" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}