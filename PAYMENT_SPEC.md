# HROP Payment System Spec

## Revenue Model

### 1. Subscription (Per-Unit Monthly)
| Tier | Units | Price/Unit/Month |
|------|-------|-----------------|
| Starter | 1-50 | $5 |
| Growth | 51-200 | $9 |
| Enterprise | 200+ | $15 |

Billed monthly via Stripe Subscriptions. Landlord self-reports unit count at signup.

### 2. Service Fee (Per-Job Flat Rate)
- Charged when estimate is accepted
- Flat rate: $25-$50 (TBD -- Josh to decide)
- Charged to landlord's card on file via Stripe
- Refund/credit if job doesn't happen within 30 days

---

## Database Schema (Supabase/PostgreSQL)

### organizations (landlord/property management companies)
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  unit_count INTEGER NOT NULL DEFAULT 1,
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'growth', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'ON',
  postal_code TEXT,
  unit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### units
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  tenant_name TEXT,
  tenant_email TEXT,
  tenant_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contractors
```sql
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  trade TEXT NOT NULL, -- plumbing, electrical, HVAC, general, etc.
  license_number TEXT,
  insurance_verified BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  wsib_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'suspended', 'removed')) DEFAULT 'active',
  stripe_account_id TEXT, -- if we ever need to pay them
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### maintenance_requests
```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  
  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- plumbing, electrical, HVAC, general, appliance, etc.
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
  photos TEXT[], -- array of storage URLs
  
  -- Submitted by
  submitted_by TEXT NOT NULL, -- tenant name
  submitted_email TEXT,
  submitted_phone TEXT,
  
  -- Status flow
  status TEXT CHECK (status IN (
    'submitted',      -- tenant submitted request
    'estimating',     -- sent to contractors for estimates
    'estimated',      -- estimates received, waiting on acceptance
    'accepted',       -- estimate accepted, service fee charged
    'scheduled',      -- contractor has scheduled the work
    'in_progress',    -- work underway
    'completed',      -- contractor marked complete
    'confirmed',      -- landlord/tenant confirmed completion
    'cancelled',      -- cancelled before completion
    'disputed'        -- dispute raised
  )) DEFAULT 'submitted',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### estimates
