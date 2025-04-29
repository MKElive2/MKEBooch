import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const { error } = await supabase
    .from('emails')
    .update({ unsubscribed: true })
    .eq('email', email);

  if (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({ message: 'Error unsubscribing. Please try again.' });
  }

  return res.status(200).json({ message: 'You’ve been unsubscribed.' });
}
