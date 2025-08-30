# @dct/stripe-checkout

A comprehensive Stripe checkout block with graceful fallbacks, tier-based features, and robust error handling.

## Features

- 🚀 **Secure Stripe Integration** - Full Stripe Checkout API support
- 🛡️ **Graceful Fallbacks** - Manual and redirect payment options when Stripe is unavailable
- 🎯 **Tier-Based Gating** - Features automatically enabled/disabled based on app tier
- 📱 **React Components** - Pre-built UI components with TypeScript support
- 🔒 **Server Actions** - Secure server-side payment processing
- ✅ **Contract Tests** - Comprehensive test suite with Stripe API mocking
- 📊 **Comprehensive Logging** - Detailed monitoring and error tracking
- 🔄 **Webhook Support** - Complete webhook event handling

## Installation

```bash
npm install @dct/stripe-checkout
```

## Peer Dependencies

```bash
npm install react react-dom stripe zod
```

## Quick Start

### 1. Configure Stripe

Set up your environment variables:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
APP_TIER=pro  # starter | pro | advanced
```

### 2. Wrap Your App

```tsx
import { StripeProvider } from '@dct/stripe-checkout';

const stripeConfig = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  enabled: true,
  tier: process.env.APP_TIER as 'starter' | 'pro' | 'advanced',
  fallbackMode: 'manual', // 'disabled' | 'manual' | 'redirect'
  successUrl: '/success',
  cancelUrl: '/cancel',
};

export default function App({ children }) {
  return (
    <StripeProvider config={stripeConfig}>
      {children}
    </StripeProvider>
  );
}
```

### 3. Add Payment Button

```tsx
import { SimplePaymentButton } from '@dct/stripe-checkout';

export function PricingCard() {
  return (
    <div className="pricing-card">
      <h3>Pro Plan</h3>
      <p>$29.99/month</p>
      
      <SimplePaymentButton
        priceId="price_1234567890"
        customerEmail="customer@example.com"
        onSuccess={(sessionId) => {
          console.log('Payment successful:', sessionId);
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
        }}
        onFallback={(fallbackData) => {
          // Handle manual payment flow
          console.log('Fallback payment:', fallbackData);
        }}
      >
        Subscribe Now
      </SimplePaymentButton>
    </div>
  );
}
```

## Components

### StripeProvider

Context provider that manages Stripe configuration and availability.

```tsx
interface StripeProviderProps {
  config: StripeCheckoutConfig;
  children: React.ReactNode;
}
```

### SimplePaymentButton

Quick payment button for single-item purchases.

```tsx
interface SimplePaymentButtonProps {
  priceId: string;
  customerEmail?: string;
  amount?: number;
  currency?: string;
  description?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  onFallback?: (fallbackData: FallbackCheckoutResult) => void;
  children?: React.ReactNode;
}
```

### StripePaymentButton

Advanced payment button with full customization.

```tsx
interface StripePaymentButtonProps {
  checkoutData: StripeCheckoutData;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  onFallback?: (fallbackData: FallbackCheckoutResult) => void;
}
```

### StripeCheckoutForm

Complete form with all Stripe Checkout options.

```tsx
interface StripeCheckoutFormProps {
  initialData?: Partial<StripeCheckoutData>;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  onFallback?: (fallbackData: FallbackCheckoutResult) => void;
  className?: string;
  submitText?: string;
  showAdvancedOptions?: boolean;
}
```

## Server Actions

### createStripeCheckout

Create a checkout session with automatic fallback handling.

```tsx
import { createStripeCheckout } from '@dct/stripe-checkout';

const result = await createStripeCheckout({
  lineItems: [
    { price: 'price_1234567890', quantity: 1 }
  ],
  customerEmail: 'customer@example.com',
  metadata: { orderId: '12345' },
}, stripeConfig);

if (result.success) {
  if (result.fallback) {
    // Handle fallback payment
    const fallbackData = result.data as FallbackCheckoutResult;
  } else {
    // Redirect to Stripe Checkout
    const session = result.data as CheckoutSession;
    window.location.href = session.url;
  }
}
```

### getCheckoutSession

Retrieve session details by ID.

```tsx
import { getCheckoutSession } from '@dct/stripe-checkout';

