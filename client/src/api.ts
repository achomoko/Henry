import axios from "axios";
import { API_BASE_URL } from "./config";
import type { Booking, CampingSpot, VehicleSize } from "./types";

const client = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchSpots = async (): Promise<CampingSpot[]> => {
  const { data } = await client.get<{ spots: CampingSpot[] }>("/spots");
  return data.spots;
};

export const fetchAvailableSpots = async (
  vehicleSize: VehicleSize,
  startDate: string,
  endDate: string,
): Promise<CampingSpot[]> => {
  const { data } = await client.get<{ spots: CampingSpot[] }>(
    "/spots/available",
    {
      params: { vehicleSize, startDate, endDate },
    },
  );
  return data.spots;
};

export const fetchBookings = async (params: {
  startDate: string;
  endDate: string;
}): Promise<Booking[]> => {
  const { data } = await client.get<{ bookings: Booking[] }>("/bookings", {
    params,
  });
  return data.bookings;
};

export interface CreateBookingPayload {
  spotId: string;
  guestName: string;
  vehicleSize: VehicleSize;
  startDate: string;
  endDate: string;
  notes?: string;
}

export const createBooking = async (
  payload: CreateBookingPayload,
): Promise<Booking> => {
  const { data } = await client.post<{ booking: Booking }>(
    "/bookings",
    payload,
  );
  return data.booking;
};

