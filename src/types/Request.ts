
export interface Request {
  id: string; // Maps to request_id
  clientId: string; // Maps to client_id
  title: string; // Maps to description
  serviceDetails: string; // Maps to description
  requestDate: string; // Maps to request_date
  customFields?: Record<string, any>;
  assignedTeamMember?: string; // Maps to assigned_to
  status: 'New' | 'Converted' | 'Archived'; // Maps to request_status
  quoteId?: string;
  jobId?: string;
  attachments?: string[];
  notes?: string;
  urgency?: 'Low' | 'Medium' | 'High';
  preferredTime?: string;
  projectType?: string; // Maps to project_type
  intakeSource?: string; // Maps to intake_source
}
