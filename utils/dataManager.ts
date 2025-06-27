import { BarracaoData, LoteData, MortalidadeEntry, EmbarqueEntry } from '../types';

// Generic localStorage helpers
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};

// Storage Keys
const BARRACAO_KEY = 'pigFarmBarracoes';
const LOTE_KEY = 'pigFarmLotes';
const MORTALIDADE_KEY = 'pigFarmMortalidades';
const EMBARQUE_KEY = 'pigFarmEmbarques';

// --- Barracão Management ---
export const getBarracoes = (): BarracaoData[] => getFromStorage<BarracaoData[]>(BARRACAO_KEY, []);
export const saveBarracoes = (barracoes: BarracaoData[]): void => saveToStorage(BARRACAO_KEY, barracoes);

// --- Lote Management ---
export const getLotes = (): LoteData[] => getFromStorage<LoteData[]>(LOTE_KEY, []);
export const saveLotes = (lotes: LoteData[]): void => saveToStorage(LOTE_KEY, lotes);

// --- Mortalidade Management ---
export const getMortalidades = (): MortalidadeEntry[] => getFromStorage<MortalidadeEntry[]>(MORTALIDADE_KEY, []);
export const saveMortalidades = (entries: MortalidadeEntry[]): void => saveToStorage(MORTALIDADE_KEY, entries);
export const addMortalidade = (entry: Omit<MortalidadeEntry, 'id'>): void => {
    const mortalities = getMortalidades();
    const newEntry = { ...entry, id: Date.now().toString() };
    saveMortalidades([newEntry, ...mortalities]);

    // Update lot quantity
    const lotes = getLotes();
    const updatedLotes = lotes.map(lote => {
        if (lote.id === entry.loteId) {
            return { ...lote, quantidadeAtual: lote.quantidadeAtual - entry.quantidade };
        }
        return lote;
    });
    saveLotes(updatedLotes);
};

// --- Embarque Management ---
export const getEmbarques = (): EmbarqueEntry[] => getFromStorage<EmbarqueEntry[]>(EMBARQUE_KEY, []);
export const saveEmbarques = (entries: EmbarqueEntry[]): void => saveToStorage(EMBARQUE_KEY, entries);
export const addEmbarque = (entry: Omit<EmbarqueEntry, 'id'>): void => {
    const embarques = getEmbarques();
    const newEntry = { ...entry, id: Date.now().toString() };
    saveEmbarques([newEntry, ...embarques]);

    // Update lot quantity
    const lotes = getLotes();
    const updatedLotes = lotes.map(lote => {
        if (lote.id === entry.loteId) {
            return { ...lote, quantidadeAtual: lote.quantidadeAtual - entry.quantidadeAnimais };
        }
        return lote;
    });
    saveLotes(updatedLotes);
};
