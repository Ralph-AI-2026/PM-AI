# HROP - Property Maintenance Marketplace Business Model

*Research completed: March 18, 2026*
*Ralph | Property Maintenance AI Platform*

---

## Executive Summary

HROP is a three-sided marketplace connecting **Tenants**, **Landlords**, and **Service Providers** for property maintenance requests. Using AI-powered routing and an Uber-like experience, we eliminate the friction in property maintenance while creating revenue opportunities for all parties.

**Target Market**: $84.73B U.S. property management market (2026), growing to $102.79B by 2030.

**Problem**: 38% of rental owners say maintenance is their #1 stress source. 40% of tenants would renew if property maintenance improved.

**Solution**: Instant request → AI routing → Qualified service provider → Transparent tracking → Automated payment.

---

## Market Research

### Property Management Industry (2026)

**Market Size**:
- U.S. property management: $84.73 billion (2026) → $102.79 billion (2030)
- 326,000+ property management firms operating
- $119 billion in total revenue generated
- Online home services growing at 60.77% CAGR

**Pain Points**:
- Maintenance costs increased 12% year-over-year
- 38% of landlords cite maintenance as top stress
- Slow response times hurt tenant retention
- Lack of transparency in service costs

**Sources**:
- [2026 Property Management Industry Trends | Buildium](https://www.buildium.com/blog/2026-property-management-industry-trends/)
- [Managing Rental Properties in 2026 | Amerisave](https://www.amerisave.com/learn/managing-rental-properties-in-essential-strategies-every-landlord-needs)

### Competitive Landscape

**TaskRabbit**: $75M revenue (2025), $1.3B valuation
- 15% service fee per completed task
- $15 registration fee for service providers
- 7.5% trust and support fee
- On-demand, instant matching

**Thumbtack**: $231.1M revenue (2025), $3.2B valuation
- Pay-per-lead model
- Pros pay to contact customers
- Quote-based matching for larger projects

**Urban Company**: $2.8B valuation
- Subscription + commission hybrid
- Vetted service provider network

**Sources**:
- [TaskRabbit Business Model | Radical Start](https://www.radicalstart.com/blog/taskrabbit-business-model/)
- [Thumbtack vs TaskRabbit Comparison | Yo-Gigs](https://www.yo-gigs.com/blog/thumbtack-vs-taskrabbit-business-model-comparison/)

---

## The Three User Types

### 1. Tenant
**Pain**: Something's broken, landlord is slow to respond, no idea when it'll be fixed.

**HROP Experience**:
- Snap photo of issue
- AI categorizes problem (plumbing, electrical, HVAC, etc.)
- Instant notification to landlord
- Real-time status updates
- Track service provider arrival (Uber-style)

**Value Proposition**: Fast, transparent, no back-and-forth with landlord.

---

### 2. Landlord
**Pain**: Tenants call at all hours, managing multiple vendors, unclear pricing, maintenance eats profits.

**HROP Experience**:
- Receives AI-categorized requests
- Reviews estimated cost before approval
- Automatically assigns to vetted service provider
- Dashboard shows all properties, all issues, all costs
- Monthly analytics: spend by category, response times, vendor performance

**Value Proposition**: One platform for all properties. Preventative insights. Budget control.

---

### 3. Service Provider (Plumber, Electrician, Handyman, etc.)
**Pain**: Inconsistent work, slow payment, no repeat customers, marketing costs.

**HROP Experience**:
- Gets matched with nearby jobs (AI routing based on skills, rating, availability)
- Uber-driver-style dashboard:
  - Today's earnings
  - Completed jobs
  - Ratings from landlords
  - Payment status (instant or net-7)
- Accept/decline jobs instantly
- Get paid automatically after job completion

**Value Proposition**: Steady work flow. Fast payment. No marketing needed.

---

## Revenue Model (Hybrid)

### Option A: Commission on Service (Like TaskRabbit)
- **Service fee**: 15-20% on total job cost
- Charged to service provider
- Landlord sees full price upfront
- Simple, transparent

**Pros**: Easy to understand, scales with transaction volume
**Cons**: Service providers may inflate prices to offset fee

### Option B: Subscription + Reduced Commission (Like Resident Benefit Package)
- **Landlord subscription**: $29-$49/month per property
- **Reduced service fee**: 10% on jobs (vs 20% for non-subscribers)
- **Tenant benefits**: Priority response, filter delivery, rent reporting

**Pros**: Recurring revenue, higher landlord retention
**Cons**: Harder to sell upfront

### Option C: Pay-Per-Lead (Like Thumbtack)
- Service providers pay $5-$15 per lead
- No commission on job
- Payment happens off-platform

**Pros**: Service providers keep full job payment
**Cons**: Lower revenue ceiling, less control

### **RECOMMENDED: Hybrid Model**
- **Free tier**: 20% commission, no subscription
- **Pro tier**: $39/month per property, 12% commission, analytics, preventative maintenance alerts
- **Service provider benefits**: Verified badge, priority routing, weekly payouts

**Revenue Projection (Year 1)**:
- 50 landlords × $39/mo × 12 = $23,400/year (subscriptions)
- 500 jobs × $150 avg × 15% = $11,250/year (commissions)
- **Total Year 1**: ~$35,000 with minimal marketing

**Revenue Projection (Year 3)**:
- 500 landlords × $39/mo × 12 = $234,000/year
- 6,000 jobs × $150 avg × 15% = $135,000/year
- **Total Year 3**: ~$370,000

---

## AI Integration (DeepSeek)

### Why DeepSeek?
- **Cost**: $0.27 per 1M tokens (95% cheaper than OpenAI)
- **Speed**: Built-in caching reduces repeat requests to $0.028/1M tokens
- **Tool-use reasoning**: AI verifies logic before calling external tools
- **Auto-failover**: Switches to backup API if primary is down

**Sources**:
- [DeepSeek API Guide | SpurNow](https://www.spurnow.com/en/blogs/deepseek-api-guide)
- [DeepSeek Guide 2026 | DeepSeek AI](https://deepseek.ai/blog/deepseek-guide-2026)

### HROP Use Cases for DeepSeek

**1. Smart Request Categorization**
- Tenant uploads photo: "My sink is leaking"
- DeepSeek analyzes image + description
- Returns: `{ category: "plumbing", urgency: "high", estimatedCost: "$150-250", requiredSkills: ["plumber"] }`

**2. Service Provider Routing**
- AI checks:
  - Provider location (within 10 miles)
  - Skill match (licensed plumber)
  - Availability (online now)
  - Rating (4.5+ stars)
  - Price range (within landlord budget)
- Routes to best match in <1 second

**3. Cost Estimation**
- Historical data: "Replace bathroom faucet in Ontario apartment = $180 avg"
- DeepSeek adjusts for: property type, urgency, time of day
- Gives landlord accurate estimate before approval

**4. Preventative Maintenance Alerts**
- "This HVAC unit is 12 years old. 80% of units fail at 15 years. Schedule inspection?"
- "Water heater last serviced 3 years ago. Recommend annual check."

**5. Dispute Resolution**
- Tenant claims "job not done properly"
- DeepSeek analyzes: photos before/after, service provider notes, similar cases
- Suggests resolution: "Partial refund of $50" or "Schedule re-service"

---

## User Flow

### Tenant Submits Request
1. Opens HROP app (PWA, installed on phone)
2. Taps "New Issue"
3. Selects category or uploads photo
4. AI analyzes and pre-fills details
5. Submits to landlord

### Landlord Reviews & Approves
6. Push notification: "Tenant 3B: Leaking faucet - Est. $180"
7. Reviews details, sees 3 nearby plumbers
8. Taps "Approve" → assigns plumber

### Service Provider Accepts
9. Push notification: "New job nearby - $180 - 5 miles away"
10. Reviews details, sees tenant contact, property address
11. Taps "Accept"

### Job Completion
12. Service provider marks "Complete", uploads photo
13. Tenant confirms or disputes
14. Payment auto-released (Stripe Connect)
15. Service provider sees earnings in dashboard

---

## Tech Stack

### Frontend (PWA)
- **React + Vite** (already built)
- **TailwindCSS** (styling)
- **Progressive Web App** (installable, offline support)

### Backend
- **Supabase** (PostgreSQL database, auth, real-time)
- **DeepSeek API** (AI routing, categorization, cost estimation)
- **Stripe Connect** (payments, split payouts)

### Hosting
- **Vercel** (frontend deployment, auto-scaling)
- **Supabase** (managed backend)

---

## What I Need From You

### 1. **Design Preferences**
- Do you want a light/dark theme or both?
- Color scheme? (Current: blue #2563eb)
- Any design inspiration? (Links to apps you like)

### 2. **Stripe Account**
- Need Stripe Connect for multi-party payments
- Should I create Stripe account using ralph.archeryrangecompany@gmail.com?

### 3. **DeepSeek API Key**
- Sign up at https://platform.deepseek.com/
- Get API key (free tier: $5 credit)
- Add to .env file

### 4. **Business Rules**
- Service provider commission: 15%? 20%?
- Landlord subscription price: $39/mo? $49/mo?
- Free trial period: 14 days? 30 days?

### 5. **Service Categories**
- Plumbing
- Electrical
- HVAC
- Appliance Repair
- Locksmith
- Pest Control
- Cleaning
- Landscaping
- Other?

### 6. **Approval Workflow**
- Should tenants be able to call service providers directly in emergencies?
- Or always require landlord approval first?

---

## Next Steps (For Ralph)

1. ✅ Research complete
2. ⏳ Build authentication (Supabase Auth)
3. ⏳ Create role selection screen
4. ⏳ Build 3 dashboards (Tenant, Landlord, Service Provider)
5. ⏳ Integrate DeepSeek AI
6. ⏳ Connect Stripe payments
7. ⏳ Design UI/UX improvements
8. ⏳ Deploy to Vercel
9. ⏳ Test end-to-end with real flow

**ETA**: 8-12 hours of focused work (spread over 2-3 sessions)

---

## Sources

- [2026 Property Management Industry Trends | Buildium](https://www.buildium.com/blog/2026-property-management-industry-trends/)
- [Managing Rental Properties in 2026 | Amerisave](https://www.amerisave.com/learn/managing-rental-properties-in-essential-strategies-every-landlord-needs)
- [Maintenance as Competitive Advantage | Buildium](https://www.buildium.com/blog/maintenance-as-a-competitive-advantage/)
- [TaskRabbit vs Thumbtack Business Model | Yo-Gigs](https://www.yo-gigs.com/blog/thumbtack-vs-taskrabbit-business-model-comparison/)
- [TaskRabbit Business Model | Radical Start](https://www.radicalstart.com/blog/taskrabbit-business-model/)
- [DeepSeek API Guide | SpurNow](https://www.spurnow.com/en/blogs/deepseek-api-guide)
- [DeepSeek Guide 2026 | DeepSeek AI](https://deepseek.ai/blog/deepseek-guide-2026)

---

**Ready to build when you wake up. Sleep well, Josh.**
