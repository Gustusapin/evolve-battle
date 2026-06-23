"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 pt-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">
          ← Voltar ao Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Histórico de Batalha</h1>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-200 outline-none focus:border-purple-500"
          >
            <option value="all">Todas as atividades</option>
            <option value="water">Água</option>
            <option value="workout">Musculação</option>
            <option value="reading">Leitura</option>
          </select>
        </div>

        <div className="glass-card p-6">
          <p className="text-zinc-500 text-center py-10">
            Aqui você importará o seu componente `ActivityFeed` passando a propriedade filter={filterType}.
          </p>
        </div>
      </div>
    </div>
  );
}