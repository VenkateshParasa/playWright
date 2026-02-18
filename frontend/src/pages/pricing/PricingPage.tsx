import React, { useState, useEffect } from 'react';
import './PricingPage.css';

interface PricingTier {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: {
    name: string;
    enabled: boolean;
    limit?: number;
  }[];
  isPopular?: boolean;
  trialDays?: number;
}

export const PricingPage: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingTiers();
  }, []);

  const fetchPricingTiers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTiers: PricingTier[] = [
        {
          id: 'free',
          name: 'free',
          displayName: 'Free',
          description: 'Perfect for getting started',
          price: 0,
          billingPeriod: 'monthly',
          features: [
            { name: 'Access to free courses', enabled: true },
            { name: 'Basic course content', enabled: true },
            { name: 'Community support', enabled: true },
            { name: 'Course certificates', enabled: false },
            { name: 'Live classes', enabled: false },
            { name: 'Download resources', enabled: false }
          ]
        },
        {
          id: 'basic',
          name: 'basic',
          displayName: 'Basic',
          description: 'Great for individual learners',
          price: billingPeriod === 'monthly' ? 29 : 290,
          billingPeriod,
          trialDays: 7,
          features: [
            { name: 'Access to all courses', enabled: true },
            { name: 'Course certificates', enabled: true },
            { name: 'Download resources', enabled: true },
            { name: 'Email support', enabled: true },
            { name: 'Live classes', enabled: false, limit: 0 },
            { name: 'Priority support', enabled: false }
          ]
        },
        {
          id: 'pro',
          name: 'pro',
          displayName: 'Pro',
          description: 'Best for professionals',
          price: billingPeriod === 'monthly' ? 79 : 790,
          billingPeriod,
          isPopular: true,
          trialDays: 14,
          features: [
            { name: 'Everything in Basic', enabled: true },
            { name: 'Live classes', enabled: true, limit: 10 },
            { name: 'Priority support', enabled: true },
            { name: '1-on-1 mentoring sessions', enabled: true, limit: 2 },
            { name: 'Advanced analytics', enabled: true },
            { name: 'Custom learning path', enabled: true }
          ]
        },
        {
          id: 'enterprise',
          name: 'enterprise',
          displayName: 'Enterprise',
          description: 'For teams and organizations',
          price: billingPeriod === 'monthly' ? 299 : 2990,
          billingPeriod,
          trialDays: 30,
          features: [
            { name: 'Everything in Pro', enabled: true },
            { name: 'Unlimited live classes', enabled: true, limit: -1 },
            { name: 'Dedicated account manager', enabled: true },
            { name: 'Custom integrations', enabled: true },
            { name: 'Team management', enabled: true },
            { name: 'Advanced reporting', enabled: true },
            { name: 'SLA guarantee', enabled: true }
          ]
        }
      ];

      setTiers(mockTiers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    try {
      // Create checkout session
      const response = await fetch('/api/monetization/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: tierId,
          billingPeriod
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free';
    return `$${price}/${period === 'monthly' ? 'mo' : 'yr'}`;
  };

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="loading">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your learning journey</p>

        <div className="billing-toggle">
          <button
            className={billingPeriod === 'monthly' ? 'active' : ''}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={billingPeriod === 'yearly' ? 'active' : ''}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            <span className="save-badge">Save 17%</span>
          </button>
        </div>
      </div>

      <div className="pricing-tiers">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`pricing-card ${tier.isPopular ? 'popular' : ''}`}
          >
            {tier.isPopular && <div className="popular-badge">Most Popular</div>}

            <div className="tier-header">
              <h2>{tier.displayName}</h2>
              <p className="tier-description">{tier.description}</p>
              <div className="tier-price">
                <span className="price">{formatPrice(tier.price, tier.billingPeriod)}</span>
              </div>
              {tier.trialDays && (
                <p className="trial-info">{tier.trialDays}-day free trial</p>
              )}
            </div>

            <div className="tier-features">
              <ul>
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    className={feature.enabled ? 'enabled' : 'disabled'}
                  >
                    <span className="feature-icon">
                      {feature.enabled ? '✓' : '✗'}
                    </span>
                    <span className="feature-text">
                      {feature.name}
                      {feature.limit !== undefined && feature.limit > 0 && (
                        <span className="feature-limit"> ({feature.limit})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="subscribe-button"
              onClick={() => handleSubscribe(tier.id)}
            >
              {tier.price === 0 ? 'Get Started' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3>Can I change my plan later?</h3>
            <p>
              Yes, you can upgrade or downgrade your plan at any time. Changes take
              effect immediately with prorated billing.
            </p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>
              We accept all major credit cards, PayPal, Apple Pay, and Google Pay.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel my subscription?</h3>
            <p>
              Yes, you can cancel anytime. You'll continue to have access until the
              end of your billing period.
            </p>
          </div>
          <div className="faq-item">
            <h3>Do you offer refunds?</h3>
            <p>
              Yes, we offer a 30-day money-back guarantee for all paid plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
