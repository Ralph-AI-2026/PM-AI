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
    stripeClient = new Stripe(key, { apiVersion: "2024-12-18.acacia" as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- HROP API Routes ---

  // TODO: implement HROP route — POST /api/stripe/onboard (provider onboarding)
  // TODO: implement HROP route — GET /api/stripe/verify/:accountId (provider verification)
  // TODO: implement HROP route — POST /api/maintenance-requests (tenant submits request)
  // TODO: implement HROP route — GET /api/maintenance-requests/:propertyId (list requests)
  // TODO: implement HROP route — POST /api/jobs (assign job to provider)
  // TODO: implement HROP route — GET /api/jobs/:providerId (provider job list)
  // TODO: implement HROP route — POST /api/payments/checkout (job payment via Stripe)
  // TODO: implement HROP route — GET /api/properties/:landlordId (landlord properties)
  // TODO: implement HROP route — GET /api/reviews/:providerId (provider reviews)

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
