import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CheckCircle, 
  BarChart3, 
  FileText, 
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'attendance', label: 'Frequência', icon: CheckCircle },
    { id: 'assessment', label: 'Apuração', icon: BarChart3 },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'reports', label: 'Relatórios', icon: ClipboardList },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-50 text-slate-700 flex flex-col z-20 shadow-xl border-r border-slate-200 transition-all print:hidden">
      <div className="p-6 flex items-center gap-3 border-b border-slate-200 bg-white">
        <div className="bg-slate-800 p-2 rounded-lg shadow-sm">
          <CheckCircle size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tighter uppercase leading-none text-slate-800">Busca Ativa</h1>
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Gestão Escolar</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${activeModule === item.id 
                ? 'bg-slate-800 text-white shadow-md shadow-slate-200' 
                : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'}
            `}
          >
            <item.icon size={20} className={activeModule === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'} />
            <span className="text-sm font-semibold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-white">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 uppercase text-xs font-bold tracking-widest"
        >
          <LogOut size={18} />
          <span>Sair do Sistema</span>
        </button>
      </div>

      <div className="p-4 text-[10px] text-slate-400 text-center font-mono uppercase tracking-widest bg-white border-t border-slate-200">
        v1.2.0 &copy; 2024
      </div>
    </aside>
  );
};

export default Sidebar;
