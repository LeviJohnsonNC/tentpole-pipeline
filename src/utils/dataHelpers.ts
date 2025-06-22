
import { Client } from '@/types/Client';
import { Request } from '@/types/Request';
import { clientsData } from '@/data/clientsData';
import { requestsData } from '@/data/requestsData';

// Client operations
export const getClientById = (id: string, sessionClients: Client[] = []): Client | undefined => {
  // Check session clients first
  const sessionClient = sessionClients.find(client => client.id === id);
  if (sessionClient) return sessionClient;
  
  return clientsData.find(client => client.id === id);
};

export const getAllClients = (sessionClients: Client[] = []): Client[] => {
  return [...clientsData, ...sessionClients];
};

// Request operations
export const getRequestById = (id: string): Request | undefined => {
  return requestsData.find(request => request.id === id);
};

export const getAllRequests = (): Request[] => {
  return requestsData;
};

export const getRequestsByClientId = (clientId: string): Request[] => {
  return requestsData.filter(request => request.clientId === clientId);
};

export const getClientByRequestId = (requestId: string, sessionClients: Client[] = []): Client | undefined => {
  const request = getRequestById(requestId);
  if (!request) return undefined;
  return getClientById(request.clientId, sessionClients);
};

// Combined operations for table display
export interface RequestWithClient extends Request {
  client: Client;
}

export const getRequestsWithClientInfo = (sessionClients: Client[] = []): RequestWithClient[] => {
  return requestsData.map(request => {
    const client = getClientById(request.clientId, sessionClients);
    if (!client) {
      throw new Error(`Client not found for request ${request.id}`);
    }
    return {
      ...request,
      client
    };
  });
};

// Validation functions
export const validateRequestHasClient = (request: Partial<Request>, sessionClients: Client[] = []): boolean => {
  if (!request.clientId) return false;
  return !!getClientById(request.clientId, sessionClients);
};

export const canDeleteClient = (clientId: string): boolean => {
  const clientRequests = getRequestsByClientId(clientId);
  return clientRequests.length === 0;
};
