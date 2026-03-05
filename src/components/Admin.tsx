import React, { useState, useRef } from 'react';
import { Question, StageType } from '../types';
import { Plus, Trash2, Edit2, Save, X, Upload, Download, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface AdminProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onBack: () => void;
}

const STAGES: { id: StageType; label: string }[] = [
  { id: 'eden', label: 'جنة عدن' },
  { id: 'ark', label: 'فلك نوح' },
  { id: 'babel', label: 'برج بابل' },
  { id: 'abraham', label: 'رحلة إبراهيم' },
  { id: 'joseph', label: 'يوسف في مصر' }
];

export function Admin({ questions, setQuestions, onBack }: AdminProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditForm({ ...question });
  };

  const handleSave = () => {
    if (!editForm.question || !editForm.correct || !editForm.options || editForm.options.length !== 4) {
      alert('يرجى تعبئة جميع الحقول المطلوبة والتأكد من وجود 4 خيارات');
      return;
    }

    if (editingId === 'new') {
      const newQuestion: Question = {
        ...(editForm as Question),
        id: Date.now().toString(),
      };
      setQuestions([...questions, newQuestion]);
    } else {
      setQuestions(questions.map(q => q.id === editingId ? editForm as Question : q));
    }
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({
      stage: 'eden',
      question: '',
      options: ['', '', '', ''],
      correct: '',
      explanation: '',
      verse: '',
      image: ''
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(editForm.options || [])];
    newOptions[index] = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "genesis_questions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuestions = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedQuestions)) {
          setQuestions(importedQuestions);
          alert('تم استيراد الأسئلة بنجاح');
        }
      } catch (error) {
        alert('حدث خطأ أثناء استيراد الملف. تأكد من أنه ملف JSON صالح.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700 text-white">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <ArrowRight size={24} />
          </button>
          <h2 className="text-3xl font-bold font-serif text-amber-400">إدارة الأسئلة</h2>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">استيراد</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <Download size={18} />
            <span className="hidden sm:inline">تصدير</span>
          </button>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors shadow-lg"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">سؤال جديد</span>
          </button>
        </div>
      </div>

      {editingId && (
        <div className="mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-600 shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-amber-400">
            {editingId === 'new' ? 'إضافة سؤال جديد' : 'تعديل السؤال'}
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">المرحلة</label>
                <select 
                  value={editForm.stage} 
                  onChange={(e) => setEditForm({...editForm, stage: e.target.value as StageType})}
                  className="w-full p-3 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {STAGES.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">رابط صورة (اختياري)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <ImageIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={editForm.image || ''} 
                    onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-3 pr-10 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">السؤال</label>
              <textarea 
                value={editForm.question || ''} 
                onChange={(e) => setEditForm({...editForm, question: e.target.value})}
                className="w-full p-3 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none min-h-[100px]"
                placeholder="اكتب السؤال هنا..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-slate-300">الخيارات (حدد الإجابة الصحيحة)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(index => (
                  <div key={index} className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="correctAnswer" 
                      checked={editForm.correct === editForm.options?.[index] && !!editForm.correct}
                      onChange={() => setEditForm({...editForm, correct: editForm.options?.[index] || ''})}
                      className="w-5 h-5 text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-600"
                    />
                    <input 
                      type="text" 
                      value={editForm.options?.[index] || ''} 
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`الخيار ${index + 1}`}
                      className="flex-1 p-3 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">الشرح</label>
                <textarea 
                  value={editForm.explanation || ''} 
                  onChange={(e) => setEditForm({...editForm, explanation: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none min-h-[100px]"
                  placeholder="شرح الإجابة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">المرجع (الآية)</label>
                <input 
                  type="text" 
                  value={editForm.verse || ''} 
                  onChange={(e) => setEditForm({...editForm, verse: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-600 bg-slate-900 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="مثال: تكوين 1: 1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button 
                onClick={() => setEditingId(null)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <X size={18} /> إلغاء
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg"
              >
                <Save size={18} /> حفظ السؤال
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:bg-slate-800 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-amber-900/40 text-amber-400 rounded-lg text-sm font-medium border border-amber-700/50">
                  {STAGES.find(s => s.id === q.stage)?.label || q.stage}
                </span>
                <span className="text-slate-400 text-sm">{q.verse}</span>
              </div>
              <h4 className="font-bold text-lg mb-2">{q.question}</h4>
              <div className="text-sm text-emerald-400 flex items-center gap-2">
                <span className="font-bold">الإجابة:</span> {q.correct}
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => handleEdit(q)}
                className="p-3 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-400 rounded-xl transition-colors border border-indigo-700/50"
                title="تعديل"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(q.id)}
                className="p-3 bg-red-900/40 hover:bg-red-800/60 text-red-400 rounded-xl transition-colors border border-red-700/50"
                title="حذف"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
          <div className="text-center p-12 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
            لا توجد أسئلة. قم بإضافة سؤال جديد أو استيراد ملف.
          </div>
        )}
      </div>
    </div>
  );
}
