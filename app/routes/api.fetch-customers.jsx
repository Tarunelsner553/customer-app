import { json } from "@remix-run/node";
import axios from "axios";
//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
export async function action({ request }) {
  const requestedData = await request.json();
  const { startDate, endDate } = requestedData;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  const shop = process.env.SHOPIFY_SHOP_NAME;

  try {
    const response = await axios.get(
      `https://${shop}.myshopify.com/admin/api/2024-07/customers.json`,
      {
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        params: {
          created_at_min: startDate,
          created_at_max: endDate,
        },
      },
    );

    const customers = response.data.customers;
    const customerData = await Promise.all(
      customers.map(async (customer) => {
        try {
          const orderResponse = await axios.get(
            `https://${shop}.myshopify.com/admin/api/2024-07/orders.json`,
            {
              headers: {
                "X-Shopify-Access-Token": token,
                "Content-Type": "application/json",
              },
              params: {
                customer_id: customer.id,
                status: "any",
              },
            },
          );

          const orders = orderResponse.data.orders;
          const totalOrderAmount = orders.reduce(
            (sum, order) => sum + parseFloat(order.total_price),
            0,
          ).toFixed(2);

          const emailConsent = customer.email_marketing_consent?.state === "subscribed";
          const smsConsent = customer.sms_marketing_consent?.state === "subscribed";
          const eligible = (emailConsent || smsConsent) && (totalOrderAmount > 0);
          // console.log("customer names: ", customer);

          return {
            id: customer.id,
            orderNumber:
              orders.length > 0 ? orders[0].name : "Order Not Placed",
            customerName: `${customer.first_name || customer.email || "N/A"} ${customer.last_name || ""
              }`,
            emailConsent: emailConsent ? "Yes" : "No",
            smsConsent: smsConsent ? "Yes" : "No",
            orderAmount: totalOrderAmount,
            status: eligible ? "Eligible" : "Not Eligible",
            email: customer.email
          };
        } catch (error) {
          console.error(
            `Error fetching orders for customer ${customer.id}:`,
            error,
          );
          return {
            id: customer.id,
            orderNumber: "N/A",
            customerName: `${customer.first_name || "N/A"} ${customer.last_name || "N/A"
              }`,
            emailConsent:
              customer.email_marketing_consent?.state === "subscribed"
                ? "Yes"
                : "No",
            smsConsent:
              customer.sms_marketing_consent?.state === "subscribed"
                ? "Yes"
                : "No",
            orderAmount: 0,
            status: "Not Eligible",
            email: customer.email
          };
        }
      }),
    );

    // console.log("Customer Data: ", customerData);
    return json(customerData);
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
}

