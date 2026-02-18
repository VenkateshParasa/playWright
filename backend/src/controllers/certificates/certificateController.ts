import { Request, Response } from 'express';
import { certificateGenerator } from '../../services/certificates/certificateGenerator';
import { Certificate } from '../../models/Certificate';
import mongoose from 'mongoose';

/**
 * Certificates Controller
 * Handles certificate generation, verification, and management
 */
export class CertificateController {
  /**
   * Generate a certificate
   * POST /api/certificates/generate
   */
  async generateCertificate(req: Request, res: Response): Promise<void> {
    try {
      const {
        certificateType,
        courseId,
        lessonId,
        achievementId,
        recipientName,
        recipientEmail,
        courseName,
        instructorName,
        instructorTitle,
        grade,
        score,
        creditsEarned,
        skillsAcquired,
        completionCriteria,
        duration,
        expiryDate,
        template
      } = req.body;

      const userId = new mongoose.Types.ObjectId(req.user?.id);

      const certificate = await certificateGenerator.generateCertificate(
        {
          userId,
          certificateType,
          courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
          lessonId: lessonId ? new mongoose.Types.ObjectId(lessonId) : undefined,
          achievementId: achievementId ? new mongoose.Types.ObjectId(achievementId) : undefined,
          recipientName,
          recipientEmail,
          courseName,
          instructorName,
          instructorTitle,
          grade,
          score,
          creditsEarned,
          skillsAcquired,
          completionCriteria,
          duration,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined
        },
        template
      );

      res.json({
        success: true,
        message: 'Certificate generated successfully',
        certificate: {
          id: certificate._id,
          certificateId: certificate.certificateId,
          title: certificate.title,
          recipientName: certificate.recipientName,
          issueDate: certificate.issueDate,
          verificationUrl: certificate.verification.verificationUrl,
          pdfUrl: certificate.pdf?.url
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate certificate',
        error: error.message
      });
    }
  }

  /**
   * Generate blockchain certificate
   * POST /api/certificates/generate/blockchain
   */
  async generateBlockchainCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { network = 'polygon', ...certificateData } = req.body;
      const userId = new mongoose.Types.ObjectId(req.user?.id);

      const certificate = await certificateGenerator.generateBlockchainCertificate(
        {
          ...certificateData,
          userId,
          courseId: certificateData.courseId
            ? new mongoose.Types.ObjectId(certificateData.courseId)
            : undefined,
          lessonId: certificateData.lessonId
            ? new mongoose.Types.ObjectId(certificateData.lessonId)
            : undefined,
          achievementId: certificateData.achievementId
            ? new mongoose.Types.ObjectId(certificateData.achievementId)
            : undefined,
          expiryDate: certificateData.expiryDate
            ? new Date(certificateData.expiryDate)
            : undefined
        },
        network,
        certificateData.template
      );

      res.json({
        success: true,
        message: 'Blockchain certificate generated successfully',
        certificate: {
          id: certificate._id,
          certificateId: certificate.certificateId,
          blockchain: certificate.blockchain,
          verificationUrl: certificate.verification.verificationUrl
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate blockchain certificate',
        error: error.message
      });
    }
  }

  /**
   * Generate Open Badge
   * POST /api/certificates/generate/badge
   */
  async generateOpenBadge(req: Request, res: Response): Promise<void> {
    try {
      const { badgeClass, ...certificateData } = req.body;
      const userId = new mongoose.Types.ObjectId(req.user?.id);

      if (!badgeClass) {
        res.status(400).json({
          success: false,
          message: 'Badge class URL is required'
        });
        return;
      }

      const certificate = await certificateGenerator.generateOpenBadge(
        {
          ...certificateData,
          userId,
          courseId: certificateData.courseId
            ? new mongoose.Types.ObjectId(certificateData.courseId)
            : undefined,
          lessonId: certificateData.lessonId
            ? new mongoose.Types.ObjectId(certificateData.lessonId)
            : undefined,
          achievementId: certificateData.achievementId
            ? new mongoose.Types.ObjectId(certificateData.achievementId)
            : undefined,
          expiryDate: certificateData.expiryDate
            ? new Date(certificateData.expiryDate)
            : undefined
        },
        badgeClass,
        certificateData.template
      );

      res.json({
        success: true,
        message: 'Open Badge generated successfully',
        certificate: {
          id: certificate._id,
          certificateId: certificate.certificateId,
          badgeUrl: certificate.openBadge?.badgeUrl,
          verificationUrl: certificate.verification.verificationUrl
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate Open Badge',
        error: error.message
      });
    }
  }

  /**
   * Verify a certificate
   * GET /api/certificates/verify/:certificateId
   */
  async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;

      const result = await certificateGenerator.verifyCertificate(certificateId);

      if (result.valid) {
        res.json({
          success: true,
          valid: true,
          message: result.message,
          certificate: {
            certificateId: result.certificate?.certificateId,
            recipientName: result.certificate?.recipientName,
            title: result.certificate?.title,
            issueDate: result.certificate?.issueDate,
            expiryDate: result.certificate?.expiryDate,
            status: result.certificate?.status,
            metadata: result.certificate?.metadata
          }
        });
      } else {
        res.status(400).json({
          success: false,
          valid: false,
          message: result.message
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to verify certificate',
        error: error.message
      });
    }
  }

