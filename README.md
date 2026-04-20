# Busca Ativa - Sistema de Gestão Escolar e Bolsa Família

## 📌 Visão Geral
O **Busca Ativa** é uma plataforma web sofisticada desenvolvida para otimizar a gestão da frequência escolar e o monitoramento da elegibilidade de alunos no Programa Bolsa Família. O sistema combina uma interface administrativa de alto nível com inteligência de dados para garantir que nenhum aluno perca seu direito à educação e aos benefícios sociais por falta de acompanhamento.

## 🚀 Objetivos do Sistema
- **Monitoramento Preventivo**: Identificar alunos em risco de descumprimento de frequência antes que ocorra a suspensão de benefícios.
- **Busca Ativa Social**: Facilitar a intervenção pedagógica imediata através da geração de Termos de Responsabilidade.
- **Eficiência Administrativa**: Automatizar a emissão de declarações escolares e relatórios de frequência.
- **Integração na Nuvem**: Garantir a persistência e segurança dos dados através do Supabase.

## 🛠️ Módulos do Sistema

### 📊 Dashboard
Visão geral e estratégica com quantitativos de alunos (Ativos, Inativos e Bolsa Família), além de gráficos de média de frequência e alertas de casos críticos.

### 📅 Calendário Escolar
Gestão de dias letivos com bloqueio automático de finais de semana e marcação de feriados/pontos facultativos, garantindo a precisão dos cálculos de frequência.

### 👥 Gestão de Alunos
- Importação de planilhas Excel (.xlsx) com mapeamento inteligente de colunas.
- Agrupamento automático por turmas em cards coloridos.
- Cadastro manual com numeração sequencial automática e botão fixo no topo.

### 📝 Digitação de Frequência
- Interface otimizada para lançamentos diários (Padrão: Presente), com bloqueios inteligentes baseados no calendário e sincronização em tempo real.
- **Notificação de Ausência Imediata**: Botão integrado para envio de mensagem via WhatsApp aos responsáveis no exato momento do lançamento de uma falta.

### 🔍 Apuração (Escala Inteligente)
Classificação automática dos alunos em quatro níveis de risco:
- 🟢 **Adequada (85-100%)**: Situação regular.
- 🟡 **Atenção (75-84%)**: Risco de descumprimento - Alerta preventivo.
- 🟠 **Alerta (60-74%)**: Situação preocupante - Contato formal.
- 🔴 **Crítico (< 60%)**: Alto risco social - Busca Ativa imediata.
- **Busca Ativa via WhatsApp**: Envio de mensagens de alerta personalizadas baseadas no percentual de frequência mensal do aluno.

### 📄 Documentos Escolares
Gerador de documentos com cabeçalho oficial centralizado e logo à esquerda:
- Declaração de Matrícula
- Declaração de Frequência
- Declaração de Comparecimento (com dados do responsável e horários)
- Termo de Responsabilidade (com Nome e RG do responsável)

### 📈 Relatórios
- Relatórios Mensais de Frequência.
- Relatórios Diários por Turma.
- Filtro específico para o Programa Bolsa Família.
- Exportação para Excel e impressão formatada.

## ⚙️ Configuração do Banco de Dados (Supabase)
Para o funcionamento pleno da sincronização, execute o seguinte script no seu SQL Editor:

```sql
create table students (
  id uuid primary key default uuid_generate_v4(),
  numero integer,
  nome text,
  rturma text,
  ra text,
  dv text,
  situacao text default 'Ativo',
  bolsafamilia boolean default false,
  telefone text,
  whatsapp text,
  parent_name text,
  datanascimento text,
  sexo text,
  created_at timestamp with time zone default now()
);

create table attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  date text,
  status text,
  created_at timestamp with time zone default now(),
  unique(student_id, date)
);

create table calendar_events (
  id uuid primary key default uuid_generate_v4(),
  date text unique,
  type text,
  description text,
  created_at timestamp with time zone default now()
);

create table school_settings (
  id text primary key,
  name text,
  address text,
  municipio text,
  uf text,
  phone text,
  email text,
  logo text,
  updated_at timestamp with time zone default now()
);

alter table students disable row level security;
alter table attendance disable row level security;
alter table calendar_events disable row level security;
alter table school_settings disable row level security;
```

## 🎨 Identidade Visual e UX
- **Estilo**: Slate-50 Professional Theme (Cinza sedoso e Branco).
- **Responsividade**: 100% compatível com dispositivos móveis (Celulares e Tablets).
- **Navegação**: Menu lateral sofisticado com transições suaves.
- **Impressão**: Layouts otimizados que removem menus e botões, focando apenas no documento oficial.

---
**Busca Ativa - Desenvolvido com excelência para a educação pública.**
