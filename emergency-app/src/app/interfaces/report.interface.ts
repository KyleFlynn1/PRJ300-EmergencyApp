export interface Report {
  _id?: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Info' | 'Urgent';
  category: string;
  notes?: string;
  timestamp: string;
  location: { lat?: number; lng?: number; address?: string };
}
