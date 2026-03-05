import React, { useState } from 'react';
import { Team, GameSettings } from '../types';
import { Users, Play, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupProps {
  onStart: (teams: Team[], settings: GameSettings) => void;
}

export function Setup({ onStart }: SetupProps) {
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(['الفريق الأول', 'الفريق الثاني']);
  const [timerDuration, setTimerDuration] = useState(30);

  const handleNumTeamsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setNumTeams(count);
    
    setTeamNames(prev => {
      const newNames = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newNames.push(`الفريق ${i + 1}`);
        }
      } else {
        newNames.length = count;
      }
      return newNames;
    });
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const handleStart = () => {
    const teams: Team[] = teamNames.map((name, index) => ({
      id: `team-${index}`,
      name: name.trim() || `الفريق ${index + 1}`,
      score: 0,
      keys: []
    }));
    onStart(teams, { timerDuration });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-slate-700 text-white"
    >
      <div className="flex justify-center mb-8">
        <div className="bg-amber-500/20 p-6 rounded-full text-amber-400 border border-amber-500/30">
          <Users size={64} />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-center mb-10 font-serif text-amber-400">إعداد الفرق</h2>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-lg font-medium mb-3 text-slate-300">عدد الفرق</label>
            <select 
              value={numTeams} 
              onChange={handleNumTeamsChange}
              className="w-full p-4 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-lg"
            >
              {[2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} فرق</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-lg font-medium mb-3 text-slate-300">
              <Clock size={20} /> وقت السؤال
            </label>
            <select 
              value={timerDuration} 
              onChange={(e) => setTimerDuration(parseInt(e.target.value))}
              className="w-full p-4 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-lg"
            >
              {[20, 25, 30, 45, 60].map(num => (
                <option key={num} value={num}>{num} ثانية</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-slate-300">أسماء الفرق</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamNames.map((name, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`اسم الفريق ${index + 1}`}
                  className="w-full p-4 rounded-xl border border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold text-2xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)] mt-8"
        >
          <Play size={32} />
          <span>بدء المغامرة</span>
        </button>
      </div>
    </motion.div>
  );
}
