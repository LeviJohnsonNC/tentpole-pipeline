
import { Badge } from "@/components/ui/badge";
import { getRequestsWithClientInfo } from "@/utils/dataHelpers";

const RequestsTable = () => {
  const requestsWithClients = getRequestsWithClientInfo();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Client</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Title</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Property</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Contact</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Requested</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          {requestsWithClients.map((request) => (
            <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900">{request.client.name}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{request.title}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{request.client.primaryAddress}</td>
              <td className="py-3 px-4 text-sm text-gray-600 whitespace-pre-line">
                {request.client.phone && `${request.client.phone}\n`}
                {request.client.email}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{request.requestDate}</td>
              <td className="py-3 px-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {request.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