  /**
   * Get user certificates
   * GET /api/certificates/my-certificates
   */
  async getMyCertificates(req: Request, res: Response): Promise<void> {
    try {
      const userId = new mongoose.Types.ObjectId(req.user?.id);
      const { status, type, page = 1, limit = 20 } = req.query;

      const query: any = { userId };
      if (status) query.status = status;
      if (type) query.certificateType = type;

      const certificates = await Certificate.find(query)
        .sort({ issueDate: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .select('-pdf -verification.signature');

      const total = await Certificate.countDocuments(query);

      res.json({
        success: true,
        certificates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get certificates',
        error: error.message
      });
    }
  }

  /**
   * Get certificate by ID
   * GET /api/certificates/:id
   */
  async getCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findById(id);

      if (!certificate) {
        res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
        return;
      }

      // Check if user owns the certificate or if it's public
      const userId = req.user?.id;
      if (
        certificate.userId.toString() !== userId &&
        !certificate.share.public
      ) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.json({
        success: true,
        certificate
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get certificate',
        error: error.message
      });
    }
  }

  /**
   * Download certificate PDF
   * GET /api/certificates/:id/download
   */
  async downloadCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const certificate = await Certificate.findById(id);

      if (!certificate) {
        res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
        return;
      }

      // Track download
      certificate.downloads += 1;
      await certificate.save();

      // In production, stream from S3 or file storage
      res.json({
        success: true,
        downloadUrl: certificate.pdf?.url
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to download certificate',
        error: error.message
      });
    }
  }

  /**
   * Share certificate
   * POST /api/certificates/:id/share
   */
  async shareCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { public: isPublic, linkedIn, twitter, facebook } = req.body;

      const certificate = await Certificate.findById(id);

      if (!certificate) {
        res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
        return;
      }

      // Check ownership
      const userId = req.user?.id;
      if (certificate.userId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      certificate.share = {
        public: isPublic !== undefined ? isPublic : certificate.share.public,
        linkedIn: linkedIn !== undefined ? linkedIn : certificate.share.linkedIn,
        twitter: twitter !== undefined ? twitter : certificate.share.twitter,
        facebook: facebook !== undefined ? facebook : certificate.share.facebook
      };

      await certificate.save();

      res.json({
        success: true,
        message: 'Certificate sharing settings updated',
        share: certificate.share
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update sharing settings',
        error: error.message
      });
    }
  }

  /**
   * Revoke a certificate (Admin only)
   * POST /api/certificates/:id/revoke
   */
  async revokeCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const certificate = await Certificate.findById(id);

      if (!certificate) {
        res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
        return;
      }

      const revokedCertificate = await certificateGenerator.revokeCertificate(
        certificate.certificateId,
        reason
      );

      res.json({
        success: true,
        message: 'Certificate revoked successfully',
        certificate: revokedCertificate
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to revoke certificate',
        error: error.message
      });
    }
  }

  /**
   * Get certificate statistics
   * GET /api/certificates/stats
   */
  async getCertificateStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId
        ? new mongoose.Types.ObjectId(req.query.userId as string)
        : undefined;

      const stats = await certificateGenerator.getCertificateStats(userId);

      res.json({
        success: true,
        stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get certificate statistics',
        error: error.message
      });
    }
  }

  /**
   * Get Open Badge assertion
   * GET /api/certificates/:certificateId/badge/assertion
   */
  async getBadgeAssertion(req: Request, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;
      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate || !certificate.openBadge?.enabled) {
        res.status(404).json({
          success: false,
          message: 'Badge not found'
        });
        return;
      }

      res.json(certificate.openBadge.assertion);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get badge assertion',
        error: error.message
      });
    }
  }

  /**
   * Get certificate templates
   * GET /api/certificates/templates
   */
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      // In production, fetch from database
      const templates = [
        {
          id: 'default',
          name: 'Default Template',
          preview: '/templates/default-preview.png',
          description: 'Classic certificate design'
        },
        {
          id: 'modern',
          name: 'Modern Template',
          preview: '/templates/modern-preview.png',
          description: 'Contemporary minimalist design'
        },
        {
          id: 'elegant',
          name: 'Elegant Template',
          preview: '/templates/elegant-preview.png',
          description: 'Sophisticated formal design'
        }
      ];

      res.json({
        success: true,
        templates
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message
      });
    }
  }
}

export const certificateController = new CertificateController();
