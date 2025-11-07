import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import bookingsRouter from "./routes/bookings";
import spotsRouter from "./routes/spots";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/spots", spotsRouter);
app.use("/bookings", bookingsRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    console.error(err);
    res.status(400).json({ error: err.message ?? "Unexpected error" });
  },
);

app.listen(PORT, () => {
  console.log(`Campsite booking API listening on http://localhost:${PORT}`);
});

