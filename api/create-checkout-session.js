import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { email, plan = 'pro', query = '' } = req.body || {};

  const PRICE_ID = 'prod_Tuputamadrerxd'; // 

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: ${process.env.SITE_URL}/docs/cuenta.html?success=1,
      cancel_url: ${process.env.SITE_URL}/docs/checkout.html?canceled=1,
      metadata: { email, plan, query }
    });

    res.status(200).json({ url: session.url });
  } catch (e) {
    console.error('stripe error', e);
    res.status(500).json({ error: 'stripe_error' });
  }
}
