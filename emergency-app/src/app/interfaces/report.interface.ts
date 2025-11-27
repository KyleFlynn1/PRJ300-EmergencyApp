export interface Report {
  severity: 'Low' | 'Moderate' | 'High' | 'Info' | 'Urgent';
  category: string;
  notes?: string;
  timestamp: string;
  location: { lat?: number; lng?: number; address?: string };
}
