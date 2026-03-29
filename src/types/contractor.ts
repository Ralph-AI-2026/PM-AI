// HROP Contractor Vetting & Onboarding Types

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'removed';

export type TradeType =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'general'
  | 'painting'
  | 'carpentry'
  | 'locksmith'
  | 'appliance'
  | 'roofing'
  | 'landscaping';

export type DocumentType =
  | 'liability_insurance'
  | 'wsib_clearance'
  | 'trade_license'
  | 'business_registration'
  | 'criminal_record_check'
  | 'drivers_license'
  | 'reference_letter';

export type ReferenceRelationship =
  | 'past_client'
  | 'business_partner'
  | 'supplier'
  | 'other';

export interface ContractorApplication {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  business_registration_number: string | null;
  hst_number: string | null;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  primary_trade: TradeType;
  secondary_trades: TradeType[];
  years_experience: number;
  licensed_trade: boolean;
  license_number: string | null;
  licensing_body: string | null;
  service_radius_km: number;
  service_cities: string[];
  status: ApplicationStatus;
  rejection_reason: string | null;
  suspension_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  documents?: ContractorDocument[];
  references?: ContractorReference[];
}

export interface ContractorDocument {
  id: string;
  application_id: string;
  contractor_id: string | null;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  expiry_date: string | null;
  expiry_alert_sent: boolean;
  created_at: string;
}

export interface ContractorReference {
  id: string;
  application_id: string;
  reference_name: string;
  reference_email: string | null;
  reference_phone: string;
  relationship: ReferenceRelationship;
  contacted: boolean;
  contacted_at: string | null;
  contacted_by: string | null;
  feedback: string | null;
  rating: number | null;
  created_at: string;
}

// Licensed trades that require trade license
export const LICENSED_TRADES: TradeType[] = ['plumbing', 'electrical', 'hvac'];

// All available trades
export const ALL_TRADES: { value: TradeType; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'general', label: 'General Maintenance' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'appliance', label: 'Appliance Repair' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'landscaping', label: 'Landscaping' },
];

// Document requirements per trade category
export const LICENSED_TRADE_DOCS: DocumentType[] = [
  'liability_insurance',
  'wsib_clearance',
  'trade_license',
  'criminal_record_check',
];

export const GENERAL_TRADE_DOCS: DocumentType[] = [
  'liability_insurance',
  'wsib_clearance',
  'criminal_record_check',
];

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  liability_insurance: 'General Liability Insurance ($2M min)',
  wsib_clearance: 'WSIB Clearance Certificate',
  trade_license: 'Trade License',
  business_registration: 'Ontario Business Registration',
  criminal_record_check: 'Criminal Record Check',
  drivers_license: "Driver's License (Photo ID)",
  reference_letter: 'Reference Letter',
};

// Ontario cities for service area
export const ONTARIO_CITIES = [
  'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton',
  'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor',
  'Richmond Hill', 'Oakville', 'Burlington', 'Oshawa', 'Barrie',
  'St. Catharines', 'Cambridge', 'Kingston', 'Guelph', 'Waterloo',
  'Thunder Bay', 'Sudbury', 'Whitby', 'Ajax', 'Milton',
  'Newmarket', 'Peterborough', 'Brantford', 'Pickering', 'Niagara Falls',
];

export const LICENSING_BODIES = [
  'Ontario College of Trades',
  'TSSA (Technical Standards and Safety Authority)',
  'ESA (Electrical Safety Authority)',
  'Ontario Ministry of Labour',
  'Other',
];
