import { EventEmitter } from 'events';
import * as AdmZip from 'adm-zip';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';

export interface SCORMPackage {
  id: string;
  version: '1.2' | '2004';
  title: string;
  description?: string;
  manifest: any;
  resources: SCORMResource[];
  organizations: SCORMOrganization[];
  metadata?: any;
  uploadedAt: Date;
  userId: string;
}

export interface SCORMResource {
  identifier: string;
  type: string;
  href?: string;
  scormType?: string;
  files: string[];
}

export interface SCORMOrganization {
  identifier: string;
  title: string;
  items: SCORMItem[];
}

export interface SCORMItem {
  identifier: string;
  title: string;
  identifierref?: string;
  parameters?: string;
  children?: SCORMItem[];
}

export interface SCORMSession {
  sessionId: string;
  userId: string;
  packageId: string;
  itemId: string;
  startTime: Date;
  lastAccessTime: Date;
  data: SCORMData;
  version: '1.2' | '2004';
}

export interface SCORMData {
  // SCORM 1.2 / 2004 Common Data Model
  'cmi.core.student_id'?: string;
  'cmi.core.student_name'?: string;
  'cmi.core.lesson_location'?: string;
  'cmi.core.credit'?: string;
  'cmi.core.lesson_status'?: 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted';
  'cmi.core.entry'?: string;
  'cmi.core.score.raw'?: number;
  'cmi.core.score.max'?: number;
  'cmi.core.score.min'?: number;
  'cmi.core.total_time'?: string;
  'cmi.core.lesson_mode'?: string;
  'cmi.core.exit'?: string;
  'cmi.core.session_time'?: string;
  'cmi.suspend_data'?: string;
  'cmi.launch_data'?: string;
  'cmi.comments'?: string;
  'cmi.comments_from_lms'?: string;
  [key: string]: any;
}

export class SCORMEngine extends EventEmitter {
  private packages: Map<string, SCORMPackage> = new Map();
  private sessions: Map<string, SCORMSession> = new Map();
  private uploadDir: string;

