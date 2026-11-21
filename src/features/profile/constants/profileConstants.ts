/**
 * Verified credit plans matching PitchMint Backend CREDIT_PLANS.
 */
export const DEMO_PLANS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 25,
    price: 99,
    description: '25 idea validations',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 100,
    price: 499,
    description: '100 idea validations + priority AI',
  },
  {
    id: 'premium',
    name: 'Founder Pack',
    credits: 500,
    price: 999,
    description: '500 idea validations + full export',
  },
];

/**
 * Authoritative public URLs matching the live PitchMint web application.
 */
export const LEGAL_URLS = {
  privacyPolicy: 'https://pitch-mint-frontend.vercel.app/privacy',
  termsOfService: 'https://pitch-mint-frontend.vercel.app/terms',
  refundPolicy: 'https://pitch-mint-frontend.vercel.app/refund',
  shippingPolicy: 'https://pitch-mint-frontend.vercel.app/shipping',
  helpCenter: 'https://pitch-mint-frontend.vercel.app/help',
  contactUs: 'https://pitch-mint-frontend.vercel.app/contact',
  aboutUs: 'https://pitch-mint-frontend.vercel.app/about',
} as const;
