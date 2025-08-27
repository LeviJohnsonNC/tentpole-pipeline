import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';
import { useSalespersonStore, Salesperson } from '@/store/salespersonStore';
import { useClientStore } from '@/store/clientStore';
import { toast } from 'sonner';

interface SalespersonAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  currentSalesperson?: Salesperson;
}

const SalespersonAssignmentModal = ({
  isOpen,
  onClose,
  clientName,
  currentSalesperson
}: SalespersonAssignmentModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { salespeople } = useSalespersonStore();
  const { sessionClients, updateSessionClient } = useClientStore();

  const filteredSalespeople = salespeople.filter(sp =>
    sp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignSalesperson = (salesperson: Salesperson) => {
    const client = sessionClients.find(c => c.name === clientName);
    if (client) {
      updateSessionClient(client.id, { salesperson: salesperson.name });
      toast.success(`${salesperson.name} assigned to ${clientName}`);
    } else {
      toast.error('Client not found');
    }
    onClose();
  };

  const handleRemoveAssignment = () => {
    const client = sessionClients.find(c => c.name === clientName);
    if (client) {
      updateSessionClient(client.id, { salesperson: undefined });
      toast.success(`Salesperson removed from ${clientName}`);
    } else {
      toast.error('Client not found');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {currentSalesperson ? 'Change Salesperson' : 'Assign Salesperson'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {currentSalesperson && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Currently assigned to:</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {currentSalesperson.avatarUrl && (
                    <AvatarImage src={currentSalesperson.avatarUrl} alt={currentSalesperson.name} />
                  )}
                  <AvatarFallback 
                    style={{ backgroundColor: currentSalesperson.color, color: 'white' }}
                    className="text-sm font-medium"
                  >
                    {currentSalesperson.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{currentSalesperson.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAssignment}
                  className="ml-auto"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salespeople..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredSalespeople.map((salesperson) => (
              <button
                key={salesperson.id}
                onClick={() => handleAssignSalesperson(salesperson)}
                className="w-full p-3 text-left rounded-lg border hover:bg-muted transition-colors flex items-center gap-3"
                disabled={currentSalesperson?.id === salesperson.id}
              >
                <Avatar className="h-8 w-8">
                  {salesperson.avatarUrl && (
                    <AvatarImage src={salesperson.avatarUrl} alt={salesperson.name} />
                  )}
                  <AvatarFallback 
                    style={{ backgroundColor: salesperson.color, color: 'white' }}
                    className="text-sm font-medium"
                  >
                    {salesperson.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{salesperson.name}</span>
                {currentSalesperson?.id === salesperson.id && (
                  <span className="ml-auto text-sm text-muted-foreground">Current</span>
                )}
              </button>
            ))}
          </div>

          {filteredSalespeople.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No salespeople found matching "{searchTerm}"
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalespersonAssignmentModal;