
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ServiceDetailsSectionProps {
  form: UseFormReturn<any>;
}

const ServiceDetailsSection = ({ form }: ServiceDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Service details</h2>
        
        <FormField
          control={form.control}
          name="serviceDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overview</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the service request in detail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">On-site assessment</h3>
          <p className="text-sm text-gray-500">On-site assessment functionality will be available soon.</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsSection;
