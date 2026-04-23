import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

interface JobAvailablePayload {
  job_id: string;
  service_type: string;
  location: string;
  description: string;
  property_address: string;
}

interface ServiceProvider {
  id: string;
  email: string;
  full_name: string;
}

function buildJobAvailableEmail(
  provider: ServiceProvider,
  payload: JobAvailablePayload,
  dashboardUrl: string
): string {
  const { service_type, location, description, property_address, job_id } = payload;
  const claimUrl = `${dashboardUrl}?claim=${job_id}`;
  const serviceLabel = service_type.charAt(0).toUpperCase() + service_type.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Job Available - HROP</title>
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
                    <span style="display:inline-block;padding:6px 14px;background:#00D4AA;color:#060D1A;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;">NEW JOB</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:15px;color:#475569;">Hi ${provider.full_name || 'there'},</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">New ${serviceLabel} job in ${location}</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#64748b;">First to claim it gets it. Act fast.</p>

              <!-- Job card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px solid #00D4AA;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <!-- Service type badge -->
                    <p style="margin:0 0 16px;">
                      <span style="display:inline-block;padding:4px 14px;background:#00D4AA1a;color:#00b894;font-size:12px;font-weight:700;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">${serviceLabel}</span>
                    </p>

                    <!-- Location -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Location</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${location}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Description -->
                    <p style="margin:0 0 3px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Job Description</p>
                    <p style="margin:0;font-size:15px;color:#334155;line-height:1.6;">${description}</p>
                  </td>
                </tr>
              </table>

              <!-- Urgency note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #fbbf24;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">First contractor to click "Claim This Job" locks the job. Others will see it as taken.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${claimUrl}" style="display:inline-block;padding:16px 48px;background:#00D4AA;color:#060D1A;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">Claim This Job</a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
                You received this because you're registered as a ${serviceLabel} on HROP.<br />
                Log in at <a href="https://hrop.ca/provider" style="color:#00D4AA;text-decoration:none;">hrop.ca</a> to manage your jobs.
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
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const payload = req.body as JobAvailablePayload;
  const required = ['job_id', 'service_type', 'location', 'description', 'property_address'];
  for (const field of required) {
    if (!payload[field as keyof JobAvailablePayload]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Find matching available service providers
  const { data: providers, error: providerError } = await supabase
    .from('service_providers')
    .select(`
      id,
      available,
      profiles!inner(email, full_name)
    `)
    .eq('service_type', payload.service_type)
    .eq('available', true);

  if (providerError) {
    console.error('Error fetching providers:', providerError);
    return res.status(500).json({ error: 'Failed to fetch service providers' });
  }

  if (!providers || providers.length === 0) {
    return res.status(200).json({ success: true, notified: 0, message: 'No matching providers found' });
  }

  const dashboardUrl = process.env.DASHBOARD_URL ?? 'https://hrop.ca/provider';
  const from = process.env.RESEND_FROM_EMAIL ?? 'HROP - Fix It Fast <notifications@hrop.ca>';

  let notified = 0;
  const errors: string[] = [];

  for (const provider of providers) {
    const profile = Array.isArray((provider as any).profiles)
      ? (provider as any).profiles[0]
      : (provider as any).profiles;

    if (!profile?.email) continue;

    const providerObj: ServiceProvider = {
      id: provider.id,
      email: profile.email,
      full_name: profile.full_name || '',
    };

    const emailHtml = buildJobAvailableEmail(providerObj, payload, dashboardUrl);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [providerObj.email],
          subject: `New ${payload.service_type} job in ${payload.location} - Claim it now`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        notified++;
      } else {
        const errData = await response.json() as { message?: string };
        errors.push(`${providerObj.email}: ${errData.message ?? 'unknown error'}`);
      }
    } catch (err) {
      errors.push(`${providerObj.email}: ${String(err)}`);
    }
  }

  return res.status(200).json({
    success: true,
    notified,
    total_providers: providers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
