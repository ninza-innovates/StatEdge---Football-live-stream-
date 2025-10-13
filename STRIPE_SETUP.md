# Stripe Setup Instructions

## Current Issue
The Stripe checkout is failing because placeholder price IDs are being used.

## Steps to Fix

### 1. Create Products in Stripe Dashboard
Go to: https://dashboard.stripe.com/products

Create two products:
- **StatEdge Weekly Plan**
  - Price: Set your weekly price
  - Billing period: Weekly
  - Copy the Price ID (starts with `price_`)

- **StatEdge Monthly Plan**
  - Price: Set your monthly price  
  - Billing period: Monthly
  - Copy the Price ID (starts with `price_`)

### 2. Update the following files with your actual Price IDs:

- `src/components/Pricing.tsx` (lines 18-19)
- `src/components/PricingModal.tsx` (lines 28-30)
- `src/pages/Account.tsx` (line 117)

### 3. Test the checkout flow

Once updated, users should be able to:
- Click "Upgrade to Premium" on the Account page
- Subscribe from the Pricing section
- Subscribe from match insight modals
