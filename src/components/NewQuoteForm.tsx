import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteStore } from "@/store/quoteStore";
import { useRequestStore } from "@/store/requestStore";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ClientSelectionModal from "./ClientSelectionModal";
import StarRating from "./StarRating";
import QuoteNumberSection from "./QuoteNumberSection";
import SalespersonSelector from "./SalespersonSelector";
import { Quote } from "@/types/Quote";
import { getAllClients, getRequestById } from "@/utils/dataHelpers";
import { useClientStore } from "@/store/clientStore";

interface QuoteFormData {
  jobTitle: string;
  clientId: string;
  property: string;
  notes: string;
  rating: number;
  amount: number;
  salesperson: string;
}

const NewQuoteForm = () => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [quoteNumber, setQuoteNumber] = useState(`Q-${Date.now()}`);
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

    // PHASE 1: Fix Form Data Type Conversion
    console.log('💰 FORM SUBMIT: Raw amount data:', data.amount, 'type:', typeof data.amount);
    
    const numericAmount = typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount);
    console.log('💰 FORM SUBMIT: Converted amount:', numericAmount, 'type:', typeof numericAmount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('💰 FORM SUBMIT: Invalid amount after conversion:', numericAmount);
      toast.error("Please enter a valid amount");
      return;
    }

    const requestId = searchParams.get('requestId') || location.state?.requestId;

    const newQuote: Quote = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      requestId: requestId || undefined, // Link to request if created from request
      quoteNumber: quoteNumber,
      jobTitle: data.jobTitle,
      property: data.property,
      status: 'Draft',
      amount: numericAmount, // FIXED: Ensure numeric amount
      createdDate: new Date().toISOString(),
      notes: data.notes,
      rating: data.rating,
      salesperson: data.salesperson,
    };

    console.log('💰 FORM SUBMIT: Final quote object:', {
      id: newQuote.id,
      amount: newQuote.amount,
      amountType: typeof newQuote.amount,
      clientId: newQuote.clientId,
      status: newQuote.status,
      isStandalone: !newQuote.requestId
    });

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

  const handleClientHeaderClick = () => {
    setIsClientModalOpen(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Client Header Section */}
      <div className="space-y-6">
        <div
          className="flex items-center space-x-4 cursor-pointer group"
          onClick={handleClientHeaderClick}
        >
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Quote for {selectedClient ? selectedClient.name : "Select Client"}
            </h1>
          </div>
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="text-base font-medium">Job title</Label>
          <Input
            id="jobTitle"
            {...register("jobTitle")}
            placeholder="Enter job title"
            className="text-base"
          />
        </div>

        {/* Quote Number Section */}
        <QuoteNumberSection
          quoteNumber={quoteNumber}
          onQuoteNumberChange={setQuoteNumber}
        />
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Rate Opportunity */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Rate opportunity</Label>
          <StarRating
            rating={watchedRating}
            onChange={(rating) => setValue("rating", rating)}
          />
        </div>

        {/* Salesperson */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Salesperson</Label>
          <SalespersonSelector
            value={watch("salesperson")}
            onValueChange={(salesperson) => setValue("salesperson", salesperson)}
          />
        </div>

        {/* Add Custom Field Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          disabled
        >
          <Plus className="h-4 w-4 mr-2" />
          Add custom field
        </Button>

        {/* Property */}
        <div className="space-y-2">
          <Label htmlFor="property" className="text-base font-medium">Property</Label>
          <Input
            id="property"
            {...register("property", { required: "Property is required" })}
            placeholder="Enter property address"
            className="text-base"
          />
          {errors.property && (
            <p className="text-sm text-red-600">{errors.property.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-base font-medium">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { 
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" }
            })}
            placeholder="0.00"
            className="text-base"
          />
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Add any additional notes..."
            rows={4}
            className="text-base"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6">
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
