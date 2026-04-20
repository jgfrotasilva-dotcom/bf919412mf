import React, { useState } from 'react';
import { Search, Printer, FileText, Info, Eye, MessageCircle } from 'lucide-react';
import { Student, AttendanceRecord, SchoolSettings } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { CalendarEvent } from '../types';

interface AssessmentModuleProps {
  students: Student[];
  attendance: AttendanceRecord[];
  calendarEvents: CalendarEvent[];
  settings: SchoolSettings;
}

export default function AssessmentModule({ students, attendance, calendarEvents, settings }: AssessmentModuleProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedTurma, setSelectedTurma] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const turmas = [...new Set(students.map(s => s.rturma))];
  const activeStudents = students.filter(s => s.situacao === 'Ativo');

  // Calcula quantos dias letivos foram lançados no mês para a turma selecionada
  const getDiasLancados = () => {
    if (!selectedTurma) return 0;
    const alunosDaTurma = students.filter(s => s.rturma === selectedTurma);
    const idsAlunos = alunosDaTurma.map(s => s.id);
    const lancamentosTurma = attendance.filter(a => 
      idsAlunos.includes(a.student_id) && a.date.startsWith(selectedMonth)
    );
    
    // Pega as datas únicas que tiveram algum lançamento para esta turma
    const datasUnicas = [...new Set(lancamentosTurma.map(a => a.date))];
    return datasUnicas.length;
  };

  const calculateFrequencia = (studentId: string) => {
    const start = startOfMonth(parseISO(selectedMonth + '-01'));
    const end = endOfMonth(start);
    
    // Filtrar dias letivos (não é final de semana e não é feriado no calendário)
    const diasLetivos = eachDayOfInterval({ start, end }).filter(day => {
      const isDayWeekend = isWeekend(day);
      const dateStr = format(day, 'yyyy-MM-dd');
      const isHoliday = calendarEvents.some(e => e.date === dateStr && e.type === 'Feriado');
      return !isDayWeekend && !isHoliday;
    });
    
    const studentAttendance = attendance.filter(a => 
      a.student_id === studentId && 
      a.date.startsWith(selectedMonth)
    );

    // Se não houver nenhum lançamento para o aluno no mês, retorna 0% (Frequência Fantasma removida)
    if (studentAttendance.length === 0) return 0;

    const presencas = studentAttendance.filter(a => a.status === 'P').length;
    const totalDiasLetivos = diasLetivos.length;
    
    const result = Math.round((presencas / totalDiasLetivos) * 100);
    return Math.min(100, Math.max(0, result));
  };

  const getEscala = (porcentagem: number) => {
    if (porcentagem >= 85) return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Adequada', icon: '🟢', action: 'Monitoramento apenas' };
    if (porcentagem >= 75) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Atenção', icon: '🟡', action: 'Contato leve (mensagem/bilhete)' };
    if (porcentagem >= 60) return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Alerta', icon: '🟠', action: 'Contato formal + registro' };
    return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Crítico', icon: '🔴', action: 'Busca ativa imediata' };
  };

  const filteredStudents = activeStudents
    .filter(s => selectedTurma && s.rturma === selectedTurma)
    .filter(s => !searchTerm || s.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(s => ({ ...s, frequencia: calculateFrequencia(s.id) }))
    .sort((a, b) => (a.numero || 0) - (b.numero || 0));

  const diasLancadosCount = getDiasLancados();

  const [showTermoModal, setShowTermoModal] = useState<string | null>(null);
  const [termoResponsavel, setTermoResponsavel] = useState('');
  const [termoRG, setTermoRG] = useState('');

  const renderHeader = () => (
    <div className="relative flex flex-col items-center justify-center border-b-2 border-slate-900 pb-4 mb-6 text-center min-h-[100px]">
      {settings.logo && (
        <div className="absolute left-0 top-0">
          <img src={settings.logo} alt="Escola Logo" className="w-24 h-24 object-contain" />
        </div>
      )}
      <div className="uppercase font-bold text-slate-900 leading-tight">
        <p className="text-[12px]">Governo do Estado de São Paulo</p>
        <p className="text-[12px]">Secretaria de Estado da Educação</p>
        <p className="text-[12px]">Unidade Regional de Ensino de Araraquara</p>
        <p className="text-lg mt-2">{settings.name}</p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-12">
      {/* ASSINATURAS DUPLAS - TERMO DE RESPONSABILIDADE */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
        {/* RESPONSÁVEL PELO ALUNO - ESQUERDA */}
        <div className="text-center w-full md:w-5/12">
          <div className="border-t-2 border-slate-800 pt-4">
            <p className="text-sm font-bold text-slate-800">
              {termoResponsavel || '_________________________________'}
            </p>
            <p className="text-sm text-slate-700">
              RG: {termoRG || '_____________________'}
            </p>
            <p className="text-xs mt-3 text-slate-600 font-semibold">
              RESPONSÁVEL PELO ALUNO
            </p>
          </div>
        </div>
        
        {/* DIREÇÃO ESCOLAR - DIREITA */}
        <div className="text-center w-full md:w-5/12">
          <div className="border-t-2 border-slate-800 pt-4">
            <p className="text-sm font-bold text-slate-800">
              {settings.name || '_________________________________'}
            </p>
            <p className="text-xs mt-3 text-slate-600 font-semibold">
              DIREÇÃO ESCOLAR
            </p>
          </div>
        </div>
      </div>
      
      {/* RODAPÉ COM ENDEREÇO */}
      <div className="text-[9px] text-slate-400 uppercase leading-tight pt-4 border-t border-slate-100 text-center">
        <p>{settings.address} - {settings.municipio}/{settings.uf}</p>
        <p>TEL: {settings.phone} | EMAIL: {settings.email}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showTermoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-[800px] max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl print:shadow-none print:max-h-none print:rounded-none">
            <div className="p-4 bg-slate-100 border-b flex justify-between items-center print:hidden">
              <h3 className="font-bold uppercase text-sm text-slate-700">Prévia do Termo de Responsabilidade</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs uppercase flex items-center gap-2"
                >
                  <Printer size={14} /> Imprimir
                </button>
                <button onClick={() => {
                  setShowTermoModal(null);
                  setTermoResponsavel('');
                  setTermoRG('');
                }} className="text-slate-500 hover:text-slate-800">✕</button>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border-b grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <div>
                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Nome do Responsável</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-xs border rounded bg-white"
                  placeholder="Nome completo..."
                  value={termoResponsavel}
                  onChange={e => setTermoResponsavel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">RG do Responsável</label>
                <input 
                  type="text" 
                  className="w-full p-2 text-xs border rounded bg-white"
                  placeholder="RG..."
                  value={termoRG}
                  onChange={e => setTermoRG(e.target.value)}
                />
              </div>
            </div>

            <div className="p-12 print:p-0">
              {renderHeader()}
              <div className="space-y-8 py-8 text-slate-800 leading-relaxed text-justify">
                <h4 className="text-lg font-bold uppercase text-center underline decoration-slate-300 underline-offset-8">
                  Termo de Responsabilidade e Compromisso
                </h4>
                <div className="text-base space-y-6">
                  {(() => {
                    const student = students.find(s => s.id === showTermoModal);
                    if (!student) return null;
                    const freq = calculateFrequencia(student.id);
                    return (
                      <div className="space-y-6">
                        <p className="indent-12">
                          Pelo presente instrumento, eu <strong>{termoResponsavel || '__________________________________________________'}</strong>, 
                          portador(a) do RG nº <strong>{termoRG || '____________'}</strong>, 
                          responsável legal pelo(a) aluno(a) <strong>{student.nome}</strong>, tomo ciência de que o(a) 
                          referido(a) discente apresenta uma frequência escolar de <strong>{freq}%</strong>, 
                          índice este que se encontra abaixo do mínimo exigido pelo Programa Bolsa Família e pelas normas 
                          da Secretaria da Educação do Estado de São Paulo no mês de <strong>{format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })}</strong>.
                        </p>
                        <p className="font-bold uppercase text-[10px] text-slate-500 bg-slate-50 p-2 rounded">Comprometo-me a:</p>
                        <ul className="list-disc ml-12 space-y-1">
                          <li>Garantir a presença diária do aluno às aulas;</li>
                          <li>Justificar imediatamente qualquer ausência através de atestado médico ou justificativa formal;</li>
                          <li>Comparecer à escola sempre que solicitado para acompanhamento pedagógico.</li>
                        </ul>
                        <p className="text-[10px] italic">Ciente de que o descumprimento deste termo pode acarretar na suspensão de benefícios sociais e acionamento da rede de proteção à criança e ao adolescente.</p>
                        <div className="pt-4 text-right">
                          <p>{settings.municipio} - {settings.uf}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {renderFooter()}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mês de Referência</label>
          <input 
            type="month" 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Turma</label>
          <select 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedTurma}
            onChange={e => setSelectedTurma(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar Aluno</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="font-bold uppercase tracking-widest flex items-center gap-2">
              <Info size={20} />
              Escala Inteligente de Frequência
            </h3>
            {selectedTurma && (
              <span className="text-[10px] text-blue-300 font-bold uppercase mt-1">
                Dias Letivos Lançados no Mês: {diasLancadosCount}
              </span>
            )}
          </div>
          <span className="text-xs font-mono uppercase opacity-70">
            {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })}
          </span>
        </div>

        <div className="overflow-x-auto">
          {!selectedTurma ? (
            <div className="p-20 text-center">
              <Info className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium italic">Selecione uma turma acima para visualizar a apuração de frequência.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b">
                  <th className="px-6 py-3 w-16">Nº</th>
                  <th className="px-6 py-3">Aluno / Turma</th>
                  <th className="px-6 py-3 text-center">Frequência</th>
                  <th className="px-6 py-3">Situação / Ação Recomendada</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => {
                  const escala = getEscala(student.frequencia);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                          {String(student.numero || '--').padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-sm uppercase">{student.nome}</p>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] bg-slate-100 px-1 rounded font-semibold text-slate-500">{student.rturma}</span>
                          {student.bolsafamilia && <span className="text-[9px] text-purple-600 font-bold uppercase tracking-tighter">Bolsa Família</span>}
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs ${
                          student.frequencia >= 85 ? 'border-green-500 text-green-700' :
                          student.frequencia >= 75 ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }`}>
                          {student.frequencia}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${escala.color}`}>
                        <span>{escala.icon}</span>
                        <span>{escala.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{escala.action}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {student.whatsapp && student.frequencia < 85 && (
                          <button 
                            onClick={() => {
                              const msg = `Olá ${student.parent_name || 'Sr(a). Responsável'}, notamos que a frequência de ${student.nome} está em ${student.frequencia}% este mês. Solicitamos o comparecimento à escola para evitar o risco de descumprimento do Bolsa Família.`;
                              window.open(`https://wa.me/${student.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Notificar Responsável via WhatsApp"
                          >
                            <MessageCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => setShowDetails(student.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Detalhes Diários"
                        >
                          <Eye size={18} />
                        </button>
                        {student.frequencia < 75 && (
                          <button 
                            onClick={() => setShowTermoModal(student.id)}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Gerar Termo de Responsabilidade"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold uppercase text-sm">Histórico de Frequência</h3>
                <p className="text-[10px] opacity-70">
                  {activeStudents.find(s => s.id === showDetails)?.nome}
                </p>
              </div>
              <button onClick={() => setShowDetails(null)} className="text-xl">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-1">
                {eachDayOfInterval({
                  start: startOfMonth(parseISO(selectedMonth + '-01')),
                  end: endOfMonth(parseISO(selectedMonth + '-01'))
                }).map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const record = attendance.find(a => a.student_id === showDetails && a.date === dateStr);
                  const isDayWeekend = isWeekend(day);
                  const calendarEvent = calendarEvents.find(e => e.date === dateStr);
                  const isBlocked = calendarEvent && (calendarEvent.type === 'Feriado' || calendarEvent.type === 'Ponto Facultativo');

                  return (
                    <div key={dateStr} className={`flex items-center justify-between p-2 rounded ${
                      isDayWeekend ? 'bg-slate-50' : 
                      isBlocked ? 'bg-amber-50' : 
                      'bg-white border-b border-slate-100'
                    }`}>
                      <span className={`text-xs ${
                        isDayWeekend ? 'text-slate-300' : 
                        isBlocked ? 'text-amber-700 font-semibold' : 
                        'text-slate-600'
                      }`}>
                        {format(day, "dd/MM (EEEE)", { locale: ptBR })}
                      </span>
                      {isDayWeekend ? (
                        <span className="text-[10px] text-slate-300 uppercase font-bold italic">Fim de Semana</span>
                      ) : isBlocked ? (
                        <span className="text-[10px] text-amber-700 uppercase font-bold italic">
                          Bloqueado - {calendarEvent.type === 'Feriado' ? 'Feriado' : 'Ponto Facultativo'}
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          {record ? (
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                              record.status === 'P' ? 'bg-green-100 text-green-700' :
                              record.status === 'F' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {record.status}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sem registro</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setShowDetails(null)}
                className="bg-slate-800 text-white px-6 py-2 rounded font-bold text-xs uppercase"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
