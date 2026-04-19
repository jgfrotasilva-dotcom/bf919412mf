import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Student, AttendanceRecord, CalendarEvent, SchoolSettings } from '../types';

export function useSupabaseSync(
  setStudents: (data: Student[]) => void,
  setAttendance: (data: AttendanceRecord[]) => void,
  setEvents: (data: CalendarEvent[]) => void,
  setSettings: (data: SchoolSettings) => void
) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'idle'>('idle');
  const [dbError, setDbError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setDbStatus('idle');
      
      // Load Students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');
      
      if (studentsError) throw studentsError;
      if (studentsData && studentsData.length > 0) {
        setStudents(studentsData.map(s => ({
          ...s,
          datanascimento: s.datanascimento || s.dataNascimento || '' // Migration path
        })));
      }

      // Load Attendance
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*');
      
      if (attendanceError) throw attendanceError;
      if (attendanceData) {
        setAttendance(attendanceData);
      }

      // Load Calendar
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendar_events')
        .select('*');
      
      if (calendarError) throw calendarError;
      if (calendarData) {
        setEvents(calendarData);
      }

      // Load Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('school_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      
      if (settingsError) throw settingsError;
      if (settingsData) {
        setSettings(settingsData);
      }

      setDbStatus('connected');
    } catch (error: any) {
      console.error('Erro ao carregar do Supabase:', error);
      setDbStatus('error');
      setDbError(error.message);
    }
  }, [setStudents, setAttendance, setEvents, setSettings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const syncStudents = async (students: Student[]) => {
    setIsSyncing(true);
    try {
      const records = students.map(s => ({
        id: s.id,
        numero: s.numero,
        nome: s.nome,
        rturma: s.rturma,
        ra: s.ra,
        dv: s.dv,
        situacao: s.situacao,
        bolsafamilia: s.bolsafamilia,
        telefone: s.telefone,
        datanascimento: s.datanascimento,
        sexo: s.sexo
      }));

      const { error } = await supabase
        .from('students')
        .upsert(records);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sincronizar alunos:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAttendance = async (attendance: AttendanceRecord[]) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(attendance, { onConflict: 'student_id,date' });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sincronizar frequência:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncCalendar = async (events: CalendarEvent[]) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('calendar_events')
        .upsert(events, { onConflict: 'date' });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sincronizar calendário:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSettings = async (settings: SchoolSettings) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('school_settings')
        .upsert({ ...settings, id: 'default' });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao sincronizar configurações:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, dbStatus, dbError, syncStudents, syncAttendance, syncCalendar, syncSettings };
}
