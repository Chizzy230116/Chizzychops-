// // app/api/verify-payment/route.ts
// // Called after Paystack payment completes — verifies with Paystack,
// // saves order to Supabase, sends WhatsApp notification to owner.

// import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

// // Use the SERVICE ROLE key here (server-side only — never expose to browser)
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!,
// )

// const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
// const OWNER_PHONE     = '2348094946923'   // owner WhatsApp number

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json()
//     const { reference, orderData } = body

//     if (!reference || !orderData) {
//       return NextResponse.json({ error: 'Missing reference or orderData' }, { status: 400 })
//     }

//     // ── 1. Verify with Paystack ──────────────────────────────────────
//     const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
//     })
//     const psJson = await psRes.json()

//     if (!psJson.status || psJson.data?.status !== 'success') {
//       // Payment failed or not found — save as failed
//       await supabase.from('orders').upsert({
//         ...orderData,
//         status:       'failed',
//         paystack_data: psJson.data ?? null,
//         updated_at:   new Date().toISOString(),
//       })
//       return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 402 })
//     }

//     const ps = psJson.data

//     // ── 2. Confirm amounts match (security check) ────────────────────
//     if (ps.amount !== orderData.total) {
//       return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
//     }

//     // ── 3. Save completed order to Supabase ──────────────────────────
//     const { error: dbErr } = await supabase.from('orders').upsert({
//       ...orderData,
//       status:        'paid',
//       paystack_data: ps,
//       updated_at:    new Date().toISOString(),
//     })

//     if (dbErr) {
//       console.error('DB save error:', dbErr)
//       // Don't fail the response — payment succeeded, log the error
//     }
  
//     // ── 4. Build receipt text ────────────────────────────────────────
//     const fmt       = (n: number) => '₦' + (n / 100).toLocaleString('en-NG')
//     const itemLines = orderData.items
//       .map((i: { name: string; qty: number; price: number }) =>
//         `• ${i.name} ×${i.qty} — ${fmt(i.price * i.qty * 100)}`
//       )
//       .join('\n')

//     const ownerMsg = [
//       `🎉 *NEW PAID ORDER — Chizzychops & Grillz*`,
//       ``,
//       `👤 *Customer:* ${orderData.customer_name}`,
//       `📞 *Phone:* ${orderData.customer_phone}`,
//       `📧 *Email:* ${orderData.customer_email}`,
//       `📍 *Address:* ${orderData.delivery_address}`,
//       ``,
//       `🛒 *Order Items:*`,
//       itemLines,
//       ``,
//       `💰 *Total Paid:* ${fmt(orderData.total)}`,
//       `🔖 *Reference:* ${reference}`,
//       `✅ *Payment:* CONFIRMED via Paystack`,
//       ``,
//       `📦 Please prepare and arrange delivery within 6 hours.`,
//     ].join('\n')

//     const customerMsg = [
//       `✅ *Payment Confirmed! — Chizzychops & Grillz*`,
//       ``,
//       `Hi ${orderData.customer_name}, your order has been received and paid for!`,
//       ``,
//       `🛒 *Your Items:*`,
//       itemLines,
//       ``,
//       `💰 *Total:* ${fmt(orderData.total)}`,
//       `🔖 *Ref:* ${reference}`,
//       ``,
//       `📦 We're cooking your meal fresh. Please allow up to *6 hours* for delivery.`,
//       `📍 Delivering to: ${orderData.delivery_address}`,
//       ``,
//       `Questions? Reply to this message. Thank you! 🙏`,
//     ].join('\n')

//     // ── 5. Send WhatsApp to owner ────────────────────────────────────
//     const ownerWAUrl = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(ownerMsg)}`

//     // ── 6. Return success with both WhatsApp URLs ────────────────────
//     return NextResponse.json({
//       success:      true,
//       reference,
//       ownerWAUrl,
//       customerMsg,  // frontend opens this for the customer
//       order: {
//         id:       orderData.id,
//         total:    orderData.total,
//         items:    orderData.items,
//         customer: orderData.customer_name,
//       },
//     })

//   } catch (err) {
//     console.error('verify-payment error:', err)
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
//   }
// }