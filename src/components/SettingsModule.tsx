import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Image as ImageIcon, AlertCircle, Download, Upload, FileSpreadsheet, Database } from 'lucide-react';
import { SchoolSettings, Student, AttendanceRecord, CalendarEvent } from '../types';
import * as XLSX from 'xlsx';

interface SettingsModuleProps {
  settings: SchoolSettings;
  setSettings: (data: SchoolSettings) => void;
  students: Student[];
  attendance: AttendanceRecord[];
  calendarEvents: CalendarEvent[];
  setStudents: (data: Student[]) => void;
  setAttendance: (data: AttendanceRecord[]) => void;
  setCalendarEvents: (data: CalendarEvent[]) => void;
}

export default function SettingsModule({ 
  settings, 
  setSettings, 
  students, 
  attendance, 
  calendarEvents,
  setStudents,
  setAttendance,
  setCalendarEvents
}: SettingsModuleProps) {
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupSummary, setBackupSummary] = useState<{students: number, attendance: number, events: number} | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  // EXPORTAR BACKUP JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings,
      students,
      attendance,
      calendarEvents
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_busca_ativa_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // EXPORTAR BACKUP EXCEL
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // ABA 1: ALUNOS
    const studentsData = students.map(s => ({
      'Nº': s.numero,
      'Nome': s.nome,
      'Turma': s.rturma,
      'RA': s.ra,
      'DV': s.dv,
      'Situação': s.situacao,
      'Bolsa Família': s.bolsafamilia ? 'SIM' : 'NÃO',
      'Telefone': s.telefone,
      'WhatsApp': s.whatsapp,
      'Responsável': s.parent_name,
      'Nascimento': s.datanascimento,
      'Sexo': s.sexo
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Alunos');
    
    // ABA 2: FREQUÊNCIAS
    const attendanceData = attendance.map(a => {
      const student = students.find(s => s.id === a.student_id);
      return {
        'Aluno': student?.nome || 'Desconhecido',
        'Turma': student?.rturma || '',
        'Data': a.date,
        'Status': a.status
      };
    });
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'Frequências');
    
    // ABA 3: CALENDÁRIO
    const eventsData = calendarEvents.map(e => ({
      'Data': e.date,
      'Tipo': e.type,
      'Descrição': e.description
    }));
    const wsEvents = XLSX.utils.json_to_sheet(eventsData);
    XLSX.utils.book_append_sheet(wb, wsEvents, 'Calendário');
    
    // ABA 4: CONFIGURAÇÕES
    const settingsData = [{
      'Escola': settings.name,
      'Endereço': settings.address,
      'Município': settings.municipio,
      'UF': settings.uf,
      'Telefone': settings.phone,
      'E-mail': settings.email
    }];
    const wsSettings = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(wb, wsSettings, 'Configurações');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `backup_escola_${settings.name?.replace(/\s/g, '_') || 'busca_ativa'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // IMPORTAR BACKUP JSON
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackupFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setBackupSummary({
            students: data.students?.length || 0,
            attendance: data.attendance?.length || 0,
            events: data.calendarEvents?.length || 0
          });
        } catch (err) {
          alert('Arquivo de backup inválido. Verifique o formato.');
          setBackupFile(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRestoreBackup = () => {
    if (!backupFile) return;
    
    if (!confirm('⚠️ ATENÇÃO: Isso substituirá TODOS os dados atuais do sistema. Deseja continuar?')) {
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.settings) setSettings(data.settings);
        if (data.students) setStudents(data.students);
        if (data.attendance) setAttendance(data.attendance);
        if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
        
        alert('✅ Backup restaurado com sucesso! O sistema foi atualizado.');
        setBackupFile(null);
        setBackupSummary(null);
      } catch (err) {
        alert('Erro ao restaurar backup. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(backupFile);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* DADOS DA ESCOLA */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <SettingsIcon className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Configurações do Sistema</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold">Gerencie os dados da unidade escolar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-blue-600 pl-3">Dados da Escola</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome da Unidade Escolar</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 font-medium"
                value={settings.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={settings.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Município</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.municipio}
                  onChange={e => handleChange('municipio', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">UF</label>
                <input 
                  type="text" 
                  maxLength={2}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-center uppercase"
                  value={settings.uf}
                  onChange={e => handleChange('uf', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telefone</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={settings.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-blue-600 pl-3">Identidade Visual</h3>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 bg-slate-50">
              {settings.logo ? (
                <div className="relative group">
                  <img src={settings.logo} alt="Logo" className="max-h-32 object-contain rounded shadow-lg" />
                  <button 
                    onClick={() => handleChange('logo', '')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <ImageIcon size={64} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase mt-2">Nenhuma logo carregada</p>
                </div>
              )}
              
              <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-colors font-bold text-[10px] uppercase shadow-sm">
                Carregar Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-amber-600 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed uppercase">
                A logo será exibida no cabeçalho de todos os documentos oficiais e relatórios gerados pelo sistema. Recomendamos o uso de imagens em formato PNG com fundo transparente.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button 
            onClick={() => alert('As configurações são salvas automaticamente na nuvem ao serem alteradas.')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs shadow-lg transition-all"
          >
            <Save size={18} />
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* BACKUP E RESTAURAÇÃO */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Database className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Backup e Restauração</h2>
            <p className="text-xs text-slate-500 uppercase font-semibold">Proteja os dados do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EXPORTAR */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-green-600 pl-3">Exportar Backup</h3>
            
            <div className="space-y-3">
              <button 
                onClick={handleExportExcel}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold uppercase text-xs shadow transition-all"
              >
                <FileSpreadsheet size={18} />
                Exportar Backup (Excel)
              </button>
              
              <button 
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold uppercase text-xs shadow transition-all"
              >
                <Download size={18} />
                Exportar Backup (JSON)
              </button>
            </div>

            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-[10px] text-green-800 font-medium leading-relaxed">
                <strong>Excel:</strong> Ideal para conferência e auditoria (4 abas organizadas).<br/>
                <strong>JSON:</strong> Ideal para restauração completa no sistema.
              </p>
            </div>
          </div>

          {/* IMPORTAR */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase border-l-4 border-amber-600 pl-3">Importar Backup</h3>
            
            <div className="space-y-3">
              <label className="block">
                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selecionar Arquivo (.json)</span>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-[10px] font-medium"
                />
              </label>

              {backupSummary && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] text-blue-800 font-bold uppercase mb-2">Resumo do Backup:</p>
                  <ul className="text-[10px] text-blue-700 space-y-1">
                    <li>📋 Alunos: <strong>{backupSummary.students}</strong></li>
                    <li>📅 Frequências: <strong>{backupSummary.attendance}</strong></li>
                    <li>🗓️ Eventos: <strong>{backupSummary.events}</strong></li>
                  </ul>
                </div>
              )}

              <button 
                onClick={handleRestoreBackup}
                disabled={!backupFile}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold uppercase text-xs shadow transition-all ${
                  backupFile 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Upload size={18} />
                Restaurar Backup
              </button>
            </div>

            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-[10px] text-red-800 font-medium leading-relaxed">
                ⚠️ <strong>Atenção:</strong> A restauração substituirá TODOS os dados atuais. Faça um backup antes de prosseguir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
