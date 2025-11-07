import { Router } from "express";
import { z } from "zod";
import { getAvailableSpots, getSpots } from "../services/bookingService";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ spots: getSpots() });
});

const availabilityQuerySchema = z.object({
  vehicleSize: z.enum(["small", "medium", "large"]),
  startDate: z.string().min(1, "startDate is required"),
  endDate: z.string().min(1, "endDate is required"),
});

router.get("/available", (req, res, next) => {
  try {
    const query = availabilityQuerySchema.parse(req.query);
    const availableSpots = getAvailableSpots(query);
    res.json({ spots: availableSpots });
  } catch (error) {
    next(error);
  }
});

export default router;

