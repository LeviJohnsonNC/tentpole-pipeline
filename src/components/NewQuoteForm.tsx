import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useQuoteStore } from "@/store/quoteStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ClientSelectionModal from "./ClientSelectionModal";
import StarRating from "./StarRating";
import { Quote } from "@/types/Quote";

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
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QuoteFormData>({
    defaultValues: {
      rating: 0,
      amount: 0,
    }
  });

  const watchedRating = watch("rating");

  const onSubmit = (data: QuoteFormData) => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    const newQuote: Quote = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      quoteNumber: `Q-${Date.now()}`,
      title: data.title,
      property: data.property,
      status: 'Draft', // Ensure quotes are created with Draft status
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
              {selectedClientId ? (
                <span className="text-gray-900">Client selected</span>
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
