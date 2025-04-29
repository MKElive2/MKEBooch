import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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
    // First, try to send the email
    await sgMail.send({
      to: email,
      from: 'welcome@mkebooch.com',
      subject: 'Welcome to MKE Booch!',
      text: 'Thanks for signing up! We\'ll keep you posted as we get ready to launch!',
      html: `
  <p><strong>Thanks for signing up!</strong><br><br>
  We can't wait to bring BoochYa! to SE Wisconsin. Stay tuned for launch announcements!</p>
  <p style="font-size: 0.8rem; color: #999;">
    Don’t want to hear from us again? 
    <a href="https://mkebooch.com/unsubscribe.html?email=${email}">Unsubscribe here</a>
  </p>
`
    });

    // If send succeeds, insert into Supabase
    const { error } = await supabase
      .from('emails')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Email sent, but we couldn’t save your signup. No action needed.' });
    }

    return res.status(200).json({ message: 'Success!' });

  } catch (err) {
    console.error('SendGrid or server error:', err);
    return res.status(500).json({ message: 'Unable to send confirmation email. Please try again later.' });
  }
}
