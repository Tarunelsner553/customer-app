import { json } from '@remix-run/node';
import axios from 'axios';
import { access } from 'fs';

export async function loader({ request }) {
    // const { accessToken, shopName } = await request.json();

    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    const shop = process.env.SHOPIFY_SHOP_NAME;

    try {
        const response = await axios.get(`https://${shop}.myshopify.com/admin/api/2024-07/gift_cards.json`, {
            headers: {
                'X-Shopify-Access-Token': token,
                'Content-Type': 'application/json'
            },
            params: {
                status: 'enabled'
            }
        });

        const giftCards = response.data.gift_cards;
        const totalValue = giftCards.reduce((sum, giftCard) => sum + parseFloat(giftCard.initial_value), 0);

        return json({ totalValue });
    } catch (error) {
        console.error('Error fetching total gift card value:', error);
        return json({ error: 'Failed to fetch total gift card value' }, { status: 500 });
    }
}
