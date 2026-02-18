import React, { useState, useEffect } from 'react';
import './CheckoutFlow.css';

interface CheckoutSummary {
  itemName: string;
  itemType: 'course' | 'bundle';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  coupon?: {
    code: string;
    type: string;
    value: number;
    discountAmount: number;
  };
}

export const CheckoutFlow: React.FC = () => {
  const [step, setStep] = useState<'summary' | 'payment' | 'success'>('summary');
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCheckoutSummary();
  }, []);

  const fetchCheckoutSummary = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      const bundleId = params.get('bundleId');

      const response = await fetch(
        `/api/monetization/checkout/summary?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching checkout summary:', error);
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponError('');
    setProcessing(true);

    try {
      const params = new URLSearchParams(window.location.search);
      params.set('couponCode', couponCode);

      const response = await fetch(
        `/api/monetization/checkout/summary?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Error applying coupon');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    fetchCheckoutSummary();
  };

  const handleProceedToPayment = async () => {
    setProcessing(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      const bundleId = params.get('bundleId');

      const response = await fetch('/api/monetization/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          bundleId,
          couponCode: summary?.coupon?.code || undefined,
          quantity: summary?.quantity || 1
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-flow">
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="checkout-flow">
        <div className="error">Unable to load checkout information</div>
      </div>
    );
  }

  return (
    <div className="checkout-flow">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step === 'summary' ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Review</span>
            </div>
            <div className={`step ${step === 'payment' ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step ${step === 'success' ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Complete</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="order-item">
                <div className="item-info">
                  <h3>{summary.itemName}</h3>
                  <p className="item-type">
                    {summary.itemType === 'course' ? 'Course' : 'Bundle'}
                  </p>
                </div>
                <div className="item-price">
                  ${summary.unitPrice.toFixed(2)}
                </div>
              </div>

              {summary.quantity > 1 && (
                <div className="quantity-info">
                  Quantity: {summary.quantity} seats
                </div>
              )}

              <div className="coupon-section">
                <h3>Have a coupon code?</h3>
                {!summary.coupon ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={processing}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || processing}
                    >
                      {processing ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <div className="coupon-details">
                      <span className="coupon-code">{summary.coupon.code}</span>
                      <span className="coupon-discount">
                        -${summary.coupon.discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="remove-coupon"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <div className="coupon-error">{couponError}</div>
                )}
              </div>
            </div>

            <div className="payment-methods">
              <h3>Payment Methods</h3>
              <div className="payment-options">
                <div className="payment-option">
                  <img src="/icons/credit-card.svg" alt="Credit Card" />
                  <span>Credit / Debit Card</span>
                </div>
                <div className="payment-option">
                  <img src="/icons/paypal.svg" alt="PayPal" />
                  <span>PayPal</span>
                </div>
                <div className="payment-option">
                  <img src="/icons/apple-pay.svg" alt="Apple Pay" />
                  <span>Apple Pay</span>
                </div>
                <div className="payment-option">
                  <img src="/icons/google-pay.svg" alt="Google Pay" />
                  <span>Google Pay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="price-breakdown">
              <h3>Price Details</h3>

              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>${summary.subtotal.toFixed(2)}</span>
              </div>

              {summary.discount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount</span>
                  <span>-${summary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="breakdown-row">
                <span>Tax</span>
                <span>${summary.tax.toFixed(2)}</span>
              </div>

              <div className="breakdown-divider" />

              <div className="breakdown-row total">
                <span>Total</span>
                <span>${summary.total.toFixed(2)}</span>
              </div>

              <button
                className="checkout-button"
                onClick={handleProceedToPayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <div className="security-badges">
                <img src="/icons/secure.svg" alt="Secure" />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>

            <div className="guarantee">
              <h4>30-Day Money-Back Guarantee</h4>
              <p>
                Not satisfied? Get a full refund within 30 days of purchase, no
                questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
