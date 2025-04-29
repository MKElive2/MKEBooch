// /api/subscribe.js

import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Role for server-side trusted inserts
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Insert email into Supabase
    const { data, error } = await supabase
      .from('emails')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Database error' });
    }

    // Send Welcome Email
    const msg = {
      to: email,
      from: 'welcome@mkebooch.com', // 🧠 <-- Must be a verified sender in SendGrid
      subject: 'Welcome to MKE Booch!',
      text: 'Thanks for signing up! We\'ll keep you posted as we get ready to launch!',
      html: `<strong>Thanks for signing up!</strong><br><br>We can't wait to bring BoochYa! to SE Wisconsin. Stay tuned for launch announcements!`,
    };

    await sgMail.send(msg);

    return res.status(200).json({ message: 'Success!' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
