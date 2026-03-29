import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  try {
    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      company_name,
      business_registration_number,
      hst_number,
      address,
      city,
      province,
      postal_code,
      primary_trade,
      secondary_trades,
      years_experience,
      licensed_trade,
      license_number,
      licensing_body,
      service_radius_km,
      service_cities,
      application_id,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !address || !city || !postal_code || !primary_trade) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = {
      user_id: user.id,
      first_name,
      last_name,
      email,
      phone,
      company_name: company_name || null,
      business_registration_number: business_registration_number || null,
      hst_number: hst_number || null,
      address,
      city,
      province: province || 'ON',
      postal_code,
      primary_trade,
      secondary_trades: secondary_trades || [],
      years_experience: years_experience || 0,
      licensed_trade: licensed_trade || false,
      license_number: license_number || null,
      licensing_body: licensing_body || null,
      service_radius_km: service_radius_km || 50,
      service_cities: service_cities || [],
    };

    if (application_id) {
      // Update existing application
      const { data, error } = await supabase
        .from('contractor_applications')
        .update(payload)
        .eq('id', application_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ application: data });
    } else {
      // Check for existing draft
      const { data: existing } = await supabase
        .from('contractor_applications')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['draft', 'submitted', 'under_review', 'approved'])
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'You already have an active application' });
      }

      // Create new application
      const { data, error } = await supabase
        .from('contractor_applications')
        .insert({ ...payload, status: 'draft' })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ application: data });
    }
  } catch (err) {
    console.error('Error in contractor apply:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
