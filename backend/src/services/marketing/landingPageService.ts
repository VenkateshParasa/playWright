import { LandingPage, ILandingPage, ILandingPageVariant } from '../../models/LandingPage';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

export class LandingPageService {
  /**
   * Create a new landing page
   */
  async createLandingPage(data: {
    tenantId?: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    type: string;
    content: string;
    css?: string;
    seo: any;
    userId: mongoose.Types.ObjectId;
  }): Promise<ILandingPage> {
    const existingPage = await LandingPage.findOne({
      slug: data.slug,
      tenantId: data.tenantId,
    });

    if (existingPage) {
      throw new Error('Landing page with this slug already exists');
    }

    const landingPage = new LandingPage({
      ...data,
      createdBy: data.userId,
      lastModifiedBy: data.userId,
    });

    return await landingPage.save();
  }

  /**
   * Get landing page by ID
   */
  async getLandingPageById(id: string | mongoose.Types.ObjectId): Promise<ILandingPage | null> {
    return await LandingPage.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
  }

  /**
   * Get landing page by slug
   */
  async getLandingPageBySlug(slug: string, tenantId?: mongoose.Types.ObjectId): Promise<ILandingPage | null> {
    const query: any = { slug, isPublished: true };
    if (tenantId) query.tenantId = tenantId;

    return await LandingPage.findOne(query);
  }

  /**
   * Get all landing pages
   */
  async getLandingPages(filters: {
    tenantId?: mongoose.Types.ObjectId;
    type?: string;
    status?: string;
    isTemplate?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ pages: ILandingPage[]; total: number }> {
    const { page = 1, limit = 20, ...queryFilters } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (queryFilters.tenantId) query.tenantId = queryFilters.tenantId;
    if (queryFilters.type) query.type = queryFilters.type;
    if (queryFilters.status) query.status = queryFilters.status;
    if (queryFilters.isTemplate !== undefined) query.isTemplate = queryFilters.isTemplate;

    const pages = await LandingPage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    const total = await LandingPage.countDocuments(query);

    return { pages, total };
  }

  /**
   * Update landing page
   */
  async updateLandingPage(
    id: string | mongoose.Types.ObjectId,
    data: Partial<ILandingPage>,
    userId: mongoose.Types.ObjectId
  ): Promise<ILandingPage | null> {
    const landingPage = await LandingPage.findById(id);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    Object.assign(landingPage, data, { lastModifiedBy: userId });
    return await landingPage.save();
  }

  /**
   * Delete landing page
   */
  async deleteLandingPage(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const result = await LandingPage.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Publish landing page
   */
  async publishLandingPage(id: string | mongoose.Types.ObjectId): Promise<ILandingPage | null> {
    const landingPage = await LandingPage.findById(id);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    landingPage.isPublished = true;
    landingPage.publishedAt = new Date();
    landingPage.status = 'published';

    return await landingPage.save();
  }

  /**
   * Unpublish landing page
   */
  async unpublishLandingPage(id: string | mongoose.Types.ObjectId): Promise<ILandingPage | null> {
    const landingPage = await LandingPage.findById(id);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    landingPage.isPublished = false;
    landingPage.status = 'draft';

    return await landingPage.save();
  }

  /**
   * Create A/B test variant
   */
  async createVariant(
    pageId: string | mongoose.Types.ObjectId,
    variant: {
      name: string;
      content: string;
      css?: string;
    }
  ): Promise<ILandingPage | null> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    landingPage.variants.push({
      name: variant.name,
      content: variant.content,
      css: variant.css || '',
      isActive: false,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
    });

    landingPage.enableABTesting = true;

    return await landingPage.save();
  }

  /**
   * Activate variant
   */
  async activateVariant(
    pageId: string | mongoose.Types.ObjectId,
    variantId: string | mongoose.Types.ObjectId
  ): Promise<ILandingPage | null> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    // Deactivate all variants
    landingPage.variants.forEach((v: ILandingPageVariant) => {
      v.isActive = false;
    });

    // Activate selected variant
    const variant = landingPage.variants.find(
      (v: ILandingPageVariant) => v._id?.toString() === variantId.toString()
    );

    if (variant) {
      variant.isActive = true;
      landingPage.activeVariantId = variant._id;
    }

    return await landingPage.save();
  }

