import React, { useState, useEffect, useCallback } from 'react';
import { Question, Team, GameSettings, AnswerHistory, StageType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, ArrowRight, BookOpen, Key, Play, Eye, X } from 'lucide-react';

interface GameProps {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  questions: Question[];
  settings: GameSettings;
  onEndGame: (history: AnswerHistory[]) => void;
}

const STAGES: { id: StageType; title: string; icon: string; color: string }[] = [
  { id: 'eden', title: 'جنة عدن', icon: '🌳', color: 'text-emerald-400' },
  { id: 'ark', title: 'فلك نوح', icon: '🚢', color: 'text-blue-400' },
  { id: 'babel', title: 'برج بابل', icon: '🗼', color: 'text-stone-400' },
  { id: 'abraham', title: 'رحلة إبراهيم', icon: '🐪', color: 'text-amber-600' },
  { id: 'joseph', title: 'يوسف في مصر', icon: '👑', color: 'text-yellow-400' }
];

const POINTS_PER_QUESTION = 20;
const POINTS_TO_WIN_STAGE = 100;

type QuestionStatus = 'ready' | 'active' | 'revealed';

export function Game({ teams, setTeams, questions, settings, onEndGame }: GameProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageQuestions, setStageQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  const [stageScores, setStageScores] = useState<Record<string, number>>({});
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [answeringTeamIndex, setAnsweringTeamIndex] = useState(0);
  const [teamsAttempted, setTeamsAttempted] = useState<string[]>([]);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>('ready');
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [stageUnlocked, setStageUnlocked] = useState(false);
  const [history, setHistory] = useState<AnswerHistory[]>([]);

  const currentStage = STAGES[currentStageIndex];
  const currentQuestion = stageQuestions.length > 0 
    ? stageQuestions[currentQuestionIndex % stageQuestions.length] 
    : null;

  // Load stage data
  const loadStage = useCallback(() => {
    if (currentStageIndex >= STAGES.length) {
      onEndGame(history);
      return;
    }

    const stageQs = questions.filter(q => q.stage === currentStage.id);
    const shuffledQs = [...stageQs].sort(() => Math.random() - 0.5);
    setStageQuestions(shuffledQs);
    setCurrentQuestionIndex(0);
    
    const initialScores: Record<string, number> = {};
    teams.forEach(t => initialScores[t.id] = 0);
    setStageScores(initialScores);
    
    setActiveTeamIndex(0);
    setAnsweringTeamIndex(0);
    setTeamsAttempted([]);
    setWrongOptions([]);
    setQuestionStatus('ready');
    setStageUnlocked(false);
  }, [currentStageIndex, questions, currentStage, teams, onEndGame, history]);

  useEffect(() => {
    loadStage();
  }, [loadStage]);

  // Shuffle options when question changes
  useEffect(() => {
    if (currentQuestion) {
      setShuffledOptions([...currentQuestion.options].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, stageQuestions, currentQuestion]);

  // Timer logic
  useEffect(() => {
    if (questionStatus !== 'active' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionStatus, timeLeft]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && questionStatus === 'active') {
      handleTimeOut();
    }
  }, [timeLeft, questionStatus]);

  const handleTimeOut = useCallback(() => {
    if (!currentQuestion) return;
    const answeringTeam = teams[answeringTeamIndex];
    
    setHistory(prev => [...prev, {
      teamId: answeringTeam.id,
      stage: currentStage.id,
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedAnswer: null,
      correctAnswer: currentQuestion.correct,
      isCorrect: false,
      timeSpent: settings.timerDuration
    }]);

    setQuestionStatus('revealed');
  }, [currentQuestion, teams, answeringTeamIndex, currentStage.id, settings.timerDuration]);

  const handleStartQuestion = () => {
    setQuestionStatus('active');
    setTimeLeft(settings.timerDuration);
    setAnsweringTeamIndex(activeTeamIndex);
    setTeamsAttempted([]);
    setWrongOptions([]);
  };

  const handleOptionClick = (option: string) => {
    if (questionStatus !== 'active' || !currentQuestion) return;

    if (option === currentQuestion.correct) {
      // Correct answer
      const answeringTeam = teams[answeringTeamIndex];
      
      const newStageScore = (stageScores[answeringTeam.id] || 0) + POINTS_PER_QUESTION;
      setStageScores(prev => ({ ...prev, [answeringTeam.id]: newStageScore }));
      
      setTeams(prev => prev.map(t => 
        t.id === answeringTeam.id ? { ...t, score: t.score + POINTS_PER_QUESTION } : t
      ));

      setHistory(prev => [...prev, {
        teamId: answeringTeam.id,
        stage: currentStage.id,
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedAnswer: option,
        correctAnswer: currentQuestion.correct,
        isCorrect: true,
        timeSpent: settings.timerDuration - timeLeft
      }]);

      setQuestionStatus('revealed');

      if (newStageScore >= POINTS_TO_WIN_STAGE) {
        setTeams(prev => prev.map(t => 
          t.id === answeringTeam.id ? { ...t, keys: [...t.keys, currentStage.id] } : t
        ));
        setStageUnlocked(true);
      }
    } else {
      // Wrong answer
      setWrongOptions(prev => [...prev, option]);
      
      const answeringTeam = teams[answeringTeamIndex];
      
      setHistory(prev => [...prev, {
        teamId: answeringTeam.id,
        stage: currentStage.id,
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selectedAnswer: option,
        correctAnswer: currentQuestion.correct,
        isCorrect: false,
        timeSpent: settings.timerDuration - timeLeft
      }]);

      setQuestionStatus('revealed');
    }
  };

  const handleShowAnswer = () => {
    setQuestionStatus('revealed');
  };

  const handleNextQuestion = () => {
    setActiveTeamIndex((prev) => (prev + 1) % teams.length);
    setCurrentQuestionIndex(prev => prev + 1);
    setQuestionStatus('ready');
    setWrongOptions([]);
  };

  const handleNextStage = () => {
    setCurrentStageIndex(prev => prev + 1);
  };

  if (!currentQuestion && stageQuestions.length === 0) {
    return (
      <div className="text-center p-8 text-2xl text-white">
        جاري تحميل مرحلة {currentStage?.title}... (تأكد من وجود أسئلة لهذه المرحلة)
        <button onClick={handleNextStage} className="block mx-auto mt-4 px-6 py-2 bg-amber-500 text-slate-900 rounded-lg">تخطي المرحلة</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {teams.map((team, idx) => {
          const isAnswering = questionStatus === 'active' && idx === answeringTeamIndex;
          const isOriginalTurn = questionStatus === 'ready' && idx === activeTeamIndex;
          const stageScore = stageScores[team.id] || 0;
          const progress = Math.min(100, (stageScore / POINTS_TO_WIN_STAGE) * 100);

          return (
            <div key={team.id} className={`bg-slate-800/80 backdrop-blur-sm border-2 p-4 rounded-2xl flex flex-col items-center shadow-lg transition-all ${
              isAnswering ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105' : 
              isOriginalTurn ? 'border-indigo-500' : 'border-slate-700'
            }`}>
              <div className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
                {team.name}
                {isAnswering && <span className="text-[10px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full animate-pulse">يجيب الآن</span>}
              </div>
              <div className="text-3xl font-black text-amber-400 mb-2">{team.score}</div>
              
              <div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden border border-slate-700">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-400 mb-3">{stageScore} / {POINTS_TO_WIN_STAGE} نقطة للمفتاح</div>

              <div className="flex gap-1 h-6">
                {STAGES.map(stage => (
                  <div key={stage.id} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${team.keys.includes(stage.id) ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-600'}`}>
                    <Key size={12} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Stage Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {stageUnlocked ? (
            <motion.div 
              key="unlocked"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-8xl mb-6 animate-bounce">{currentStage.icon}</div>
              <h2 className="text-5xl font-black text-amber-400 mb-4 font-serif drop-shadow-lg">تم فتح المرحلة!</h2>
              <p className="text-3xl text-slate-200 mb-4">الفريق الفائز بالمفتاح:</p>
              <p className="text-5xl font-bold text-emerald-400 drop-shadow-lg mb-12">{teams[answeringTeamIndex]?.name}</p>
              <button 
                onClick={handleNextStage}
                className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-bold text-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <span>{currentStageIndex === STAGES.length - 1 ? 'إنهاء اللعبة' : 'الانتقال للمرحلة التالية'}</span>
                <ArrowRight size={32} />
              </button>
            </motion.div>
          ) : questionStatus === 'ready' ? (
            <motion.div 
              key="ready"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center py-12 px-8 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl max-w-3xl w-full"
            >
              <div className="text-6xl mb-6">{currentStage.icon}</div>
              <h3 className="text-3xl font-bold text-slate-300 mb-6 font-serif">السؤال القادم</h3>
              <div className="text-5xl font-black text-amber-400 mb-12 drop-shadow-md">
                دور فريق: {teams[activeTeamIndex]?.name}
              </div>
              <button 
                onClick={handleStartQuestion}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-2xl flex items-center gap-3 mx-auto transition-all hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                <Play size={32} /> ابدأ السؤال
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="question"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              {/* Stage Header */}
              <div className="bg-slate-950/50 p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{currentStage.icon}</span>
                  <h2 className={`text-3xl font-bold font-serif ${currentStage.color}`}>
                    المرحلة {currentStageIndex + 1}: {currentStage.title}
                  </h2>
                </div>
                <div className={`flex items-center gap-3 font-mono text-4xl font-bold ${
                  timeLeft <= 5 && questionStatus === 'active' ? 'text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-amber-400'
                }`}>
                  <Clock size={36} />
                  <span>{timeLeft}</span>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-8 md:p-12">
                {currentQuestion?.image && (
                  <div className="mb-8 rounded-2xl overflow-hidden h-64 relative border border-slate-700">
                    <img 
                      src={currentQuestion.image} 
                      alt="Stage visual" 
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  </div>
                )}
                
                <h3 className="text-3xl md:text-4xl font-bold mb-10 leading-relaxed font-serif text-white text-center">
                  {currentQuestion?.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shuffledOptions.map((option, idx) => {
                    let btnClass = "p-6 text-2xl font-medium rounded-2xl border-2 text-center transition-all duration-300 ";
                    const isWrong = wrongOptions.includes(option);
                    
                    if (questionStatus === 'active') {
                      if (isWrong) {
                        btnClass += "border-red-500/50 bg-red-900/20 text-red-400/50 cursor-not-allowed";
                      } else {
                        btnClass += "border-slate-600 bg-slate-800 text-slate-200 cursor-pointer hover:bg-slate-700 hover:border-slate-500";
                      }
                    } else {
                      if (option === currentQuestion?.correct) {
                        btnClass += "border-emerald-500 bg-emerald-900/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105";
                      } else if (isWrong) {
                        btnClass += "border-red-900/50 bg-red-950/30 text-red-500/50";
                      } else {
                        btnClass += "border-slate-700 bg-slate-900/50 text-slate-500 opacity-50";
                      }
                    }

                    return (
                      <div 
                        key={idx} 
                        className={btnClass}
                        onClick={() => {
                          if (questionStatus === 'active' && !isWrong) {
                            handleOptionClick(option);
                          }
                        }}
                      >
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {questionStatus === 'revealed' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-800 bg-emerald-950/30 p-8"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl">
                        <BookOpen size={28} />
                        <span>الشرح:</span>
                      </div>
                      <p className="text-slate-200 text-xl leading-relaxed">{currentQuestion?.explanation}</p>
                      <div className="text-lg font-medium text-amber-400 bg-amber-950/50 inline-block px-4 py-2 rounded-lg self-start border border-amber-900/50">
                        المرجع: {currentQuestion?.verse}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Presenter Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-4 z-50">
        <div className="container mx-auto flex flex-wrap justify-center gap-4">
          {questionStatus === 'active' && !stageUnlocked && (
            <button onClick={handleShowAnswer} className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
              <Eye size={20} /> إظهار الإجابة
            </button>
          )}

          {questionStatus === 'revealed' && !stageUnlocked && (
            <button onClick={handleNextQuestion} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <span>السؤال التالي</span>
              <ArrowRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
