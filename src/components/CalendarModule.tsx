import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Unlock, AlertCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from '../types';

interface CalendarModuleProps {
  events: CalendarEvent[];
  setEvents: (data: CalendarEvent[]) => void;
}

export default function CalendarModule({ events, setEvents }: CalendarModuleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [eventDetails, setEventDetails] = useState<{
    type: 'Feriado' | 'Ponto Facultativo';
    description: string;
  }>({
    type: 'Feriado',
    description: ''
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    if (isWeekend(date)) return;
    setSelectedDate(date);
    const existingEvent = events.find(e => e.date === format(date, 'yyyy-MM-dd'));
    if (existingEvent) {
      setEventDetails({ type: existingEvent.type, description: existingEvent.description });
    } else {
      setEventDetails({ type: 'Feriado', description: '' });
    }
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newEvent: CalendarEvent = {
      date: dateStr,
      type: eventDetails.type,
      description: eventDetails.description
    };

    const otherEvents = events.filter(e => e.date !== dateStr);
    setEvents([...otherEvents, newEvent]);
    setShowModal(false);
  };

  const handleRemoveEvent = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setEvents(events.filter(e => e.date !== dateStr));
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Calendário Escolar</h2>
            <p className="text-slate-400 text-xs uppercase font-semibold mt-1">Gestão de Feriados e Pontos Facultativos</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-lg border border-slate-600">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="hover:text-blue-400 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-bold min-w-[150px] text-center uppercase">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="hover:text-blue-400 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="bg-slate-50 p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
            {monthDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const event = events.find(e => e.date === dateStr);
              const isWeekendDay = isWeekend(day);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div 
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[100px] p-2 transition-all cursor-pointer relative
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-300'}
                    ${isWeekendDay ? 'bg-slate-50 cursor-not-allowed' : 'hover:bg-blue-50'}
                  `}
                >
                  <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {isWeekendDay && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <Lock size={40} />
                    </div>
                  )}

                  {event && (
                    <div className={`mt-2 p-1 rounded text-[9px] font-bold uppercase border ${
                      event.type === 'Feriado' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {event.type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-blue-600 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-blue-800 uppercase">Informação Importante</h4>
          <p className="text-xs text-blue-600 mt-1">
            Datas marcadas como Feriado ou Ponto Facultativo serão automaticamente desconsideradas no cálculo da frequência mensal dos alunos e bloqueadas para lançamento.
          </p>
        </div>
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold uppercase tracking-widest flex items-center gap-2">
                <Lock size={18} />
                Bloquear Data
              </h3>
              <button onClick={() => setShowModal(false)} className="text-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Configurando bloqueio para o dia: <span className="font-bold text-slate-800">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Bloqueio</label>
                <select 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={eventDetails.type}
                  onChange={e => setEventDetails({...eventDetails, type: e.target.value as any})}
                >
                  <option value="Feriado">Feriado</option>
                  <option value="Ponto Facultativo">Ponto Facultativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Independência do Brasil"
                  value={eventDetails.description}
                  onChange={e => setEventDetails({...eventDetails, description: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-between gap-3">
              <button 
                onClick={handleRemoveEvent}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold text-xs uppercase"
              >
                <Unlock size={16} />
                Remover Bloqueio
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 font-bold text-xs uppercase">Cancelar</button>
                <button onClick={handleSaveEvent} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
