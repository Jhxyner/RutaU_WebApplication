export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ModerationAction = 'WARNING' | 'SUSPENSION' | 'DISMISS';

export interface Report {
  id: number;
  reporterId: number;
  reporterName: string;
  reportedUserId: number;
  reportedUserName: string;
  reportedTripId: number | null;
  reportedTripRoute: string | null;
  reason: string;
  status: ReportStatus;
  actionTaken: string | null;
  createdAt: string;
  resolvedAt: string | null;
  reportedUserStatus: string;
}

export interface ReportBody {
  reportedUserId?: number;
  tripId?: number;
  reason: string;
}

export interface ModerationBody { action: ModerationAction; notes?: string; }

export interface UserModeration {
  userId: number;
  fullName: string;
  email: string;
  accountStatus: string;
  totalReports: number;
  validReports: number;
  reports: Report[];
}