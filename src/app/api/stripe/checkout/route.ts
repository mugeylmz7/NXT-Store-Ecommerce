//localhost:3000/api/stripe/checkout
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: '{{PRICE_ID}}',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    
    // 🟢 EKLEYECEĞİMİZ GÜVENLİK KONTROLÜ:
    // Eğer Stripe bir şekilde URL dönmediyse, süreci güvenli bir hatayla durduruyoruz.
    // Böylece TypeScript alttaki satırda session.url'in KESİNLİKLE null olmayacağını anlıyor.
    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe checkout session URL is missing." },
        { status: 500 }
      );
    }
    
    // 🟢 Artık burası hata vermeyecek
    return NextResponse.redirect(session.url, 303)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}