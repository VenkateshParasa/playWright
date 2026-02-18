import { Certificate, ICertificate, ICertificateTemplate } from '../../models/Certificate';
import mongoose from 'mongoose';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface CertificateData {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  achievementId?: mongoose.Types.ObjectId;
  certificateType: ICertificate['certificateType'];
  recipientName: string;
  recipientEmail: string;
  courseName?: string;
  instructorName?: string;
  instructorTitle?: string;
  grade?: number;
  score?: number;
  creditsEarned?: number;
  skillsAcquired?: string[];
  completionCriteria?: string;
  duration?: string;
  expiryDate?: Date;
}

export interface OpenBadgeAssertion {
  '@context': string;
  type: string;
  id: string;
  recipient: {
    type: string;
    identity: string;
    hashed: boolean;
  };
  badge: string;
  verification: {
    type: string;
  };
  issuedOn: string;
  expires?: string;
}

/**
 * Certificate Generator Service
 * Generates digital certificates with:
 * - PDF generation
 * - QR code verification
 * - Digital signatures
 * - Blockchain integration (optional)
 * - Open Badges support
 */
export class CertificateGenerator {
  private templatesDir: string;
  private outputDir: string;
  private verificationBaseUrl: string;
  private privateKey: string;

  constructor(
    templatesDir: string = './certificate-templates',
    outputDir: string = './certificates',
    verificationBaseUrl: string = process.env.APP_URL || 'http://localhost:3000'
  ) {
    this.templatesDir = templatesDir;
    this.outputDir = outputDir;
    this.verificationBaseUrl = verificationBaseUrl;
    this.privateKey = this.loadOrGeneratePrivateKey();
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.templatesDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private loadOrGeneratePrivateKey(): string {
    const keyPath = path.join(this.templatesDir, 'certificate-signing-key.pem');

    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    }

    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    fs.writeFileSync(keyPath, privateKey);
    return privateKey;
  }

