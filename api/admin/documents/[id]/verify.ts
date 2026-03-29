import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing document ID' });
  }

  try {
    const { verified, verified_by, verification_notes } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'verified field must be a boolean' });
    }

    const { data, error } = await supabase
      .from('contractor_documents')
      .update({
        verified,
        verified_by: verified_by || null,
        verified_at: new Date().toISOString(),
        verification_notes: verification_notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.status(200).json({ document: data });
  } catch (err) {
    console.error('Error verifying document:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
