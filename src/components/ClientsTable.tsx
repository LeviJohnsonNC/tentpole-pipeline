
import { Badge } from "@/components/ui/badge";

const ClientsTable = () => {
  const clients = [
    {
      name: "Nate Brown",
      address: "8 Patterson Drive, Ayr, Ontario N0B 1E0",
      tags: [],
      status: "Active",
      lastActivity: "Fri"
    },
    {
      name: "Zev P",
      address: "5780 Major Boulevard, Orlando, Florida 32819",
      tags: [],
      status: "Active", 
      lastActivity: "Fri"
    },
    {
      name: "Philip Dickau",
      address: "9871 279 St, Acheson, Alberta T7X 6J4",
      tags: [],
      status: "Active",
      lastActivity: "Fri"
    },
    {
      name: "Eno Ren",
      address: "2725 Melfa Road, Vancouver, British Columbia V6T 1N4",
      tags: [],
      status: "Active",
      lastActivity: "Thu"
    },
    {
      name: "Client 5.0.0 3",
      address: "4 Properties",
      tags: ["HVAC"],
      status: "Active",
      lastActivity: "Wed"
    },
    {
      name: "Nathaniel Lewis",
      address: "123 Edward Street, Old Toronto, Toronto, Ontario M5G 0A8",
      tags: ["HVAC"],
      status: "Active",
      lastActivity: "Wed"
    },
    {
      name: "Ruth H",
      address: "1901 Brady Road, La Barriere, La Salle, Manitoba R0G 0A1",
      tags: [],
      status: "Active",
      lastActivity: "Wed"
    },
    {
      name: "Estelle's ice-cream truck company",
      address: "7 Grenville Street, Old Toronto, Toronto, Ontario M4Y 0E9",
      tags: [],
      status: "Active",
      lastActivity: "Wed",
      subtitle: "Estelle's ice-cream truck company"
    },
    {
      name: "John Adams",
      address: "1 Main Street South, Brampton, Ontario L6V 1M8",
      tags: ["HVAC"],
      status: "Active",
      lastActivity: "Wed"
    }
  ];

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
          {clients.map((client, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
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
              <td className="py-3 px-4 text-sm text-gray-600">{client.address}</td>
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
