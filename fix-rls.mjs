// Run RLS fix via Supabase Management API
const projectRef = 'uyazjsoystozhetysdtc';
const serviceRoleKey = ''; // Add new service role key here

const sql = `
DROP POLICY IF EXISTS "Service providers can view their jobs" ON jobs;
CREATE POLICY "Service providers can view available and their jobs" ON jobs FOR SELECT USING (
  service_provider_id IS NULL OR auth.uid() = service_provider_id
);
`;

// Use Supabase's pg REST endpoint via service role
const res = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
  },
  body: JSON.stringify({ sql }),
});

if (res.ok) {
  const body = await res.text();
  console.log('exec_sql success:', body);
} else {
  const err = await res.text();
  console.log('exec_sql failed:', res.status, err);

  // Try pg endpoint
  const res2 = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const body2 = await res2.text();
  console.log('Management API:', res2.status, body2);
}
