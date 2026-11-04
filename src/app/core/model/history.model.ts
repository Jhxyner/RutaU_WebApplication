export interface TripHistoryItem {
  tripId: number;
  role: 'DRIVER' | 'PASSENGER';
  departureTime: string;
  origin: string;
  destination: string;
  status: string;
  otherParty: string;
}

export interface TripHistory {
  message: string;
  asDriver: TripHistoryItem[];
  asPassenger: TripHistoryItem[];
  inProgress: TripHistoryItem[];
}