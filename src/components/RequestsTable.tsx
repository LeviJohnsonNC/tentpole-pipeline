import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestWithClient } from "@/utils/dataHelpers";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface RequestsTableProps {
  requests: RequestWithClient[];
  statusFilter?: string | null;
}

const RequestsTable = ({ requests, statusFilter }: RequestsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState<string>("all");

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      case 'Assessment complete':
        return 'bg-emerald-100 text-emerald-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Unscheduled':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Client</TableHead>
              <TableHead className="font-medium">Title</TableHead>
              <TableHead className="font-medium">Property</TableHead>
              <TableHead className="font-medium">Contact</TableHead>
              <TableHead className="font-medium">Requested</TableHead>
              <TableHead className="font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="hover:bg-gray-50">
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <div className="font-medium text-gray-900">{request.client.name}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <div className="text-gray-900">{request.title}</div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block text-gray-600">
                    {request.client.primaryAddress}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/requests/${request.id}`} className="block">
                    <div className="text-sm text-gray-600">
                      {request.client.phone && <div>{request.client.phone}</div>}
                      {request.client.email && <div>{request.client.email}</div>}
                    </div>
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
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
