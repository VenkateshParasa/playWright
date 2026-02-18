import { Client } from '@hubspot/api-client';
import { EventEmitter } from 'events';

export interface HubSpotConfig {
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface HubSpotContact {
  id?: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    website?: string;
    lifecyclestage?: string;
    [key: string]: any;
  };
}

export interface HubSpotDeal {
  properties: {
    dealname: string;
    amount?: string;
    dealstage: string;
    pipeline: string;
    closedate?: string;
    [key: string]: any;
  };
}

export interface EmailCampaign {
  name: string;
  subject: string;
  fromName: string;
  replyTo: string;
  emailBody: string;
  listIds?: string[];
  workflowIds?: string[];
}

export class HubSpotClient extends EventEmitter {
  private client: Client;
  private config: HubSpotConfig;

  constructor(config: HubSpotConfig) {
    super();
    this.config = config;

    if (config.accessToken) {
      this.client = new Client({ accessToken: config.accessToken });
    } else if (config.apiKey) {
      this.client = new Client({ apiKey: config.apiKey });
    } else {
      throw new Error('Either accessToken or apiKey must be provided');
    }
  }

  /**
   * Create or update a contact
   */
  async upsertContact(contact: HubSpotContact): Promise<string> {
    try {
      const email = contact.properties.email;

      // Try to find existing contact
      const searchResponse = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      });

      let contactId: string;

      if (searchResponse.results.length > 0) {
        // Update existing contact
        const existingContact = searchResponse.results[0];
        const updateResponse = await this.client.crm.contacts.basicApi.update(
          existingContact.id,
          { properties: contact.properties }
        );
        contactId = updateResponse.id;
        this.emit('contact_updated', contactId);
      } else {
        // Create new contact
        const createResponse = await this.client.crm.contacts.basicApi.create({
          properties: contact.properties,
        });
        contactId = createResponse.id;
        this.emit('contact_created', contactId);
      }

      return contactId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to upsert HubSpot contact: ${error.message}`);
    }
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      const response = await this.client.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
      });

      if (response.results.length > 0) {
        const contact = response.results[0];
        return {
          id: contact.id,
          properties: contact.properties as any,
        };
      }

      return null;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create a deal
   */
  async createDeal(deal: HubSpotDeal, contactId?: string): Promise<string> {
    try {
      const createResponse = await this.client.crm.deals.basicApi.create({
        properties: deal.properties,
        associations: contactId
          ? [
              {
                to: { id: contactId },
                types: [
                  {
                    associationCategory: 'HUBSPOT_DEFINED',
                    associationTypeId: 3, // Deal to Contact association
                  },
                ],
              },
            ]
          : undefined,
      });

      this.emit('deal_created', createResponse.id);
      return createResponse.id;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create HubSpot deal: ${error.message}`);
    }
  }

  /**
   * Add contact to list
   */
  async addContactToList(contactId: string, listId: string): Promise<void> {
    try {
      await this.client.apiRequest({
        method: 'PUT',
        path: `/contacts/v1/lists/${listId}/add`,
        body: {
          vids: [contactId],
        },
      });

      this.emit('contact_added_to_list', { contactId, listId });
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to add contact to list: ${error.message}`);
    }
  }

  /**
   * Create marketing email
   */
  async createMarketingEmail(campaign: EmailCampaign): Promise<string> {
    try {
      const response = await this.client.apiRequest({
        method: 'POST',
        path: '/marketing/v3/emails',
        body: {
          name: campaign.name,
          subject: campaign.subject,
          emailBody: campaign.emailBody,
          fromName: campaign.fromName,
          replyTo: campaign.replyTo,
        },
      });

      const emailId = response.id;
      this.emit('email_created', emailId);
      return emailId;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to create marketing email: ${error.message}`);
    }
  }

  /**
   * Send marketing email
   */
  async sendMarketingEmail(emailId: string): Promise<void> {
    try {
      await this.client.apiRequest({
        method: 'POST',
        path: `/marketing/v3/emails/${emailId}/send`,
      });

      this.emit('email_sent', emailId);
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Failed to send marketing email: ${error.message}`);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(
    email: string,
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    try {
      await this.client.apiRequest({
        method: 'POST',
        path: '/events/v3/send',
        body: {
          email,
          eventName,
          properties: properties || {},
        },
      });

      this.emit('event_tracked', { email, eventName });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get contact activity timeline
   */
  async getContactTimeline(contactId: string): Promise<any[]> {
    try {
      const response = await this.client.apiRequest({
        method: 'GET',
        path: `/engagements/v1/engagements/associated/contact/${contactId}/paged`,
      });

      return response.results || [];
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Bulk create or update contacts
   */
  async bulkUpsertContacts(contacts: HubSpotContact[]): Promise<any> {
    try {
      const response = await this.client.crm.contacts.batchApi.upsert({
        inputs: contacts.map(contact => ({
          id: contact.id,
          properties: contact.properties,
          idProperty: 'email',
        })),
      });

      this.emit('bulk_contacts_upserted', contacts.length);
      return response;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create or update custom property
   */
  async createCustomProperty(
    objectType: string,
    propertyName: string,
    label: string,
    type: string
  ): Promise<void> {
    try {
      await this.client.crm.properties.coreApi.create(objectType, {
        name: propertyName,
        label,
        type,
        fieldType: type === 'string' ? 'text' : type,
        groupName: 'courseinfo',
      });

      this.emit('custom_property_created', propertyName);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        // Property already exists, ignore
        return;
      }
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(scopes: string[], state?: string): string {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error('clientId and redirectUri are required for OAuth');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error('clientId, clientSecret, and redirectUri are required for OAuth');
    }

    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token exchange failed');
      }

      // Update client with new access token
      this.client = new Client({ accessToken: data.access_token });
      this.emit('authenticated', data);

      return data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('clientId and clientSecret are required for token refresh');
    }

    try {
      const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Update client with new access token
      this.client = new Client({ accessToken: data.access_token });
      this.emit('token_refreshed', data);

      return data;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

export default HubSpotClient;