  /**
   * Generate a certificate
   */
  async generateCertificate(
    data: CertificateData,
    template?: ICertificateTemplate
  ): Promise<ICertificate> {
    // Use default template if none provided
    const certTemplate = template || this.getDefaultTemplate();

    // Generate unique certificate ID
    const certificateId = this.generateCertificateId();

    // Generate verification URL and QR code
    const verificationUrl = `${this.verificationBaseUrl}/verify/${certificateId}`;
    const qrCode = await this.generateQRCode(verificationUrl);

    // Create certificate document
    const certificate = new Certificate({
      userId: data.userId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      achievementId: data.achievementId,
      certificateType: data.certificateType,
      certificateId,
      title: this.generateTitle(data),
      description: this.generateDescription(data),
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      issueDate: new Date(),
      expiryDate: data.expiryDate,
      status: 'issued',
      template: certTemplate,
      metadata: {
        courseName: data.courseName,
        instructorName: data.instructorName,
        instructorTitle: data.instructorTitle,
        grade: data.grade,
        score: data.score,
        creditsEarned: data.creditsEarned,
        skillsAcquired: data.skillsAcquired,
        completionCriteria: data.completionCriteria,
        duration: data.duration
      },
      verification: {
        verificationUrl,
        qrCode,
        signature: this.generateSignature(certificateId)
      },
      share: {
        public: false,
        linkedIn: false,
        twitter: false,
        facebook: false
      }
    });

    // Generate PDF
    const pdfBuffer = await this.generatePDF(certificate);
    const pdfPath = path.join(this.outputDir, `${certificateId}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    certificate.pdf = {
      url: `/certificates/${certificateId}.pdf`,
      s3Key: certificateId, // In production, upload to S3
      generatedAt: new Date()
    };

    // Save certificate
    await certificate.save();

    return certificate;
  }

  /**
   * Generate certificate with blockchain
   */
  async generateBlockchainCertificate(
    data: CertificateData,
    network: string = 'polygon',
    template?: ICertificateTemplate
  ): Promise<ICertificate> {
    const certificate = await this.generateCertificate(data, template);

    // In production, integrate with actual blockchain
    const transactionHash = this.mockBlockchainTransaction();

    certificate.blockchain = {
      enabled: true,
      transactionHash,
      network,
      contractAddress: process.env.CERTIFICATE_CONTRACT_ADDRESS || '0x...',
      tokenId: certificate.certificateId
    };

    await certificate.save();

    return certificate;
  }

  /**
   * Generate Open Badge
   */
  async generateOpenBadge(
    data: CertificateData,
    badgeClass: string,
    template?: ICertificateTemplate
  ): Promise<ICertificate> {
    const certificate = await this.generateCertificate(data, template);

    const badgeId = `${this.verificationBaseUrl}/badges/${certificate.certificateId}`;
    const assertion = this.createOpenBadgeAssertion(
      certificate,
      badgeClass
    );

    certificate.openBadge = {
      enabled: true,
      badgeId,
      badgeUrl: `${badgeId}/assertion.json`,
      assertion
    };

    await certificate.save();

    return certificate;
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(
    certificateId: string,
    reason?: string
  ): Promise<ICertificate | null> {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return null;
    }

    certificate.status = 'revoked';
    certificate.metadata.revocationReason = reason;
    certificate.metadata.revokedAt = new Date();

    await certificate.save();

    return certificate;
  }

  /**
   * Verify a certificate
   */
  async verifyCertificate(certificateId: string): Promise<{
    valid: boolean;
    certificate?: ICertificate;
    message: string;
  }> {
    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return { valid: false, message: 'Certificate not found' };
    }

    if (certificate.status === 'revoked') {
      return {
        valid: false,
        certificate,
        message: 'Certificate has been revoked'
      };
    }

    if (certificate.isExpired()) {
      return {
        valid: false,
        certificate,
        message: 'Certificate has expired'
      };
    }

    // Verify signature
    const signatureValid = this.verifySignature(
      certificateId,
      certificate.verification.signature || ''
    );

    if (!signatureValid) {
      return {
        valid: false,
        certificate,
        message: 'Invalid certificate signature'
      };
    }

    return {
      valid: true,
      certificate,
      message: 'Certificate is valid'
    };
  }

  /**
   * Generate PDF certificate
   */
  private async generatePDF(certificate: ICertificate): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: certificate.template.design.layout === 'portrait' ? 'A4' : [842, 595],
          margin: 50
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Background color
        doc.rect(0, 0, doc.page.width, doc.page.height)
          .fill(certificate.template.design.colors.primary);

        // Border
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
          .stroke(certificate.template.design.colors.secondary);

        // Logo
        if (certificate.template.design.logo) {
          // In production, load actual logo
          // doc.image(certificate.template.design.logo, 50, 50, { width: 100 });
        }

        // Title
        doc.fontSize(36)
          .fillColor(certificate.template.design.colors.text)
          .font('Helvetica-Bold')
          .text('Certificate of Completion', 50, 120, { align: 'center' });

        // Decorative line
        doc.moveTo(200, 180)
          .lineTo(doc.page.width - 200, 180)
          .stroke(certificate.template.design.colors.secondary);

        // Recipient name
        doc.fontSize(28)
          .font('Helvetica-Bold')
          .text(certificate.recipientName, 50, 220, { align: 'center' });

        // Achievement text
        doc.fontSize(16)
          .font('Helvetica')
          .text('has successfully completed', 50, 270, { align: 'center' });

        // Course name
        if (certificate.metadata.courseName) {
          doc.fontSize(22)
            .font('Helvetica-Bold')
            .text(certificate.metadata.courseName, 50, 310, { align: 'center' });
        }

        // Additional details
        let yPos = 370;

        if (certificate.metadata.score !== undefined) {
          doc.fontSize(14)
            .font('Helvetica')
            .text(`Score: ${certificate.metadata.score}%`, 50, yPos, { align: 'center' });
          yPos += 25;
        }

        if (certificate.metadata.duration) {
          doc.text(`Duration: ${certificate.metadata.duration}`, 50, yPos, { align: 'center' });
          yPos += 25;
        }

        // Issue date
        doc.fontSize(12)
          .text(
            `Issued on: ${certificate.issueDate.toLocaleDateString()}`,
            50,
            yPos + 30,
            { align: 'center' }
          );

        // Certificate ID
        doc.fontSize(10)
          .text(
            `Certificate ID: ${certificate.certificateId}`,
            50,
            doc.page.height - 100,
            { align: 'center' }
          );

        // QR Code
        if (certificate.verification.qrCode) {
          const qrBuffer = Buffer.from(
            certificate.verification.qrCode.split(',')[1],
            'base64'
          );
          doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 150, {
            width: 100,
            height: 100
          });
        }

        // Instructor signature
        if (certificate.metadata.instructorName) {
          doc.fontSize(12)
            .font('Helvetica')
            .text(certificate.metadata.instructorName, 100, doc.page.height - 80);

          if (certificate.metadata.instructorTitle) {
            doc.fontSize(10)
              .text(certificate.metadata.instructorTitle, 100, doc.page.height - 65);
          }
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate QR code for verification
   */
  private async generateQRCode(url: string): Promise<string> {
    return await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * Generate digital signature for certificate
   */
  private generateSignature(certificateId: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(certificateId);
    sign.end();
    return sign.sign(this.privateKey, 'base64');
  }

  /**
   * Verify digital signature
   */
  private verifySignature(certificateId: string, signature: string): boolean {
    try {
      const publicKey = crypto.createPublicKey(this.privateKey);
      const verify = crypto.createVerify('SHA256');
      verify.update(certificateId);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  /**
   * Generate unique certificate ID
   */
  private generateCertificateId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  /**
   * Generate certificate title
   */
  private generateTitle(data: CertificateData): string {
    switch (data.certificateType) {
      case 'course_completion':
        return `Certificate of Completion - ${data.courseName || 'Course'}`;
      case 'achievement':
        return 'Achievement Certificate';
      case 'skill_mastery':
        return 'Skill Mastery Certificate';
      case 'exam_pass':
        return 'Exam Pass Certificate';
      case 'participation':
        return 'Certificate of Participation';
      default:
        return 'Certificate';
    }
  }

  /**
   * Generate certificate description
   */
  private generateDescription(data: CertificateData): string {
    return `This certificate recognizes ${data.recipientName} for successfully completing the requirements.`;
  }

  /**
   * Get default certificate template
   */
  private getDefaultTemplate(): ICertificateTemplate {
    return {
      name: 'Default Template',
      design: {
        layout: 'landscape',
        fonts: {
          title: 'Helvetica-Bold',
          body: 'Helvetica'
        },
        colors: {
          primary: '#FFFFFF',
          secondary: '#4A90E2',
          text: '#333333'
        }
      },
      fields: {
        recipientName: { x: 100, y: 200, size: 28 },
        courseName: { x: 100, y: 280, size: 22 },
        completionDate: { x: 100, y: 350, size: 14 },
        certificateId: { x: 100, y: 500, size: 10 }
      }
    };
  }

  /**
   * Create Open Badge assertion
   */
  private createOpenBadgeAssertion(
    certificate: ICertificate,
    badgeClass: string
  ): OpenBadgeAssertion {
    const recipientHash = crypto
      .createHash('sha256')
      .update(certificate.recipientEmail)
      .digest('hex');

    return {
      '@context': 'https://w3id.org/openbadges/v2',
      type: 'Assertion',
      id: `${this.verificationBaseUrl}/badges/${certificate.certificateId}/assertion`,
      recipient: {
        type: 'email',
        identity: `sha256$${recipientHash}`,
        hashed: true
      },
      badge: badgeClass,
      verification: {
        type: 'hosted'
      },
      issuedOn: certificate.issueDate.toISOString(),
      expires: certificate.expiryDate?.toISOString()
    };
  }

  /**
   * Mock blockchain transaction (for demonstration)
   */
  private mockBlockchainTransaction(): string {
    return `0x${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats(userId?: mongoose.Types.ObjectId): Promise<{
    total: number;
    issued: number;
    revoked: number;
    expired: number;
    byType: { [key: string]: number };
  }> {
    const query = userId ? { userId } : {};
    const certificates = await Certificate.find(query);

    const stats = {
      total: certificates.length,
      issued: certificates.filter(c => c.status === 'issued').length,
      revoked: certificates.filter(c => c.status === 'revoked').length,
      expired: certificates.filter(c => c.isExpired()).length,
      byType: {} as { [key: string]: number }
    };

    certificates.forEach(cert => {
      stats.byType[cert.certificateType] =
        (stats.byType[cert.certificateType] || 0) + 1;
    });

    return stats;
  }
}

export const certificateGenerator = new CertificateGenerator();
