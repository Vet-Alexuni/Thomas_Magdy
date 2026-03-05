import React from 'react';
import { Team, AnswerHistory, StageType } from '../types';
import { Trophy, RotateCcw, Medal, Key } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsProps {
  teams: Team[];
  history: AnswerHistory[];
  onReset: () => void;
}

const STAGES: { id: StageType; title: string; icon: string }[] = [
  { id: 'eden', title: 'جنة عدن', icon: '🌳' },
  { id: 'ark', title: 'فلك نوح', icon: '🚢' },
  { id: 'babel', title: 'برج بابل', icon: '🗼' },
  { id: 'abraham', title: 'رحلة إبراهيم', icon: '🐪' },
  { id: 'joseph', title: 'يوسف في مصر', icon: '👑' }
];

export function Results({ teams, history, onReset }: ResultsProps) {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.keys.length !== a.keys.length) {
      return b.keys.length - a.keys.length;
    }
    return b.score - a.score;
  });

  const winner = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && 
                sortedTeams[0].keys.length === sortedTeams[1].keys.length && 
                sortedTeams[0].score === sortedTeams[1].score;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-slate-700 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-500/20 p-6 rounded-full text-amber-400 border border-amber-500/30">
              <Trophy size={80} />
            </div>
          </div>
          
          <h2 className="text-5xl font-black mb-4 font-serif text-amber-400 drop-shadow-lg">نهاية المغامرة!</h2>
          
          {isTie ? (
            <p className="text-3xl text-slate-200 font-bold">تعادل بين الفرق المتصدرة!</p>
          ) : (
            <div className="space-y-4">
              <p className="text-2xl text-slate-300">الفريق الفائز الذي نجح في الهروب هو</p>
              <p className="text-6xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">{winner.name}</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeams.map((team, index) => (
          <motion.div 
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border-2 ${
              index === 0 && !isTie
                ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{team.name}</h3>
              {index === 0 && !isTie && <Medal className="text-amber-400" size={32} />}
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-950/50 p-4 rounded-xl text-center border border-slate-800">
                <div className="text-sm text-slate-400 mb-1">النقاط</div>
                <div className="text-4xl font-black text-amber-400">{team.score}</div>
              </div>
              
              <div>
                <div className="text-sm text-slate-400 mb-3 text-center">المفاتيح المجمعة ({team.keys.length}/5)</div>
                <div className="flex justify-center gap-2">
                  {STAGES.map(stage => (
                    <div 
                      key={stage.id} 
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
                        team.keys.includes(stage.id) 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                          : 'bg-slate-800 text-slate-600 border border-slate-700'
                      }`}
                      title={stage.title}
                    >
                      {team.keys.includes(stage.id) ? stage.icon : <Key size={16} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button 
          onClick={onReset}
          className="px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-2xl flex items-center gap-3 transition-colors border border-slate-600 shadow-xl"
        >
          <RotateCcw size={28} />
          <span>لعبة جديدة</span>
        </button>
      </div>
    </div>
  );
}
