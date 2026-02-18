import Stripe from 'stripe';
import { EventEmitter } from 'events';

export interface StripeConfig {
  apiKey: string;
  webhookSecret?: string;
  apiVersion?: string;
}

export interface StripeCustomer {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface StripePayment {
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
  receiptEmail?: string;
}

export interface StripeInvoice {
  customerId: string;
  items: Array<{
    priceId: string;
    quantity?: number;
  }>;
  dueDate?: number;
  autoAdvance?: boolean;
}

export class StripeClient extends EventEmitter {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    super();
    this.config = config;

    this.stripe = new Stripe(config.apiKey, {
      apiVersion: (config.apiVersion as any) || '2023-10-16',
    });
  }

  /**
   * Create customer
   */
  async createCustomer(customer: StripeCustomer): Promise<string> {
    try {
      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        metadata: customer.metadata,
      });

      this.emit('customer_created', stripeCustomer.id);
      return stripeCustomer.id;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    updates: Partial<StripeCustomer>
  ): Promise<void> {
    try {
      await this.stripe.customers.update(customerId, {
        email: updates.email,
        name: updates.name,
        phone: updates.phone,
        metadata: updates.metadata,
      });

      this.emit('customer_updated', customerId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: StripeSubscription): Promise<string> {
    try {
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: subscription.customerId,
        items: [{ price: subscription.priceId }],
        trial_period_days: subscription.trialPeriodDays,
        metadata: subscription.metadata,
        expand: ['latest_invoice.payment_intent'],
      });

      this.emit('subscription_created', stripeSubscription.id);
      return stripeSubscription.id;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<void> {
    try {
      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      this.emit('subscription_cancelled', subscriptionId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List subscriptions for customer
   */
  async listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
      });

      return subscriptions.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create payment intent
   */
  async createPayment(payment: StripePayment): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: payment.amount,
        currency: payment.currency,
        customer: payment.customerId,
        description: payment.description,
        metadata: payment.metadata,
        receipt_email: payment.receiptEmail,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.emit('payment_created', paymentIntent.id);
      return paymentIntent.id;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Get payment intent
   */
  async getPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create price
   */
  async createPrice(
    productId: string,
    amount: number,
    currency: string,
    recurring?: { interval: 'day' | 'week' | 'month' | 'year' }
  ): Promise<string> {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: amount,
        currency,
        recurring,
      });

      this.emit('price_created', price.id);
      return price.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create product
   */
  async createProduct(name: string, description?: string): Promise<string> {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
      });

      this.emit('product_created', product.id);
      return product.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(invoice: StripeInvoice): Promise<string> {
    try {
      // Create invoice items
      for (const item of invoice.items) {
        await this.stripe.invoiceItems.create({
          customer: invoice.customerId,
          price: item.priceId,
          quantity: item.quantity || 1,
        });
      }

      // Create invoice
      const stripeInvoice = await this.stripe.invoices.create({
        customer: invoice.customerId,
        due_date: invoice.dueDate,
        auto_advance: invoice.autoAdvance !== false,
      });

      this.emit('invoice_created', stripeInvoice.id);
      return stripeInvoice.id;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Finalize invoice
   */
  async finalizeInvoice(invoiceId: string): Promise<void> {
    try {
      await this.stripe.invoices.finalizeInvoice(invoiceId);
      this.emit('invoice_finalized', invoiceId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Send invoice
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    try {
      await this.stripe.invoices.sendInvoice(invoiceId);
      this.emit('invoice_sent', invoiceId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      return await this.stripe.invoices.retrieve(invoiceId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * List invoices for customer
   */
  async listCustomerInvoices(customerId: string): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
      });

      return invoices.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(
    customerId: string,
    priceIds: string[],
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        line_items: priceIds.map(priceId => ({
          price: priceId,
          quantity: 1,
        })),
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      this.emit('checkout_session_created', session.id);
      return session.url!;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<string> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });

      this.emit('refund_created', refund.id);
      return refund.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get balance
   */
  async getBalance(): Promise<Stripe.Balance> {
    try {
      return await this.stripe.balance.retrieve();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create payment method
   */
  async createPaymentMethod(
    type: 'card',
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    }
  ): Promise<string> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type,
        card,
      });

      this.emit('payment_method_created', paymentMethod.id);
      return paymentMethod.id;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      this.emit('payment_method_attached', { paymentMethodId, customerId });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

export default StripeClient;
