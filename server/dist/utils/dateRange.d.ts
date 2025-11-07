export interface DateRange {
    startDate: string;
    endDate: string;
}
export declare const normalizeDate: (date: string) => string;
export declare const assertValidDateRange: ({ startDate, endDate }: DateRange) => void;
export declare const rangesOverlap: (rangeA: DateRange, rangeB: DateRange) => boolean;
export declare const enumerateDates: (range: DateRange, inclusiveEnd?: boolean) => string[];
//# sourceMappingURL=dateRange.d.ts.map