export interface Defib {
  _id?: string;
  working: boolean;
  timestamp: string;
  photoUrl?: string;
  accessInstructions?: string;
  location: { lat?: number; lng?: number; address?: string };
}
