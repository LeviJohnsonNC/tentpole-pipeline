
import { Badge } from "@/components/ui/badge";

const RequestsTable = () => {
  const requests = [
    {
      client: "Test Client",
      title: "New landscaping request",
      property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
      contact: "(306) 555-5555\ntest@client.com",
      requested: "May 26",
      status: "New"
    },
    {
      client: "Test Client",
      title: "Landscaping",
      property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
      contact: "(306) 555-5555\ntest@client.com",
      requested: "May 26",
      status: "New"
    },
    {
      client: "Pete Duggan",
      title: "",
      property: "188 Chestnut Street, Pictou, Nova Scotia B2H 1Y5",
      contact: "",
      requested: "May 23",
      status: "New"
    },
    {
      client: "Sid Sidé",
      title: "",
      property: "",
      contact: "",
      requested: "May 23",
      status: "New"
    },
    {
      client: "Pam Sillar",
      title: "Request!",
      property: "190 Watt Street, Winnipeg, Manitoba R2L 2B8",
      contact: "",
      requested: "May 23",
      status: "New"
    },
    {
      client: "Enjoi Skateboards",
      title: "Levi's Request #1",
      property: "",
      contact: "(306) 555-5555",
      requested: "Mar 19",
      status: "New"
    },
    {
      client: "Marketing Dashboard Aabsss",
      title: "",
      property: "5527 15 Ave NW, Edmonton, AB T5A 2X6",
      contact: "(123456789074744443\nlaura.@getjobber.com",
      requested: "Nov 13",
      status: "New"
    },
    {
      client: "SC2 referral test sep 24th 10:35pm",
      title: "",
      property: "909 king street, toronto, on m5s2h8",
      contact: "(647) 299-5877\nming0716@gmail.com",
      requested: "Sep 24",
      status: "New"
    },
    {
      client: "Natasha Wheeler",
      title: "SC2 Sep 16th 10:57am (bump)",
      property: "123 king street, toronto, on m5s2h7",
      contact: "(647) 299-5877\nlink.eggs@gmail.com",
      requested: "Sep 16",
      status: "New"
    },
    {
      client: "Referrals Sep 10th 1:33pm",
      title: "",
      property: "899 king street, toronto, on m5s2h7",
      contact: "(647) 299-5877\nxguo99@gmail.com",
      requested: "Sep 10",
      status: "New"
    }
  ];

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
          {requests.map((request, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900">{request.client}</td>
              <td className="py-3 px-4 text-sm text-gray-900">{request.title}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{request.property}</td>
              <td className="py-3 px-4 text-sm text-gray-600 whitespace-pre-line">{request.contact}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{request.requested}</td>
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
