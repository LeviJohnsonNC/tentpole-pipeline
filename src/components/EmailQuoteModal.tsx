
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, File, MoreHorizontal } from "lucide-react";
import { QuoteWithClient } from "@/utils/dataHelpers";

interface EmailQuoteModalProps {
  quote: QuoteWithClient | null;
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}

export const EmailQuoteModal = ({ quote, isOpen, onClose, onSend }: EmailQuoteModalProps) => {
  if (!quote) return null;

  const handleSend = () => {
    onSend();
  };

  const defaultSubject = `Quote from GROW QA 1 - 22/06/2025`;
  const defaultMessage = `Hi ${quote.client.name},

Thank you for asking us to quote on your project.

The quote total is $${quote.amount.toFixed(2)} as of 22/06/2025.

If you have any questions or concerns regarding this quote, please don't hesitate to get in touch with us at pd_operations+grow1@getjobber.com.

Sincerely,

GROW QA 1`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Email quote #{quote.quoteNumber} to {quote.client.name}
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
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="space-y-2">
                <label htmlFor="to" className="text-sm font-medium text-gray-700">
                  To
                </label>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-100 px-3 py-2 rounded border text-sm flex items-center">
                    {quote.client.email || "test@client.com"}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-2">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={defaultSubject}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  value={defaultMessage}
                  readOnly
                  className="min-h-[300px] resize-none bg-gray-50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="sendCopy" />
                <label htmlFor="sendCopy" className="text-sm text-gray-700">
                  Send me a copy
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-500">
                    Drag your files here or{" "}
                    <span className="text-green-600 font-medium">Select a File</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <File className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">quote_241.pdf</div>
                    <div className="text-xs text-gray-500">0 Bytes</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Quote attachments</span>
                  <span className="text-sm text-gray-500">0</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Client attachments</span>
                  <span className="text-sm text-gray-500">0</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                You've attached 0.00 MB out of the 10 MB limit
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700">
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
