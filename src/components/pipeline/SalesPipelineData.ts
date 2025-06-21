
interface Deal {
  id: number;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount: number;
  status: string;
}

export const initialDeals: Deal[] = [
  {
    id: 1,
    client: "Test Client",
    title: "New landscaping request",
    property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
    contact: "(306) 555-5555\ntest@client.com",
    requested: "May 26",
    amount: 45000,
    status: "new-deals"
  },
  {
    id: 2,
    client: "Test Client",
    title: "Landscaping",
    property: "333 Skimmon Place, Saskatoon, Saskatchewan S7V 0A7",
    contact: "(306) 555-5555\ntest@client.com",
    requested: "May 26",
    amount: 45000,
    status: "new-deals"
  },
  {
    id: 3,
    client: "Pete Duggan",
    title: "Garden maintenance",
    property: "188 Chestnut Street, Pictou, Nova Scotia B2H 1Y5",
    contact: "",
    requested: "May 23",
    amount: 25000,
    status: "new-deals"
  },
  {
    id: 4,
    client: "Sid Sidé",
    title: "Landscaping consultation",
    property: "",
    contact: "",
    requested: "May 23",
    amount: 5000,
    status: "new-deals"
  },
  {
    id: 5,
    client: "Pam Sillar",
    title: "Request!",
    property: "190 Watt Street, Winnipeg, Manitoba R2L 2B8",
    contact: "",
    requested: "May 23",
    amount: 18000,
    status: "new-deals"
  },
  {
    id: 6,
    client: "Enjoi Skateboards",
    title: "Levi's Request #1",
    property: "",
    contact: "(306) 555-5555",
    requested: "Mar 19",
    amount: 15000,
    status: "new-deals"
  },
  {
    id: 7,
    client: "Marketing Dashboard Aabsss",
    title: "Commercial landscaping",
    property: "5527 15 Ave NW, Edmonton, AB T5A 2X6",
    contact: "(123456789074744443\nlaura.@getjobber.com",
    requested: "Nov 13",
    amount: 15000,
    status: "new-deals"
  }
];

export const pipelineColumns = [
  { id: "new-deals", title: "New Deals" },
  { id: "contacted", title: "Contacted" },
  { id: "quote-sent", title: "Quote Sent" },
  { id: "followup", title: "Followup" }
];

export type { Deal };
