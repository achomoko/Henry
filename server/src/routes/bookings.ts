import { Router } from "express";
import { z } from "zod";
import { createBooking, listBookings } from "../services/bookingService";

const router = Router();

const listSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  spotIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) {
        return value;
      }
      return value.split(",");
    }),
});

router.get("/", (req, res, next) => {
  try {
    const parsed = listSchema.parse(req.query);
    const filters: Parameters<typeof listBookings>[0] = {};

    if (parsed.startDate) {
      filters.startDate = parsed.startDate;
    }
    if (parsed.endDate) {
      filters.endDate = parsed.endDate;
    }
    if (parsed.spotIds && parsed.spotIds.length > 0) {
      filters.spotIds = parsed.spotIds;
    }

    const bookings = listBookings(filters);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  spotId: z.string(),
  guestName: z.string(),
  vehicleSize: z.enum(["small", "medium", "large"]),
  startDate: z.string(),
  endDate: z.string(),
  notes: z.string().optional(),
});

router.post("/", (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);
    const { notes, ...rest } = payload;
    const booking = createBooking(
      notes ? { ...rest, notes } : rest,
    );
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

export default router;

