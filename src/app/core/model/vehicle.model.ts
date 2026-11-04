export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  color: string | null;
  plate: string;
  capacity: number;
}

export type VehicleBody = Omit<Vehicle, 'id'>;