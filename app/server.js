const { createRequestHandler } = require('@remix-run/express');
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
require('dotenv').config();

const app = express();
const shopify = new Shopify.Clients.Rest({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  appUrl: process.env.SHOPIFY_APP_URL,
});

app.use(express.static('public'));
app.use(express.json());
app.all('*', createRequestHandler({
  getLoadContext() {
    return { shopify };
  },
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
