import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RequestWithClient } from "@/utils/dataHelpers";
import { Search, Filter, MoreHorizontal, Quote, Hammer, Archive, Printer, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface RequestsTableProps {
  requests: RequestWithClient[];
  statusFilter?: string | null;
}

const RequestsTable = ({ requests, statusFilter }: RequestsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState<string>("all");
  const navigate = useNavigate();

  const handleConvertToQuote = (request: RequestWithClient) => {
    // Navigate to new quote with request data pre-filled
    navigate('/quotes/new', { 
      state: { 
        fromRequest: true,
        requestId: request.id,
        clientId: request.clientId,
        property: request.client.primaryAddress,
        notes: request.serviceDetails,
        serviceDetails: request.serviceDetails
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeColor = (urgency: string) => {
    switch (urgency) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesSalesperson = salespersonFilter === "all" || request.assignedTeamMember === salespersonFilter;

    return matchesSearch && matchesStatus && matchesSalesperson;
  });

  const uniqueSalespeople = [...new Set(requests.map(r => r.assignedTeamMember).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Client</TableHead>
              <TableHead className="font-medium">Requested</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Assigned</TableHead>
              <TableHead className="font-medium">Urgency</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="hover:bg-gray-50">
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <div className="font-medium text-gray-900">{request.client.name}</div>
                    <div className="text-sm text-gray-500">{request.title}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block text-sm text-gray-600">
                    {formatDate(request.requestDate)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <Badge className={`${getStatusBadgeColor(request.status)} border-0`}>
                      {request.status}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  <Link to={`/requests/${request.id}`} className="block">
                    {request.assignedTeamMember || 'Unassigned'}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <Badge className={`${getUrgencyBadgeColor(request.urgency)} border-0`}>
                      {request.urgency}
                    </Badge>
                  </Link>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem 
                        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleConvertToQuote(request)}
                      >
                        <Quote className="h-4 w-4 text-gray-600" />
                        <span>Convert to Quote</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <Hammer className="h-4 w-4 text-gray-600" />
                        <span>Convert to Job</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <Archive className="h-4 w-4 text-gray-600" />
                        <span>Archive</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <Printer className="h-4 w-4 text-gray-600" />
                        <span>Print</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No requests found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequestsTable;
