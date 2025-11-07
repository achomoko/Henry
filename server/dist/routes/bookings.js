"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bookingService_1 = require("../services/bookingService");
const router = (0, express_1.Router)();
const listSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    spotIds: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .transform((value) => {
        if (!value)
            return undefined;
        if (Array.isArray(value)) {
            return value;
        }
        return value.split(",");
    }),
});
router.get("/", (req, res, next) => {
    try {
        const parsed = listSchema.parse(req.query);
        const filters = {};
        if (parsed.startDate) {
            filters.startDate = parsed.startDate;
        }
        if (parsed.endDate) {
            filters.endDate = parsed.endDate;
        }
        if (parsed.spotIds && parsed.spotIds.length > 0) {
            filters.spotIds = parsed.spotIds;
        }
        const bookings = (0, bookingService_1.listBookings)(filters);
        res.json({ bookings });
    }
    catch (error) {
        next(error);
    }
});
const createSchema = zod_1.z.object({
    spotId: zod_1.z.string(),
    guestName: zod_1.z.string(),
    vehicleSize: zod_1.z.enum(["small", "medium", "large"]),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
});
router.post("/", (req, res, next) => {
    try {
        const payload = createSchema.parse(req.body);
        const { notes, ...rest } = payload;
        const booking = (0, bookingService_1.createBooking)(notes ? { ...rest, notes } : rest);
        res.status(201).json({ booking });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map