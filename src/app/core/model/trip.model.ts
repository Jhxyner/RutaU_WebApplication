import { SeatRequest } from './seat-request.model';

export type TripStatus = 'SCHEDULED' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export interface TripStop {
  id: number;
  address: string;
  zone: string;
  stopOrder: number;
}

export interface Trip {
  id: number;
  driverId: number;
  driverName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  zone: string;
  departureTime: string;      // 2026-11-05T07:30:00
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  status: TripStatus;
  stops: TripStop[];
}

export interface TripStopBody { address: string; zone: string; }

export interface TripBody {
  origin: string;
  destination: string;
  zone: string;
  departureTime: string;
  seats: number;
  pricePerSeat: number;
  stops: TripStopBody[];
}

export interface TripFilters {
  origin?: string;
  destination?: string;
  from?: string;      // HH:mm
  to?: string;        // HH:mm
  zone?: string;
  maxPrice?: number | null;
}

export interface TripSearchResponse {
  message: string;
  totalResults: number;
  results: Trip[];
  alternatives: Trip[];
}

export interface CompleteTripBody {
  confirmEarly?: boolean;
  completedRequestIds?: number[];
}

export interface TripCompletion {
  tripId: number;
  status: TripStatus;
  message: string;
  passengers: SeatRequest[];
}