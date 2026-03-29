// HROP Payment System Types

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  unit_count: number;
  subscription_tier: 'starter' | 'growth' | 'enterprise' | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_method_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  user_id: string | null;
  name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  trade: string;
  license_number: string | null;
  insurance_verified: boolean;
  insurance_expiry: string | null;
  wsib_verified: boolean;
  rating: number;
  total_jobs: number;
  status: 'active' | 'suspended' | 'removed';
  stripe_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: string;
  request_id: string;
  contractor_id: string;
  amount: number;
  description: string | null;
  estimated_duration: string | null;
  available_date: string | null;
  valid_until: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  accepted_at: string | null;
  created_at: string;
  contractor?: Contractor;
}

export interface ServiceFee {
  id: string;
  organization_id: string;
  request_id: string;
  estimate_id: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  status: 'pending' | 'charged' | 'failed' | 'refunded' | 'credited';
  charged_at: string | null;
  refunded_at: string | null;
  refund_reason: string | null;
  created_at: string;
}

export interface ContractorReview {
  id: string;
  contractor_id: string;
  request_id: string;
  organization_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface ContractorComplaint {
  id: string;
  contractor_id: string;
  request_id: string;
  complaint_type:
    | 'property_damage'
    | 'no_show'
    | 'poor_quality'
    | 'overcharge'
    | 'safety_concern'
    | 'unprofessional'
    | 'other';
  description: string;
  evidence_urls: string[];
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface MaintenanceRequestPayment {
  id: string;
  organization_id: string | null;
  property_id: string;
  unit_id: string | null;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  photos: string[];
  submitted_by: string;
  submitted_email: string | null;
  submitted_phone: string | null;
  status:
    | 'submitted'
    | 'estimating'
    | 'estimated'
    | 'accepted'
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'confirmed'
    | 'cancelled'
    | 'disputed';
  created_at: string;
  updated_at: string;
  estimates?: Estimate[];
  service_fees?: ServiceFee[];
}

// Constants
export const SERVICE_FEE_AMOUNT = 3500; // $35.00 CAD in cents
export const SERVICE_FEE_CURRENCY = 'cad';

export const SUBSCRIPTION_TIERS = {
  starter: { name: 'Starter', units: '1-50', pricePerUnit: 500 },
  growth: { name: 'Growth', units: '51-200', pricePerUnit: 900 },
  enterprise: { name: 'Enterprise', units: '200+', pricePerUnit: 1500 },
} as const;
