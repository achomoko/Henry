import { randomUUID } from "crypto";
import { formatISO } from "date-fns";
import { campingSpots } from "../data/spots";
import { Booking, VehicleSize } from "../types";
import {
  assertValidDateRange,
  normalizeDate,
  rangesOverlap,
} from "../utils/dateRange";
import { isVehicleSizeAllowed } from "../utils/vehicleSize";

const bookings: Booking[] = [
  {
    id: randomUUID(),
    spotId: "A2",
    guestName: "The Carters",
    vehicleSize: "medium",
    startDate: "2025-06-02",
    endDate: "2025-06-05",
    createdAt: formatISO(new Date("2025-05-15T08:00:00Z")),
    notes: "Celebrating anniversary",
  },
  {
    id: randomUUID(),
    spotId: "B1",
    guestName: "Rolling Hills RV",
    vehicleSize: "large",
    startDate: "2025-06-10",
    endDate: "2025-06-14",
    createdAt: formatISO(new Date("2025-05-18T11:30:00Z")),
  },
  {
    id: randomUUID(),
    spotId: "C1",
    guestName: "Backpackers United",
    vehicleSize: "small",
    startDate: "2025-06-08",
    endDate: "2025-06-09",
    createdAt: formatISO(new Date("2025-05-20T17:45:00Z")),
  },
];

interface BookingQueryOptions {
  startDate?: string;
  endDate?: string;
  spotIds?: string[];
}

interface CreateBookingInput {
  spotId: string;
  guestName: string;
  vehicleSize: VehicleSize;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const listBookings = ({
  startDate,
  endDate,
  spotIds,
}: BookingQueryOptions = {}): Booking[] => {
  return bookings.filter((booking) => {
    if (spotIds && spotIds.length > 0 && !spotIds.includes(booking.spotId)) {
      return false;
    }

    const normalizedStart = startDate ? normalizeDate(startDate) : undefined;
    const normalizedEnd = endDate ? normalizeDate(endDate) : undefined;

    if (normalizedStart && normalizedEnd) {
      return rangesOverlap(
        { startDate: normalizedStart, endDate: normalizedEnd },
        { startDate: booking.startDate, endDate: booking.endDate },
      );
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

export const createBooking = ({
  spotId,
  guestName,
  vehicleSize,
  startDate,
  endDate,
  notes,
}: CreateBookingInput): Booking => {
  const spot = campingSpots.find((s) => s.id === spotId);

  if (!spot) {
    throw new Error("Spot not found");
  }

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  assertValidDateRange({ startDate: normalizedStart, endDate: normalizedEnd });

  if (!isVehicleSizeAllowed(vehicleSize, spot.maxVehicleSize)) {
    throw new Error(
      `Spot ${spot.id} can only host up to ${spot.maxVehicleSize.toUpperCase()} vehicles`,
    );
  }

  const conflict = bookings.some(
    (booking) =>
      booking.spotId === spotId &&
      rangesOverlap(
        { startDate: normalizedStart, endDate: normalizedEnd },
        { startDate: booking.startDate, endDate: booking.endDate },
      ),
  );

  if (conflict) {
    throw new Error("Spot is already booked for the requested dates");
  }

  const booking: Booking = {
    id: randomUUID(),
    spotId,
    guestName,
    vehicleSize,
    startDate: normalizedStart,
    endDate: normalizedEnd,
    createdAt: formatISO(new Date()),
    ...(notes ? { notes } : {}),
  };

  bookings.push(booking);
  return booking;
};

export const getAvailableSpots = ({
  vehicleSize,
  startDate,
  endDate,
}: {
  vehicleSize: VehicleSize;
  startDate: string;
  endDate: string;
}) => {
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  assertValidDateRange({ startDate: normalizedStart, endDate: normalizedEnd });

  return campingSpots.filter((spot) => {
    if (!isVehicleSizeAllowed(vehicleSize, spot.maxVehicleSize)) {
      return false;
    }

    const conflictingBooking = bookings.find(
      (booking) =>
        booking.spotId === spot.id &&
        rangesOverlap(
          { startDate: normalizedStart, endDate: normalizedEnd },
          { startDate: booking.startDate, endDate: booking.endDate },
        ),
    );

    return !conflictingBooking;
  });
};

export const getSpots = () => campingSpots;

