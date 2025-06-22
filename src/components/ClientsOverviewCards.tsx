
import { Card, CardContent } from "@/components/ui/card";
import { getAllClients } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";
import { useMemo } from "react";

const ClientsOverviewCards = () => {
  const { sessionClients } = useClientStore();
  const allClients = useMemo(() => getAllClients(sessionClients), [sessionClients]);

  const stats = useMemo(() => {
    const total = allClients.length;
    const leads = allClients.filter(client => client.status === 'Lead').length;
    const active = allClients.filter(client => client.status === 'Active').length;
    const archived = allClients.filter(client => client.status === 'Archived').length;

    return { total, leads, active, archived };
  }, [allClients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total clients</div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.leads}</div>
          <div className="text-sm text-gray-600">Leads</div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </CardContent>
      </Card>
      
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          <div className="text-sm text-gray-600">Archived</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsOverviewCards;
