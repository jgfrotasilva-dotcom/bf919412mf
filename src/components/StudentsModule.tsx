import React, { useState } from 'react';
import { Upload, Plus, Trash2, Users, ArrowLeft, Edit2 } from 'lucide-react';
import { Student } from '../types';
import * as XLSX from 'xlsx';

interface StudentsModuleProps {
  students: Student[];
  setStudents: (data: Student[]) => void;
  onClearData: () => void;
}

export default function StudentsModule({ students, setStudents, onClearData }: StudentsModuleProps) {
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    nome: '',
    rturma: '',
    ra: '',
    dv: '',
    situacao: 'Ativo',
    bolsafamilia: false,
    telefone: '',
    whatsapp: '',
    parent_name: '',
    datanascimento: '',
    sexo: 'Masculino'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data.length === 0) return;

      // Função auxiliar para encontrar coluna independente de acentos/maiúsculas
      const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      
      const findCol = (row: any, target: string) => {
        const targetNorm = normalize(target);
        return Object.keys(row).find(key => normalize(key) === targetNorm || normalize(key).includes(targetNorm));
      };

      const importedStudents: Student[] = data.map((row: any) => {
        const bfKey = findCol(row, 'bolsafamilia') || findCol(row, 'bolsa');
        const turmaKey = findCol(row, 'rturma') || findCol(row, 'turma');
        const nomeKey = findCol(row, 'nome');
        const numeroKey = findCol(row, 'numero');
        const situacaoKey = findCol(row, 'situacao');
        const raKey = findCol(row, 'ra');
        const dvKey = findCol(row, 'dv');
        const telKey = findCol(row, 'telefone') || findCol(row, 'celular');
        const whatsappKey = findCol(row, 'whatsapp') || findCol(row, 'zap');
        const respKey = findCol(row, 'responsavel') || findCol(row, 'pai') || findCol(row, 'mae');
        const nascKey = findCol(row, 'nascimento') || findCol(row, 'data');
        const sexoKey = findCol(row, 'sexo');

        const rawBF = String(row[bfKey || ''] || '').trim().toUpperCase();
        const isBF = ['SIM', 'S', '1', 'TRUE', 'VERDADEIRO'].includes(rawBF);

        return {
          id: crypto.randomUUID(),
          numero: Number(row[numeroKey || '']) || 0,
          nome: String(row[nomeKey || ''] || '').toUpperCase(),
          rturma: String(row[turmaKey || ''] || 'SEM TURMA').toUpperCase(),
          ra: String(row[raKey || ''] || ''),
          dv: String(row[dvKey || ''] || ''),
          situacao: String(row[situacaoKey || ''] || '').toLowerCase().includes('inativo') ? 'Inativo' : 'Ativo',
          bolsafamilia: isBF,
          telefone: String(row[telKey || ''] || ''),
          whatsapp: String(row[whatsappKey || ''] || row[telKey || ''] || ''), // Tries whatsapp, then phone
          parent_name: String(row[respKey || ''] || '').toUpperCase(),
          datanascimento: String(row[nascKey || ''] || ''),
          sexo: String(row[sexoKey || ''] || '').toLowerCase().startsWith('f') ? 'Feminino' : 'Masculino'
        };
      });

      setStudents(importedStudents);
    };
    reader.readAsBinaryString(file);
  };

  const handleAddStudent = () => {
    if (!newStudent.nome || !newStudent.rturma) return;

    const studentsInTurma = students.filter(s => s.rturma === newStudent.rturma);
    const nextNumero = studentsInTurma.length > 0 
      ? Math.max(...studentsInTurma.map(s => s.numero)) + 1 
      : 1;

    const student: Student = {
      ...(newStudent as Student),
      id: crypto.randomUUID(),
      numero: nextNumero
    };

    setStudents([...students, student]);
    setShowAddModal(false);
    setNewStudent({
      nome: '',
      rturma: '',
      ra: '',
      dv: '',
      situacao: 'Ativo',
      bolsafamilia: false,
      telefone: '',
      whatsapp: '',
      parent_name: '',
      datanascimento: '',
      sexo: 'Masculino'
    });
  };

  const handleEditStudent = () => {
    if (!editingStudent) return;

    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
  };

  const turmas = [...new Set(students.map(s => s.rturma))].sort();

  if (selectedTurma) {
    const alunosTurma = students.filter(s => s.rturma === selectedTurma).sort((a, b) => a.numero - b.numero);
    
    return (
      <div className="space-y-4">
        <div className="sticky top-0 z-20 bg-white p-4 border rounded-xl shadow-md flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedTurma(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
              Turma: {selectedTurma}
            </h2>
          </div>
          
          <button 
            onClick={() => {
              setNewStudent({ ...newStudent, rturma: selectedTurma });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-bold uppercase text-sm shadow-sm"
          >
            <Plus size={18} />
            Novo Aluno
          </button>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nº</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Situação</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Bolsa Família</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alunosTurma.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{aluno.numero}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{aluno.nome}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      aluno.situacao === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {aluno.situacao}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {aluno.bolsafamilia ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">Sim</span>
                    ) : (
                      <span className="text-gray-400 text-xs uppercase">Não</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingStudent(aluno)}
                        className="p-1 hover:text-blue-600 transition-colors"
                        title="Editar Aluno"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setStudents(students.filter(s => s.id !== aluno.id))}
                        className="p-1 hover:text-red-600 transition-colors"
                        title="Excluir Aluno"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {alunosTurma.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                    Nenhum aluno encontrado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAddModal && renderAddModal()}
        {editingStudent && renderEditModal()}
      </div>
    );
  }

  function renderEditModal() {
    if (!editingStudent) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest">Editar Aluno</h3>
            <button onClick={() => setEditingStudent(null)} className="hover:bg-white/20 p-1 rounded">✕</button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                value={editingStudent.numero}
                disabled
              />
              <p className="text-[10px] text-gray-400 mt-1">Número do aluno não pode ser alterado</p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={editingStudent.nome}
                onChange={e => setEditingStudent({...editingStudent, nome: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turma</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={editingStudent.rturma}
                onChange={e => setEditingStudent({...editingStudent, rturma: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RA (com dígito)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-2 border rounded"
                  value={editingStudent.ra}
                  onChange={e => setEditingStudent({...editingStudent, ra: e.target.value})}
                />
                <input 
                  type="text" 
                  className="w-12 p-2 border rounded text-center"
                  maxLength={1}
                  value={editingStudent.dv}
                  onChange={e => setEditingStudent({...editingStudent, dv: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                value={editingStudent.datanascimento}
                onChange={e => setEditingStudent({...editingStudent, datanascimento: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Responsável</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={editingStudent.parent_name}
                onChange={e => setEditingStudent({...editingStudent, parent_name: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={editingStudent.telefone}
                onChange={e => setEditingStudent({...editingStudent, telefone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={editingStudent.whatsapp}
                onChange={e => setEditingStudent({...editingStudent, whatsapp: e.target.value})}
                placeholder="Ex: 5516999999999"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sexo</label>
              <select 
                className="w-full p-2 border rounded"
                value={editingStudent.sexo}
                onChange={e => setEditingStudent({...editingStudent, sexo: e.target.value as any})}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="bf-edit" 
                className="w-4 h-4"
                checked={editingStudent.bolsafamilia}
                onChange={e => setEditingStudent({...editingStudent, bolsafamilia: e.target.checked})}
              />
              <label htmlFor="bf-edit" className="text-sm font-semibold text-gray-700">Beneficiário Bolsa Família</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <select 
                className="w-full p-2 border rounded"
                value={editingStudent.situacao}
                onChange={e => setEditingStudent({...editingStudent, situacao: e.target.value as any})}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <label className="text-sm font-semibold text-gray-700">Situação</label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button 
              onClick={() => setEditingStudent(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleEditStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold uppercase"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest">Cadastrar Novo Aluno</h3>
            <button onClick={() => setShowAddModal(false)} className="hover:bg-white/20 p-1 rounded">✕</button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={newStudent.nome}
                onChange={e => setNewStudent({...newStudent, nome: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turma</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={newStudent.rturma}
                onChange={e => setNewStudent({...newStudent, rturma: e.target.value.toUpperCase()})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RA (com dígito)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-2 border rounded"
                  value={newStudent.ra}
                  onChange={e => setNewStudent({...newStudent, ra: e.target.value})}
                />
                <input 
                  type="text" 
                  className="w-12 p-2 border rounded text-center"
                  maxLength={1}
                  value={newStudent.dv}
                  onChange={e => setNewStudent({...newStudent, dv: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                value={newStudent.datanascimento}
                onChange={e => setNewStudent({...newStudent, datanascimento: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Responsável</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                value={newStudent.parent_name}
                onChange={e => setNewStudent({...newStudent, parent_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={newStudent.telefone}
                onChange={e => setNewStudent({...newStudent, telefone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={newStudent.whatsapp}
                onChange={e => setNewStudent({...newStudent, whatsapp: e.target.value})}
                placeholder="Ex: 5516999999999"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sexo</label>
              <select 
                className="w-full p-2 border rounded"
                value={newStudent.sexo}
                onChange={e => setNewStudent({...newStudent, sexo: e.target.value as any})}
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="bf" 
                className="w-4 h-4"
                checked={newStudent.bolsafamilia}
                onChange={e => setNewStudent({...newStudent, bolsafamilia: e.target.checked})}
              />
              <label htmlFor="bf" className="text-sm font-semibold text-gray-700">Beneficiário Bolsa Família</label>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button 
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold uppercase"
            >
              Gravar Aluno
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Gestão de Alunos
          </h2>
          <p className="text-sm text-gray-500">Importe planilhas ou cadastre novos alunos manualmente.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {students.length === 0 ? (
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors font-semibold text-sm uppercase">
              <Upload size={18} />
              <span>Importar Excel</span>
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-semibold text-sm uppercase border cursor-not-allowed" title="Dados já importados. Limpe os dados para importar novamente.">
              <Upload size={18} />
              <span>Importar Excel</span>
            </div>
          )}

          <button 
            onClick={() => {
              if(confirm('Tem certeza que deseja apagar TODOS os alunos e frequências?')) {
                onClearData();
              }
            }}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors font-semibold text-sm uppercase border border-red-100"
          >
            <Trash2 size={18} />
            Limpar Dados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas.map((turma, idx) => {
          const alunosTurma = students.filter(s => s.rturma === turma);
          const ativos = alunosTurma.filter(s => s.situacao === 'Ativo').length;
          const inativos = alunosTurma.filter(s => s.situacao === 'Inativo').length;
          const bf = alunosTurma.filter(s => s.bolsafamilia).length;

          const colors = [
            'border-blue-500 bg-blue-50',
            'border-purple-500 bg-purple-50',
            'border-emerald-500 bg-emerald-50',
            'border-amber-500 bg-amber-50',
            'border-rose-500 bg-rose-50',
            'border-indigo-500 bg-indigo-50'
          ];
          const colorClass = colors[idx % colors.length];

          return (
            <div 
              key={turma} 
              onClick={() => setSelectedTurma(turma)}
              className={`p-6 rounded-xl border-t-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                {turma}
                <span className="bg-white/50 px-2 py-1 rounded text-xs font-mono">{alunosTurma.length}</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-gray-500 text-[10px] uppercase font-bold">Ativos</p>
                  <p className="text-green-600 font-bold">{ativos}</p>
                </div>
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-gray-500 text-[10px] uppercase font-bold">Inativos</p>
                  <p className="text-red-600 font-bold">{inativos}</p>
                </div>
                <div className="bg-white p-2 rounded border border-gray-100 col-span-2">
                  <p className="text-gray-500 text-[10px] uppercase font-bold text-center">Bolsa Família</p>
                  <p className="text-purple-600 font-bold text-center">{bf}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && renderAddModal()}
    </div>
  );
}
