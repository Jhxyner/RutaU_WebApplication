export interface HourSlot {
  hour: number;
  label: string;
  tripsOffered: number;
  seatsOffered: number;
  seatRequests: number;
  opportunity: boolean;
}

export interface ScheduleComparison {
  enoughData: boolean;
  message: string;
  zone: string | null;
  totalTrips: number;
  totalRequests: number;
  mostOfferedHour: string | null;
  mostRequestedHour: string | null;
  opportunityHours: string[];
  slots: HourSlot[];
}

export interface ReportCount { label: string; requests: number; }

export interface DemandReport {
  message: string;
  from: string;
  to: string;
  groupedBy: string;
  totalRequests: number;
  topRoutes: ReportCount[];
  topHours: ReportCount[];
  timeline: ReportCount[];
}