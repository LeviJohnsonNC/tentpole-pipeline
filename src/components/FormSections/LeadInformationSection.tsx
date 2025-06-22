
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface LeadInformationSectionProps {
  form: UseFormReturn<any>;
}

const LeadInformationSection = ({ form }: LeadInformationSectionProps) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-base font-medium text-gray-900 mb-4">Lead information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="leadSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where did this lead come from?</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Google, referral, social media" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default LeadInformationSection;
