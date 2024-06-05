import Stripe from "stripe"

const stripe = new Stripe("sk_test_51PLfemC65sgmj7Mot4O8f4eAXV9TSyKLboHUEsWOejiYSdh2l2ootyy8DQ5m5ZDFuq1dnigb3sCkl3B5gqUwtExn00A42bV8so");
const host = "https://explorerv1.netlify.app";

export const stripePayment = async ( amount, _id, type ) => {
    try {

        const date = new Date().toISOString();
    
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "INV-" + date,
                },
                unit_amount: Math.round(amount * 100) || 100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          cancel_url: `${host}/toursandactivity/booking/?booking_status=false&booking_type=${type}&booking_id=${_id}`,
          success_url: `${host}/toursandactivity/booking/?booking_status=true&booking_type=${type}&booking_id=${_id}`,
        });

        const sessionId = session.id
        return { sessionId }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating checkout session" });
      }
}
