import React, { useState, useEffect } from 'react';
import { Save, Calendar as CalendarIcon, Users, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { Student, AttendanceRecord, CalendarEvent } from '../types';
import { format, isWeekend, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceModuleProps {
  students: Student[];
  attendance: AttendanceRecord[];
  setAttendance: (data: AttendanceRecord[]) => void;
  events: CalendarEvent[];
}

export default function AttendanceModule({ students, attendance, setAttendance, events }: AttendanceModuleProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTurma, setSelectedTurma] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord[]>([]);

  const turmas = [...new Set(students.map(s => s.rturma))];

  useEffect(() => {
    if (!selectedDate || !selectedTurma) {
      setCurrentAttendance([]);
      return;
    }

    const studentsInTurma = students.filter(s => s.rturma === selectedTurma && s.situacao === 'Ativo');
    
    const existingRecords = attendance.filter(a => a.date === selectedDate);
    const studentIdsInTurma = studentsInTurma.map(s => s.id);
    const filteredRecords = existingRecords.filter(a => studentIdsInTurma.includes(a.student_id));

    if (filteredRecords.length > 0) {
      setCurrentAttendance(filteredRecords);
    } else {
      const newRecords = studentsInTurma.map(s => ({
        student_id: s.id,
        date: selectedDate,
        status: 'P' as const
      }));
      setCurrentAttendance(newRecords);
    }
  }, [selectedDate, selectedTurma, students, attendance]);

  const isBlocked = () => {
    const date = parseISO(selectedDate);
    if (isWeekend(date)) return 'Final de Semana';
    const event = events.find(e => e.date === selectedDate);
    if (event) return event.type;
    return null;
  };

  const updateStatus = (studentId: string, status: 'P' | 'F' | 'J') => {
    setCurrentAttendance(prev => 
      prev.map(a => a.student_id === studentId ? { ...a, status } : a)
    );
  };

  const handleSave = () => {
    const otherRecords = attendance.filter(a => a.date !== selectedDate || !currentAttendance.find(ca => ca.student_id === a.student_id));
    setAttendance([...otherRecords, ...currentAttendance]);
    alert('Frequência salva com sucesso!');
  };

  const blockedReason = isBlocked();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data da Frequência</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selecionar Turma</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select 
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={selectedTurma}
                onChange={e => setSelectedTurma(e.target.value)}
              >
                <option value="">Selecione uma turma...</option>
                {turmas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {blockedReason && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-semibold">Lançamento bloqueado: {blockedReason}</p>
          </div>
        )}
      </div>

      {selectedTurma && !blockedReason && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded font-bold">{selectedTurma}</span>
              <span className="text-sm font-medium">{format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
            </div>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm uppercase"
            >
              <Save size={18} />
              Salvar Frequência
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b">
                  <th className="px-6 py-3 w-16">Nº</th>
                  <th className="px-6 py-3">Aluno</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Bolsa Família</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students
                  .filter(s => s.rturma === selectedTurma && s.situacao === 'Ativo')
                  .sort((a, b) => a.numero - b.numero)
                  .map(student => {
                    const record = currentAttendance.find(a => a.student_id === student.id);
                    const status = record?.status || 'P';

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{student.numero}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{student.nome}</p>
                              <p className="text-[10px] text-slate-400">RA: {student.ra}-{student.dv}</p>
                            </div>
                            {student.whatsapp && status === 'F' && (
                              <button 
                                onClick={() => {
                                  const msg = `Olá ${student.parent_name || 'Sr(a). Responsável'}, informamos que o(a) aluno(a) ${student.nome} não compareceu à escola hoje, ${format(parseISO(selectedDate), "dd/MM/yyyy")}. Justifique a ausência para o acompanhamento do Bolsa Família.`;
                                  window.open(`https://wa.me/${student.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm"
                                title="Notificar Ausência via WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => updateStatus(student.id, 'P')}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${status === 'P' ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              title="Presente"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button 
                              onClick={() => updateStatus(student.id, 'F')}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${status === 'F' ? 'bg-red-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              title="Ausente"
                            >
                              <XCircle size={20} />
                            </button>
                            <button 
                              onClick={() => updateStatus(student.id, 'J')}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${status === 'J' ? 'bg-amber-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              title="Justificado"
                            >
                              <AlertCircle size={20} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.bolsafamilia && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                              Bolsa Família
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
