
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { QuoteWithClient } from "@/utils/dataHelpers";

interface SendQuoteModalProps {
  quote: QuoteWithClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}

export const SendQuoteModal = ({ quote, isOpen, onClose, onSend }: SendQuoteModalProps) => {
  if (!quote) return null;

  const handleSend = () => {
    onSend();
  };

  const defaultMessage = `Hi ${quote.client.name}, here's your quote from GROW QA 1.

View your quote here https://jbbr.io/6Z0XZcoNrhH4kvEr9

Your client can view the quote in their client hub.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Send quote #{quote.quoteNumber} to {quote.client.name} as a text message
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              To
            </label>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 px-3 py-2 rounded border text-sm flex items-center">
                {quote.client.phone || "+17809844327"}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message
              </label>
              <Textarea
                id="message"
                value={defaultMessage}
                readOnly
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="link" className="text-green-600 p-0 h-auto text-sm">
                  Customize your default templates
                </Button>
                <span className="text-sm text-gray-500">104</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preview</label>
              <div className="bg-gray-50 p-3 rounded border text-sm italic text-gray-600">
                {defaultMessage}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700">
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
