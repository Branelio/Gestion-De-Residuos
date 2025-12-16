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

// Tipos actualizados para usar API de EPAGAL
export interface WasteReport {
  id: number;
  userId: number;
  type: string; // TipoIncidencia de EPAGAL
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  photoUrl?: string;
  status: string; // EstadoIncidencia de EPAGAL
  severity: number; // 1-5
  zone: string; // ZonaIncidencia de EPAGAL
  createdAt: string;
  reportedAt: string;
}

export type WasteReportType = 
  | 'CONTENEDOR_LLENO' 
  | 'BASURA_ESPARCIDA' 
  | 'PUNTO_CRITICO' 
  | 'FALTA_RECOLECCION' 
  | 'RESIDUO_PELIGROSO' 
  | 'OTRO';

export type WasteReportStatus = 
  | 'PENDIENTE' 
  | 'EN_PROCESO' 
  | 'RESUELTA' 
  | 'RECHAZADA';

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
