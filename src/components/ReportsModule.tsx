import React, { useState } from 'react';
import { FileDown, Table, Search, Download, Printer } from 'lucide-react';
import { Student, AttendanceRecord, SchoolSettings, CalendarEvent } from '../types';
import * as XLSX from 'xlsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, parseISO } from 'date-fns';

interface ReportsModuleProps {
  students: Student[];
  attendance: AttendanceRecord[];
  calendarEvents: CalendarEvent[];
  settings: SchoolSettings;
}

export default function ReportsModule({ students, attendance, calendarEvents, settings }: ReportsModuleProps) {
  const [reportType, setReportType] = useState<'mensal' | 'diario'>('mensal');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [onlyBolsaFamilia, setOnlyBolsaFamilia] = useState(false);

  const turmas = [...new Set(students.map(s => s.rturma))].sort();

  const calculateFrequencia = (studentId: string) => {
    const start = startOfMonth(parseISO(selectedMonth + '-01'));
    const end = endOfMonth(start);
    
    const diasLetivos = eachDayOfInterval({ start, end }).filter(day => {
      const isDayWeekend = isWeekend(day);
      const dateStr = format(day, 'yyyy-MM-dd');
      const isHoliday = calendarEvents.some(e => e.date === dateStr && e.type === 'Feriado');
      return !isDayWeekend && !isHoliday;
    });
    
    const studentAttendance = attendance.filter(a => 
      a.student_id === studentId && a.date.startsWith(selectedMonth)
    );

    if (studentAttendance.length === 0) return 0;

    const presencas = studentAttendance.filter(a => a.status === 'P').length;
    const totalDiasLetivos = diasLetivos.length;
    
    return totalDiasLetivos > 0 ? Math.round((presencas / totalDiasLetivos) * 100) : 0;
  };

  const filteredStudents = students
    .filter(s => s.situacao === 'Ativo')
    .filter(s => !selectedTurma || s.rturma === selectedTurma)
    .filter(s => !onlyBolsaFamilia || s.bolsafamilia)
    .sort((a, b) => (a.numero || 0) - (b.numero || 0));

  const exportToExcel = () => {
    const data = filteredStudents.map(s => {
      const freq = reportType === 'mensal' 
        ? calculateFrequencia(s.id) + '%'
        : (attendance.find(a => a.student_id === s.id && a.date === selectedDate)?.status || 'P');
      
      return {
        'Nº': s.numero,
        'Nome': s.nome,
        'Turma': s.rturma,
        'RA': `${s.ra}-${s.dv}`,
        'Bolsa Família': s.bolsafamilia ? 'Sim' : 'Não',
        [reportType === 'mensal' ? 'Frequência Mensal' : 'Status na Data']: freq
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `Relatorio_${reportType}_${selectedTurma || 'Geral'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO PARA IMPRESSÃO - LOGO À ESQUERDA, TEXTO AO CENTRO */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-slate-900 pb-4 mb-8 relative min-h-[120px]">
        <img src={settings.logo} className="absolute left-0 w-24 h-24 object-contain" alt="Escola Logo" />
        <div className="text-center uppercase font-bold text-slate-900 leading-tight">
          <p className="text-[12px]">Governo do Estado de São Paulo</p>
          <p className="text-[12px]">Secretaria de Estado da Educação</p>
          <p className="text-[12px]">Unidade Regional de Ensino de Araraquara</p>
          <p className="text-lg mt-1">{settings.name}</p>
          <p className="text-xs mt-3 border-t border-slate-300 pt-2 italic">
            {reportType === 'mensal' ? `Relatório de Frequência Mensal - Ref: ${selectedMonth}` : `Relatório Diário de Frequência - Data: ${format(parseISO(selectedDate), 'dd/MM/yyyy')}`}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Relatório</label>
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
              value={reportType}
              onChange={e => setReportType(e.target.value as any)}
            >
              <option value="mensal">Mensal (Resumo)</option>
              <option value="diario">Diário (Por Data)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filtrar por Turma</label>
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
              value={selectedTurma}
              onChange={e => setSelectedTurma(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {turmas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            {reportType === 'mensal' ? (
              <>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mês de Referência</label>
                <input 
                  type="month" 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data do Relatório</label>
                <input 
                  type="date" 
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </>
            )}
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-slate-700 rounded border-slate-300 focus:ring-slate-400 cursor-pointer"
                checked={onlyBolsaFamilia}
                onChange={e => setOnlyBolsaFamilia(e.target.checked)}
              />
              <span className="text-xs font-bold text-slate-600 uppercase group-hover:text-slate-900 transition-colors">Apenas Bolsa Família</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button 
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase text-xs shadow-md transition-all"
          >
            <Printer size={18} />
            Imprimir Relatório
          </button>
          <button 
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold uppercase text-xs shadow-md transition-all"
          >
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Table size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
              {onlyBolsaFamilia ? 'Relatório Bolsa Família' : 'Relatório Geral'} - {selectedTurma || 'Todas as Turmas'}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {reportType === 'mensal' ? `Mês: ${selectedMonth}` : `Data: ${format(parseISO(selectedDate), 'dd/MM/yyyy')}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b print:bg-white print:text-slate-900">
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Turma</th>
                {reportType === 'mensal' ? (
                  <th className="px-4 py-3 text-center">Frequência (%)</th>
                ) : (
                  <th className="px-4 py-3 text-center">Status</th>
                )}
                <th className="px-4 py-3 text-right">RA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const freq = calculateFrequencia(student.id);
                  const statusData = attendance.find(a => a.student_id === student.id && a.date === selectedDate);
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors print:hover:bg-transparent">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{student.numero}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 uppercase">{student.nome}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{student.rturma}</td>
                      <td className="px-4 py-3 text-center">
                        {reportType === 'mensal' ? (
                          <span className={`font-bold ${
                            freq >= 85 ? 'text-emerald-600' :
                            freq >= 75 ? 'text-amber-600' :
                            'text-rose-600'
                          }`}>
                            {freq}%
                          </span>
                        ) : (
                          <span className="font-bold uppercase text-slate-700">
                            {statusData ? statusData.status : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono text-xs">
                        {student.ra}-{student.dv}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ PARA IMPRESSÃO */}
        <div className="hidden print:block mt-20 pt-8 border-t border-slate-300">
          <div className="flex justify-between items-end text-[10px] text-slate-600 italic">
            <div>
              <p className="font-bold uppercase not-italic mb-1">{settings.name}</p>
              <p>{settings.address}, {settings.municipio} - {settings.uf}</p>
              <p>Emitido em: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
            <div className="text-center w-64 border-t border-slate-400 pt-2 not-italic">
              Assinatura do Diretor / Coordenador
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
