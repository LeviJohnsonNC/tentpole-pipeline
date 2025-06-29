
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuoteNumberSectionProps {
  quoteNumber: string;
  onQuoteNumberChange: (quoteNumber: string) => void;
}

const QuoteNumberSection = ({ quoteNumber, onQuoteNumberChange }: QuoteNumberSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuoteNumber, setTempQuoteNumber] = useState(quoteNumber);

  const handleSave = () => {
    onQuoteNumberChange(tempQuoteNumber);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempQuoteNumber(quoteNumber);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="space-y-2">
          <Label htmlFor="quoteNumber">Quote number</Label>
          <Input
            id="quoteNumber"
            value={tempQuoteNumber}
            onChange={(e) => setTempQuoteNumber(e.target.value)}
            placeholder="Enter quote number"
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} size="sm">Save</Button>
          <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-600">Quote number:</span>
      <span className="font-medium">{quoteNumber}</span>
      <Button
        type="button"
        variant="link"
        className="p-0 h-auto text-blue-600"
        onClick={() => setIsEditing(true)}
      >
        Change
      </Button>
    </div>
  );
};

export default QuoteNumberSection;
