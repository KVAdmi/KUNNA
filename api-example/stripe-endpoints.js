// Ejemplo de endpoint para crear sesión de Stripe Checkout
// Este archivo debería estar en tu backend (Node.js/Express o similar)

import Stripe from 'stripe';

// Inicializar Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { priceId, customerEmail, plan, userId } = req.body;

  try {
    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: userId,
        plan: plan,
      },
      // Configurar webhooks para actualizar la base de datos
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
        },
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Webhook para manejar eventos de Stripe
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', session);
      
      // Actualizar base de datos del usuario
      // await updateUserPaymentStatus(session.metadata.userId, true);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription);
      
      // Actualizar base de datos del usuario
      // await updateUserPaymentStatus(deletedSubscription.metadata.userId, false);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}
