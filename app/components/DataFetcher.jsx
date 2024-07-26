// app/components/DataFetcher.jsx
import { useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

export function DataFetcher() {
    const fetcher = useFetcher();

    useEffect(() => {
        const getDataAndAppendEnv = async () => {
            if (localStorage.getItem('envUpdated') === 'true') {
                console.log('Environment variables have already been updated.');
                return;
            }

            try {
                const response = await fetch("/api/getdata", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                let shopData = await response.json();
                const accessToken = shopData[0].accessToken;
                const shopName = shopData[0].shop.replace(".myshopify.com", "");

                fetcher.submit(
                    { accessToken, shopName },
                    { method: 'post', action: '/api/update-env' }
                );

                localStorage.setItem('envUpdated', 'true');

                return { accessToken, shopName };
            } catch (error) {
                console.error("Error:", error);
                throw error;
            }
        };

        getDataAndAppendEnv();
    }, [fetcher]);

    return null;
}