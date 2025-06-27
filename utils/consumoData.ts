export interface ConsumoReferenceItem {
  ageRangeStart: number;
  ageRangeEnd: number;
  consumoDiarioKg: number; // Average daily consumption in kilograms
}

// Tabela de Consumo de Ração por Idade (em kg)
export const CONSUMO_REFERENCE_TABLE: ConsumoReferenceItem[] = [
  { ageRangeStart: 15, ageRangeEnd: 21, consumoDiarioKg: 0.25 },
  { ageRangeStart: 21, ageRangeEnd: 28, consumoDiarioKg: 0.40 },
  { ageRangeStart: 28, ageRangeEnd: 35, consumoDiarioKg: 0.60 },
  { ageRangeStart: 35, ageRangeEnd: 42, consumoDiarioKg: 0.80 },
  { ageRangeStart: 42, ageRangeEnd: 49, consumoDiarioKg: 1.00 },
  { ageRangeStart: 49, ageRangeEnd: 56, consumoDiarioKg: 1.20 },
  { ageRangeStart: 56, ageRangeEnd: 63, consumoDiarioKg: 1.40 },
  { ageRangeStart: 63, ageRangeEnd: 70, consumoDiarioKg: 1.60 },
  { ageRangeStart: 70, ageRangeEnd: 77, consumoDiarioKg: 1.80 },
  { ageRangeStart: 77, ageRangeEnd: 84, consumoDiarioKg: 2.00 },
  { ageRangeStart: 84, ageRangeEnd: 91, consumoDiarioKg: 2.20 },
  { ageRangeStart: 91, ageRangeEnd: 98, consumoDiarioKg: 2.40 },
  { ageRangeStart: 98, ageRangeEnd: 105, consumoDiarioKg: 2.50 },
  { ageRangeStart: 105, ageRangeEnd: 112, consumoDiarioKg: 2.60 },
  { ageRangeStart: 112, ageRangeEnd: 119, consumoDiarioKg: 2.70 },
  { ageRangeStart: 119, ageRangeEnd: 126, consumoDiarioKg: 2.80 },
  { ageRangeStart: 126, ageRangeEnd: 133, consumoDiarioKg: 2.90 },
  { ageRangeStart: 133, ageRangeEnd: 140, consumoDiarioKg: 3.00 },
  { ageRangeStart: 140, ageRangeEnd: 147, consumoDiarioKg: 3.10 },
  { ageRangeStart: 147, ageRangeEnd: 154, consumoDiarioKg: 3.20 },
  { ageRangeStart: 154, ageRangeEnd: 161, consumoDiarioKg: 3.30 },
  { ageRangeStart: 161, ageRangeEnd: 168, consumoDiarioKg: 3.40 },
  { ageRangeStart: 168, ageRangeEnd: 175, consumoDiarioKg: 3.50 },
  { ageRangeStart: 175, ageRangeEnd: 180, consumoDiarioKg: 3.60 },
  { ageRangeStart: 181, ageRangeEnd: 999, consumoDiarioKg: 3.70 }, // Fallback for older pigs
];

export const findConsumoReference = (ageInDays: number): ConsumoReferenceItem | undefined => {
  return CONSUMO_REFERENCE_TABLE.find(item => ageInDays >= item.ageRangeStart && ageInDays <= item.ageRangeEnd);
};
