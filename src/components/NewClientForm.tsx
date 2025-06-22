
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useClientStore } from "@/store/clientStore";
import { Client, Address, CustomField } from "@/types/Client";
import PrimaryContactSection from "@/components/FormSections/PrimaryContactSection";
import CommunicationSection from "@/components/FormSections/CommunicationSection";
import LeadInformationSection from "@/components/FormSections/LeadInformationSection";
import PropertyAddressSection from "@/components/FormSections/PropertyAddressSection";
import { useToast } from "@/hooks/use-toast";

const clientSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  communicationMethod: z.enum(["email", "phone", "text"]).optional(),
  allowMarketing: z.boolean().default(false),
  allowReminders: z.boolean().default(true),
  leadSource: z.string().optional(),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Canada"),
  gstRate: z.number().optional(),
  billingAddressSameAsProperty: z.boolean().default(true),
});

type ClientFormData = z.infer<typeof clientSchema>;

const NewClientForm = () => {
  const navigate = useNavigate();
  const { addSessionClient, sessionClients } = useClientStore();
  const { toast } = useToast();

  console.log('NewClientForm - Current sessionClients:', sessionClients);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      allowMarketing: false,
      allowReminders: true,
      street1: "",
      street2: "",
      city: "",
      province: "",
      postalCode: "",
      country: "Canada",
      billingAddressSameAsProperty: true,
    },
  });

  const onSubmit = (data: ClientFormData) => {
    console.log('Form submission data:', data);
    
    const primaryAddress: Address = {
      street1: data.street1,
      street2: data.street2 || "",
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      country: data.country,
    };

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`.trim() || data.companyName || "Unnamed Client",
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      primaryAddress: `${primaryAddress.street1}, ${primaryAddress.city}, ${primaryAddress.province}`,
      fullPrimaryAddress: primaryAddress,
      tags: [],
      status: 'Lead',
      jobHistory: [],
      communicationLog: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      communicationSettings: {
        preferredMethod: data.communicationMethod || 'email',
        allowMarketing: data.allowMarketing,
        allowReminders: data.allowReminders,
      },
      leadSource: data.leadSource,
      gstRate: data.gstRate,
      billingAddressSameAsProperty: data.billingAddressSameAsProperty,
      customFields: [],
      additionalContacts: [],
    };

    console.log('Created new client object:', newClient);
    addSessionClient(newClient);
    
    // Force a small delay to ensure store update
    setTimeout(() => {
      console.log('Store state after adding client:', useClientStore.getState().sessionClients);
    }, 100);
    
    toast({
      title: "Client created successfully",
      description: `${newClient.name} has been added to your clients.`,
    });

    navigate('/clients');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">
            <PrimaryContactSection form={form} />
            <CommunicationSection form={form} />
            <LeadInformationSection form={form} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <PropertyAddressSection form={form} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => navigate('/clients')}
          >
            Cancel
          </Button>
          <div className="flex space-x-3">
            <Button type="submit" variant="outline">
              Save and create another
            </Button>
            <Button type="submit" className="bg-[#0B6839] hover:bg-[#0B6839]/90">
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default NewClientForm;
