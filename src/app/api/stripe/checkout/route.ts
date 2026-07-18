// localhost:3000/stripe/checkout
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const CheckoutSchema = z.object({
  cartItems: z.array(
    z.object({
      stripePriceId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "Cart cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Sepette 1 ürün de olsa, 5 ürün de olsa hepsini tek seferde JSON olarak yakalıyoruz:
    const body = await req.json().catch(() => ({}));

    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cartItems } = parsed.data;

    // Gelen sepet öğelerini Stripe'ın beklediği formata haritalıyoruz (Tek ürün yerine çoklu ürün desteği)
    const lineItems = cartItems.map(item => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));

    
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });


    // GÜVENLİK KONTROLÜ:
    // Eğer Stripe bir şekilde URL dönmediyse, süreci güvenli bir hatayla durduruyoruz.
    // Böylece TypeScript alttaki satırda session.url'in KESİNLİKLE null olmayacağını anlıyor.
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout session URL is missing." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}