import { useFetcher } from '@remix-run/react';
export const getDataAndAppendEnv = async () => {
    const fetcher = useFetcher();
    try {
        const response = await fetch("/api/getdata", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        let shopData = await response.json();
        const accessToken = shopData[0].accessToken;
        const shopName = shopData[0].shop.replace(".myshopify.com", "");
        shopData = {
            accessToken: accessToken,
            shopName: shopName
        }
        fetcher.submit(
            { accessToken, shopName },
            { method: 'post', action: '/api/update-env' }
        );

        return { accessToken, shopName };
    } catch (error) {
        console.error("Error in fetch or file operation:", error);
    }
};