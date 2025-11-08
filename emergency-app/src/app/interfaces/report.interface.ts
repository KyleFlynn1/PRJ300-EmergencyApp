export interface Report {
  severity: 'low' | 'medium' | 'high';
  category: string;
  notes?: string;
  timestamp: string;
  location: { lat?: number; lng?: number; address?: string };
}
