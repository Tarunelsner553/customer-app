import { json } from '@remix-run/node';
import fs from 'fs';
import path from 'path';

export async function action({ request }) {
    if (request.method !== 'POST') {
        return json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    const formData = await request.formData();
    const accessToken = formData.get('accessToken');
    const shopName = formData.get('shopName');

    const envPath = path.resolve(process.cwd(), '.env');

    try {
        let envContent = '';
        let existingEnv = {};

        // Read existing .env file if it exists
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');

            // Parse existing environment variables
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    existingEnv[key.trim()] = value.trim();
                }
            });
        }

        // Update or add new variables
        existingEnv['SHOPIFY_ACCESS_TOKEN'] = accessToken;
        existingEnv['SHOPIFY_SHOP_NAME'] = shopName;

        // Convert back to string
        const newEnvContent = Object.entries(existingEnv)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Write the updated content back to the .env file
        fs.writeFileSync(envPath, newEnvContent);

        return json({ message: 'Environment variables updated' }, { status: 200 });
    } catch (error) {
        console.error('Error updating .env file:', error);
        return json({ error: 'Error updating environment variables' }, { status: 500 });
    }
}