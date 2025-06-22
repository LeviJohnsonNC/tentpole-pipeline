
import { Badge } from "@/components/ui/badge";
import { getAllClients } from "@/utils/dataHelpers";

const ClientsTable = () => {
  const clients = getAllClients();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
              <input type="checkbox" className="mr-3" />
              Name
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Address</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tags</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Last activity</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <div>
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                      {client.name}
                    </div>
                    {client.subtitle && (
                      <div className="text-xs text-gray-500">{client.subtitle}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{client.primaryAddress}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {client.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-900">{client.status}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{client.lastActivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
