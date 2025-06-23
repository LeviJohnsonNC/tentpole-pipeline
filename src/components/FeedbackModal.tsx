
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Simulate sending feedback
    toast.success("Feedback submitted successfully!");
    
    // Reset form
    setEmail("");
    setSubject("");
    setMessage("");
    onClose();
  };

  const handleCancel = () => {
    // Reset form and close
    setEmail("");
    setSubject("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              id="subject"
              placeholder="Brief description of your feedback"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Please share your detailed feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            className="bg-[#0B6839] hover:bg-[#0B6839]/90 text-white"
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