```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),
  
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  estimated_duration TEXT, -- "2-3 hours", "1 day", etc.
  available_date DATE,
  valid_until DATE, -- estimate expiry
  
  status TEXT CHECK (status IN (
    'pending',    -- sent to landlord/tenant
    'accepted',   -- chosen by landlord/tenant
    'declined',   -- not selected
    'expired'     -- past valid_until date
  )) DEFAULT 'pending',
  
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### service_fees (tracks every charge)
```sql
CREATE TABLE service_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  request_id UUID REFERENCES maintenance_requests(id),
  estimate_id UUID REFERENCES estimates(id),
  
  amount NUMERIC(10,2) NOT NULL, -- flat fee amount
  currency TEXT DEFAULT 'cad',
  
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  
  status TEXT CHECK (status IN (
    'pending',     -- about to charge
    'charged',     -- successfully charged
    'failed',      -- charge failed
    'refunded',    -- refunded (job didn't happen)
    'credited'     -- credit applied to account
  )) DEFAULT 'pending',
  
  charged_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contractor_reviews
```sql
CREATE TABLE contractor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id),
  request_id UUID REFERENCES maintenance_requests(id),
  organization_id UUID REFERENCES organizations(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### contractor_complaints (for liability protection)
```sql
CREATE TABLE contractor_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id),
  request_id UUID REFERENCES maintenance_requests(id),
  
  complaint_type TEXT CHECK (complaint_type IN (
    'property_damage', 'no_show', 'poor_quality', 
    'overcharge', 'safety_concern', 'unprofessional', 'other'
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- photos of damage, etc.
  
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Stripe Integration

### Setup (One-Time)
1. Landlord signs up on HROP
2. Create Stripe Customer: `stripe.customers.create({ email, name, metadata: { org_id } })`
3. Collect payment method via Stripe Elements (card form)
4. Attach payment method: `stripe.paymentMethods.attach(pm_id, { customer: cus_id })`
5. Set as default: `stripe.customers.update(cus_id, { invoice_settings: { default_payment_method: pm_id } })`
6. Create subscription based on unit count/tier

### Subscription Billing
```
Products in Stripe:
- hrop_starter: $5/unit/month
- hrop_growth: $9/unit/month  
- hrop_enterprise: $15/unit/month

Create subscription:
stripe.subscriptions.create({
  customer: cus_id,
  items: [{ price: price_id, quantity: unit_count }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent']
})
```

### Service Fee Charging (Per-Job)
Triggered when estimate is accepted:

```
// 1. Create PaymentIntent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2500, // $25.00 in cents
  currency: 'cad',
  customer: org.stripe_customer_id,
  payment_method: org.stripe_payment_method_id,
  off_session: true,
  confirm: true,
  metadata: {
    request_id: request.id,
    estimate_id: estimate.id,
    organization_id: org.id,
    fee_type: 'service_fee'
  }
});

// 2. Record in service_fees table
await supabase.from('service_fees').insert({
  organization_id: org.id,
  request_id: request.id,
  estimate_id: estimate.id,
  amount: 25.00,
  stripe_payment_intent_id: paymentIntent.id,
  status: 'charged',
  charged_at: new Date().toISOString()
});

// 3. Update request status
await supabase.from('maintenance_requests')
  .update({ status: 'accepted' })
  .eq('id', request.id);

// 4. Update estimate status
await supabase.from('estimates')
  .update({ status: 'accepted', accepted_at: new Date().toISOString() })
  .eq('id', estimate.id);

// 5. Notify contractor
// Send email/SMS to contractor that their estimate was accepted
```

### Refund Flow (Job Didn't Happen)
```
// Auto-check: cron job runs daily, finds accepted requests older than 30 days
// that never moved to 'completed' or 'confirmed'

const staleRequests = await supabase
  .from('maintenance_requests')
  .select('*, service_fees(*)')
  .eq('status', 'accepted')
  .lt('updated_at', thirtyDaysAgo);

// For each stale request:
const refund = await stripe.refunds.create({
  payment_intent: fee.stripe_payment_intent_id,
  reason: 'requested_by_customer'
});

await supabase.from('service_fees')
  .update({ status: 'refunded', refunded_at: now(), refund_reason: 'job_not_completed_30_days' })
  .eq('id', fee.id);
```

---

## Job Lifecycle Flow

```
TENANT                    HROP PLATFORM               LANDLORD              CONTRACTOR
  |                           |                          |                      |
  |-- Submit Request -------->|                          |                      |
  |                           |-- Notify Landlord ------>|                      |
  |                           |-- Match Contractors ---->|                      |
  |                           |                          |                      |
  |                           |<-- Estimates Submitted --|-------- Submit ------|
  |                           |                          |                      |
  |                           |-- Present Estimates ---->|                      |
  |                           |                          |                      |
  |                           |<-- Accept Estimate ------|                      |
  |                           |                          |                      |
  |                           |== CHARGE SERVICE FEE ===>| (auto-charge card)   |
  |                           |                          |                      |
  |                           |-- Notify Contractor -----|------- Accepted ---->|
  |                           |                          |                      |
  |                           |                          |<---- Schedule -------|
  |                           |<-- Status: Scheduled ----|                      |
  |<-- Notify: Scheduled -----|                          |                      |
  |                           |                          |                      |
  |                           |                          |<---- Complete -------|
  |                           |<-- Status: Completed ----|                      |
  |<-- Confirm Completion? ---|                          |                      |
  |-- Yes, Confirmed -------->|                          |                      |
  |                           |-- Status: Confirmed ---->|                      |
  |                           |                          |                      |
  |-- Leave Review ---------->|-- Update Rating -------->|                      |
```

---

## Webhook Endpoints Needed

### /api/webhooks/stripe
Handle these events:
- `payment_intent.succeeded` -- service fee charged successfully
- `payment_intent.payment_failed` -- card declined, notify landlord
- `invoice.paid` -- subscription payment succeeded
- `invoice.payment_failed` -- subscription payment failed
- `customer.subscription.deleted` -- landlord cancelled

---

## API Routes Needed

```
POST   /api/requests              -- tenant submits maintenance request
GET    /api/requests/:id          -- get request details
PATCH  /api/requests/:id/status   -- update request status

POST   /api/estimates             -- contractor submits estimate
POST   /api/estimates/:id/accept  -- landlord accepts estimate (triggers charge)
POST   /api/estimates/:id/decline -- landlord declines estimate

GET    /api/organizations/:id/fees     -- landlord views fee history
POST   /api/organizations/:id/payment-method -- update payment method

POST   /api/contractors/:id/review     -- submit contractor review
POST   /api/contractors/:id/complaint  -- file complaint

GET    /api/dashboard/landlord    -- landlord dashboard data
GET    /api/dashboard/contractor  -- contractor dashboard data
```

---

## Environment Variables Needed

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SERVICE_FEE_AMOUNT=2500  # $25.00 in cents (configurable)

SUPABASE_URL=https://uyazjsoystozhetysdtc.supabase.co
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Security Considerations

- Service fees are charged server-side only (never from client)
- Stripe webhook signature verification on all webhook events
- RLS policies on all Supabase tables (landlords see only their data)
- Contractor complaints table is admin-only read
- Rate limiting on estimate submission and request creation

---

*Spec created: March 29, 2026*
*Ready for implementation once Josh confirms fee amount and tier pricing*
