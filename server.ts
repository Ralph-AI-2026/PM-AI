import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

// Initialize Stripe lazily to prevent crashing if the key is missing
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key, { apiVersion: "2026-02-25.clover" as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // 1. Create a Stripe Connect Account and generate an onboarding link
  app.post("/api/stripe/onboard", async (req, res) => {
    try {
      const stripe = getStripe();
      
      // In a real app, you would get the club ID from the authenticated user's session
      // and look up their existing Stripe account ID if they have one.
      // For this MVP, we'll create a new Express account each time.
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // The APP_URL is provided by the AI Studio environment
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      
      // Create an account link for the user to complete onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${appUrl}/club-admin?stripe_refresh=true`,
        return_url: `${appUrl}/club-admin?stripe_return=true&account_id=${account.id}`,
        type: "account_onboarding",
      });

      res.json({ url: accountLink.url, accountId: account.id });
    } catch (error: any) {
      console.error("Stripe onboarding error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Verify the Stripe Connect Account status after return
  app.get("/api/stripe/verify/:accountId", async (req, res) => {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(req.params.accountId);
      
      // Check if they have completed the required onboarding steps
      const isComplete = account.details_submitted && account.charges_enabled;
      
      // In a real app, you would save the account.id and status to your database here
      
      res.json({ 
        isComplete,
        accountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled
      });
    } catch (error: any) {
      console.error("Stripe verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Save Waiver
  app.post("/api/waivers", async (req, res) => {
    try {
      const { userId, clubId, signature, agreed } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      
      // Mock Prisma DB call:
      // const waiver = await prisma.waiver.create({
      //   data: { userId, clubId, ipAddress, agreementBoolean: agreed }
      // });
      
      console.log(`Waiver saved for user ${userId} at club ${clubId} from IP ${ipAddress}`);
      res.json({ success: true, waiverId: "w_mock123" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Create Checkout Session for Membership
  app.post("/api/memberships/checkout", async (req, res) => {
    try {
      const stripe = getStripe();
      const { userId, clubId } = req.body;
      
      // In a real app, fetch the club's stripeConnectAccountId from DB
      // const club = await prisma.club.findUnique({ where: { id: clubId } });
      // const connectedAccountId = club.stripeConnectAccountId;
      
      // Mock connected account ID for demonstration. 
      // In production, this MUST be a valid connected account ID.
      const connectedAccountId = "acct_1MockAccountID"; 
      
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "cad", // ARC is Archery Ranges Canada
              product_data: {
                name: "Annual Club Membership",
                description: "Access to all lanes and club facilities.",
              },
              unit_amount: 12000, // $120.00 CAD
              recurring: {
                interval: "year",
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          application_fee_percent: 1.5, // ARC takes 1.5% platform fee
          transfer_data: {
            destination: connectedAccountId, // Funds routed to the Club's connected account
          },
        },
        success_url: `${appUrl}/member?checkout=success`,
        cancel_url: `${appUrl}/member/purchase-membership?checkout=cancelled`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Get Available Time Slots
  app.get("/api/availability/:clubId", async (req, res) => {
    try {
      const { clubId } = req.params;
      const { date } = req.query; // YYYY-MM-DD
      
      if (!date) return res.status(400).json({ error: "Date is required" });

      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      // --- PRISMA QUERY LOGIC (Commented out for MVP) ---
      /*
      // 1. Fetch all lanes for the club
      const lanes = await prisma.lane.findMany({
        where: { clubId, isActive: true }
      });

      // 2. Fetch all bookings for that date
      const bookings = await prisma.booking.findMany({
        where: {
          lane: { clubId },
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      });
      */

      // Mock Data for demonstration
      const lanes = [
        { id: "lane_1", name: "Lane 1", type: "20 Yards" },
        { id: "lane_2", name: "Lane 2", type: "20 Yards" },
        { id: "lane_3", name: "Lane 3", type: "18 Meters" },
      ];

      const mockBookings = [
        { laneId: "lane_1", startTime: `${date}T14:00:00.000Z`, endTime: `${date}T15:00:00.000Z` },
        { laneId: "lane_2", startTime: `${date}T10:00:00.000Z`, endTime: `${date}T11:00:00.000Z` },
      ];

      // Generate 1-hour slots from 9 AM to 8 PM
      const operatingHours = { start: 9, end: 20 };
      const availability = [];

      for (let hour = operatingHours.start; hour < operatingHours.end; hour++) {
        const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00.000Z`);
        const slotEnd = new Date(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00.000Z`);

        const availableLanes = lanes.filter(lane => {
          // Check if there's a booking for this lane that overlaps with this slot
          const isBooked = mockBookings.some(b => 
            b.laneId === lane.id && 
            new Date(b.startTime).getTime() === slotStart.getTime()
          );
          return !isBooked;
        });

        availability.push({
          time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          availableLanes
        });
      }

      res.json({ date, availability });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Create Booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { userId, clubId, laneId, startTime, endTime, isMember } = req.body;
      
      // --- PRISMA LOGIC (Commented out for MVP) ---
      /*
      // 1. Check for double booking
      const existingBooking = await prisma.booking.findFirst({
        where: {
          laneId,
          startTime: new Date(startTime),
          status: { in: ['CONFIRMED', 'PENDING'] }
        }
      });
      if (existingBooking) throw new Error("Slot is already booked");

      // 2. Check if user is an active member
      const membership = await prisma.membership.findFirst({
        where: { userId, clubId, status: 'ACTIVE', endDate: { gt: new Date() } }
      });

      if (membership) {
        // Free booking for members
        const booking = await prisma.booking.create({
          data: { userId, laneId, startTime: new Date(startTime), endTime: new Date(endTime), status: 'CONFIRMED' }
        });
        return res.json({ success: true, bookingId: booking.id, requiresPayment: false });
      }
      */

      if (isMember) {
        // Member booking is free and instantly confirmed
        res.json({ success: true, bookingId: "b_mock123", requiresPayment: false });
      } else {
        // Non-member drop-in fee -> Stripe Checkout
        const stripe = getStripe();
        const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
        
        // Mock connected account ID for demonstration
        const connectedAccountId = "acct_1MockAccountID"; 

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "cad",
              product_data: { name: "Drop-in Lane Rental (1 Hour)" },
              unit_amount: 2500, // $25.00 CAD
            },
            quantity: 1,
          }],
          payment_intent_data: {
            application_fee_amount: 38, // 1.5% of $25.00 is $0.375
            transfer_data: {
              destination: connectedAccountId,
            },
          },
          success_url: `${appUrl}/member?booking=success`,
          cancel_url: `${appUrl}/member/calendar?booking=cancelled`,
        });
        res.json({ success: true, requiresPayment: true, checkoutUrl: session.url });
      }

    } catch (error: any) {
      console.error("Booking error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Get Events
  app.get("/api/events/:clubId", async (req, res) => {
    try {
      // Mock Data for MVP
      res.json({
        events: [
          { id: "evt_1", name: "Summer 3D Shoot", date: "2026-07-15T09:00:00Z", maxCapacity: 50, price: 45, soldTickets: 50 },
          { id: "evt_2", name: "Fall Target Tournament", date: "2026-09-20T10:00:00Z", maxCapacity: 100, price: 60, soldTickets: 42 }
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 8. Create Event
  app.post("/api/events", async (req, res) => {
    try {
      const { clubId, name, date, maxCapacity, price } = req.body;
      // Mock create
      res.json({ success: true, eventId: "evt_mock_new" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 9. Purchase Event Ticket Checkout
  app.post("/api/events/checkout", async (req, res) => {
    try {
      const { eventId, userId, clubId } = req.body;
      
      // --- PRISMA LOGIC (Commented out for MVP) ---
      /*
      const event = await prisma.event.findUnique({ 
        where: { id: eventId }, 
        include: { tickets: true } 
      });
      if (!event) throw new Error("Event not found");

      const soldCount = event.tickets.filter(t => t.paymentStatus === 'PAID').length;
      if (soldCount >= event.maxCapacity) {
        return res.status(400).json({ error: "Event is sold out. Please join the waitlist." });
      }
      */

      // Mock capacity check
      if (eventId === "evt_1") {
        return res.status(400).json({ error: "Event is sold out. Please join the waitlist." });
      }

      const stripe = getStripe();
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const connectedAccountId = "acct_1MockAccountID"; 
      const priceInCents = 60 * 100; // Mock price: $60.00 CAD

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: { name: "Tournament Ticket" },
            unit_amount: priceInCents,
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: Math.round(priceInCents * 0.015), // 1.5% platform fee
          transfer_data: {
            destination: connectedAccountId,
          },
        },
        success_url: `${appUrl}/member/events?checkout=success`,
        cancel_url: `${appUrl}/member/events?checkout=cancelled`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Event checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 10. Join Waitlist
  app.post("/api/events/waitlist", async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      // Mock waitlist logic
      res.json({ success: true, message: "Added to waitlist" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 11. Get Financials
  app.get("/api/financials/:clubId", async (req, res) => {
    try {
      const { clubId } = req.params;
      const { startDate, endDate } = req.query;

      // Mock Data for MVP
      res.json({
        executiveSummary: {
          grossRevenue: 15420.00,
          discountsAndComps: 420.00,
          refundsIssued: 150.00,
          netRevenue: 14850.00,
          taxesCollected: 742.50,
          totalCashCollected: 15592.50
        },
        revenueByCategory: {
          recurringMemberships: 8500.00,
          singleSessionsAndDropIns: 4200.00,
          retailAndFoodBeverage: 1850.00,
          penaltyFees: 300.00
        },
        tenderTypes: {
          creditAndDebitCards: 14200.00,
          cash: 1392.50
        },
        liabilitiesAndReceivables: {
          tipsAndGratuities: 450.00,
          unpaidInvoicesAndFailedAutoPays: [
            { id: "inv_1", clientName: "John Doe", amount: 120.00, reason: "Failed Auto-Pay", date: "2026-03-01" },
            { id: "inv_2", clientName: "Jane Smith", amount: 25.00, reason: "Unpaid Drop-in", date: "2026-03-05" }
          ]
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
