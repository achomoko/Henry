"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpots = exports.getAvailableSpots = exports.createBooking = exports.listBookings = void 0;
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const spots_1 = require("../data/spots");
const dateRange_1 = require("../utils/dateRange");
const vehicleSize_1 = require("../utils/vehicleSize");
const bookings = [
    {
        id: (0, crypto_1.randomUUID)(),
        spotId: "A2",
        guestName: "The Carters",
        vehicleSize: "medium",
        startDate: "2025-06-02",
        endDate: "2025-06-05",
        createdAt: (0, date_fns_1.formatISO)(new Date("2025-05-15T08:00:00Z")),
        notes: "Celebrating anniversary",
    },
    {
        id: (0, crypto_1.randomUUID)(),
        spotId: "B1",
        guestName: "Rolling Hills RV",
        vehicleSize: "large",
        startDate: "2025-06-10",
        endDate: "2025-06-14",
        createdAt: (0, date_fns_1.formatISO)(new Date("2025-05-18T11:30:00Z")),
    },
    {
        id: (0, crypto_1.randomUUID)(),
        spotId: "C1",
        guestName: "Backpackers United",
        vehicleSize: "small",
        startDate: "2025-06-08",
        endDate: "2025-06-09",
        createdAt: (0, date_fns_1.formatISO)(new Date("2025-05-20T17:45:00Z")),
    },
];
const listBookings = ({ startDate, endDate, spotIds, } = {}) => {
    return bookings.filter((booking) => {
        if (spotIds && spotIds.length > 0 && !spotIds.includes(booking.spotId)) {
            return false;
        }
        const normalizedStart = startDate ? (0, dateRange_1.normalizeDate)(startDate) : undefined;
        const normalizedEnd = endDate ? (0, dateRange_1.normalizeDate)(endDate) : undefined;
        if (normalizedStart && normalizedEnd) {
            return (0, dateRange_1.rangesOverlap)({ startDate: normalizedStart, endDate: normalizedEnd }, { startDate: booking.startDate, endDate: booking.endDate });
        }
        if (normalizedStart) {
            return booking.endDate >= normalizedStart;
        }
        if (normalizedEnd) {
            return booking.startDate <= normalizedEnd;
        }
        return true;
    });
};
exports.listBookings = listBookings;
const createBooking = ({ spotId, guestName, vehicleSize, startDate, endDate, notes, }) => {
    const spot = spots_1.campingSpots.find((s) => s.id === spotId);
    if (!spot) {
        throw new Error("Spot not found");
    }
    const normalizedStart = (0, dateRange_1.normalizeDate)(startDate);
    const normalizedEnd = (0, dateRange_1.normalizeDate)(endDate);
    (0, dateRange_1.assertValidDateRange)({ startDate: normalizedStart, endDate: normalizedEnd });
    if (!(0, vehicleSize_1.isVehicleSizeAllowed)(vehicleSize, spot.maxVehicleSize)) {
        throw new Error(`Spot ${spot.id} can only host up to ${spot.maxVehicleSize.toUpperCase()} vehicles`);
    }
    const conflict = bookings.some((booking) => booking.spotId === spotId &&
        (0, dateRange_1.rangesOverlap)({ startDate: normalizedStart, endDate: normalizedEnd }, { startDate: booking.startDate, endDate: booking.endDate }));
    if (conflict) {
        throw new Error("Spot is already booked for the requested dates");
    }
    const booking = {
        id: (0, crypto_1.randomUUID)(),
        spotId,
        guestName,
        vehicleSize,
        startDate: normalizedStart,
        endDate: normalizedEnd,
        createdAt: (0, date_fns_1.formatISO)(new Date()),
        ...(notes ? { notes } : {}),
    };
    bookings.push(booking);
    return booking;
};
exports.createBooking = createBooking;
const getAvailableSpots = ({ vehicleSize, startDate, endDate, }) => {
    const normalizedStart = (0, dateRange_1.normalizeDate)(startDate);
    const normalizedEnd = (0, dateRange_1.normalizeDate)(endDate);
    (0, dateRange_1.assertValidDateRange)({ startDate: normalizedStart, endDate: normalizedEnd });
    return spots_1.campingSpots.filter((spot) => {
        if (!(0, vehicleSize_1.isVehicleSizeAllowed)(vehicleSize, spot.maxVehicleSize)) {
            return false;
        }
        const conflictingBooking = bookings.find((booking) => booking.spotId === spot.id &&
            (0, dateRange_1.rangesOverlap)({ startDate: normalizedStart, endDate: normalizedEnd }, { startDate: booking.startDate, endDate: booking.endDate }));
        return !conflictingBooking;
    });
};
exports.getAvailableSpots = getAvailableSpots;
const getSpots = () => spots_1.campingSpots;
exports.getSpots = getSpots;
//# sourceMappingURL=bookingService.js.map