import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing application ID' });
  }

  try {
    const { action, reason, reviewed_by } = req.body;

    const validActions = ['approved', 'rejected', 'suspended', 'removed', 'under_review'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be one of: ' + validActions.join(', ') });
    }

    if ((action === 'rejected' || action === 'suspended') && !reason) {
      return res.status(400).json({ error: 'Reason is required for rejection or suspension' });
    }

    // Fetch current application
    const { data: app, error: fetchErr } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updates: Record<string, unknown> = {
      status: action,
      reviewed_by: reviewed_by || null,
      reviewed_at: new Date().toISOString(),
    };

    if (action === 'rejected') {
      updates.rejection_reason = reason;
    }
    if (action === 'suspended') {
      updates.suspension_reason = reason;
    }

    const { data, error } = await supabase
      .from('contractor_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // If approved, update the contractors table
    if (action === 'approved') {
      await supabase
        .from('contractors')
        .update({
          application_id: id,
          vetting_status: 'approved',
          status: 'active',
        })
        .eq('user_id', app.user_id);
    }

    // If suspended, update the contractors table
    if (action === 'suspended') {
      await supabase
        .from('contractors')
        .update({
          vetting_status: 'suspended',
          status: 'suspended',
        })
        .eq('user_id', app.user_id);
    }

    return res.status(200).json({ application: data });
  } catch (err) {
    console.error('Error reviewing application:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
