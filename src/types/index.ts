export interface Student {
  id: string;
  numero: number;
  nome: string;
  rturma: string;
  ra: string;
  dv: string;
  situacao: 'Ativo' | 'Inativo';
  bolsafamilia: boolean;
  telefone: string;
  whatsapp: string;
  parent_name: string;
  datanascimento: string;
  sexo: 'Masculino' | 'Feminino';
}

export interface AttendanceRecord {
  id?: string;
  student_id: string;
  date: string;
  status: 'P' | 'F' | 'J';
}

export interface CalendarEvent {
  id?: string;
  date: string;
  type: 'Feriado' | 'Ponto Facultativo';
  description: string;
}

export interface SchoolSettings {
  id: string;
  name: string;
  address: string;
  municipio: string;
  uf: string;
  phone: string;
  email: string;
  logo: string;
}
