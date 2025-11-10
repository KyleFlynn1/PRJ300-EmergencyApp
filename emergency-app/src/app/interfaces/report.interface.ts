export interface Report {
  severity: 'Low' | 'Moderate' | 'High' | 'Info';
  category: string;
  notes?: string;
  timestamp: string;
  location: { lat?: number; lng?: number; address?: string };
}
