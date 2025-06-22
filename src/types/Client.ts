
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  primaryAddress: string;
  additionalAddresses?: string[];
  tags: string[];
  status: 'Lead' | 'Active' | 'Archived';
  notes?: string;
  jobHistory: string[];
  communicationLog: string[];
  salesperson?: string;
  sourceInfo?: string;
  createdAt: string;
  lastActivity: string;
  subtitle?: string;
}
