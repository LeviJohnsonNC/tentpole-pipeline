
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'dropdown';
  value: any;
  options?: string[]; // for dropdown fields
  unit?: string; // for number fields
}

export interface CommunicationSettings {
  preferredMethod: 'email' | 'phone' | 'text';
  allowMarketing: boolean;
  allowReminders: boolean;
}

export interface Client {
  id: string;
  name: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  primaryAddress: string;
  fullPrimaryAddress?: Address;
  additionalAddresses?: string[];
  fullAdditionalAddresses?: Address[];
  tags: string[];
  status: 'Lead' | 'Active' | 'Archived';
  notes?: string;
  jobHistory: string[];
  communicationLog: string[];
  salesperson?: string;
  sourceInfo?: string;
  leadSource?: string;
  createdAt: string;
  lastActivity: string;
  subtitle?: string;
  communicationSettings?: CommunicationSettings;
  customFields?: CustomField[];
  additionalContacts?: Contact[];
  propertyDetails?: Record<string, any>;
  billingAddress?: Address;
  gstRate?: number;
  billingAddressSameAsProperty?: boolean;
}
