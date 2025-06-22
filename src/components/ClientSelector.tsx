
import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAllClients } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";
import { useNavigate } from "react-router-dom";
import { Client } from "@/types/Client";

interface ClientSelectorProps {
  value?: string;
  onValueChange: (clientId: string) => void;
  placeholder?: string;
}

const ClientSelector = ({ value, onValueChange, placeholder = "Select client..." }: ClientSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const sessionClients = useClientStore(state => state.sessionClients);
  const navigate = useNavigate();
  
  console.log('ClientSelector render - sessionClients:', sessionClients);
  console.log('ClientSelector render - sessionClients length:', sessionClients.length);
  
  // Get all clients directly without memoization to ensure reactivity
  const clients = getAllClients(sessionClients);
  console.log('ClientSelector render - all clients:', clients);
  console.log('ClientSelector render - all clients length:', clients.length);
  
  const selectedClient = clients.find(client => client.id === value);

  // Force component to re-render when sessionClients change
  useEffect(() => {
    console.log('ClientSelector useEffect - sessionClients changed:', sessionClients);
    setForceUpdate(prev => prev + 1);
  }, [sessionClients]);

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'Lead': return 'bg-blue-100 text-blue-700';
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNewClient = () => {
    setOpen(false);
    navigate('/clients/new');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[44px] p-3"
        >
          {selectedClient ? (
            <div className="flex items-center space-x-3 text-left">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{selectedClient.name}</div>
                <div className="text-sm text-gray-500">{selectedClient.primaryAddress}</div>
                <div className="text-sm text-gray-500">
                  {[selectedClient.phone, selectedClient.email].filter(Boolean).join(' • ')}
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(selectedClient.status)}>
                {selectedClient.status}
              </Badge>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command key={forceUpdate}>
          <CommandInput placeholder="Search clients..." />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={handleNewClient} className="flex items-center space-x-2 p-3">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Create new client</span>
              </CommandItem>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={`${client.name} ${client.primaryAddress} ${client.phone} ${client.email}`}
                  onSelect={() => {
                    onValueChange(client.id);
                    setOpen(false);
                  }}
                  className="p-3"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center space-x-3 flex-1">
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ClientSelector;
