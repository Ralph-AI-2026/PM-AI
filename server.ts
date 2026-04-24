import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Supabase client (server-side — uses service role key if available, falls back to anon)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------------------------------------------------------------------
// AI triage — keyword-based, no external API needed
// ---------------------------------------------------------------------------

type Category = "plumbing" | "electrical" | "hvac" | "general";
type Priority = "urgent" | "high" | "medium" | "low";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  plumbing: [
    "pipe", "leak", "water", "drain", "toilet", "faucet", "sink",
    "shower", "bathtub", "sewer", "hot water",
  ],
  electrical: [
    "outlet", "wire", "switch", "breaker", "light", "power",
    "electrical", "socket", "voltage", "spark",
  ],
  hvac: [
    "heat", "furnace", "ac", "air conditioning", "thermostat", "vent",
    "duct", "filter", "cooling", "temperature",
  ],
  general: [
    "door", "window", "lock", "paint", "wall", "floor", "ceiling",
    "cabinet", "appliance", "pest", "mold",
  ],
};

const URGENT_KEYWORDS = ["flood", "fire", "gas", "no heat", "no power", "sewage"];
const HIGH_KEYWORDS = ["leak", "no hot water", "broken lock", "no ac"];
const MEDIUM_KEYWORDS = ["appliance", "minor leak", "clogged drain", "clogged"];
// anything else defaults to low

