import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Student, AttendanceRecord, CalendarEvent, SchoolSettings } from './types';
import Dashboard from './components/Dashboard';
import StudentsModule from './components/StudentsModule';
import AttendanceModule from './components/AttendanceModule';
import AssessmentModule from './components/AssessmentModule';
import CalendarModule from './components/CalendarModule';
import DocumentsModule from './components/DocumentsModule';
import ReportsModule from './components/ReportsModule';
import SettingsModule from './components/SettingsModule';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>({
    id: 'default',
    name: 'Escola Estadual Busca Ativa',
    address: 'Rua das Flores, 123',
    municipio: 'Araraquara',
    uf: 'SP',
    phone: '(16) 3333-4444',
    email: 'escola@educacao.sp.gov.br',
    logo: ''
  });

  const { isSyncing, dbStatus, dbError, syncStudents, syncAttendance, syncCalendar, syncSettings } = useSupabaseSync(
    setStudents,
    setAttendance,
    setEvents,
    setSettings
  );

const handleClearData = async () => {
  try {
    // Clear Supabase
    await supabase.from('attendance').delete().neq('status', '');
    await supabase.from('students').delete().neq('nome', '');
    await supabase.from('calendar_events').delete().neq('type', '');
    
    // Clear Local State
    setStudents([]);
    setAttendance([]);
    setEvents([]);
    alert('Todos os dados foram apagados com sucesso!');
  } catch (error) {
    console.error('Erro ao apagar dados:', error);
    alert('Erro ao apagar dados do banco.');
  }
};

const handleLogout = () => {
  if (confirm('Deseja realmente sair do sistema?')) {
    alert('Sessão encerrada com sucesso. Obrigado por utilizar o sistema Busca Ativa!');
    
    // Tenta fechar a aba
    window.close();
    
    // Se o navegador impedir o fechamento (fallback), redireciona para uma página vazia
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 100);
  }
};

return (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar 
      activeModule={activeModule} 
      setActiveModule={setActiveModule} 
      onLogout={handleLogout}
    />
      
      <main className="flex-1 lg:ml-64 print:ml-0 print:p-0">
        <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between print:hidden">
          <h1 className="text-xl font-semibold text-gray-800 uppercase tracking-tight">
            Busca Ativa - Sistema de Gestão Escolar
          </h1>
          
          <div className="flex items-center gap-4">
            {dbStatus === 'connected' && (
              <div className="flex items-center gap-2 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                <Cloud size={14} />
                <span>BANCO CONECTADO</span>
              </div>
            )}
            {dbStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                <CloudOff size={14} />
                <span title={dbError || ''}>ERRO DE CONEXÃO</span>
              </div>
            )}
            {isSyncing && (
              <div className="flex items-center gap-2 text-blue-600 text-xs font-medium animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                <span>SINCRONIZANDO...</span>
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
          {activeModule === 'dashboard' && (
            <Dashboard students={students} attendance={attendance} />
          )}
          {activeModule === 'students' && (
            <StudentsModule 
              students={students} 
              setStudents={(data: Student[]) => {
                setStudents(data);
                syncStudents(data);
              }} 
              onClearData={handleClearData}
            />
          )}
          {activeModule === 'attendance' && (
            <AttendanceModule 
              students={students} 
              attendance={attendance} 
              setAttendance={(data: AttendanceRecord[]) => {
                setAttendance(data);
                syncAttendance(data);
              }}
              events={events}
            />
          )}
          {activeModule === 'assessment' && (
            <AssessmentModule 
              students={students} 
              attendance={attendance}
              calendarEvents={events}
              settings={settings}
            />
          )}
          {activeModule === 'calendar' && (
            <CalendarModule 
              events={events} 
              setEvents={(data: CalendarEvent[]) => {
                setEvents(data);
                syncCalendar(data);
              }} 
            />
          )}
          {activeModule === 'documents' && (
            <DocumentsModule students={students} settings={settings} attendance={attendance} />
          )}
          {activeModule === 'reports' && (
            <ReportsModule 
              students={students} 
              attendance={attendance} 
              calendarEvents={events}
              settings={settings} 
            />
          )}
          {activeModule === 'settings' && (
            <SettingsModule 
              settings={settings} 
              setSettings={(data: SchoolSettings) => {
                setSettings(data);
                syncSettings(data);
              }} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
