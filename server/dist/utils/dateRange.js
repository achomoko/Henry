"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumerateDates = exports.rangesOverlap = exports.assertValidDateRange = exports.normalizeDate = void 0;
const date_fns_1 = require("date-fns");
const normalizeDate = (date) => (0, date_fns_1.formatISO)((0, date_fns_1.parseISO)(date), { representation: "date" });
exports.normalizeDate = normalizeDate;
const assertValidDateRange = ({ startDate, endDate }) => {
    const start = (0, date_fns_1.parseISO)(startDate);
    const end = (0, date_fns_1.parseISO)(endDate);
    if ((0, date_fns_1.isAfter)(start, end)) {
        throw new Error("startDate must be on or before endDate");
    }
};
exports.assertValidDateRange = assertValidDateRange;
const rangesOverlap = (rangeA, rangeB) => {
    const startA = (0, date_fns_1.parseISO)(rangeA.startDate);
    const endA = (0, date_fns_1.parseISO)(rangeA.endDate);
    const startB = (0, date_fns_1.parseISO)(rangeB.startDate);
    const endB = (0, date_fns_1.parseISO)(rangeB.endDate);
    return !((0, date_fns_1.isBefore)(endA, startB) || (0, date_fns_1.isBefore)(endB, startA));
};
exports.rangesOverlap = rangesOverlap;
const enumerateDates = (range, inclusiveEnd = true) => {
    const start = (0, date_fns_1.parseISO)(range.startDate);
    const end = inclusiveEnd ? (0, date_fns_1.parseISO)(range.endDate) : (0, date_fns_1.addDays)((0, date_fns_1.parseISO)(range.endDate), -1);
    const dates = [];
    let current = start;
    while (!(0, date_fns_1.isAfter)(current, end)) {
        dates.push((0, date_fns_1.formatISO)(current, { representation: "date" }));
        current = (0, date_fns_1.addDays)(current, 1);
    }
    return dates;
};
exports.enumerateDates = enumerateDates;
//# sourceMappingURL=dateRange.js.map