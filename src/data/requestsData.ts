
import { Request } from '@/types/Request';

export const requestsData: Request[] = [
  {
    id: 'request-1',
    clientId: 'client-10',
    title: 'New landscaping request',
    serviceDetails: 'Landscaping services needed for residential property',
    requestDate: 'May 26',
    status: 'New',
    notes: 'Initial landscaping inquiry'
  },
  {
    id: 'request-2',
    clientId: 'client-10',
    title: 'Landscaping',
    serviceDetails: 'Additional landscaping work',
    requestDate: 'May 26',
    status: 'New',
    notes: 'Follow-up landscaping request'
  },
  {
    id: 'request-3',
    clientId: 'client-11',
    title: '',
    serviceDetails: 'Service inquiry from Pete Duggan',
    requestDate: 'May 23',
    status: 'New'
  },
  {
    id: 'request-4',
    clientId: 'client-12',
    title: '',
    serviceDetails: 'General service inquiry',
    requestDate: 'May 23',
    status: 'New'
  },
  {
    id: 'request-5',
    clientId: 'client-13',
    title: 'Request!',
    serviceDetails: 'Service request from Pam Sillar',
    requestDate: 'May 23',
    status: 'New'
  },
  {
    id: 'request-6',
    clientId: 'client-14',
    title: "Levi's Request #1",
    serviceDetails: 'Commercial service inquiry',
    requestDate: 'Mar 19',
    status: 'New'
  }
];
