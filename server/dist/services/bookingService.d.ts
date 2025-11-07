import { Booking, VehicleSize } from "../types";
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
export declare const listBookings: ({ startDate, endDate, spotIds, }?: BookingQueryOptions) => Booking[];
export declare const createBooking: ({ spotId, guestName, vehicleSize, startDate, endDate, notes, }: CreateBookingInput) => Booking;
export declare const getAvailableSpots: ({ vehicleSize, startDate, endDate, }: {
    vehicleSize: VehicleSize;
    startDate: string;
    endDate: string;
}) => import("../types").CampingSpot[];
export declare const getSpots: () => import("../types").CampingSpot[];
export {};
//# sourceMappingURL=bookingService.d.ts.map