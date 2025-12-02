export interface CollectionPoint {
  id: string;
  name: string;
  type: 'CONTAINER' | 'COLLECTION_CENTER' | 'LANDFILL';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  capacity: number;
  currentLoad: number;
  fillPercentage: number;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  isRural: boolean;
  distance?: number;
}

export interface WasteReport {
  id: string;
  userId: string;
  type: 'OVERFLOW' | 'ILLEGAL_DUMP' | 'DAMAGED_CONTAINER' | 'MISSED_COLLECTION';
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  photoUrl?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  verifiedByAI: boolean;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export type WasteReportType = 'OVERFLOW' | 'ILLEGAL_DUMP' | 'DAMAGED' | 'MISSED' | 'OTHER';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  points: number;
  reportsCount: number;
  verifiedReports: number;
  canRedeemDiscount: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
}