const result = await getCheckoutSession('cs_test_123', stripeConfig);
if (result.success) {
  console.log('Session:', result.data);
}
```

### handleStripeWebhook

Process Stripe webhook events.

```tsx
// app/api/webhooks/stripe/route.ts
import { handleStripeWebhook } from '@dct/stripe-checkout';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  const result = await handleStripeWebhook(body, signature, stripeConfig);
  
  return Response.json(result);
}
```

## Tier-Based Features

### Starter Tier
- Basic checkout functionality
- Simple payment processing
- Limited customization options

### Pro Tier
- Promotion codes support
- Automatic tax calculation (if enabled)
- Customer portal access
- Enhanced metadata
- Subscription support

### Advanced Tier
- All Pro features
- Advanced metadata support
- Multiple payment methods
- Custom integrations
- Priority support

## Fallback Modes

### Manual Fallback
When Stripe is unavailable, generates payment instructions with:
- Unique reference number
- Multiple payment methods (bank transfer, check, etc.)
- Clear instructions for customers
- Contact information for support

### Redirect Fallback
Redirects to an external payment processor with:
- Payment amount and details
- Customer information
- Return URLs
- Metadata preservation

### Disabled Fallback
Completely disables payment processing when Stripe is unavailable.

## Configuration Validation

The package includes comprehensive configuration validation:

```tsx
import { validateStripeConfig } from '@dct/stripe-checkout';

const validation = validateStripeConfig({
  publicKey: 'pk_test_123',
  secretKey: 'sk_test_123',
  webhookSecret: 'whsec_123',
  // ... other config
});

console.log({
  valid: validation.valid,
  errors: validation.errors,
  warnings: validation.warnings,
  fallbackMode: validation.fallbackMode,
});
```

## Error Handling

The package provides structured error handling:

```tsx
interface StripeError {
  type: 'validation' | 'network' | 'authentication' | 'rate_limit' | 'api_error' | 'unknown';
  message: string;
  code?: string;
  requestId?: string;
  statusCode?: number;
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

The package includes comprehensive contract tests that mock the Stripe API and test all functionality without requiring real Stripe credentials.

## Type Safety

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  StripeCheckoutConfig,
  StripeCheckoutData,
  CheckoutSession,
  StripeError,
  FallbackCheckoutResult,
} from '@dct/stripe-checkout';
```

## Security Considerations

- Never expose secret keys to the client
- Always validate webhook signatures
- Use HTTPS in production
- Implement proper CORS policies
- Log security events appropriately
- Rotate keys regularly

## Environment Variables

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `STRIPE_SECRET_KEY` | Server | Yes | Stripe secret key (sk_test_ or sk_live_) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Yes | Stripe publishable key (pk_test_ or pk_live_) |
| `STRIPE_WEBHOOK_SECRET` | Server | No | Webhook endpoint secret (whsec_) |
| `APP_TIER` | Both | No | Application tier (starter/pro/advanced) |
| `BUSINESS_EMAIL` | Server | No | Business contact email for fallback |
| `BUSINESS_PHONE` | Server | No | Business contact phone for fallback |
| `FALLBACK_PAYMENT_URL` | Server | No | External payment processor URL |

## Examples

### Basic Subscription Button

```tsx
import { SimplePaymentButton } from '@dct/stripe-checkout';

<SimplePaymentButton
  priceId="price_monthly_subscription"
  customerEmail={user.email}
  onSuccess={(sessionId) => {
    // Redirect to success page
    router.push(`/success?session_id=${sessionId}`);
  }}
  onError={(error) => {
    toast.error(`Payment failed: ${error}`);
  }}
  onFallback={(fallback) => {
    if (fallback.type === 'manual') {
      // Show manual payment instructions
      setShowManualPayment(fallback);
    } else {
      // Redirect to external processor
      window.location.href = fallback.url;
    }
  }}
>
  Subscribe ($29.99/month)
</SimplePaymentButton>
```

### Custom Checkout Form

```tsx
import { StripeCheckoutForm } from '@dct/stripe-checkout';

<StripeCheckoutForm
  initialData={{
    lineItems: [
      { price: 'price_product_1', quantity: 1 },
      { price: 'price_product_2', quantity: 2 },
    ],
    customerEmail: user.email,
    collectBillingAddress: true,
    allowPromotionCodes: true,
  }}
  showAdvancedOptions={true}
  submitText="Complete Purchase"
  onSuccess={(sessionId) => {
    // Handle success
  }}
  onError={(error) => {
    // Handle error
  }}
  onFallback={(fallback) => {
    // Handle fallback
  }}
/>
```

### Webhook Handler

```tsx
// app/api/webhooks/stripe/route.ts
import { handleStripeWebhook } from '@dct/stripe-checkout';
import { stripeConfig } from '@/lib/stripe-config';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }
    
    const result = await handleStripeWebhook(body, signature, stripeConfig);
    
    return Response.json({
      received: true,
      processed: result.processed,
      eventType: result.eventType,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

## License

MIT

## Support

For support, please check the following resources:
- [Documentation](./docs/)
- [Examples](./examples/)
- [Issue Tracker](https://github.com/your-org/your-repo/issues)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.