
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useRequestStore } from "@/store/requestStore";
import { useToast } from "@/hooks/use-toast";
import BasicInformationSection from "@/components/FormSections/BasicInformationSection";
import ServiceDetailsSection from "@/components/FormSections/ServiceDetailsSection";
import NotesSection from "@/components/FormSections/NotesSection";
import { Request } from "@/types/Request";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().min(1, "Client selection is required"),
  requestDate: z.string().min(1, "Request date is required"),
  serviceDetails: z.string().optional(),
  notes: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

const NewRequestForm = () => {
  const navigate = useNavigate();
  const { addSessionRequest } = useRequestStore();
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      clientId: "",
      requestDate: new Date().toISOString().split('T')[0],
      serviceDetails: "",
      notes: "",
    },
  });

  const onSubmit = (data: RequestFormData) => {
    try {
      const newRequest: Request = {
        id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientId: data.clientId,
        title: data.title,
        serviceDetails: data.serviceDetails || "",
        requestDate: data.requestDate,
        status: 'New',
        notes: data.notes,
        customFields: {},
      };

      addSessionRequest(newRequest);
      
      toast({
        title: "Request created",
        description: "The new request has been saved successfully.",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
          <BasicInformationSection form={form} />
          <ServiceDetailsSection form={form} />
          <NotesSection form={form} />

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0B6839] hover:bg-[#0B6839]/90">
              Save Request
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewRequestForm;
