import { addDays, formatISO, isAfter, isBefore, parseISO } from "date-fns";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const normalizeDate = (date: string): string =>
  formatISO(parseISO(date), { representation: "date" });

export const assertValidDateRange = ({ startDate, endDate }: DateRange) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isAfter(start, end)) {
    throw new Error("startDate must be on or before endDate");
  }
};

export const rangesOverlap = (
  rangeA: DateRange,
  rangeB: DateRange,
): boolean => {
  const startA = parseISO(rangeA.startDate);
  const endA = parseISO(rangeA.endDate);
  const startB = parseISO(rangeB.startDate);
  const endB = parseISO(rangeB.endDate);

  return !(isBefore(endA, startB) || isBefore(endB, startA));
};

export const enumerateDates = (
  range: DateRange,
  inclusiveEnd = true,
): string[] => {
  const start = parseISO(range.startDate);
  const end = inclusiveEnd ? parseISO(range.endDate) : addDays(parseISO(range.endDate), -1);
  const dates: string[] = [];
  let current = start;
  while (!isAfter(current, end)) {
    dates.push(formatISO(current, { representation: "date" }));
    current = addDays(current, 1);
  }
  return dates;
};

