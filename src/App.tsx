import React, { useState, useEffect } from 'react';
import { GameState, Question, Team, GameSettings, AnswerHistory } from './types';
import initialQuestions from './data/questions.json';
import { Setup } from './components/Setup';
import { Game } from './components/Game';
import { Admin } from './components/Admin';
import { Results } from './components/Results';
import { Settings } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('escape_genesis_questions');
    return saved ? JSON.parse(saved) : initialQuestions;
  });
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    timerDuration: 30
  });
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('escape_genesis_questions', JSON.stringify(questions));
  }, [questions]);

  const handleStartGame = (newTeams: Team[], settings: GameSettings) => {
    setTeams(newTeams);
    setGameSettings(settings);
    setAnswerHistory([]);
    setGameState('playing');
  };

  const handleEndGame = (history: AnswerHistory[]) => {
    setAnswerHistory(history);
    setGameState('results');
  };

  const handleReset = () => {
    setGameState('setup');
    setTeams([]);
    setAnswerHistory([]);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
          <h1 className="text-3xl font-bold text-amber-500 font-serif tracking-wider drop-shadow-md">الهروب من التكوين</h1>
          <div className="flex gap-4">
            {gameState !== 'admin' && (
              <button 
                onClick={() => setGameState('admin')} 
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 hover:border-slate-500"
                title="لوحة التحكم"
              >
                <Settings size={24} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 container mx-auto p-6 flex flex-col justify-center">
          {gameState === 'setup' && (
            <Setup onStart={handleStartGame} />
          )}
          {gameState === 'playing' && (
            <Game 
              teams={teams} 
              setTeams={setTeams}
              questions={questions}
              settings={gameSettings}
              onEndGame={handleEndGame}
            />
          )}
          {gameState === 'admin' && (
            <Admin 
              questions={questions} 
              setQuestions={setQuestions}
              teams={teams}
              setTeams={setTeams}
              onBack={() => setGameState('setup')} 
            />
          )}
          {gameState === 'results' && (
            <Results teams={teams} history={answerHistory} onReset={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
}
