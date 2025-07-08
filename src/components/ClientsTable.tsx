
import { useState, useMemo } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllClients } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { useQuoteStore } from "@/store/quoteStore";

interface ClientsTableProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ClientsTable = ({ searchTerm, onSearchChange }: ClientsTableProps) => {
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  const { sessionQuotes } = useQuoteStore();
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const allClients = useMemo(() => getAllClients(sessionClients), [sessionClients]);

  // Stage order from most to least advanced (leftmost to rightmost in pipeline)
  const stageOrder = [
    'Quote Awaiting Response',
    'Draft Quote', 
    'Contacted',
    'New Opportunities',
    'Followup'
  ];

  const getRequestStatusPriority = (status: string): number => {
    const statusToStage: { [key: string]: string } = {
      'New': 'New Opportunities',
      'Assessment complete': 'Contacted',
      'Converted': 'Converted', // This won't be in pipeline
      'Archived': 'Archived' // This won't be in pipeline
    };
    
    const stage = statusToStage[status] || status;
    const priority = stageOrder.indexOf(stage);
    return priority === -1 ? 999 : priority; // Unknown stages go to end
  };

  const getQuoteStatusPriority = (status: string): number => {
    const statusToStage: { [key: string]: string } = {
      'Draft': 'Draft Quote',
      'Awaiting Response': 'Quote Awaiting Response',
      'Approved': 'Converted', // This won't be in pipeline
      'Converted': 'Converted', // This won't be in pipeline
      'Closed Lost': 'Archived' // This won't be in pipeline
    };
    
    const stage = statusToStage[status] || status;
    const priority = stageOrder.indexOf(stage);
    return priority === -1 ? 999 : priority; // Unknown stages go to end
  };

  const getMostAdvancedLeadStage = (clientName: string): string => {
    // Get all requests for this client
    const clientRequests = sessionRequests.filter(req => {
      const client = sessionClients.find(c => c.id === req.clientId);
      return client?.name === clientName;
    });

    // Get all quotes for this client
    const clientQuotes = sessionQuotes.filter(quote => {
      const client = sessionClients.find(c => c.id === quote.clientId);
      return client?.name === clientName;
    });

    let mostAdvancedStage = 'New Opportunities';
    let bestPriority = 999;

    // Check request statuses
    clientRequests.forEach(request => {
      const priority = getRequestStatusPriority(request.status);
      if (priority < bestPriority) {
        bestPriority = priority;
        const statusToStage: { [key: string]: string } = {
          'New': 'New Opportunities',
          'Assessment complete': 'Contacted',
        };
        mostAdvancedStage = statusToStage[request.status] || request.status;
      }
    });

    // Check quote statuses (these typically have higher priority)
    clientQuotes.forEach(quote => {
      const priority = getQuoteStatusPriority(quote.status);
      if (priority < bestPriority) {
        bestPriority = priority;
        const statusToStage: { [key: string]: string } = {
          'Draft': 'Draft Quote',
          'Awaiting Response': 'Quote Awaiting Response',
        };
        mostAdvancedStage = statusToStage[quote.status] || quote.status;
      }
    });

    return mostAdvancedStage;
  };

  const getClientLastActivity = (clientName: string): string => {
    const client = sessionClients.find(c => c.name === clientName);
    if (!client) return new Date().toISOString();

    // Get all requests for this client
    const clientRequests = sessionRequests.filter(req => {
      const c = sessionClients.find(c => c.id === req.clientId);
      return c?.name === clientName;
    });

    // Get all quotes for this client
    const clientQuotes = sessionQuotes.filter(quote => {
      const c = sessionClients.find(c => c.id === quote.clientId);
      return c?.name === clientName;
    });

    // Find the most recent activity
    let mostRecentDate = client.createdAt;

    clientRequests.forEach(request => {
      if (request.createdAt > mostRecentDate) {
        mostRecentDate = request.createdAt;
      }
    });

    clientQuotes.forEach(quote => {
      if (quote.createdDate > mostRecentDate) {
        mostRecentDate = quote.createdDate;
      }
    });

    return mostRecentDate;
  };

  const filteredClients = useMemo(() => {
    return allClients.filter(client => {
      if (searchTerm === "") return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [allClients, searchTerm]);

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortField === 'lastActivity') {
        aValue = getClientLastActivity(a.name);
        bValue = getClientLastActivity(b.name);
      } else {
        aValue = a[sortField as keyof typeof a] || '';
        bValue = b[sortField as keyof typeof b] || '';
      }
      
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredClients, sortField, sortDirection, sessionRequests, sessionQuotes, sessionClients]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeadStageColor = (stage: string) => {
    switch (stage) {
      case 'Quote Awaiting Response':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Draft Quote':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'New Opportunities':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Followup':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    // Truncate long addresses
    return address.length > 30 ? `${address.substring(0, 30)}...` : address;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead 
              className="text-left font-medium text-gray-700 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('name')}
            >
              Client {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-left font-medium text-gray-700">Contact</TableHead>
            <TableHead 
              className="text-left font-medium text-gray-700 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('primaryAddress')}
            >
              Primary address {sortField === 'primaryAddress' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-left font-medium text-gray-700">Tags</TableHead>
            <TableHead 
              className="text-left font-medium text-gray-700 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('status')}
            >
              Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="text-left font-medium text-gray-700 cursor-pointer hover:text-gray-900"
              onClick={() => handleSort('lastActivity')}
            >
              Last activity {sortField === 'lastActivity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClients.map((client) => (
            <TableRow key={client.id} className="border-gray-200 hover:bg-gray-50">
              <TableCell className="py-4">
                <div>
                  <div className="font-medium text-gray-900">{client.name}</div>
                  {client.subtitle && (
                    <div className="text-sm text-gray-500">{client.subtitle}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                {client.primaryAddress && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    {formatAddress(client.primaryAddress)}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-wrap gap-1">
                  {client.tags.slice(0, 2).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-gray-100 text-gray-700 border-gray-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gray-100 text-gray-700 border-gray-300"
                    >
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col space-y-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(client.status)}`}
                  >
                    {client.status}
                  </Badge>
                  {client.status === 'Lead' && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getLeadStageColor(getMostAdvancedLeadStage(client.name))}`}
                    >
                      {getMostAdvancedLeadStage(client.name)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 text-sm text-gray-600">
                {new Date(getClientLastActivity(client.name)).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
