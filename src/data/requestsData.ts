
import { Request } from '@/types/Request';

// Helper function to map request_status to our internal status
const mapRequestStatus = (requestStatus: string): 'New' | 'Converted' | 'Archived' => {
  switch (requestStatus) {
    case 'Open':
    case 'Contacted':
    case 'Quoted':
      return 'New';
    case 'Converted':
      return 'Converted';
    default:
      return 'New';
  }
};

export const requestsData: Request[] = [
  {
    id: 'RQ001',
    clientId: 'CL001',
    title: 'Weekly office cleaning – 3,500 sq ft',
    serviceDetails: 'Weekly office cleaning – 3,500 sq ft',
    requestDate: '2025‑06‑10',
    status: mapRequestStatus('Open'),
    assignedTeamMember: 'Vicki VA',
    projectType: 'Janitorial',
    intakeSource: 'Online Form',
    customFields: { urgency: 'Medium', frequency: 'Weekly' },
    attachments: ['floorplan.pdf'],
    notes: ''
  },
  {
    id: 'RQ002',
    clientId: 'CL002',
    title: 'Sand, stain & seal backyard deck (320 sq ft)',
    serviceDetails: 'Sand, stain & seal backyard deck (320 sq ft)',
    requestDate: '2025‑06‑07',
    status: mapRequestStatus('Contacted'),
    assignedTeamMember: 'Jamie Lee',
    projectType: 'Deck Refinish',
    intakeSource: 'Phone Call',
    customFields: { preferred_start: '2025‑07‑01' },
    attachments: [],
    notes: 'Requested mid‑range cedar tone.'
  },
  {
    id: 'RQ003',
    clientId: 'CL003',
    title: 'Seasonal common‑area mowing & edging (25 acres)',
    serviceDetails: 'Seasonal common‑area mowing & edging (25 acres)',
    requestDate: '2025‑06‑08',
    status: mapRequestStatus('Quoted'),
    assignedTeamMember: 'Alex Morgan',
    projectType: 'Grounds Maintenance',
    intakeSource: 'Referral',
    customFields: { contract_length: '6 months' },
    attachments: ['hoa‑scope.docx'],
    notes: 'Quote #Q‑2071 sent 2025‑06‑09.'
  },
  {
    id: 'RQ004',
    clientId: 'CL004',
    title: 'Turnover – #204, Oak Ridge Apts (2 br unit)',
    serviceDetails: 'Turnover – #204, Oak Ridge Apts (2 br unit)',
    requestDate: '2025‑05‑30',
    status: mapRequestStatus('Converted'),
    assignedTeamMember: 'Vicki VA',
    projectType: 'Unit Turn',
    intakeSource: 'Client Hub',
    customFields: { due_date: '2025‑06‑14' },
    attachments: ['move‑out‑photos.zip'],
    notes: 'Job J‑892 created 2025‑06‑01.'
  },
  {
    id: 'RQ005',
    clientId: 'CL004',
    title: 'Drywall patch & paint – #118, Maple Crossing',
    serviceDetails: 'Drywall patch & paint – #118, Maple Crossing',
    requestDate: '2025‑06‑12',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Special Project',
    intakeSource: 'Email',
    customFields: { colour: 'Oxford White' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ006',
    clientId: 'CL005',
    title: 'Move‑out deep clean – 2,100 sq ft bungalow',
    serviceDetails: 'Move‑out deep clean – 2,100 sq ft bungalow',
    requestDate: '2025‑06‑04',
    status: mapRequestStatus('Contacted'),
    assignedTeamMember: 'Vicki VA',
    projectType: 'Deep Clean',
    intakeSource: 'Yelp Message',
    customFields: { pets: 'Yes', carpet_clean: 'Yes' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ007',
    clientId: 'CL006',
    title: 'Sub‑contract snow removal – retail plaza',
    serviceDetails: 'Sub‑contract snow removal – retail plaza',
    requestDate: '2025‑06‑03',
    status: mapRequestStatus('Open'),
    assignedTeamMember: 'Jamie Lee',
    projectType: 'Snow Removal',
    intakeSource: 'Partner Portal',
    customFields: { season: '2025‑26' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ008',
    clientId: 'CL007',
    title: 'Pressure wash vinyl siding & gutters',
    serviceDetails: 'Pressure wash vinyl siding & gutters',
    requestDate: '2025‑06‑05',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Exterior Wash',
    intakeSource: 'Web Chat',
    customFields: { two_story: true },
    attachments: ['house_front.jpg'],
    notes: ''
  },
  {
    id: 'RQ009',
    clientId: 'CL007',
    title: 'Exterior paint – doors & trim only',
    serviceDetails: 'Exterior paint – doors & trim only',
    requestDate: '2025‑06‑06',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Painting',
    intakeSource: 'Follow‑up Call',
    customFields: { colour: 'Benjamin Moore – Simply White' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ010',
    clientId: 'CL008',
    title: 'Quarterly hood‑vent & grease trap service',
    serviceDetails: 'Quarterly hood‑vent & grease trap service',
    requestDate: '2025‑05‑28',
    status: mapRequestStatus('Converted'),
    assignedTeamMember: 'Jamie Lee',
    projectType: 'Kitchen Exhaust',
    intakeSource: 'Recurring',
    customFields: { frequency: 'Quarterly' },
    attachments: [],
    notes: 'Job series updated.'
  },
  {
    id: 'RQ011',
    clientId: 'CL009',
    title: 'Carpet cleaning – 12 common hallways',
    serviceDetails: 'Carpet cleaning – 12 common hallways',
    requestDate: '2025‑06‑02',
    status: mapRequestStatus('Quoted'),
    assignedTeamMember: 'Alex Morgan',
    projectType: 'Carpet Clean',
    intakeSource: 'LinkedIn',
    customFields: { square_feet: 8200 },
    attachments: [],
    notes: 'Quote #Q‑2080 pending approval.'
  },
  {
    id: 'RQ012',
    clientId: 'CL009',
    title: 'Pressure wash underground parkade',
    serviceDetails: 'Pressure wash underground parkade',
    requestDate: '2025‑06‑09',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Parkade Clean',
    intakeSource: 'Client Email',
    customFields: { levels: 2 },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ013',
    clientId: 'CL010',
    title: 'Post‑construction clean – new 2‑storey',
    serviceDetails: 'Post‑construction clean – new 2‑storey',
    requestDate: '2025‑05‑30',
    status: mapRequestStatus('Contacted'),
    assignedTeamMember: 'Jamie Lee',
    projectType: 'Post‑Construction',
    intakeSource: 'Facebook Lead',
    customFields: { builder_walkthrough: '2025‑07‑12' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ014',
    clientId: 'CL011',
    title: 'Pre‑listing clean & staging support',
    serviceDetails: 'Pre‑listing clean & staging support',
    requestDate: '2025‑06‑03',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Real‑Estate Prep',
    intakeSource: 'Cold Email',
    customFields: { listing_date: '2025‑06‑25' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ015',
    clientId: 'CL012',
    title: 'Bi‑weekly house‑clean',
    serviceDetails: 'Bi‑weekly house‑clean',
    requestDate: '2025‑05‑25',
    status: mapRequestStatus('Converted'),
    assignedTeamMember: 'Vicki VA',
    projectType: 'Maintenance Clean',
    intakeSource: 'Client Hub',
    customFields: { day_of_week: 'Friday' },
    attachments: [],
    notes: 'Recurring job active.'
  },
  {
    id: 'RQ016',
    clientId: 'CL013',
    title: 'Weekly laundry pick‑up & fold service',
    serviceDetails: 'Weekly laundry pick‑up & fold service',
    requestDate: '2025‑06‑02',
    status: mapRequestStatus('Contacted'),
    assignedTeamMember: 'Alex Morgan',
    projectType: 'Laundry',
    intakeSource: 'Conference Lead',
    customFields: { volume_lb: 150 },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ017',
    clientId: 'CL014',
    title: 'Strip & wax rubber gym flooring (4,500 sq ft)',
    serviceDetails: 'Strip & wax rubber gym flooring (4,500 sq ft)',
    requestDate: '2025‑06‑06',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Floor Care',
    intakeSource: 'Instagram DM',
    customFields: { preferred_window: 'overnight' },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ018',
    clientId: 'CL015',
    title: 'Job‑site trailer cleaning – Seton Hospital build',
    serviceDetails: 'Job‑site trailer cleaning – Seton Hospital build',
    requestDate: '2025‑06‑01',
    status: mapRequestStatus('Quoted'),
    assignedTeamMember: 'Jamie Lee',
    projectType: 'Site Clean',
    intakeSource: 'Partner Portal',
    customFields: { trailers: 3 },
    attachments: [],
    notes: 'Quote #Q‑2078 sent 2025‑06‑02.'
  },
  {
    id: 'RQ019',
    clientId: 'CL015',
    title: 'Final construction clean – 8 townhomes',
    serviceDetails: 'Final construction clean – 8 townhomes',
    requestDate: '2025‑06‑11',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Post‑Construction',
    intakeSource: 'Job Foreman Call',
    customFields: { sq_ft_total: 16400 },
    attachments: [],
    notes: ''
  },
  {
    id: 'RQ020',
    clientId: 'CL001',
    title: 'One‑time carpet extraction – boardroom & hallway',
    serviceDetails: 'One‑time carpet extraction – boardroom & hallway',
    requestDate: '2025‑06‑13',
    status: mapRequestStatus('Open'),
    assignedTeamMember: '',
    projectType: 'Carpet Clean',
    intakeSource: 'Client Email',
    customFields: { square_feet: 680 },
    attachments: [],
    notes: ''
  }
];
