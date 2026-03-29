import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Admin routes use the service key directly (supabase client in api/lib already uses it)
  // In production, add admin role verification here

  try {
    if (req.method === 'GET') {
      const { status, trade, limit: limitStr, offset: offsetStr } = req.query;

      let query = supabase
        .from('contractor_applications')
        .select('*, contractor_documents(*), contractor_references(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status && typeof status === 'string' && status !== 'all') {
        query = query.eq('status', status);
      }
      if (trade && typeof trade === 'string' && trade !== 'all') {
        query = query.eq('primary_trade', trade);
      }

      const limit = parseInt(limitStr as string) || 50;
      const offset = parseInt(offsetStr as string) || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ applications: data, total: count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in admin applications:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
