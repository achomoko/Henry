"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bookingService_1 = require("../services/bookingService");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({ spots: (0, bookingService_1.getSpots)() });
});
const availabilityQuerySchema = zod_1.z.object({
    vehicleSize: zod_1.z.enum(["small", "medium", "large"]),
    startDate: zod_1.z.string().min(1, "startDate is required"),
    endDate: zod_1.z.string().min(1, "endDate is required"),
});
router.get("/available", (req, res, next) => {
    try {
        const query = availabilityQuerySchema.parse(req.query);
        const availableSpots = (0, bookingService_1.getAvailableSpots)(query);
        res.json({ spots: availableSpots });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=spots.js.map