  /**
   * Track page view
   */
  async trackPageView(
    pageId: string | mongoose.Types.ObjectId,
    data: {
      ip?: string;
      userAgent?: string;
      referer?: string;
      utmSource?: string;
      utmMedium?: string;
      variantId?: string;
    }
  ): Promise<void> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) return;

    landingPage.impressions += 1;

    // Track unique visitors (simplified - in production use Redis/session)
    landingPage.uniqueVisitors += 1;

    // Update variant impressions if applicable
    if (data.variantId) {
      const variant = landingPage.variants.find(
        (v: ILandingPageVariant) => v._id?.toString() === data.variantId
      );
      if (variant) {
        variant.impressions += 1;
      }
    }

    await landingPage.save();
  }

  /**
   * Track conversion
   */
  async trackConversion(
    pageId: string | mongoose.Types.ObjectId,
    variantId?: string
  ): Promise<void> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) return;

    landingPage.conversions += 1;
    if (landingPage.impressions > 0) {
      landingPage.conversionRate = (landingPage.conversions / landingPage.impressions) * 100;
    }

    // Update variant conversions if applicable
    if (variantId) {
      const variant = landingPage.variants.find(
        (v: ILandingPageVariant) => v._id?.toString() === variantId
      );
      if (variant) {
        variant.conversions += 1;
        if (variant.impressions > 0) {
          variant.conversionRate = (variant.conversions / variant.impressions) * 100;
        }
      }
    }

    await landingPage.save();
  }

  /**
   * Get analytics for landing page
   */
  async getAnalytics(
    pageId: string | mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    let analyticsHistory = landingPage.analyticsHistory;

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
        impressions: landingPage.impressions,
        uniqueVisitors: landingPage.uniqueVisitors,
        conversions: landingPage.conversions,
        conversionRate: landingPage.conversionRate,
      },
      history: analyticsHistory,
      variants: landingPage.variants.map((v: ILandingPageVariant) => ({
        id: v._id,
        name: v.name,
        impressions: v.impressions,
        conversions: v.conversions,
        conversionRate: v.conversionRate,
        isActive: v.isActive,
      })),
    };
  }

  /**
   * Clone landing page as template
   */
  async cloneAsTemplate(
    pageId: string | mongoose.Types.ObjectId,
    templateData: {
      name: string;
      category?: string;
      userId: mongoose.Types.ObjectId;
    }
  ): Promise<ILandingPage> {
    const originalPage = await LandingPage.findById(pageId);
    if (!originalPage) {
      throw new Error('Landing page not found');
    }

    const template = new LandingPage({
      title: templateData.name,
      slug: `template-${nanoid(10)}`,
      type: originalPage.type,
      content: originalPage.content,
      css: originalPage.css,
      seo: originalPage.seo,
      isTemplate: true,
      templateCategory: templateData.category,
      forms: originalPage.forms,
      mobileContent: originalPage.mobileContent,
      mobileCss: originalPage.mobileCss,
      createdBy: templateData.userId,
      lastModifiedBy: templateData.userId,
    });

    return await template.save();
  }

  /**
   * Create page from template
   */
  async createFromTemplate(
    templateId: string | mongoose.Types.ObjectId,
    pageData: {
      title: string;
      slug: string;
      tenantId?: mongoose.Types.ObjectId;
      userId: mongoose.Types.ObjectId;
    }
  ): Promise<ILandingPage> {
    const template = await LandingPage.findById(templateId);
    if (!template || !template.isTemplate) {
      throw new Error('Template not found');
    }

    const page = new LandingPage({
      ...pageData,
      templateId: template._id,
      type: template.type,
      content: template.content,
      css: template.css,
      seo: template.seo,
      forms: template.forms,
      mobileContent: template.mobileContent,
      mobileCss: template.mobileCss,
      createdBy: pageData.userId,
      lastModifiedBy: pageData.userId,
    });

    return await page.save();
  }

  /**
   * Submit form on landing page
   */
  async submitForm(
    pageId: string | mongoose.Types.ObjectId,
    formId: string | mongoose.Types.ObjectId,
    data: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    const landingPage = await LandingPage.findById(pageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    const form = landingPage.forms.find((f: any) => f._id?.toString() === formId.toString());
    if (!form) {
      throw new Error('Form not found');
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !data[field.name]) {
        throw new Error(`Field "${field.label}" is required`);
      }
    }

    // Here you would typically:
    // 1. Save form submission to database
    // 2. Send email notification if configured
    // 3. Trigger webhook if configured
    // 4. Add to email list if configured
    // 5. Sync to CRM if configured

    // Track conversion
    await this.trackConversion(pageId);

    return {
      success: true,
      message: form.successMessage || 'Thank you for your submission!',
    };
  }
}

export const landingPageService = new LandingPageService();
