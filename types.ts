export enum TabId {
  Dashboard = 'dashboard', // Added Dashboard
  Racao = 'racao',
  Mortalidade = 'mortalidade',
  GPD = 'gpd',
  Barracoes = 'barracoes',
  Calendario = 'calendario',
  Rendimento = 'rendimento',
  OS = 'os',
  Contato = 'contato',
}

export type UserRole = 'admin' | 'client';

export interface AuthenticatedUser {
  username: string; 
  role: UserRole;
}

export interface SiloData {
  id: string; 
  capacidade: number;
  racaoAtual: number;
}

export interface BarracaoData {
  id: string; 
  machos: number;
  femeas: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  color: string;
}

export type OsPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type OsStatus = 'Aberto' | 'Em andamento' | 'Concluído';

export interface OrdemServico {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: OsPrioridade;
  status: OsStatus;
}

// Added for SidebarNav
export interface TabItem {
  id: TabId;
  label: string;
  icon?: string; // e.g., 'fas fa-tachometer-alt'
}