export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface SeatRequest {
  id: number;
  tripId: number;
  origin: string;
  destination: string;
  departureTime: string;
  tripAvailableSeats: number;
  passengerId: number;
  passengerName: string;
  pickupStopId: number | null;
  pickupPoint: string | null;
  status: RequestStatus;
  requestedAt: string;
}

export interface SeatRequestBody {
  tripId: number;
  pickupStopId: number | null;
  confirmOverlap?: boolean;
}