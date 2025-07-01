

export interface Request {
  id: string;
  clientId: string; // Required reference to Client
  title: string;
  serviceDetails: string;
  requestDate: string;
  customFields?: Record<string, any>;
  assignedTeamMember?: string;
  status: 'New' | 'Converted' | 'Archived' | 'Assessment complete' | 'Overdue' | 'Unscheduled' | 'Closed Won' | 'Closed Lost';
  quoteId?: string;
  jobId?: string;
  attachments?: string[];
  notes?: string;
  urgency?: 'Low' | 'Medium' | 'High';
  preferredTime?: string;
}

