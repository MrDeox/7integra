export interface GpdReferenceItem {
  ageRangeStart: number;
  ageRangeEnd: number;
  weightRangeStartKg: number;
  weightRangeEndKg: number;
  expectedGpdGrams: number;
  isEstimate?: boolean;
}

// Tabela de GPD Suíno (15 a 180 dias)
export const GPD_REFERENCE_TABLE: GpdReferenceItem[] = [
  { ageRangeStart: 15, ageRangeEnd: 21, weightRangeStartKg: 5.4, weightRangeEndKg: 6.4, expectedGpdGrams: 143 },
  { ageRangeStart: 21, ageRangeEnd: 28, weightRangeStartKg: 6.4, weightRangeEndKg: 8.4, expectedGpdGrams: 250 },
  { ageRangeStart: 28, ageRangeEnd: 35, weightRangeStartKg: 8.4, weightRangeEndKg: 11.0, expectedGpdGrams: 274 },
  { ageRangeStart: 35, ageRangeEnd: 42, weightRangeStartKg: 11.0, weightRangeEndKg: 14.1, expectedGpdGrams: 302 },
  { ageRangeStart: 42, ageRangeEnd: 49, weightRangeStartKg: 14.1, weightRangeEndKg: 17.6, expectedGpdGrams: 330 },
  { ageRangeStart: 49, ageRangeEnd: 56, weightRangeStartKg: 17.6, weightRangeEndKg: 21.6, expectedGpdGrams: 360 },
  { ageRangeStart: 56, ageRangeEnd: 63, weightRangeStartKg: 21.6, weightRangeEndKg: 26.0, expectedGpdGrams: 390 },
  { ageRangeStart: 63, ageRangeEnd: 70, weightRangeStartKg: 26.0, weightRangeEndKg: 30.7, expectedGpdGrams: 418 },
  { ageRangeStart: 70, ageRangeEnd: 77, weightRangeStartKg: 30.7, weightRangeEndKg: 35.7, expectedGpdGrams: 445 },
  { ageRangeStart: 77, ageRangeEnd: 84, weightRangeStartKg: 35.7, weightRangeEndKg: 41.1, expectedGpdGrams: 472 },
  { ageRangeStart: 84, ageRangeEnd: 91, weightRangeStartKg: 41.1, weightRangeEndKg: 46.8, expectedGpdGrams: 498 },
  { ageRangeStart: 91, ageRangeEnd: 98, weightRangeStartKg: 46.8, weightRangeEndKg: 52.8, expectedGpdGrams: 524 },
  { ageRangeStart: 98, ageRangeEnd: 105, weightRangeStartKg: 52.8, weightRangeEndKg: 59.1, expectedGpdGrams: 549 },
  { ageRangeStart: 105, ageRangeEnd: 112, weightRangeStartKg: 59.1, weightRangeEndKg: 65.7, expectedGpdGrams: 574 },
  { ageRangeStart: 112, ageRangeEnd: 119, weightRangeStartKg: 65.7, weightRangeEndKg: 72.5, expectedGpdGrams: 597 },
  { ageRangeStart: 119, ageRangeEnd: 126, weightRangeStartKg: 72.5, weightRangeEndKg: 79.6, expectedGpdGrams: 620 },
  { ageRangeStart: 126, ageRangeEnd: 133, weightRangeStartKg: 79.6, weightRangeEndKg: 86.8, expectedGpdGrams: 642 },
  { ageRangeStart: 133, ageRangeEnd: 140, weightRangeStartKg: 86.8, weightRangeEndKg: 94.1, expectedGpdGrams: 662 },
  { ageRangeStart: 140, ageRangeEnd: 147, weightRangeStartKg: 94.1, weightRangeEndKg: 101.5, expectedGpdGrams: 680 },
  { ageRangeStart: 147, ageRangeEnd: 154, weightRangeStartKg: 101.5, weightRangeEndKg: 108.9, expectedGpdGrams: 700, isEstimate: true },
  { ageRangeStart: 154, ageRangeEnd: 161, weightRangeStartKg: 108.9, weightRangeEndKg: 116.3, expectedGpdGrams: 720, isEstimate: true },
  { ageRangeStart: 161, ageRangeEnd: 168, weightRangeStartKg: 116.3, weightRangeEndKg: 123.7, expectedGpdGrams: 740, isEstimate: true },
  { ageRangeStart: 168, ageRangeEnd: 175, weightRangeStartKg: 123.7, weightRangeEndKg: 131.0, expectedGpdGrams: 760, isEstimate: true },
  { ageRangeStart: 175, ageRangeEnd: 180, weightRangeStartKg: 131.0, weightRangeEndKg: 135.0, expectedGpdGrams: 780, isEstimate: true },
];

export const findGpdReference = (ageInDays: number): GpdReferenceItem | undefined => {
  return GPD_REFERENCE_TABLE.find(item => ageInDays >= item.ageRangeStart && ageInDays <= item.ageRangeEnd);
};
