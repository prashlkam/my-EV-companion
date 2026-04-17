
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
  city?: string;
  country?: string;
  onRoadCost?: number;
  loanAmount?: number;
  images?: string[]; // Array of base64 data URLs
  videos?: { id: string; url: string }[]; // YouTube URLs
  reviews?: { id: string; title: string; url: string }[];
  socials?: { id: string; platform: string; url: string }[];
}

// Country-based unit configuration
export interface CountryUnits {
  distanceUnit: 'miles' | 'km';
  distanceSymbol: 'mi' | 'km';
  currencySymbol: string;
  currencyCode: string;
  weightUnit: 'lbs' | 'kg';
  weightSymbol: 'lbs' | 'kg';
  sizeUnit: 'in' | 'cm';
  sizeSymbol: 'in' | 'cm';
}

export const COUNTRY_UNITS: Record<string, CountryUnits> = {
  'US': {
    distanceUnit: 'miles',
    distanceSymbol: 'mi',
    currencySymbol: '$',
    currencyCode: 'USD',
    weightUnit: 'lbs',
    weightSymbol: 'lbs',
    sizeUnit: 'in',
    sizeSymbol: 'in',
  },
  'IN': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: '₹',
    currencyCode: 'INR',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'GB': {
    distanceUnit: 'miles',
    distanceSymbol: 'mi',
    currencySymbol: '£',
    currencyCode: 'GBP',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'CA': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: 'C$',
    currencyCode: 'CAD',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'AU': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'DE': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: '€',
    currencyCode: 'EUR',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'FR': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: '€',
    currencyCode: 'EUR',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'JP': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: '¥',
    currencyCode: 'JPY',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
  'CN': {
    distanceUnit: 'km',
    distanceSymbol: 'km',
    currencySymbol: '¥',
    currencyCode: 'CNY',
    weightUnit: 'kg',
    weightSymbol: 'kg',
    sizeUnit: 'cm',
    sizeSymbol: 'cm',
  },
};

export const DEFAULT_UNITS: CountryUnits = {
  distanceUnit: 'miles',
  distanceSymbol: 'mi',
  currencySymbol: '$',
  currencyCode: 'USD',
  weightUnit: 'lbs',
  weightSymbol: 'lbs',
  sizeUnit: 'in',
  sizeSymbol: 'in',
};

export const getUnitsForCountry = (countryCode?: string): CountryUnits => {
  return countryCode && COUNTRY_UNITS[countryCode] ? COUNTRY_UNITS[countryCode] : DEFAULT_UNITS;
};

export enum LogType {
  Charging = 'Charging',
  Trip = 'Trip',
  Service = 'Service',
  PurchaseAccessories = 'Purchase Accessories',
  Fault = 'Fault',
  Satisfaction = 'Satisfaction',
  LoanEMI = 'Loan / EMI',
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

export interface LoanEMILog {
  id: string;
  evId: string;
  type: LogType.LoanEMI;
  paymentDate: string;
  emiAmount: number;
  emiNumber?: number;
  notes?: string;
}

export type Log = ChargingLog | TripLog | ServiceLog | FaultLog | SatisfactionLog | PurchaseAccessoriesLog | LoanEMILog;

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
