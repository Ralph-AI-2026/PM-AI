import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing reference ID' });
  }

  try {
    const { contacted_by, feedback, rating } = req.body;

    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('contractor_references')
      .update({
        contacted: true,
        contacted_at: new Date().toISOString(),
        contacted_by: contacted_by || null,
        feedback,
        rating: rating || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Reference not found' });
    }

    return res.status(200).json({ reference: data });
  } catch (err) {
    console.error('Error logging reference contact:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
