import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

export interface RazorpayCustomer {
  id?: string;
  name: string;
  email: string;
  contact: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpaySubscription {
  planId: string;
  customerId: string;
  totalCount: number;
  quantity?: number;
  startAt?: number;
  notes?: Record<string, string>;
}

export class RazorpayClient extends EventEmitter {
  private config: RazorpayConfig;
  private apiClient: AxiosInstance;

  constructor(config: RazorpayConfig) {
    super();
    this.config = config;

    this.apiClient = axios.create({
      baseURL: 'https://api.razorpay.com/v1',
      auth: {
        username: config.keyId,
        password: config.keySecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create customer
   */
  async createCustomer(customer: RazorpayCustomer): Promise<string> {
    try {
      const response = await this.apiClient.post('/customers', customer);
      const customerId = response.data.id;

      this.emit('customer_created', customerId);
      return customerId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create Razorpay customer: ${error.message}`);
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/customers/${customerId}`);
      return response.data;
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
    updates: Partial<RazorpayCustomer>
  ): Promise<void> {
    try {
      await this.apiClient.patch(`/customers/${customerId}`, updates);
      this.emit('customer_updated', customerId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create order
   */
  async createOrder(order: RazorpayOrder): Promise<string> {
    try {
      const response = await this.apiClient.post('/orders', {
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      });

      const orderId = response.data.id;
      this.emit('order_created', orderId);
      return orderId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Get order
   */
  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get payment
   */
  async getPayment(paymentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Capture payment
   */
  async capturePayment(paymentId: string, amount: number, currency: string): Promise<void> {
    try {
      await this.apiClient.post(`/payments/${paymentId}/capture`, {
        amount,
        currency,
      });

      this.emit('payment_captured', paymentId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentId: string, amount?: number): Promise<string> {
    try {
      const response = await this.apiClient.post('/refunds', {
        payment_id: paymentId,
        amount,
      });

      const refundId = response.data.id;
      this.emit('refund_created', refundId);
      return refundId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create plan
   */
  async createPlan(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: number,
    amount: number,
    currency: string,
    description?: string
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/plans', {
        period,
        interval,
        item: {
          name: description || 'Subscription Plan',
          amount,
          currency,
        },
      });

      const planId = response.data.id;
      this.emit('plan_created', planId);
      return planId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: RazorpaySubscription): Promise<string> {
    try {
      const response = await this.apiClient.post('/subscriptions', {
        plan_id: subscription.planId,
        customer_id: subscription.customerId,
        total_count: subscription.totalCount,
        quantity: subscription.quantity || 1,
        start_at: subscription.startAt,
        notes: subscription.notes,
      });

      const subscriptionId = response.data.id;
      this.emit('subscription_created', subscriptionId);
      return subscriptionId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
      this.emit('subscription_cancelled', subscriptionId);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Create payment link
   */
  async createPaymentLink(
    amount: number,
    currency: string,
    description: string,
    customerId?: string
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/payment_links', {
        amount,
        currency,
        description,
        customer_id: customerId,
      });

      const linkUrl = response.data.short_url;
      this.emit('payment_link_created', response.data.id);
      return linkUrl;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(
    customerId: string,
    amount: number,
    currency: string,
    description: string,
    dueDate?: number
  ): Promise<string> {
    try {
      const response = await this.apiClient.post('/invoices', {
        customer_id: customerId,
        type: 'invoice',
        amount,
        currency,
        description,
        ...(dueDate && { expire_by: dueDate }),
      });

      const invoiceId = response.data.id;
      this.emit('invoice_created', invoiceId);
      return invoiceId;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

export default RazorpayClient;
