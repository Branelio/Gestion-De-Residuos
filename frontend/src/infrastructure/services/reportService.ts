/**
 * Servicio para obtener reportes desde el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface WasteReport {
    id: string;
    userId: string;
    type: 'OVERFLOW' | 'ILLEGAL_DUMP' | 'DAMAGED_CONTAINER' | 'MISSED_COLLECTION' | 'DANGEROUS';
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
    resolvedAt?: string;
}

export interface ReportsResponse {
    success: boolean;
    data: WasteReport[];
    count: number;
}

export interface ReportStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    byType: Record<string, number>;
}

class ReportService {
    async getAll(): Promise<WasteReport[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/waste-reports`);
            if (!response.ok) throw new Error('Error fetching reports');
            const data: ReportsResponse = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    }

    async getById(id: string): Promise<WasteReport | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/waste-reports/${id}`);
            if (!response.ok) throw new Error('Report not found');
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching report:', error);
            return null;
        }
    }

    async updateStatus(id: string, status: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/waste-reports/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating status:', error);
            return false;
        }
    }

    async getStats(): Promise<ReportStats> {
        try {
            const reports = await this.getAll();
            const stats: ReportStats = {
                total: reports.length,
                pending: reports.filter(r => r.status === 'PENDING').length,
                inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
                resolved: reports.filter(r => r.status === 'RESOLVED').length,
                rejected: reports.filter(r => r.status === 'REJECTED').length,
                byType: {},
            };

            reports.forEach(r => {
                stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error calculating stats:', error);
            return { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0, byType: {} };
        }
    }
}

export const reportService = new ReportService();
export default reportService;
