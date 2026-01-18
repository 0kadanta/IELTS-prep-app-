
import React, { useState, useEffect, useMemo } from 'react';
import { PHASES, FULL_PLAN } from './constants';
import { ProgressState, WeekPlan, DailyPlan } from './types';
import { geminiService } from './services/geminiService';
import { CheckCircle, Circle, Brain, Calendar, ChevronLeft, ChevronRight, Award, MessageSquareQuote, Send, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = localStorage.getItem('ielts_study_state_v2');
    return saved ? JSON.parse(saved) : { completedTasks: {}, userOutputs: {}, aiFeedback: {} };
  });
  const [isAiLoading, setIsAiLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('ielts_study_state_v2', JSON.stringify(progress));
  }, [progress]);

  const currentWeekPlan = useMemo(() => FULL_PLAN.find(w => w.week === selectedWeek)!, [selectedWeek]);
  const currentPhase = useMemo(() => PHASES.find(p => p.weeks.includes(selectedWeek))!, [selectedWeek]);

  const toggleTask = (taskId: string) => {
    setProgress(prev => ({
      ...prev,
      completedTasks: { ...prev.completedTasks, [taskId]: !prev.completedTasks[taskId] }
    }));
  };

  const handleOutputChange = (date: string, content: string) => {
    setProgress(prev => ({
      ...prev,
      userOutputs: { ...prev.userOutputs, [date]: content }
    }));
  };

  const getAiFeedback = async (date: string, taskDesc: string) => {
    const output = progress.userOutputs[date];
    if (!output || output.length < 5) return;

    setIsAiLoading(prev => ({ ...prev, [date]: true }));
    const feedback = await geminiService.getFeedback(output, taskDesc);
    setProgress(prev => ({
      ...prev,
      aiFeedback: { ...prev.aiFeedback, [date]: feedback }
    }));
    setIsAiLoading(prev => ({ ...prev, [date]: false }));
  };

  const totalCompleted = Object.values(progress.completedTasks).filter(Boolean).length;
  const totalTasks = FULL_PLAN.reduce((acc, w) => acc + w.dailyPlans.reduce((dAcc, d) => dAcc + d.tasks.length, 0), 0);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${currentPhase.color} text-white shadow-lg shadow-blue-100`}>
              <Brain size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">雅思 23 周备考</h1>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 rounded uppercase text-white ${currentPhase.color}`}>
                  {currentPhase.name}
                </span>
                <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{currentPhase.goal}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-tighter">Overall Progress</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-700">{completionRate}%</span>
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${currentPhase.color}`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* Week Navigator */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/60 flex items-center justify-between">
          <button 
            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
            disabled={selectedWeek === 1}
            className="p-3 hover:bg-slate-50 rounded-2xl disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="text-slate-600" />
          </button>
          <div className="text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Week {selectedWeek} / 23
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentWeekPlan.focus}</h2>
            <p className="text-xs font-medium text-slate-400 mt-1">{currentWeekPlan.startDate} 至 {currentWeekPlan.endDate}</p>
          </div>
          <button 
            onClick={() => setSelectedWeek(prev => Math.min(23, prev + 1))}
            disabled={selectedWeek === 23}
            className="p-3 hover:bg-slate-50 rounded-2xl disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="text-slate-600" />
          </button>
        </div>

        {/* Daily Plans */}
        <div className="grid gap-6">
          {currentWeekPlan.dailyPlans.map((day) => (
            <div key={day.date} className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden transition-all hover:shadow-md group">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center group-hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${currentPhase.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
                    D{day.dayNumber}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-700">{day.date}</span>
                    <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Daily Checklist</span>
                  </div>
                </div>
                {day.tasks.every(t => progress.completedTasks[t.id]) && (
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border border-emerald-100">
                    <CheckCircle size={14} /> 核心任务达成
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Task List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> 学习清单
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {day.tasks.map(task => (
                        <button 
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                            progress.completedTasks[task.id] 
                            ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="mt-0.5">
                            {progress.completedTasks[task.id] ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle className="text-white" size={14} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                            )}
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${progress.completedTasks[task.id] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {task.label}
                            </div>
                            {task.description && (
                              <div className="text-[11px] text-slate-400 mt-1 font-medium">{task.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Active Output */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <Award size={14} /> 主动产出要求
                      </h3>
                      <span className="text-[10px] bg-rose-50 text-rose-500 font-black px-2 py-0.5 rounded-full border border-rose-100">
                        必备环节
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-800 rounded-2xl shadow-inner border border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                          <Sparkles size={10} className="text-yellow-400" /> 目标产出内容
                        </div>
                        <p className="text-sm font-bold text-white leading-relaxed">
                          {day.outputRequired}
                        </p>
                      </div>

                      <div className="relative">
                        <textarea
                          placeholder={`点击此处开始写下你的产出...\n(例如: ${day.outputRequired})`}
                          className="w-full min-h-[160px] p-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm transition-all bg-white shadow-sm resize-none leading-relaxed placeholder:text-slate-300"
                          value={progress.userOutputs[day.date] || ''}
                          onChange={(e) => handleOutputChange(day.date, e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          <button 
                            onClick={() => getAiFeedback(day.date, day.outputRequired)}
                            disabled={!progress.userOutputs[day.date] || progress.userOutputs[day.date].length < 5 || isAiLoading[day.date]}
                            className={`p-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-lg ${
                              progress.userOutputs[day.date]?.length >= 5
                              ? 'bg-slate-900 text-white hover:bg-black active:scale-95 shadow-slate-200' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                            }`}
                          >
                            {isAiLoading[day.date] ? (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="animate-pulse">AI 老师批改中...</span>
                              </div>
                            ) : (
                              <>
                                <Brain size={16} /> 
                                {progress.aiFeedback[day.date] ? '再次请求反馈' : '获取导师点评'}
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* AI Feedback Display */}
                      {progress.aiFeedback[day.date] && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-4 p-6 rounded-3xl bg-blue-50/80 border border-blue-100 relative group/feedback shadow-sm">
                          <div className="absolute -top-3 left-6 flex items-center gap-2">
                            <div className="bg-white p-1.5 rounded-xl border border-blue-100 shadow-sm">
                              <MessageSquareQuote size={18} className="text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-blue-100">
                              AI Teacher Feedback
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 whitespace-pre-line leading-loose font-medium pt-2">
                            {progress.aiFeedback[day.date]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Navigation Tab bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/20 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-2 overflow-x-auto max-w-[95vw] no-scrollbar z-50">
        {PHASES.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedWeek(phase.weeks[0])}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${
              phase.weeks.includes(selectedWeek) 
              ? `${phase.color} text-white shadow-xl shadow-blue-100 scale-105` 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {phase.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
