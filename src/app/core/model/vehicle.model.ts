export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  color: string;
  plate: string;
  capacity: number;
}

export type VehicleBody = Omit<Vehicle, 'id'>;