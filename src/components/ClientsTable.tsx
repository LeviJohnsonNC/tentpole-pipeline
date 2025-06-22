
import { useState, useMemo } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllClients } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";

const ClientsTable = () => {
  const { sessionClients } = useClientStore();
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const allClients = useMemo(() => getAllClients(sessionClients), [sessionClients]);

  const sortedClients = useMemo(() => {
    return [...allClients].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a] || '';
      const bValue = b[sortField as keyof typeof b] || '';
      
      if (sortDirection === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [allClients, sortField, sortDirection]);

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
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(client.status)}`}
                >
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell className="py-4 text-sm text-gray-600">
                {new Date(client.lastActivity).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
