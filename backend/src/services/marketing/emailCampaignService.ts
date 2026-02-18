import { EmailCampaign, IEmailCampaign, IEmailRecipient, IEmailSegment } from '../../models/EmailCampaign';
import { User } from '../../models/User';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

interface SendEmailOptions {
  to: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export class EmailCampaignService {
  /**
   * Create a new email campaign
   */
  async createCampaign(data: {
    tenantId?: mongoose.Types.ObjectId;
    name: string;
    type: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    htmlContent: string;
    userId: mongoose.Types.ObjectId;
  }): Promise<IEmailCampaign> {
    const campaign = new EmailCampaign({
      ...data,
      createdBy: data.userId,
      lastModifiedBy: data.userId,
    });

    return await campaign.save();
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(id: string | mongoose.Types.ObjectId): Promise<IEmailCampaign | null> {
    return await EmailCampaign.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters: {
    tenantId?: mongoose.Types.ObjectId;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: IEmailCampaign[]; total: number }> {
    const { page = 1, limit = 20, ...queryFilters } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (queryFilters.tenantId) query.tenantId = queryFilters.tenantId;
    if (queryFilters.type) query.type = queryFilters.type;
    if (queryFilters.status) query.status = queryFilters.status;

    const campaigns = await EmailCampaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await EmailCampaign.countDocuments(query);

    return { campaigns, total };
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    id: string | mongoose.Types.ObjectId,
    data: Partial<IEmailCampaign>,
    userId: mongoose.Types.ObjectId
  ): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'sent') {
      throw new Error('Cannot update a sent campaign');
    }

    Object.assign(campaign, data, { lastModifiedBy: userId });
    return await campaign.save();
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) return false;

    if (campaign.status === 'sending') {
      throw new Error('Cannot delete a campaign that is currently sending');
    }

    await campaign.deleteOne();
    return true;
  }

