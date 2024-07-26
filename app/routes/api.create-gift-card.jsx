import { json } from '@remix-run/node';
import axios from 'axios';

export async function action({ request }) {
    try {
        const { customerId, orderAmount } = await request.json();
        const token = process.env.SHOPIFY_ACCESS_TOKEN;
        const shop = process.env.SHOPIFY_SHOP_NAME;

        console.log('Creating gift card for customer:', customerId, 'with amount:', orderAmount);

        const response = await axios.post(`https://${shop}.myshopify.com/admin/api/2024-07/gift_cards.json`, {
            gift_card: {
                initial_value: orderAmount,
                note: `Refund for customer ${customerId}`
            }
        }, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });

        // Log the full response for inspection
        console.log('Response from Shopify API:', response.data);

        // Check if the response contains the expected data
        if (response.data && response.data.gift_card && response.data.gift_card.code) {
            return json({ success: true, giftCard: { code: response.data.gift_card.code } });
        } else {
            console.error('Unexpected response structure:', response.data);
            return json({ error: 'Failed to fetch total gift card value' }, { status: 500 });
        }
    } catch (error) {
        // Improved error logging
        if (error.response) {
            console.error('Error response from Shopify:', error.response.data);
            return json({ error: 'Failed to create gift card', details: error.response.data }, { status: 500 });
        } else {
            console.error('Error creating gift card:', error.message);
            return json({ error: 'Failed to create gift card', details: error.message }, { status: 500 });
        }
    }
}
