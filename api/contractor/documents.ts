import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    if (req.method === 'POST') {
      const { application_id, document_type, file_url, file_name, expiry_date } = req.body;

      if (!application_id || !document_type || !file_url || !file_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify the application belongs to this user
      const { data: app } = await supabase
        .from('contractor_applications')
        .select('id')
        .eq('id', application_id)
        .eq('user_id', user.id)
        .single();

      if (!app) {
        return res.status(403).json({ error: 'Application not found or access denied' });
      }

      const { data, error } = await supabase
        .from('contractor_documents')
        .insert({
          application_id,
          document_type,
          file_url,
          file_name,
          expiry_date: expiry_date || null,
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ document: data });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing document ID' });
      }

      // Verify document belongs to user's application
      const { data: doc } = await supabase
        .from('contractor_documents')
        .select('*, contractor_applications!inner(user_id)')
        .eq('id', id)
        .single();

      const appData = (doc as Record<string, unknown>)?.contractor_applications as Record<string, unknown> | undefined;
      if (!doc || appData?.user_id !== user.id) {
        return res.status(403).json({ error: 'Document not found or access denied' });
      }

      if (doc.verified) {
        return res.status(400).json({ error: 'Cannot delete a verified document' });
      }

      const { error } = await supabase
        .from('contractor_documents')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Error in contractor documents:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
