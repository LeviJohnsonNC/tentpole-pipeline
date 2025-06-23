
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useQuoteStore } from "@/store/quoteStore";
import { useRequestStore } from "@/store/requestStore";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import ClientSelectionModal from "./ClientSelectionModal";
import StarRating from "./StarRating";
import { Quote } from "@/types/Quote";
import { getAllClients, getRequestById } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";

interface QuoteFormData {
  title: string;
  clientId: string;
  property: string;
  notes: string;
  rating: number;
  division: string;
  amount: number;
}

const NewQuoteForm = () => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { addSessionQuote } = useQuoteStore();
  const { sessionClients } = useClientStore();
  const { sessionRequests } = useRequestStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Debug client state
  useEffect(() => {
    console.log('NewQuoteForm - sessionClients changed:', {
      sessionClientsCount: sessionClients.length,
      sessionClients: sessionClients.map(c => ({ id: c.id, name: c.name }))
    });
    
    const allClients = getAllClients(sessionClients);
    console.log('NewQuoteForm - getAllClients result:', {
      totalClientsCount: allClients.length,
      allClients: allClients.map(c => ({ id: c.id, name: c.name }))
    });
  }, [sessionClients]);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QuoteFormData>({
    defaultValues: {
      rating: 0,
      amount: 0,
    }
  });

  const watchedRating = watch("rating");

  // Handle pre-filled data from request conversion via URL params or location state
  useEffect(() => {
    const requestId = searchParams.get('requestId');
    const clientId = searchParams.get('clientId');
    
    if (requestId && clientId) {
      // Coming from request conversion via URL
      const request = getRequestById(requestId, sessionRequests);
      
      if (request) {
        // Set client
        setSelectedClientId(clientId);
        setValue("clientId", clientId);
        
        // Fill in property from request if available
        if (request.serviceDetails) {
          // Try to extract property address from service details or use a generic property field
          setValue("property", ""); // Leave property blank as requested, user can fill it in
        }
        
        // Fill in notes with service details
        setValue("notes", request.serviceDetails);
      }
    } else if (location.state && location.state.fromRequest) {
      // Coming from request conversion via location state (legacy)
      const { clientId, property, notes, serviceDetails } = location.state;
      
      if (clientId) {
        setSelectedClientId(clientId);
        setValue("clientId", clientId);
      }
      
      if (property) {
        setValue("property", property);
      }
      
      if (notes || serviceDetails) {
        setValue("notes", notes || serviceDetails);
      }
    }
  }, [searchParams, location.state, setValue, sessionRequests]);

  // Get all clients and find the selected one
  const allClients = getAllClients(sessionClients);
  const selectedClient = selectedClientId ? allClients.find(client => client.id === selectedClientId) : null;

  const onSubmit = (data: QuoteFormData) => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    const requestId = searchParams.get('requestId') || location.state?.requestId;

    const newQuote: Quote = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      requestId: requestId || undefined, // Link to request if created from request
      quoteNumber: `Q-${Date.now()}`,
      title: data.title,
      property: data.property,
      status: 'Draft',
      amount: data.amount,
      createdDate: new Date().toISOString(),
      notes: data.notes,
      rating: data.rating,
      division: data.division,
    };

    addSessionQuote(newQuote);
    console.log('New quote created and added to session:', newQuote.id);
    toast.success("Quote saved successfully");
    navigate("/quotes");
  };

  const handleClientSelect = (clientId: string) => {
    console.log('NewQuoteForm - client selected:', clientId);
    setSelectedClientId(clientId);
    setValue("clientId", clientId);
    setIsClientModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Quote Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quote title</Label>
            <Input
              id="title"
              {...register("title", { required: "Quote title is required" })}
              placeholder="Enter quote title"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <Label>Client</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-auto p-4 text-left"
              onClick={() => setIsClientModalOpen(true)}
            >
              {selectedClient ? (
                <span className="text-gray-900">{selectedClient.name}</span>
              ) : (
                <span className="text-gray-500">Select a client</span>
              )}
            </Button>
          </div>

          {/* Property */}
          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            <Input
              id="property"
              {...register("property", { required: "Property is required" })}
              placeholder="Enter property address"
            />
            {errors.property && (
              <p className="text-sm text-red-600">{errors.property.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { required: "Amount is required" })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating
              rating={watchedRating}
              onChange={(rating) => setValue("rating", rating)}
            />
          </div>

          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Input
              id="division"
              {...register("division")}
              placeholder="Enter division"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any additional notes..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/quotes")}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Save Quote
        </Button>
      </div>

      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientSelect={handleClientSelect}
      />
    </form>
  );
};

export default NewQuoteForm;
