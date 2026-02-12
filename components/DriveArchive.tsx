
import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudUpload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  ExternalLink,
  Trash2,
  Loader2,
  HardDrive,
  FolderOpen,
  ChevronRight,
  LayoutGrid,
  List,
  Share2,
  CloudCheck,
  Zap,
  ArrowUpRight,
  // Add missing RefreshCw import
  RefreshCw
} from 'lucide-react';
import { Project } from '../types';

interface Props {
  projects: Project[];
}

interface CloudFile {
  id: string;
  name: string;
  size: string;
  date: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  driveLink?: string;
  projectId: string;
  targetFolder: string;
}

const DriveArchive: React.FC<Props> = ({ projects }) => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // الربط التلقائي عند الدخول (للمحاكاة)
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      handleConnectDrive();
    }
  }, []);

  const handleConnectDrive = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 1200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const formattedFiles: CloudFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleString('ar-BH'),
      status: 'pending',
      projectId: selectedProjectId,
      targetFolder: selectedProject?.name || 'General'
    }));
    setFiles(prev => [...formattedFiles, ...prev]);

    formattedFiles.forEach(f => {
      startAutoSync(f.id);
    });
  };

  const startAutoSync = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'uploading' } : f));
    
    // محاكاة النقل التلقائي السريع
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'completed', 
          driveLink: `https://drive.google.com/search?q=${encodeURIComponent(f.name)}` 
        } : f
      ));
    }, 2000);
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const filteredFiles = files.filter(f => f.projectId === selectedProjectId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* Auto-Move Status Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl ${isConnected ? 'bg-blue-600 animate-pulse' : 'bg-slate-800'}`}>
              <CloudUpload size={40} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-blue-400 fill-blue-400" />
                <h2 className="text-2xl font-black">نظام النقل التلقائي (Auto-Move)</h2>
              </div>
              <p className="text-slate-400 font-bold text-sm max-w-md">
                المزامنة مفعلة: أي ملف يتم رفعه سينتقل فوراً إلى مجلد <span className="text-blue-400 font-black">"{selectedProject?.name}"</span> في Google Drive.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {isConnected ? (
              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-2xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-xs font-black text-blue-400">اتصال نشط مع سحابة Google</span>
              </div>
            ) : (
              <button onClick={handleConnectDrive} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg">
                تنشيط المزامنة التلقائية
              </button>
            )}
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
              <HardDrive size={12} /> المساحة المستخدمة: 1.2 GB / 15 GB
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project Selector (Folder Context) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
              <FolderOpen size={14} /> اختر مجلد المشروع المستهدف
            </h3>
            <div className="space-y-1">
              {projects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-[11px] ${
                    selectedProjectId === p.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen size={18} className={selectedProjectId === p.id ? 'text-white' : 'text-blue-400'} />
                  <span className="truncate">{p.name}</span>
                  {selectedProjectId === p.id && <ArrowUpRight size={14} className="mr-auto opacity-50" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex items-start gap-4">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                <Share2 size={20} />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-800 uppercase">مشاركة الملفات</p>
                <p className="text-[10px] text-emerald-600/80 font-bold leading-tight">جميع الملفات المرفوعة هنا متاحة تلقائياً للمحاسب المشترك في المجلد.</p>
             </div>
          </div>
        </div>

        {/* Files Explorer Area */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[550px] transition-all duration-300 ${isDragging ? 'ring-8 ring-blue-500/10 bg-blue-50/5' : ''}`}
          >
            {/* Breadcrumbs Navigation */}
            <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400">
                <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><HardDrive size={16} /> <span>My Drive</span></div>
                <ChevronRight size={14} />
                <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><span>Binaa_Accounting</span></div>
                <ChevronRight size={14} />
                <span className="text-blue-600 bg-blue-100/50 border border-blue-200 px-3 py-1 rounded-xl flex items-center gap-2">
                  <FolderOpen size={14} /> {selectedProject?.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={16}/></button>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  <CloudUpload size={18} /> رفع ونقل تلقائي
                </button>
              </div>
            </div>

            {/* Drop Zone / Content Area */}
            <div className="flex-1 relative">
              {isDragging && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-8 pointer-events-none">
                  <div className="w-full h-full border-4 border-dashed border-blue-400 rounded-[3rem] flex flex-col items-center justify-center gap-6 bg-white/95 backdrop-blur-sm shadow-2xl animate-in zoom-in">
                    <div className="w-28 h-28 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-bounce">
                      <CloudUpload size={56} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-black text-slate-900 mb-2">أفلت الملف للنقل التلقائي</h3>
                      <p className="text-blue-600 font-black text-lg">الوجهة السحابية: {selectedProject?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />

              {filteredFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-32 text-center space-y-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center">
                      <FolderOpen size={56} className="text-slate-200" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 border border-slate-50">
                      <Zap size={24} className="fill-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800">هذا المجلد جاهز للمزامنة</h3>
                    <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                      أي ملف تسحبه هنا سينتقل "أوتوماتيكياً" إلى مجلد <span className="text-slate-900 underline">"{selectedProject?.name}"</span> في قوقل درايف.
                    </p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl">
                    بدء الرفع الآن
                  </button>
                </div>
              ) : (
                <div className={`p-8 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-3'}`}>
                  {filteredFiles.map(file => (
                    viewMode === 'grid' ? (
                      <div key={file.id} className="group bg-slate-50 rounded-3xl p-4 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1.5 bg-blue-100">
                          {file.status === 'uploading' && <div className="h-full bg-blue-600 animate-[shimmer_2s_infinite]"></div>}
                          {file.status === 'completed' && <div className="h-full bg-emerald-500"></div>}
                        </div>
                        
                        <button onClick={() => deleteFile(file.id)} className="absolute top-3 left-3 p-1.5 bg-white text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-rose-50"><Trash2 size={14}/></button>
                        
                        <div className="w-full aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center shadow-inner relative overflow-hidden border border-slate-50">
                          {file.status === 'uploading' ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 size={32} className="animate-spin text-blue-600" />
                              <span className="text-[10px] font-black text-blue-600 animate-pulse tracking-tighter">جاري النقل السحابي...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                               <FileText size={48} className="text-blue-600" />
                               {file.status === 'completed' && <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full"><CheckCircle size={20} className="fill-white" /></div>}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <h4 className="text-[11px] font-black text-slate-900 truncate">{file.name}</h4>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{file.size}</span>
                            {file.status === 'completed' ? (
                              <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                                <CloudCheck size={10} /> تم الحفظ
                              </span>
                            ) : (
                              <span className="text-[8px] font-black text-blue-500 flex items-center gap-1">
                                <RefreshCw size={10} className="animate-spin" /> قيد المزامنة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={file.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-xl hover:border-blue-100 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${file.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {file.status === 'uploading' ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{file.name}</h4>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] text-slate-400 font-bold">{file.size} • {file.date}</p>
                              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                              <p className="text-[10px] text-blue-600 font-black flex items-center gap-1">
                                <HardDrive size={10} /> الوجهة: Drive / {file.targetFolder}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {file.status === 'completed' ? (
                            <a href={file.driveLink} target="_blank" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                              معاينة في Drive <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black">
                              <Loader2 size={14} className="animate-spin" /> جاري المزامنة...
                            </div>
                          )}
                          <button onClick={() => deleteFile(file.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={20}/></button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual Instruction Footer */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 w-24 h-24 bg-white/20 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-md">
           <Zap size={48} className="fill-white" />
        </div>
        <div className="relative z-10 space-y-3 text-center md:text-right">
           <h4 className="text-2xl font-black">تقنية النقل الذكي أوتو مكة (Auto-Sync)</h4>
           <p className="text-blue-100 font-bold leading-relaxed max-w-3xl">
             تم برمجة النظام ليتعرف تلقائياً على المشروع المحدد؛ بمجرد إفلات الملف، يقوم الذكاء الاصطناعي بربطه محاسبياً وتوجيهه إلى مجلد قوقل درايف الخاص بالمشروع. 
             لا داعي للقلق بشأن تصنيف الملفات يدوياً، نحن نقوم بذلك عنك بدقة تامة.
           </p>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default DriveArchive;
