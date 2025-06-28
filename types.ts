
export enum TabId {
  Dashboard = 'dashboard',
  Racao = 'racao',
  Mortalidade = 'mortalidade',
  GPD = 'gpd',
  Barracoes = 'barracoes',
  Calendario = 'calendario',
  Rendimento = 'rendimento',
  OS = 'os',
  Contato = 'contato',
  Embarques = 'embarques', // Added
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

// Simplified BarracaoData
export interface BarracaoData {
  id: string; 
  nome: string;
}

// New: Represents a batch of pigs
export interface LoteData {
  id: string;
  barracaoId: string;
  nome: string; // e.g., "Lote 2024-07-A"
  dataEntrada: string; // YYYY-MM-DD
  idadeInicial: number; // in days
  pesoInicial: number; // in kg
  quantidadeInicial: number;
  quantidadeAtual: number;
  sexo: 'macho' | 'fêmea' | 'misto';
}

// New: Represents a mortality log entry
export interface MortalidadeEntry {
  id: string;
  loteId: string;
  data: string; // YYYY-MM-DD
  quantidade: number;
  causa?: string;
}

// New: Represents a shipment log entry
export interface EmbarqueEntry {
  id: string;
  loteId: string;
  data: string; // YYYY-MM-DD
  quantidadeAnimais: number;
  quantidadeCaminhoes: number;
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

export interface TabItem {
  id: TabId;
  label: string;
  icon?: string; 
}

export interface ActivityLogItem {
  id: string;
  timestamp: string; // ISO string
  description: string;
  icon?: string;
  type: 'os' | 'event' | 'barracao' | 'generic' | 'lote' | 'mortalidade' | 'embarque'; // Added new types
  userId?: string; // Optional: to associate activity with a user
}
