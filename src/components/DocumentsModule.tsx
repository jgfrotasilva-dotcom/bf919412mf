import React, { useState } from 'react';
import { FileText, Printer, Search, User } from 'lucide-react';
import { Student, AttendanceRecord, SchoolSettings } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentsModuleProps {
  students: Student[];
  attendance: AttendanceRecord[];
  settings: SchoolSettings;
}

export default function DocumentsModule({ students, settings, attendance }: DocumentsModuleProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [docType, setDocType] = useState('matricula');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados para Declaração de Comparecimento e Termo
  const [guardianName, setGuardianName] = useState('');
  const [guardianRG, setGuardianRG] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [reason, setReason] = useState('');
  const [termoResponsavel, setTermoResponsavel] = useState('');
  const [termoRG, setTermoRG] = useState('');

  const activeStudents = students.filter(s => s.situacao === 'Ativo');
  const filteredStudents = activeStudents.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ra.includes(searchTerm)
  );

  const student = activeStudents.find(s => s.id === selectedStudent);

  const calculateFrequencia = (studentId: string) => {
    const studentAttendance = attendance.filter(a => a.student_id === studentId);
    const presencas = studentAttendance.filter(a => a.status === 'P').length;
    const total = studentAttendance.length;
    return total > 0 ? Math.round((presencas / total) * 100) : 100;
  };

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
    <div className="mt-12 text-center">
      <div className="flex justify-center mb-8">
        <div className="w-64 border-t border-slate-400 pt-1">
          <p className="text-[10px] uppercase font-bold text-slate-500">Direção Escolar</p>
        </div>
      </div>
      <div className="text-[9px] text-slate-400 uppercase leading-tight pt-4 border-t border-slate-100">
        <p>{settings.address} - {settings.municipio}/{settings.uf}</p>
        <p>TEL: {settings.phone} | EMAIL: {settings.email}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-1 space-y-4 print:hidden">
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 uppercase text-sm border-b pb-2">Configuração do Documento</h3>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Buscar Aluno (Ativo)</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                className="w-full pl-8 p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Nome ou RA..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded p-1 space-y-1 bg-slate-50">
            {filteredStudents.map(s => (
              <button 
                key={s.id}
                onClick={() => setSelectedStudent(s.id)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${selectedStudent === s.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-200 text-slate-600'}`}
              >
                <User size={12} />
                <span className="truncate">{s.nome}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Documento</label>
            <select 
              className="w-full p-2 text-sm border rounded bg-white"
              value={docType}
              onChange={e => setDocType(e.target.value)}
            >
              <option value="matricula">Declaração de Matrícula</option>
              <option value="frequencia">Declaração de Frequência</option>
              <option value="comparecimento">Declaração de Comparecimento</option>
              <option value="responsabilidade">Termo de Responsabilidade</option>
            </select>
          </div>

          {docType === 'comparecimento' && (
            <div className="pt-2 border-t space-y-3">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase">Dados do Comparecimento</h4>
              <input type="text" placeholder="Nome do Responsável" className="w-full p-2 text-xs border rounded" value={guardianName} onChange={e => setGuardianName(e.target.value)} />
              <input type="text" placeholder="RG do Responsável" className="w-full p-2 text-xs border rounded" value={guardianRG} onChange={e => setGuardianRG(e.target.value)} />
              <div className="flex gap-2">
                <input type="time" title="Chegada" className="w-full p-2 text-xs border rounded" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} />
                <input type="time" title="Saída" className="w-full p-2 text-xs border rounded" value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
              </div>
              <textarea placeholder="Motivo do comparecimento..." className="w-full p-2 text-xs border rounded h-20" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          )}

          {docType === 'responsabilidade' && (
            <div className="pt-2 border-t space-y-3">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase">Dados do Responsável</h4>
              <input type="text" placeholder="Nome do Responsável" className="w-full p-2 text-xs border rounded" value={termoResponsavel} onChange={e => setTermoResponsavel(e.target.value)} />
              <input type="text" placeholder="RG do Responsável" className="w-full p-2 text-xs border rounded" value={termoRG} onChange={e => setTermoRG(e.target.value)} />
            </div>
          )}

          <button 
            onClick={() => window.print()}
            disabled={!selectedStudent}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-bold uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Printer size={16} />
            Imprimir Documento
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white p-12 shadow-2xl rounded-sm border min-h-[800px] flex flex-col mx-auto max-w-[800px] print:shadow-none print:p-0 print:border-none print:m-0 print:w-full">
          {student ? (
            <div className="flex-1 flex flex-col">
              {renderHeader()}
              
              <div className="flex-1 space-y-8 py-8 text-slate-800 leading-relaxed text-justify">
                <h4 className="text-lg font-bold uppercase text-center underline decoration-slate-300 underline-offset-8">
                  {docType === 'matricula' && 'Declaração de Matrícula'}
                  {docType === 'frequencia' && 'Declaração de Frequência'}
                  {docType === 'comparecimento' && 'Declaração de Comparecimento'}
                  {docType === 'responsabilidade' && 'Termo de Responsabilidade e Compromisso'}
                </h4>

                <div className="text-base space-y-6">
                  {docType === 'matricula' && (
                    <p className="indent-12">
                      Declaramos para os devidos fins que o(a) aluno(a) <strong>{student.nome}</strong>, 
                      portador(a) do RA <strong>{student.ra}-{student.dv}</strong>, nascido(a) em 
                      <strong> {student.datanascimento && student.datanascimento.length === 10 ? student.datanascimento : '___/___/___'}</strong>, 
                      encontra-se regularmente matriculado(a) nesta unidade escolar, cursando o(a) 
                      <strong> {student.rturma}</strong> no ano letivo de 2026.
                    </p>
                  )}

                  {docType === 'frequencia' && (
                    <p className="indent-12">
                      Declaramos para os devidos fins que o(a) aluno(a) <strong>{student.nome}</strong>, 
                      portador(a) do RA <strong>{student.ra}-{student.dv}</strong>, nascido(a) em 
                      <strong> {student.datanascimento && student.datanascimento.length === 10 ? student.datanascimento : '___/___/___'}</strong>, 
                      matriculado(a) no(a) <strong>{student.rturma}</strong>, apresenta até a presente data uma frequência escolar de 
                      <strong> {calculateFrequencia(student.id)}%</strong>, estando sua situação devidamente registrada 
                      em nosso sistema de controle pedagógico.
                    </p>
                  )}

                  {docType === 'comparecimento' && (
                    <div className="space-y-4">
                      <p className="indent-12">
                        Declaramos que o(a) Sr(a). <strong>{guardianName || '__________________________'}</strong>, 
                        portador(a) do RG <strong>{guardianRG || '____________'}</strong>, responsável pelo(a) aluno(a) 
                        <strong> {student.nome}</strong>, nascido(a) em <strong>{student.datanascimento && student.datanascimento.length === 10 ? student.datanascimento : '___/___/___'}</strong>, 
                        matriculado(a) no(a) <strong>{student.rturma}</strong>, compareceu a esta unidade escolar no dia 
                        <strong> {format(new Date(), 'dd/MM/yyyy')}</strong>, permanecendo das 
                        <strong> {arrivalTime || '__:__'}</strong> às <strong>{departureTime || '__:__'}</strong>.
                      </p>
                      <p><strong>Motivo do comparecimento:</strong> {reason || '____________________________________________________________________'}</p>
                    </div>
                  )}

                  {docType === 'responsabilidade' && (
                    <div className="space-y-4 text-base leading-relaxed text-slate-800">
                      <p className="indent-12">
                        Pelo presente instrumento, eu <strong>{termoResponsavel || '__________________________'}</strong>, 
                        portador(a) do RG nº <strong>{termoRG || '____________'}</strong>, 
                        responsável legal pelo(a) aluno(a) <strong>{student.nome}</strong>, nascido(a) em 
                        <strong>{student.datanascimento && student.datanascimento.length === 10 ? student.datanascimento : '___/___/___'}</strong>, 
                        matriculado(a) no(a) <strong>{student.rturma}</strong>, tomo ciência de que o(a) 
                        referido(a) discente apresenta uma frequência escolar de <strong>{calculateFrequencia(student.id)}%</strong>, 
                        índice este que se encontra abaixo do mínimo exigido pelo Programa Bolsa Família e pelas normas 
                        da Secretaria da Educação do Estado de São Paulo.
                      </p>
                      <p className="font-bold uppercase text-[10px] text-slate-500 bg-slate-50 p-2 rounded">Comprometo-me a:</p>
                      <ul className="list-disc ml-12 space-y-1">
                        <li>Garantir a presença diária do aluno às aulas;</li>
                        <li>Justificar imediatamente qualquer ausência através de atestado médico ou justificativa formal;</li>
                        <li>Comparecer à escola sempre que solicitado para acompanhamento pedagógico.</li>
                      </ul>
                      <p className="text-[10px] italic">Ciente de que o descumprimento deste termo pode acarretar na suspensão de benefícios sociais e acionamento da rede de proteção à criança e ao adolescente.</p>
                    </div>
                  )}
                </div>

                <div className="pt-12 text-right text-sm">
                  <p>{settings.municipio} - {settings.uf}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                </div>
              </div>

              {renderFooter()}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4 border-2 border-dashed border-slate-100 rounded-lg m-4">
              <FileText size={64} />
              <p className="font-bold uppercase text-xs tracking-widest text-center">
                Selecione um aluno ativo e o tipo de documento <br /> para visualizar a prévia
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1cm; size: A4; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
