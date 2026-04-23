import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

interface ClaimPayload {
  job_id: string;
  provider_id: string;
}

function buildClaimedConfirmationEmail(params: {
  provider_name: string;
  job_title: string;
  service_type: string;
  property_address: string;
  location: string;
  description: string;
  tenant_name: string;
  tenant_phone: string;
  dashboard_url: string;
}): string {
  const {
    provider_name,
    job_title,
    service_type,
    property_address,
    location,
    description,
    tenant_name,
    tenant_phone,
    dashboard_url,
  } = params;
  const serviceLabel = service_type.charAt(0).toUpperCase() + service_type.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Job Claimed - HROP</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#060D1A;border-radius:12px 12px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#00D4AA;font-size:22px;font-weight:700;letter-spacing:-0.5px;">HROP</span>
                    <span style="color:rgba(255,255,255,0.4);font-size:14px;margin-left:8px;">Fix It Fast</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:6px 14px;background:#22c55e;color:#fff;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">JOB CLAIMED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:15px;color:#475569;">Hi ${provider_name || 'there'},</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">You've locked in the job!</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;">Here are the full details. Contact the tenant to schedule.</p>

              <!-- Job details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Job</p>
                    <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#1e293b;">${job_title}</p>

                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Service Type</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#334155;">${serviceLabel}</p>

                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Description</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.6;">${description}</p>
                  </td>
                </tr>
              </table>

              <!-- Property + tenant card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Property &amp; Tenant Details</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:50%;padding-right:12px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">Property Address</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${property_address}</p>
                          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${location}</p>
                        </td>
                        <td style="width:50%;padding-left:12px;vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">Tenant Contact</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">${tenant_name}</p>
                          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${tenant_phone || 'No phone on file'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${dashboard_url}" style="display:inline-block;padding:14px 36px;background:#00D4AA;color:#060D1A;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">View in Dashboard</a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
                Update your job status as you go. Tenants and landlords are notified automatically.<br />
                Log in at <a href="https://hrop.ca/provider" style="color:#00D4AA;text-decoration:none;">hrop.ca</a>
              </p>

            </td>
          </tr>

          <!-- Footer bar -->
          <tr>
            <td style="background:#060D1A;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">HROP &mdash; Property Maintenance Platform &mdash; hrop.ca</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { job_id, provider_id } = req.body as ClaimPayload;

  if (!job_id || !provider_id) {
    return res.status(400).json({ error: 'Missing job_id or provider_id' });
  }

  // Atomic claim: only succeeds if job is still available
  // Supabase doesn't expose rowCount directly, so we use a select + update approach
  // Update with status='available' guard for race condition protection
  const { data: claimedJob, error: claimError } = await supabase
    .from('jobs')
    .update({
      status: 'claimed',
      service_provider_id: provider_id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', job_id)
    .eq('status', 'available')
    .select(`
      id,
      cost,
      request_id,
      request:maintenance_requests(
        title,
        description,
        category,
        tenant:profiles!maintenance_requests_tenant_id_fkey(full_name, phone),
        property:properties(address, city)
      )
    `)
    .single();

  if (claimError || !claimedJob) {
    // Could be already claimed or not found
    return res.status(409).json({ error: 'Job already claimed or not available', already_claimed: true });
  }

  // Fetch provider profile for confirmation email
  const { data: providerProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', provider_id)
    .single();

  // Fetch provider service type
  const { data: providerData } = await supabase
    .from('service_providers')
    .select('service_type, service_area')
    .eq('id', provider_id)
    .single();

  // Send confirmation email if we have the provider's email
  if (providerProfile?.email && claimedJob.request) {
    const req_data = Array.isArray(claimedJob.request) ? claimedJob.request[0] : claimedJob.request;
    const property = Array.isArray(req_data?.property) ? req_data.property[0] : req_data?.property;
    const tenant = Array.isArray(req_data?.tenant) ? req_data.tenant[0] : req_data?.tenant;

    const dashboardUrl = process.env.DASHBOARD_URL ?? 'https://hrop.ca/provider';
    const from = process.env.RESEND_FROM_EMAIL ?? 'HROP - Fix It Fast <notifications@hrop.ca>';

    const emailHtml = buildClaimedConfirmationEmail({
      provider_name: providerProfile.full_name || '',
      job_title: req_data?.title || 'Maintenance Job',
      service_type: providerData?.service_type || 'general',
      property_address: property?.address || 'Address on file',
      location: property?.city || providerData?.service_area || '',
      description: req_data?.description || '',
      tenant_name: tenant?.full_name || 'Tenant',
      tenant_phone: tenant?.phone || '',
      dashboard_url: dashboardUrl,
    });

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [providerProfile.email],
          subject: `Job Confirmed: ${req_data?.title ?? 'Maintenance Job'} - ${property?.city ?? ''}`,
          html: emailHtml,
        }),
      });
    } catch (err) {
      // Non-fatal: job was claimed, email is best-effort
      console.error('Failed to send confirmation email:', err);
    }
  }

  return res.status(200).json({
    success: true,
    job_id: claimedJob.id,
    message: 'Job claimed successfully',
  });
}
