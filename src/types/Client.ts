
export interface Client {
  id: string; // Maps to client_id
  name: string; // Maps to display_name
  email?: string;
  phone?: string;
  primaryAddress: string; // Maps to primary_address
  additionalAddresses?: string[];
  tags: string[];
  status: 'Lead' | 'Active' | 'Archived';
  notes?: string;
  jobHistory: string[];
  communicationLog: string[];
  salesperson?: string;
  sourceInfo?: string; // Maps to source
  createdAt: string; // Maps to created_at
  lastActivity: string;
  subtitle?: string;
  primaryContact?: string; // Maps to primary_contact
}
