
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ClientSelector from "@/components/ClientSelector";
import { useClientStore } from "@/store/clientStore";

const BasicInformationSection = ({ form }: { form: any }) => {
  const sessionClients = useClientStore(state => state.sessionClients);
  
  console.log('BasicInformationSection render - sessionClients:', sessionClients);
  console.log('BasicInformationSection render - sessionClients length:', sessionClients.length);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter request title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requestDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div>
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client *</FormLabel>
              <FormControl>
                <ClientSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a client for this request..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInformationSection;
