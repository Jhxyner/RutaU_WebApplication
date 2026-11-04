export type RatedRole = 'DRIVER' | 'PASSENGER';

export interface Rating {
  id: number;
  tripId: number;
  raterId: number;
  raterName: string;
  ratedId: number;
  ratedName: string;
  ratedRole: RatedRole;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface RatingHistory {
  message: string;
  roleFilter: string;
  total: number;
  average: number | null;
  ratings: Rating[];
}

export interface RatingBody {
  tripId: number;
  ratedUserId: number;
  score: number;
  comment?: string;
}