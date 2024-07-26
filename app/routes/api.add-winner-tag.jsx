import { json } from '@remix-run/node';
import axios from 'axios';

export async function action({ request }) {
    const { customerId } = await request.json();
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    const shop = process.env.SHOPIFY_SHOP_NAME;

    try {
        const response = await axios.put(`https://${shop}.myshopify.com/admin/api/2024-07/customers/${customerId}.json`, {
            customer: {
                id: customerId,
                tags: 'contest_winner'
            }
        }, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error adding winner tag:', error);
        return json({ error: 'Failed to add winner tag' }, { status: 500 });
    }
}
