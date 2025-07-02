import { faker } from '@faker-js/faker';

export interface Deal {
  id: string;
  client: string;
  title: string;
  property: string;
  contact: string;
  requested: string;
  amount?: number;
  status: string;
  createdAt: string;
  stageEnteredDate: string;
}

export const sampleDeals: Deal[] = [
  // New Deals - should be within 3 hours
  {
    id: "deal-1",
    client: "ABC Manufacturing",
    title: "Office Renovation",
    property: "123 Main St, Downtown",
    contact: "John Smith",
    requested: "Commercial renovation for office space",
    amount: 25000,
    status: "new-deals",
    createdAt: "2024-07-02T10:00:00Z",
    stageEnteredDate: "2024-07-02T10:00:00Z" // Within 3 hours
  },
  {
    id: "deal-2", 
    client: "Tech Startup Inc",
    title: "Modern Office Setup",
    property: "456 Innovation Blvd",
    contact: "Sarah Johnson",
    requested: "Complete office interior design",
    amount: 18000,
    status: "new-deals",
    createdAt: "2024-07-02T11:30:00Z",
    stageEnteredDate: "2024-07-02T11:30:00Z" // Within 3 hours
  },

  // Contacted - should be within 3 days
  {
    id: "deal-3",
    client: "Downtown Restaurant",
    title: "Kitchen Remodel", 
    property: "789 Food Court Plaza",
    contact: "Mike Chen",
    requested: "Commercial kitchen renovation",
    amount: 35000,
    status: "contacted",
    createdAt: "2024-07-01T14:00:00Z",
    stageEnteredDate: "2024-07-01T14:00:00Z" // 1 day ago - within limit
  },
  {
    id: "deal-4",
    client: "Local Retail Chain",
    title: "Store Front Update",
    property: "321 Shopping Center",
    contact: "Lisa Wong",
    requested: "Retail space modernization",
    amount: 22000,
    status: "contacted", 
    createdAt: "2024-06-30T16:00:00Z",
    stageEnteredDate: "2024-06-30T16:00:00Z" // 2 days ago - within limit
  },

  // Draft Quote - should be within 1 day
  {
    id: "deal-5",
    client: "Medical Practice",
    title: "Clinic Interior",
    property: "555 Health Plaza",
    contact: "Dr. Amanda Brown",
    requested: "Medical office renovation",
    amount: 28000,
    status: "draft-quote",
    createdAt: "2024-07-01T20:00:00Z",
    stageEnteredDate: "2024-07-01T20:00:00Z" // Within 1 day
  },
  {
    id: "deal-6",
    client: "Law Firm Associates", 
    title: "Conference Room Upgrade",
    property: "888 Legal District",
    contact: "Robert Taylor",
    requested: "Professional office spaces",
    amount: 31000,
    status: "draft-quote",
    createdAt: "2024-07-02T08:00:00Z",
    stageEnteredDate: "2024-07-02T08:00:00Z" // Within 1 day
  },

  // Quote Awaiting Response - 7 days limit, only one should be over
  {
    id: "deal-7",
    client: "Fitness Center Pro",
    title: "Gym Renovation",
    property: "777 Wellness Way",
    contact: "Maria Garcia",
    requested: "Complete gym interior overhaul",
    amount: 45000,
    status: "quote-awaiting-response",
    createdAt: "2024-06-30T10:00:00Z",
    stageEnteredDate: "2024-06-30T10:00:00Z" // 2 days ago - within limit
  },
  {
    id: "deal-8",
    client: "Creative Agency Hub",
    title: "Open Office Design", 
    property: "999 Creative Blvd",
    contact: "David Kim",
    requested: "Modern workspace transformation",
    amount: 33000,
    status: "quote-awaiting-response",
    createdAt: "2024-06-25T12:00:00Z", 
    stageEnteredDate: "2024-06-23T12:00:00Z" // 9 days ago - OVER LIMIT (only this one)
  },
  {
    id: "deal-9",
    client: "Boutique Hotel",
    title: "Lobby Redesign",
    property: "111 Hospitality Row",
    contact: "Emma Wilson",
    requested: "Luxury hotel lobby renovation", 
    amount: 52000,
    status: "quote-awaiting-response",
    createdAt: "2024-06-28T14:00:00Z",
    stageEnteredDate: "2024-06-28T14:00:00Z" // 4 days ago - within limit
  },

  // Followup - 7 days limit, only one should be over
  {
    id: "deal-10",
    client: "Dental Clinic Group",
    title: "Multi-Room Setup",
    property: "444 Medical Center",
    contact: "Dr. James Lee",
    requested: "Dental practice interior design",
    amount: 38000,
    status: "followup",
    createdAt: "2024-06-29T09:00:00Z",
    stageEnteredDate: "2024-06-29T09:00:00Z" // 3 days ago - within limit
  },
  {
    id: "deal-11",
    client: "Accounting Firm LLC",
    title: "Professional Office",
    property: "666 Business Park",
    contact: "Jennifer Davis",
    requested: "Corporate office renovation",
    amount: 27000,
    status: "followup",
    createdAt: "2024-06-22T11:00:00Z",
    stageEnteredDate: "2024-06-22T11:00:00Z" // 10 days ago - OVER LIMIT (only this one)
  },
  {
    id: "deal-12",
    client: "Photography Studio",
    title: "Creative Space Design",
    property: "222 Arts District", 
    contact: "Alex Rivera",
    requested: "Photography studio renovation",
    amount: 19000,
    status: "followup",
    createdAt: "2024-06-30T15:00:00Z",
    stageEnteredDate: "2024-06-30T15:00:00Z" // 2 days ago - within limit
  }
];

export const closedDeals: Deal[] = [
  {
    id: "deal-13",
    client: "Luxury Apartments",
    title: "Apartment Renovation",
    property: "Park Avenue Residences",
    contact: "Michael Johnson",
    requested: "Full apartment renovation",
    amount: 60000,
    status: "closed-won",
    createdAt: faker.date.past().toISOString(),
    stageEnteredDate: faker.date.past().toISOString()
  },
  {
    id: "deal-14",
    client: "GlobalTech Solutions",
    title: "Office Expansion",
    property: "Innovation Tech Park",
    contact: "Emily Chen",
    requested: "Complete office expansion project",
    amount: 85000,
    status: "closed-won",
    createdAt: faker.date.past().toISOString(),
    stageEnteredDate: faker.date.past().toISOString()
  },
  {
    id: "deal-15",
    client: "City Bank Branch",
    title: "Branch Redesign",
    property: "Financial District Plaza",
    contact: "David Rodriguez",
    requested: "Modern bank branch redesign",
    amount: 45000,
    status: "closed-lost",
    createdAt: faker.date.past().toISOString(),
    stageEnteredDate: faker.date.past().toISOString()
  },
  {
    id: "deal-16",
    client: "Elite Fitness Studio",
    title: "Studio Upgrade",
    property: "Wellness Center Avenue",
    contact: "Sophia Williams",
    requested: "High-end fitness studio upgrade",
    amount: 52000,
    status: "closed-lost",
    createdAt: faker.date.past().toISOString(),
    stageEnteredDate: faker.date.past().toISOString()
  }
];

export const allSampleDeals = [...sampleDeals, ...closedDeals];