  /**
   * Build recipient list based on segments
   */
  async buildRecipientList(
    tenantId: mongoose.Types.ObjectId | undefined,
    segmentType: string,
    segments: IEmailSegment[]
  ): Promise<IEmailRecipient[]> {
    if (segmentType === 'all') {
      const users = await User.find({ tenantId, status: 'active' });
      return users.map(user => ({
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 'pending' as const,
      }));
    }

    // Build query from segments
    const query: any = { tenantId, status: 'active' };

    for (const segment of segments) {
      const { field, operator, value, logic } = segment;

      switch (operator) {
        case 'equals':
          query[field] = value;
          break;
        case 'not_equals':
          query[field] = { $ne: value };
          break;
        case 'contains':
          query[field] = { $regex: value, $options: 'i' };
          break;
        case 'not_contains':
          query[field] = { $not: { $regex: value, $options: 'i' } };
          break;
        case 'greater_than':
          query[field] = { $gt: value };
          break;
        case 'less_than':
          query[field] = { $lt: value };
          break;
        case 'in':
          query[field] = { $in: Array.isArray(value) ? value : [value] };
          break;
        case 'not_in':
          query[field] = { $nin: Array.isArray(value) ? value : [value] };
          break;
      }
    }

    const users = await User.find(query);
    return users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: 'pending' as const,
    }));
  }

  /**
   * Schedule campaign
   */
  async scheduleCampaign(
    id: string | mongoose.Types.ObjectId,
    sendAt: Date
  ): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Build recipient list
    const recipients = await this.buildRecipientList(
      campaign.tenantId,
      campaign.segmentType,
      campaign.segments
    );

    campaign.recipients = recipients;
    campaign.totalRecipients = recipients.length;
    campaign.sendAt = sendAt;
    campaign.status = 'scheduled';

    return await campaign.save();
  }

  /**
   * Send campaign immediately
   */
  async sendCampaignNow(id: string | mongoose.Types.ObjectId): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Build recipient list
    const recipients = await this.buildRecipientList(
      campaign.tenantId,
      campaign.segmentType,
      campaign.segments
    );

    campaign.recipients = recipients;
    campaign.totalRecipients = recipients.length;
    campaign.sendNow = true;
    campaign.status = 'sending';

    await campaign.save();

    // Start sending (this would be handled by a background job in production)
    this.processCampaignSending(campaign._id);

    return campaign;
  }

  /**
   * Process campaign sending (background job)
   */
  private async processCampaignSending(campaignId: mongoose.Types.ObjectId): Promise<void> {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    for (const recipient of campaign.recipients) {
      if (recipient.status === 'pending') {
        try {
          // Personalize content
          let htmlContent = campaign.htmlContent;
          let subject = campaign.subject;

          // Replace personalization tokens
          if (recipient.firstName) {
            htmlContent = htmlContent.replace(/\{\{firstName\}\}/g, recipient.firstName);
            subject = subject.replace(/\{\{firstName\}\}/g, recipient.firstName);
          }
          if (recipient.lastName) {
            htmlContent = htmlContent.replace(/\{\{lastName\}\}/g, recipient.lastName);
            subject = subject.replace(/\{\{lastName\}\}/g, recipient.lastName);
          }
          htmlContent = htmlContent.replace(/\{\{email\}\}/g, recipient.email);

          // Add tracking pixels and links if enabled
          if (campaign.trackOpens) {
            const trackingPixel = `<img src="${process.env.BASE_URL}/api/marketing/campaigns/${campaignId}/track/open/${recipient.email}" width="1" height="1" alt="" />`;
            htmlContent += trackingPixel;
          }

          if (campaign.trackClicks) {
            // Replace links with tracking links
            htmlContent = this.addClickTracking(htmlContent, campaignId.toString(), recipient.email);
          }

          // Send email (integrate with email provider)
          await this.sendEmail({
            to: recipient.email,
            from: campaign.fromEmail,
            fromName: campaign.fromName,
            replyTo: campaign.replyToEmail,
            subject,
            html: htmlContent,
            text: campaign.textContent,
          });

          recipient.status = 'sent';
          recipient.sentAt = new Date();
          campaign.sent += 1;
          campaign.delivered += 1;
        } catch (error) {
          recipient.status = 'failed';
          recipient.failedReason = error instanceof Error ? error.message : 'Unknown error';
          campaign.failed += 1;
        }
      }
    }

    campaign.status = 'sent';
    await campaign.updateAnalytics();
    await campaign.save();
  }

  /**
   * Add click tracking to links
   */
  private addClickTracking(html: string, campaignId: string, email: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return html.replace(
      /href="([^"]+)"/g,
      (match, url) => {
        const trackingUrl = `${baseUrl}/api/marketing/campaigns/${campaignId}/track/click?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`;
        return `href="${trackingUrl}"`;
      }
    );
  }

  /**
   * Send email via provider (placeholder - integrate with SendGrid, etc.)
   */
  private async sendEmail(options: SendEmailOptions): Promise<void> {
    // This would integrate with your email provider (SendGrid, Mailgun, etc.)
    console.log('Sending email:', options);

    // Example: SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: { email: options.from, name: options.fromName },
    //   replyTo: options.replyTo,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
  }

  /**
   * Track email open
   */
  async trackOpen(campaignId: string | mongoose.Types.ObjectId, email: string): Promise<void> {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    await campaign.trackOpen(email);
  }

  /**
   * Track email click
   */
  async trackClick(
    campaignId: string | mongoose.Types.ObjectId,
    email: string,
    url: string
  ): Promise<void> {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    await campaign.trackClick(email, url);
  }

  /**
   * Send test email
   */
  async sendTestEmail(
    campaignId: string | mongoose.Types.ObjectId,
    testEmails: string[]
  ): Promise<void> {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    for (const email of testEmails) {
      await this.sendEmail({
        to: email,
        from: campaign.fromEmail,
        fromName: campaign.fromName,
        replyTo: campaign.replyToEmail,
        subject: `[TEST] ${campaign.subject}`,
        html: campaign.htmlContent,
        text: campaign.textContent,
      });
    }

    campaign.testEmails = testEmails;
    campaign.lastTestSentAt = new Date();
    await campaign.save();
  }

  /**
   * Get campaign analytics
   */
  async getAnalytics(
    campaignId: string | mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let analyticsHistory = campaign.analyticsHistory;

    if (startDate || endDate) {
      analyticsHistory = analyticsHistory.filter((a: any) => {
        const date = new Date(a.date);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      });
    }

    return {
      overall: {
        sent: campaign.sent,
        delivered: campaign.delivered,
        opened: campaign.opened,
        clicked: campaign.clicked,
        bounced: campaign.bounced,
        unsubscribed: campaign.unsubscribed,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        unsubscribeRate: campaign.unsubscribeRate,
        bounceRate: campaign.bounceRate,
        conversionRate: campaign.conversionRate,
        revenue: campaign.revenue,
        conversions: campaign.conversions,
      },
      history: analyticsHistory,
      trackedLinks: campaign.trackedLinks,
      recipientBreakdown: {
        pending: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'pending').length,
        sent: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'sent').length,
        delivered: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'delivered').length,
        opened: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'opened').length,
        clicked: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'clicked').length,
        bounced: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'bounced').length,
        unsubscribed: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'unsubscribed').length,
        failed: campaign.recipients.filter((r: IEmailRecipient) => r.status === 'failed').length,
      },
    };
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(id: string | mongoose.Types.ObjectId): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'sending') {
      throw new Error('Can only pause campaigns that are currently sending');
    }

    campaign.status = 'paused';
    return await campaign.save();
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(id: string | mongoose.Types.ObjectId): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'paused') {
      throw new Error('Can only resume paused campaigns');
    }

    campaign.status = 'sending';
    await campaign.save();

    // Resume sending
    this.processCampaignSending(campaign._id);

    return campaign;
  }

  /**
   * Cancel campaign
   */
  async cancelCampaign(id: string | mongoose.Types.ObjectId): Promise<IEmailCampaign | null> {
    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'sent') {
      throw new Error('Cannot cancel a campaign that has already been sent');
    }

    campaign.status = 'cancelled';
    return await campaign.save();
  }
}

export const emailCampaignService = new EmailCampaignService();