function triageRequest(description: string): {
  category: Category;
  priority: Priority;
  reasoning: string;
} {
  const lower = description.toLowerCase();

  // Determine category — first match wins
  let category: Category = "general";
  let categoryReason = "No specific category keywords matched; defaulting to general.";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    const match = keywords.find((kw) => lower.includes(kw));
    if (match) {
      category = cat;
      categoryReason = `Matched keyword "${match}" for category "${cat}".`;
      break;
    }
  }

  // Determine priority
  let priority: Priority = "low";
  let priorityReason = "No urgent/high/medium indicators found; defaulting to low priority.";

  const urgentMatch = URGENT_KEYWORDS.find((kw) => lower.includes(kw));
  const highMatch = HIGH_KEYWORDS.find((kw) => lower.includes(kw));
  const mediumMatch = MEDIUM_KEYWORDS.find((kw) => lower.includes(kw));

  if (urgentMatch) {
    priority = "urgent";
    priorityReason = `Urgent keyword detected: "${urgentMatch}".`;
  } else if (highMatch) {
    priority = "high";
    priorityReason = `High-priority keyword detected: "${highMatch}".`;
  } else if (mediumMatch) {
    priority = "medium";
    priorityReason = `Medium-priority keyword detected: "${mediumMatch}".`;
  }

  return {
    category,
    priority,
    reasoning: `${categoryReason} ${priorityReason}`,
  };
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json({ limit: "10mb" }));

  // -------------------------------------------------------------------------
  // 1. POST /api/auth/signup
  //    Create profile row after Supabase auth signup
  // -------------------------------------------------------------------------
  app.post("/api/auth/signup", async (req, res) => {
    const { user_id, email, full_name, role, phone } = req.body;

    if (!user_id || !email || !role) {
      return res.status(400).json({ error: "user_id, email, and role are required" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: user_id, email, full_name: full_name ?? null, role, phone: phone ?? null })
      .select()
      .single();

    if (error) {
      console.error("[/api/auth/signup]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ profile: data });
  });

  // -------------------------------------------------------------------------
  // 2. POST /api/maintenance/request
  //    Tenant submits a maintenance request
  // -------------------------------------------------------------------------
  app.post("/api/maintenance/request", async (req, res) => {
    const { tenant_id, property_id, landlord_id, title, description, category, priority, photos } =
      req.body;

    if (!tenant_id || !property_id || !landlord_id || !title || !description) {
      return res.status(400).json({
        error: "tenant_id, property_id, landlord_id, title, and description are required",
      });
    }

    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        tenant_id,
        property_id,
        landlord_id,
        title,
        description,
        category: category ?? "general",
        priority: priority ?? "medium",
        photos: photos ?? [],
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[/api/maintenance/request]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ request: data });
  });

  // -------------------------------------------------------------------------
  // 3. POST /api/maintenance/approve
  //    Landlord approves a maintenance request; creates a job row
  // -------------------------------------------------------------------------
  app.post("/api/maintenance/approve", async (req, res) => {
    const { request_id, estimated_cost } = req.body;

    if (!request_id) {
      return res.status(400).json({ error: "request_id is required" });
    }

    // Update the maintenance request status
    const { data: updatedRequest, error: requestError } = await supabase
      .from("maintenance_requests")
      .update({ status: "approved" })
      .eq("id", request_id)
      .select()
      .single();

    if (requestError) {
      console.error("[/api/maintenance/approve] request update", requestError);
      return res.status(500).json({ error: requestError.message });
    }

    // Create a corresponding job
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        request_id,
        status: "available",
        estimated_cost: estimated_cost ?? null,
      })
      .select()
      .single();

    if (jobError) {
      console.error("[/api/maintenance/approve] job insert", jobError);
      return res.status(500).json({ error: jobError.message });
    }

    return res.status(200).json({ request: updatedRequest, job });
  });

  // -------------------------------------------------------------------------
  // 4. POST /api/maintenance/reject
  //    Landlord rejects a maintenance request
  // -------------------------------------------------------------------------
  app.post("/api/maintenance/reject", async (req, res) => {
    const { request_id } = req.body;

    if (!request_id) {
      return res.status(400).json({ error: "request_id is required" });
    }

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update({ status: "rejected" })
      .eq("id", request_id)
      .select()
      .single();

    if (error) {
      console.error("[/api/maintenance/reject]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ request: data });
  });

  // -------------------------------------------------------------------------
  // 5. GET /api/jobs/available
  //    List all available jobs with joined request details
  // -------------------------------------------------------------------------
  app.get("/api/jobs/available", async (_req, res) => {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        maintenance_requests (
          id, title, description, category, priority, photos,
          property_id, landlord_id, tenant_id,
          properties ( address, city, state, zip_code )
        )
      `
      )
      .eq("status", "available")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/jobs/available]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ jobs: data });
  });

  // -------------------------------------------------------------------------
  // 6. POST /api/jobs/claim
  //    Contractor atomically claims an available job
  // -------------------------------------------------------------------------
  app.post("/api/jobs/claim", async (req, res) => {
    const { job_id, provider_id } = req.body;

    if (!job_id || !provider_id) {
      return res.status(400).json({ error: "job_id and provider_id are required" });
    }

    // Atomic update: only succeeds if status is still 'available'
    const { data, error } = await supabase
      .from("jobs")
      .update({ status: "claimed", provider_id, claimed_at: new Date().toISOString() })
      .eq("id", job_id)
      .eq("status", "available")
      .select()
      .single();

    if (error) {
      console.error("[/api/jobs/claim]", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      // Row existed but status was not 'available' — already claimed
      return res.status(409).json({ error: "already_claimed" });
    }

    return res.status(200).json({ job: data });
  });

  // -------------------------------------------------------------------------
  // 7. POST /api/jobs/update-status
  //    Contractor updates job status (in_progress, completed)
  // -------------------------------------------------------------------------
  app.post("/api/jobs/update-status", async (req, res) => {
    const { job_id, status } = req.body;

    const allowed = ["in_progress", "completed"];
    if (!job_id || !status) {
      return res.status(400).json({ error: "job_id and status are required" });
    }
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", job_id)
      .select()
      .single();

    if (error) {
      console.error("[/api/jobs/update-status]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ job: data });
  });

  // -------------------------------------------------------------------------
  // 8. GET /api/properties/:landlordId
  //    Get all properties for a landlord
  // -------------------------------------------------------------------------
  app.get("/api/properties/:landlordId", async (req, res) => {
    const { landlordId } = req.params;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", landlordId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/properties/:landlordId]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ properties: data });
  });

  // -------------------------------------------------------------------------
  // 9. POST /api/properties
  //    Create a property
  // -------------------------------------------------------------------------
  app.post("/api/properties", async (req, res) => {
    const { landlord_id, address, city, state, zip_code, property_type, units } = req.body;

    if (!landlord_id || !address || !city) {
      return res.status(400).json({ error: "landlord_id, address, and city are required" });
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        landlord_id,
        address,
        city,
        state: state ?? null,
        zip_code: zip_code ?? null,
        property_type: property_type ?? null,
        units: units ?? 1,
      })
      .select()
      .single();

    if (error) {
      console.error("[/api/properties]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ property: data });
  });

  // -------------------------------------------------------------------------
  // 10. GET /api/dashboard/stats/:userId
  //     Role-aware dashboard stats
  // -------------------------------------------------------------------------
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    const { userId } = req.params;
    const role = (req.query.role as string) || "tenant";

    try {
      if (role === "landlord") {
        const [propertiesRes, requestsRes, jobsRes] = await Promise.all([
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("landlord_id", userId),
          supabase
            .from("maintenance_requests")
            .select("id, status", { count: "exact" })
            .eq("landlord_id", userId),
          supabase
            .from("jobs")
            .select("id, status", { count: "exact" })
            .in(
              "request_id",
              (
                await supabase
                  .from("maintenance_requests")
                  .select("id")
                  .eq("landlord_id", userId)
              ).data?.map((r) => r.id) ?? []
            ),
        ]);

        const requests = requestsRes.data ?? [];
        const jobs = jobsRes.data ?? [];

        return res.status(200).json({
          role,
          total_properties: propertiesRes.count ?? 0,
          total_requests: requests.length,
          pending_requests: requests.filter((r) => r.status === "pending").length,
          approved_requests: requests.filter((r) => r.status === "approved").length,
          active_jobs: jobs.filter((j) => ["claimed", "in_progress"].includes(j.status)).length,
          completed_jobs: jobs.filter((j) => j.status === "completed").length,
        });
      }

      if (role === "provider") {
        const [claimedRes, completedRes, availableRes] = await Promise.all([
          supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("provider_id", userId)
            .in("status", ["claimed", "in_progress"]),
          supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("provider_id", userId)
            .eq("status", "completed"),
          supabase
            .from("jobs")
            .select("id", { count: "exact", head: true })
            .eq("status", "available"),
        ]);

        return res.status(200).json({
          role,
          active_jobs: claimedRes.count ?? 0,
          completed_jobs: completedRes.count ?? 0,
          available_jobs: availableRes.count ?? 0,
        });
      }

      // Default: tenant
      const [requestsRes] = await Promise.all([
        supabase
          .from("maintenance_requests")
          .select("id, status")
          .eq("tenant_id", userId),
      ]);

      const requests = requestsRes.data ?? [];

      return res.status(200).json({
        role,
        total_requests: requests.length,
        pending_requests: requests.filter((r) => r.status === "pending").length,
        approved_requests: requests.filter((r) => r.status === "approved").length,
        completed_requests: requests.filter((r) => r.status === "completed").length,
      });
    } catch (err) {
      console.error("[/api/dashboard/stats]", err);
      return res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // -------------------------------------------------------------------------
  // 11. POST /api/ai/triage
  //     Keyword-based categorization and priority for maintenance requests
  // -------------------------------------------------------------------------
  app.post("/api/ai/triage", (req, res) => {
    const { description } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "description (string) is required" });
    }

    const result = triageRequest(description);
    return res.status(200).json(result);
  });

  // -------------------------------------------------------------------------
  // Vite dev middleware (SPA passthrough)
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HROP server running on http://localhost:${PORT}`);
  });
}

startServer();
