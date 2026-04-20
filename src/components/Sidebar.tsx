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
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  onLogout,
  isOpen,
  onClose
}) => {
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
    <>
      {/* Overlay escuro para mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-slate-50 text-slate-700 flex flex-col z-40 
        shadow-xl border-r border-slate-200 
        transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        print:hidden
      `}>
        {/* Cabeçalho com botão X para mobile */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg shadow-sm">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter uppercase leading-none text-slate-800">Busca Ativa</h1>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Gestão Escolar</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                onClose(); // Fecha menu no mobile ao selecionar
              }}
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

        {/* Botão Sair */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 uppercase text-xs font-bold tracking-widest"
          >
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>

        {/* Versão */}
        <div className="p-4 text-[10px] text-slate-400 text-center font-mono uppercase tracking-widest bg-white border-t border-slate-200">
          v1.2.0 &copy; 2024
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
