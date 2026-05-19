export const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseUrl: 'https://api.paystack.co',
  currency: 'GHS',
  channels: ['mobile_money'],
};
