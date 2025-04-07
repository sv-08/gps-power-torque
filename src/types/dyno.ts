
export interface Vehicle {
  mass: number; // kg
  name: string;
}

export interface GPSData {
  speed: number; // m/s
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface PowerData {
  power: number; // horsepower
  torque: number; // Nm
  speed: number; // km/h
  time: number; // seconds from start
}

export interface TestRun {
  id: string;
  vehicle: Vehicle;
  date: string;
  maxPower: number;
  maxTorque: number;
  data: PowerData[];
}

export type DynoStatus = 'idle' | 'ready' | 'recording' | 'processing' | 'complete';
