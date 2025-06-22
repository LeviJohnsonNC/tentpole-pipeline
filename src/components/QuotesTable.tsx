
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { QuoteWithClient } from "@/utils/dataHelpers";
import { Search, Filter, MoreHorizontal, Copy, MessageSquareText, Mail } from "lucide-react";
import { SendQuoteModal } from "./SendQuoteModal";
import { EmailQuoteModal } from "./EmailQuoteModal";
import { useQuoteStore } from "@/store/quoteStore";

interface QuotesTableProps {
  quotes: QuoteWithClient[];
  statusFilter?: string | null;
}

const QuotesTable = ({ quotes, statusFilter }: QuotesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salespersonFilter, setSalespersonFilter] = useState<string>("all");
  const [selectedQuoteForText, setSelectedQuoteForText] = useState<QuoteWithClient | null>(null);
  const [selectedQuoteForEmail, setSelectedQuoteForEmail] = useState<QuoteWithClient | null>(null);
  const { updateQuoteStatus } = useQuoteStore();
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Awaiting Response':
        return 'bg-blue-100 text-blue-800';
      case 'Changes Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Converted':
        return 'bg-emerald-100 text-emerald-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quote.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quote.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || quote.status === statusFilter;
    const matchesSalesperson = salespersonFilter === "all" || quote.salesperson === salespersonFilter;
    
    return matchesSearch && matchesStatus && matchesSalesperson;
  });

  const uniqueSalespeople = [...new Set(quotes.map(q => q.salesperson).filter(Boolean))];

  const handleSendQuoteText = (quote: QuoteWithClient) => {
    setSelectedQuoteForText(quote);
  };

  const handleSendQuoteEmail = (quote: QuoteWithClient) => {
    setSelectedQuoteForEmail(quote);
  };

  const handleQuoteSentText = () => {
    if (selectedQuoteForText) {
      updateQuoteStatus(selectedQuoteForText.id, 'Awaiting Response');
      setSelectedQuoteForText(null);
    }
  };

  const handleQuoteSentEmail = () => {
    if (selectedQuoteForEmail) {
      updateQuoteStatus(selectedQuoteForEmail.id, 'Awaiting Response');
      setSelectedQuoteForEmail(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Client</TableHead>
              <TableHead className="font-medium">Quote #</TableHead>
              <TableHead className="font-medium">Property</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map(quote => (
              <HoverCard key={quote.id} openDelay={100} closeDelay={300}>
                <HoverCardTrigger asChild>
                  <TableRow className="hover:bg-gray-50 cursor-pointer">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{quote.client.name}</div>
                        <div className="text-sm text-gray-500">{quote.title}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{quote.quoteNumber}</TableCell>
                    <TableCell className="text-sm text-gray-600">{quote.property}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(quote.createdDate)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeColor(quote.status)} border-0`}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(quote.amount)}</TableCell>
                  </TableRow>
                </HoverCardTrigger>
                <HoverCardContent 
                  className="w-auto p-2 bg-white border shadow-lg z-50" 
                  side="right" 
                  align="center"
                  sideOffset={10}
                >
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      title="Send as text message"
                      onClick={() => handleSendQuoteText(quote)}
                    >
                      <MessageSquareText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      title="Send as email"
                      onClick={() => handleSendQuoteEmail(quote)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                      title="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
            {filteredQuotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No quotes found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SendQuoteModal 
        quote={selectedQuoteForText}
        isOpen={!!selectedQuoteForText}
        onClose={() => setSelectedQuoteForText(null)}
        onSend={handleQuoteSentText}
      />

      <EmailQuoteModal 
        quote={selectedQuoteForEmail}
        isOpen={!!selectedQuoteForEmail}
        onClose={() => setSelectedQuoteForEmail(null)}
        onSend={handleQuoteSentEmail}
      />
    </div>
  );
};

export default QuotesTable;
