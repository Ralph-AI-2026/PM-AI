import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NotificationPayload {
  landlord_email: string;
  landlord_name: string;
  property_address: string;
  request_description: string;
  request_priority: string;
  tenant_name: string;
  request_title?: string;
  dashboard_url?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#16a34a',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'URGENT',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

function buildEmailHtml(payload: NotificationPayload): string {
  const {
    landlord_name,
    property_address,
    request_description,
    request_priority,
    tenant_name,
    request_title,
    dashboard_url,
  } = payload;

  const priorityColor = PRIORITY_COLORS[request_priority] ?? '#d97706';
  const priorityLabel = PRIORITY_LABELS[request_priority] ?? request_priority.toUpperCase();
  const viewUrl = dashboard_url ?? 'https://hrop.ca/landlord/dashboard';
  const title = request_title ?? 'Maintenance Request';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Maintenance Request - HROP</title>
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
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:15px;color:#475569;">Hi ${landlord_name},</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0f172a;">New maintenance request submitted</h1>

              <!-- Property card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Property</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${property_address}</p>
                  </td>
                </tr>
              </table>

              <!-- Request details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Issue</p>
                          <p style="margin:0;font-size:16px;font-weight:600;color:#1e293b;">${title}</p>
                        </td>
                        <td align="right" valign="top">
                          <span style="display:inline-block;padding:4px 12px;border-radius:20px;background:${priorityColor}1a;color:${priorityColor};font-size:12px;font-weight:700;letter-spacing:0.5px;">${priorityLabel}</span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Description</p>
                    <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.6;">${request_description}</p>

                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Submitted by</p>
                    <p style="margin:0;font-size:14px;color:#475569;">${tenant_name}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${viewUrl}" style="display:inline-block;padding:14px 32px;background:#00D4AA;color:#060D1A;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">View in Dashboard</a>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
                You received this because you're registered as a landlord on HROP.<br />
                Log in at <a href="https://hrop.ca" style="color:#00D4AA;text-decoration:none;">hrop.ca</a> to manage your properties.
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
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const payload = req.body as NotificationPayload;

  // Validate required fields
  const required = ['landlord_email', 'landlord_name', 'property_address', 'request_description', 'request_priority', 'tenant_name'];
  for (const field of required) {
    if (!payload[field as keyof NotificationPayload]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const emailHtml = buildEmailHtml(payload);
  const subject = `New Maintenance Request - ${payload.property_address}`;

  // Determine sender - use onboarding@resend.dev if custom domain isn't set up
  const from = process.env.RESEND_FROM_EMAIL ?? 'HROP - Fix It Fast <onboarding@resend.dev>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [payload.landlord_email],
        subject,
        html: emailHtml,
      }),
    });

    const data = await response.json() as { id?: string; error?: string; message?: string };

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(502).json({ error: 'Failed to send email', details: data });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Email send failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
