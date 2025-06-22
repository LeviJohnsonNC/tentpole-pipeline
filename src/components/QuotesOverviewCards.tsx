
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "@/types/Quote";
import { calculateQuoteMetrics } from "@/utils/dataHelpers";

interface QuotesOverviewCardsProps {
  quotes: Quote[];
}

const QuotesOverviewCards = ({ quotes }: QuotesOverviewCardsProps) => {
  const metrics = calculateQuoteMetrics(quotes);

  const cards = [
    {
      title: "Draft",
      value: metrics.draft,
      subtitle: `${metrics.total > 0 ? Math.round((metrics.draft / metrics.total) * 100) : 0}% of total quotes`,
      bgColor: "bg-gray-50"
    },
    {
      title: "Awaiting Response",
      value: metrics.awaitingResponse,
      subtitle: `${metrics.total > 0 ? Math.round((metrics.awaitingResponse / metrics.total) * 100) : 0}% of total quotes`,
      bgColor: "bg-blue-50"
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      subtitle: `${metrics.approved + metrics.converted} of ${metrics.sent} sent quotes`,
      bgColor: "bg-green-50"
    },
    {
      title: "Sent",
      value: metrics.sent,
      subtitle: `${metrics.total > 0 ? Math.round((metrics.sent / metrics.total) * 100) : 0}% of total quotes`,
      bgColor: "bg-purple-50"
    },
    {
      title: "Converted",
      value: metrics.converted,
      subtitle: `${metrics.total > 0 ? Math.round((metrics.converted / metrics.total) * 100) : 0}% of total quotes`,
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border-0`}>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuotesOverviewCards;
