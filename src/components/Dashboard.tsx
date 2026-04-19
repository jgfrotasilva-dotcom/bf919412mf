import React from 'react';
import { Users, UserCheck, UserX, TrendingUp, AlertTriangle } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export default function Dashboard({ students, attendance }: DashboardProps) {
  const activeStudents = students.filter(s => s.situacao === 'Ativo');
  const inactiveStudents = students.filter(s => s.situacao === 'Inativo');
  const bfStudents = students.filter(s => s.bolsafamilia);

  // Calcula frequência média geral
  const totalPresencas = attendance.filter(a => a.status === 'P').length;
  const totalRegistros = attendance.length;
  const frequenciaMedia = totalRegistros > 0 ? (totalPresencas / totalRegistros) * 100 : 0;

  // Alunos em risco (Busca Ativa)
  const alunosPorcentagem = activeStudents.map(student => {
    const studentAttendance = attendance.filter(a => a.student_id === student.id);
    const presencas = studentAttendance.filter(a => a.status === 'P').length;
    const total = studentAttendance.length;
    const porcentagem = total > 0 ? (presencas / total) * 100 : 100;
    return { ...student, porcentagem };
  });

  const emRisco = alunosPorcentagem.filter(s => s.porcentagem < 75).length;

  const stats = [
    { label: 'Total de Alunos', value: students.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Alunos Ativos', value: activeStudents.length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Bolsa Família', value: bfStudents.length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Busca Ativa', value: emRisco, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  // Dados para o gráfico de turmas
  const turmas = [...new Set(activeStudents.map(s => s.rturma))];
  const chartData = turmas.map(turma => {
    const alunosTurma = activeStudents.filter(s => s.rturma === turma);
    const idsAlunos = alunosTurma.map(s => s.id);
    const attTurma = attendance.filter(a => idsAlunos.includes(a.student_id));
    const presencas = attTurma.filter(a => a.status === 'P').length;
    const total = attTurma.length;
    const media = total > 0 ? Math.round((presencas / total) * 100) : 0;
    return { name: turma, media };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Frequência Média por Turma</h3>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} unit="%" />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="media" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.media >= 85 ? '#22c55e' : entry.media >= 75 ? '#eab308' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 italic">
                Aguardando dados de frequência...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">Indicadores de Desempenho</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Frequência Geral</span>
                <span className={`text-sm font-bold ${frequenciaMedia >= 85 ? 'text-green-600' : 'text-amber-600'}`}>
                  {Math.round(frequenciaMedia)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${frequenciaMedia >= 85 ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${frequenciaMedia}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Resumo Bolsa Família</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-md border border-slate-100">
                  <p className="text-xl font-bold text-slate-700">{bfStudents.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Elegíveis</p>
                </div>
                <div className="text-center p-3 bg-white rounded-md border border-slate-100">
                  <p className="text-xl font-bold text-green-600">
                    {activeStudents.length > 0 ? Math.round((bfStudents.length / activeStudents.length) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Participação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