  constructor(uploadDir: string = './scorm-content') {
    super();
    this.uploadDir = uploadDir;
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Import a SCORM package from a ZIP file
   */
  async importPackage(zipBuffer: Buffer, userId: string): Promise<SCORMPackage> {
    try {
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();

      // Find imsmanifest.xml
      const manifestEntry = zipEntries.find(
        entry => entry.entryName.toLowerCase().endsWith('imsmanifest.xml')
      );

      if (!manifestEntry) {
        throw new Error('Invalid SCORM package: imsmanifest.xml not found');
      }

      // Parse manifest
      const manifestXml = manifestEntry.getData().toString('utf8');
      const parser = new xml2js.Parser({ explicitArray: false });
      const manifest = await parser.parseStringPromise(manifestXml);

      // Detect SCORM version
      const version = this.detectSCORMVersion(manifest);

      // Extract package metadata
      const metadata = manifest.manifest.metadata || {};
      const organizations = this.parseOrganizations(manifest.manifest.organizations);
      const resources = this.parseResources(manifest.manifest.resources);

      // Generate package ID
      const packageId = `scorm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Extract package to disk
      const packagePath = path.join(this.uploadDir, packageId);
      zip.extractAllTo(packagePath, true);

      const scormPackage: SCORMPackage = {
        id: packageId,
        version,
        title: metadata.title || manifest.manifest.$.identifier || 'Untitled Course',
        description: metadata.description,
        manifest: manifest.manifest,
        resources,
        organizations,
        metadata,
        uploadedAt: new Date(),
        userId
      };

      this.packages.set(packageId, scormPackage);
      this.emit('packageImported', scormPackage);

      return scormPackage;
    } catch (error) {
      this.emit('importError', error);
      throw new Error(`Failed to import SCORM package: ${error.message}`);
    }
  }

  /**
   * Export a SCORM package to a ZIP file
   */
  async exportPackage(packageId: string): Promise<Buffer> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error('Package not found');
    }

    const packagePath = path.join(this.uploadDir, packageId);
    if (!fs.existsSync(packagePath)) {
      throw new Error('Package files not found');
    }

    const zip = new AdmZip();
    zip.addLocalFolder(packagePath);

    return zip.toBuffer();
  }

  /**
   * Initialize a SCORM session
   */
  async initializeSession(
    userId: string,
    packageId: string,
    itemId: string
  ): Promise<SCORMSession> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error('Package not found');
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: SCORMSession = {
      sessionId,
      userId,
      packageId,
      itemId,
      startTime: new Date(),
      lastAccessTime: new Date(),
      version: pkg.version,
      data: {
        'cmi.core.student_id': userId,
        'cmi.core.lesson_status': 'not attempted',
        'cmi.core.entry': 'ab-initio',
        'cmi.core.score.raw': 0,
        'cmi.core.score.max': 100,
        'cmi.core.score.min': 0,
        'cmi.core.total_time': '0000:00:00.00',
        'cmi.core.lesson_mode': 'normal'
      }
    };

    this.sessions.set(sessionId, session);
    this.emit('sessionInitialized', session);

    return session;
  }

  /**
   * Get a SCORM data value
   */
  getValue(sessionId: string, element: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: '301', errorString: 'Not initialized' };
    }

    session.lastAccessTime = new Date();

    if (!session.data.hasOwnProperty(element)) {
      return { error: '401', errorString: 'Not implemented' };
    }

    return {
      error: '0',
      errorString: 'No error',
      value: session.data[element]
    };
  }

  /**
   * Set a SCORM data value
   */
  setValue(sessionId: string, element: string, value: any): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: '301', errorString: 'Not initialized' };
    }

    session.lastAccessTime = new Date();

    // Validate element name
    if (!this.isValidElement(element, session.version)) {
      return { error: '401', errorString: 'Not implemented' };
    }

    // Type validation
    const validationResult = this.validateValue(element, value, session.version);
    if (validationResult.error !== '0') {
      return validationResult;
    }

    session.data[element] = value;
    this.emit('dataChanged', { sessionId, element, value });

    return { error: '0', errorString: 'No error' };
  }

  /**
   * Commit session data
   */
  commit(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: '301', errorString: 'Not initialized' };
    }

    session.lastAccessTime = new Date();
    this.emit('dataCommitted', session);

    return { error: '0', errorString: 'No error' };
  }

  /**
   * Terminate a SCORM session
   */
  terminate(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: '301', errorString: 'Not initialized' };
    }

    this.emit('sessionTerminated', session);
    this.sessions.delete(sessionId);

    return { error: '0', errorString: 'No error' };
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SCORMSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get package by ID
   */
  getPackage(packageId: string): SCORMPackage | undefined {
    return this.packages.get(packageId);
  }

  /**
   * Get all packages for a user
   */
  getUserPackages(userId: string): SCORMPackage[] {
    return Array.from(this.packages.values()).filter(pkg => pkg.userId === userId);
  }

  /**
   * Delete a package
   */
  async deletePackage(packageId: string): Promise<void> {
    const pkg = this.packages.get(packageId);
    if (!pkg) {
      throw new Error('Package not found');
    }

    const packagePath = path.join(this.uploadDir, packageId);
    if (fs.existsSync(packagePath)) {
      fs.rmSync(packagePath, { recursive: true, force: true });
    }

    this.packages.delete(packageId);
    this.emit('packageDeleted', packageId);
  }

  // Private helper methods

  private detectSCORMVersion(manifest: any): '1.2' | '2004' {
    const metadata = manifest.manifest.metadata;
    if (metadata && metadata.schemaversion) {
      const version = metadata.schemaversion.toLowerCase();
      if (version.includes('2004') || version.includes('1.3')) {
        return '2004';
      }
    }
    return '1.2'; // Default to SCORM 1.2
  }

  private parseOrganizations(orgsNode: any): SCORMOrganization[] {
    if (!orgsNode || !orgsNode.organization) {
      return [];
    }

    const orgs = Array.isArray(orgsNode.organization)
      ? orgsNode.organization
      : [orgsNode.organization];

    return orgs.map(org => ({
      identifier: org.$.identifier,
      title: org.title || org.$.identifier,
      items: this.parseItems(org.item)
    }));
  }

  private parseItems(itemNode: any): SCORMItem[] {
    if (!itemNode) return [];

    const items = Array.isArray(itemNode) ? itemNode : [itemNode];

    return items.map(item => ({
      identifier: item.$.identifier,
      title: item.title || item.$.identifier,
      identifierref: item.$.identifierref,
      parameters: item.$.parameters,
      children: item.item ? this.parseItems(item.item) : []
    }));
  }

  private parseResources(resourcesNode: any): SCORMResource[] {
    if (!resourcesNode || !resourcesNode.resource) {
      return [];
    }

    const resources = Array.isArray(resourcesNode.resource)
      ? resourcesNode.resource
      : [resourcesNode.resource];

    return resources.map(res => {
      const files = res.file
        ? (Array.isArray(res.file) ? res.file : [res.file]).map((f: any) => f.$.href)
        : [];

      return {
        identifier: res.$.identifier,
        type: res.$.type || res.$['adlcp:scormtype'],
        href: res.$.href,
        scormType: res.$['adlcp:scormtype'],
        files
      };
    });
  }

  private isValidElement(element: string, version: '1.2' | '2004'): boolean {
    // Simplified validation - in production, use full SCORM spec
    const commonElements = [
      'cmi.core.student_id',
      'cmi.core.student_name',
      'cmi.core.lesson_location',
      'cmi.core.credit',
      'cmi.core.lesson_status',
      'cmi.core.entry',
      'cmi.core.score.raw',
      'cmi.core.score.max',
      'cmi.core.score.min',
      'cmi.core.total_time',
      'cmi.core.lesson_mode',
      'cmi.core.exit',
      'cmi.core.session_time',
      'cmi.suspend_data',
      'cmi.launch_data',
      'cmi.comments',
      'cmi.comments_from_lms'
    ];

    return commonElements.some(el => element.startsWith(el));
  }

  private validateValue(element: string, value: any, version: '1.2' | '2004'): any {
    // Simplified validation - in production, implement full SCORM data type validation
    if (element.includes('score') && typeof value !== 'number') {
      return { error: '405', errorString: 'Incorrect Data Type' };
    }

    if (element === 'cmi.core.lesson_status') {
      const validStatuses = ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'];
      if (!validStatuses.includes(value)) {
        return { error: '405', errorString: 'Incorrect Data Type' };
      }
    }

    return { error: '0', errorString: 'No error' };
  }
}

export const scormEngine = new SCORMEngine();
