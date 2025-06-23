
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import { getAllClients } from "@/utils/dataHelpers";
import { useNavigate } from "react-router-dom";
import { Client } from "@/types/Client";

interface ClientSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSelect: (clientId: string) => void;
}

const ClientSelectionModal = ({ isOpen, onClose, onClientSelect }: ClientSelectionModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const sessionClients = useClientStore(state => state.sessionClients);
  const navigate = useNavigate();
  
  // Force re-render when sessionClients change
  const [, forceUpdate] = useState({});
  useEffect(() => {
    console.log('ClientSelectionModal - sessionClients changed:', sessionClients.length);
    forceUpdate({});
  }, [sessionClients]);
  
  const clients = getAllClients(sessionClients);
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'Lead': return 'bg-blue-100 text-blue-700';
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNewClient = () => {
    onClose();
    navigate('/clients/new');
  };

  const handleClientSelect = (clientId: string) => {
    onClientSelect(clientId);
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select a client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Create New Client Option */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={handleNewClient}
          >
            <Plus className="h-4 w-4 mr-3 text-green-600" />
            <span className="text-green-600 font-medium">Create new client</span>
          </Button>

          {/* Client List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredClients.map((client) => (
              <Button
                key={client.id}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleClientSelect(client.id)}
              >
                <div className="flex items-center space-x-3 flex-1 text-left">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.primaryAddress}</div>
                    <div className="text-sm text-gray-500">
                      {[client.phone, client.email].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>

          {filteredClients.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              No clients found matching "{searchTerm}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelectionModal;
