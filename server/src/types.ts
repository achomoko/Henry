export type VehicleSize = "small" | "medium" | "large";

export interface CampingSpot {
  id: string;
  name: string;
  maxVehicleSize: VehicleSize;
  description?: string;
}

export interface Booking {
  id: string;
  spotId: string;
  guestName: string;
  vehicleSize: VehicleSize;
  startDate: string;
  endDate: string;
  createdAt: string;
  notes?: string;
}

export interface AvailabilityQuery {
  vehicleSize: VehicleSize;
  startDate: string;
  endDate: string;
}

