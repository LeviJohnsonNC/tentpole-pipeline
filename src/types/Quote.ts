
export interface Quote {
  id: string;
  clientId: string;
  requestId?: string; // Optional - quotes can exist without being linked to a request
  quoteNumber: string;
  title?: string; // Made optional - only present for quotes linked to requests
  property: string;
  status: 'Draft' | 'Awaiting Response' | 'Changes Requested' | 'Approved' | 'Converted' | 'Archived';
  amount: number;
  createdDate: string;
  sentDate?: string;
  approvedDate?: string;
  convertedDate?: string;
  notes?: string;
  salesperson?: string;
  validUntil?: string;
  lineItems?: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }[];
  // New fields for the form
  rating?: number;
  division?: string;
  customFields?: {
    id: string;
    name: string;
    value: string;
    type: 'text' | 'number' | 'dropdown';
  }[];
}
