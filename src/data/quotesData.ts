
import { Quote } from '@/types/Quote';

export const quotesData: Quote[] = [
  {
    id: 'quote-1',
    clientId: 'client-3',
    requestId: 'request-1',
    quoteNumber: 'Q-2025-001',
    title: 'Restaurant Patio Deep Clean',
    property: '2847 Mountain View Rd',
    status: 'Draft', // Changed from 'Awaiting Response' to match request status 'New'
    amount: 1250.00,
    createdDate: '2025-06-10',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-11',
    notes: 'Includes pressure washing and sanitizing all outdoor furniture'
  },
  {
    id: 'quote-2',
    clientId: 'client-4',
    requestId: 'request-2',
    quoteNumber: 'Q-2025-002',
    title: 'Backyard Landscaping Design',
    property: '1245 Riverside Crescent NE',
    status: 'Draft',
    amount: 8500.00,
    createdDate: '2025-06-12',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-12',
    notes: 'Complete backyard transformation with garden beds and pathways'
  },
  {
    id: 'quote-3',
    clientId: 'client-6',
    requestId: 'request-3',
    quoteNumber: 'Q-2025-003',
    title: 'Large Oak Tree Removal',
    property: '967 Heritage Lane SW',
    status: 'Converted', // Keep as converted since request-3 is 'Converted'
    amount: 2850.00,
    createdDate: '2025-06-13',
    sentDate: '2025-06-14',
    approvedDate: '2025-06-16',
    convertedDate: '2025-06-17',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-14',
    notes: 'Emergency tree removal due to storm damage'
  },
  {
    id: 'quote-4',
    clientId: 'client-9',
    requestId: 'request-4',
    quoteNumber: 'Q-2025-004',
    title: 'Playground Safety Surface Cleaning',
    property: '725 School Avenue NE',
    status: 'Draft', // Changed from 'Changes Requested' to match request status 'New'
    amount: 975.00,
    createdDate: '2025-06-08',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-09',
    notes: 'Initial quote for playground cleaning'
  },
  {
    id: 'quote-5',
    clientId: 'client-11',
    requestId: 'request-5',
    quoteNumber: 'Q-2025-005',
    title: 'Courtyard Garden Renovation',
    property: '4890 Prairie Rose Drive SE',
    status: 'Converted', // Keep as converted since request-5 is 'Converted'
    amount: 12500.00,
    createdDate: '2025-06-05',
    sentDate: '2025-06-06',
    approvedDate: '2025-06-08',
    convertedDate: '2025-06-10',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-06',
    notes: 'Full courtyard renovation for nursing home'
  },
  {
    id: 'quote-6',
    clientId: 'client-2',
    requestId: 'request-7',
    quoteNumber: 'Q-2025-006',
    title: 'Deck Staining and Sealing',
    property: '8542 Scenic Drive SW',
    status: 'Awaiting Response', // Keep as awaiting response for variety
    amount: 1875.00,
    createdDate: '2025-06-15',
    sentDate: '2025-06-16',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-16',
    notes: 'Cedar deck restoration with natural tone finish'
  },
  {
    id: 'quote-7',
    clientId: 'client-5',
    requestId: 'request-8',
    quoteNumber: 'Q-2025-007',
    title: 'Parking Lot Deep Clean',
    property: '5500 Sunset Blvd',
    status: 'Draft',
    amount: 3200.00,
    createdDate: '2025-06-17',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-17',
    notes: 'Overnight parking lot cleaning and re-striping'
  },
  {
    id: 'quote-8',
    clientId: 'client-14',
    requestId: 'request-13',
    quoteNumber: 'Q-2025-008',
    title: 'Pool Deck Restoration',
    property: '3654 Parkdale Boulevard SW',
    status: 'Converted', // Keep as converted since request-13 is 'Converted'
    amount: 2950.00,
    createdDate: '2025-06-18',
    sentDate: '2025-06-19',
    approvedDate: '2025-06-20',
    convertedDate: '2025-06-21',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-19',
    notes: 'Non-slip coating application for pool deck'
  },
  {
    id: 'quote-9',
    clientId: 'client-8',
    requestId: 'request-10',
    quoteNumber: 'Q-2025-009',
    title: 'Hedge Trimming and Shaping',
    property: '3421 Hillview Crescent NW',
    status: 'Changes Requested', // Keep as changes requested for variety
    amount: 425.00,
    createdDate: '2025-06-04',
    sentDate: '2025-06-05',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-05',
    notes: 'Client requested modifications to trimming approach'
  },
  {
    id: 'quote-10',
    clientId: 'client-1',
    requestId: 'request-14',
    quoteNumber: 'Q-2025-010',
    title: 'Summer Flower Bed Installation',
    property: '150 Green Valley Dr',
    status: 'Converted', // Keep as converted since request-14 is 'Converted'
    amount: 3500.00,
    createdDate: '2025-06-20',
    sentDate: '2025-06-21',
    approvedDate: '2025-06-21',
    convertedDate: '2025-06-22',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-21',
    notes: 'Seasonal flower installation for condo complex'
  },
  // Standalone quotes (not linked to requests)
  {
    id: 'quote-11',
    clientId: 'client-7',
    quoteNumber: 'Q-2025-011',
    title: 'Office Building Window Cleaning',
    property: '789 Business District Ave',
    status: 'Awaiting Response',
    amount: 850.00,
    createdDate: '2025-06-19',
    sentDate: '2025-06-20',
    salesperson: 'Mike Johnson',
    validUntil: '2025-07-20',
    notes: 'Monthly window cleaning service for 3-story office building'
  },
  {
    id: 'quote-12',
    clientId: 'client-12',
    quoteNumber: 'Q-2025-012',
    title: 'Emergency Storm Cleanup',
    property: '456 Maple Street SW',
    status: 'Draft',
    amount: 2200.00,
    createdDate: '2025-06-21',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-21',
    notes: 'Emergency debris removal and property cleanup after storm damage'
  },
  // Adding a few more example quotes to test the "newest quote" logic
  {
    id: 'quote-13',
    clientId: 'client-4',
    requestId: 'request-2',
    quoteNumber: 'Q-2025-013',
    title: 'Backyard Landscaping Design - Revised',
    property: '1245 Riverside Crescent NE',
    status: 'Awaiting Response',
    amount: 9200.00,
    createdDate: '2025-06-15', // Newer than quote-2
    sentDate: '2025-06-16',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-16',
    notes: 'Revised quote with additional features requested by client'
  },
  {
    id: 'quote-14',
    clientId: 'client-9',
    requestId: 'request-4',
    quoteNumber: 'Q-2025-014',
    title: 'Playground Safety Surface Cleaning - Updated',
    property: '725 School Avenue NE',
    status: 'Changes Requested',
    amount: 1150.00,
    createdDate: '2025-06-12', // Newer than quote-4
    sentDate: '2025-06-13',
    salesperson: 'Lisa Chen',
    validUntil: '2025-07-13',
    notes: 'Updated quote with additional sanitization as requested by client'
  }
];
