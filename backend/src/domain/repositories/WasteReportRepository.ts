// Domain Layer - Repository Interface

import { WasteReport, ReportId } from '../entities/WasteReport';

export interface WasteReportRepository {
  save(report: WasteReport): Promise<void>;
  findById(id: ReportId): Promise<WasteReport | null>;
  findByUserId(userId: string): Promise<WasteReport[]>;
  findByStatus(status: string): Promise<WasteReport[]>;
  findAll(): Promise<WasteReport[]>;
  update(report: WasteReport): Promise<void>;
  delete(id: ReportId): Promise<void>;
}
