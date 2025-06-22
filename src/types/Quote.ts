
export interface Quote {
  id: string;
  clientId: string;
  requestId?: string; // Optional - quotes can exist without being linked to a request
  quoteNumber: string;
  title: string;
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
}
