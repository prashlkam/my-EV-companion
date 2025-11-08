
export interface EV {
  id: string;
  make: string;
  model: string;
  variant?: string;
  vehicleType: '2-wheeler' | '4-wheeler';
  year: number;
  batteryCapacityKwh: number;
  vin?: string;
  purchaseDate: string;
  initialOdometer: number;
  initialNotes?: string;
  images?: string[]; // Array of base64 data URLs
  videos?: { id: string; url: string }[]; // YouTube URLs
  reviews?: { id: string; title: string; url: string }[];
  socials?: { id: string; platform: string; url: string }[];
}

export enum LogType {
  Charging = 'Charging',
  Trip = 'Trip',
  Service = 'Service',
  PurchaseAccessories = 'Purchase Accessories',
  Fault = 'Fault',
  Satisfaction = 'Satisfaction',
}

export enum ChargerType {
  L1 = 'Level 1',
  L2 = 'Level 2',
  DCFC = 'DC Fast Charge',
}

export enum FaultType {
  Breakdown = 'Breakdown',
  Accident = 'Accident',
  WarningLight = 'Warning Light',
  Other = 'Other',
}

export interface ChargingLog {
  id: string;
  evId: string;
  type: LogType.Charging;
  startTime: string;
  endTime: string;
  startSocPercent: number;
  endSocPercent: number;
  chargerType: ChargerType;
  cost?: number;
  location?: string;
  notes?: string;
}

export interface TripLog {
  id: string;
  evId: string;
  type: LogType.Trip;
  startTime: string;
  endTime: string;
  startOdometer: number;
  endOdometer: number;
  purpose?: string;
  notes?: string;
}

export interface ServiceLog {
  id: string;
  evId: string;
  type: LogType.Service;
  serviceDate: string;
  odometer: number;
  description: string;
  cost?: number;
  performedBy?: string;
  notes?: string;
}

export interface FaultLog {
  id: string;
  evId: string;
  type: LogType.Fault;
  faultDate: string;
  odometer: number;
  faultType: FaultType;
  description: string;
  resolution?: string;
  notes?: string;
}

export interface SatisfactionLog {
  id: string;
  evId: string;
  type: LogType.Satisfaction;
  logDate: string;
  rating: number; // 1-5
  comments?: string;
}

export interface PurchaseAccessoriesLog {
  id: string;
  evId: string;
  type: LogType.PurchaseAccessories;
  purchaseDate: string;
  accessoryName: string;
  brand?: string;
  accessoryType?: string;
  cost?: number;
  sizeL?: number;
  sizeW?: number;
  sizeH?: number;
  weight?: number;
  purpose?: string;
  usesPower: boolean;
  avgPowerDrawWatts?: number;
  couldVoidWarranty: boolean;
  notes?: string;
}

export type Log = ChargingLog | TripLog | ServiceLog | FaultLog | SatisfactionLog | PurchaseAccessoriesLog;

export interface AppState {
  evs: EV[];
  logs: Log[];
}

export type AppAction =
  | { type: 'ADD_EV'; payload: EV }
  | { type: 'UPDATE_EV'; payload: EV }
  | { type: 'DELETE_EV'; payload: string } // id
  | { type: 'ADD_LOG'; payload: Log }
  | { type: 'DELETE_LOG'; payload: string } // id
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'DELETE_ALL_DATA' };

export interface AIRecommendation {
  title: string;
  recommendation: string;
  rationale: string;
}
