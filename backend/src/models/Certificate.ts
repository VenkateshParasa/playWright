import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificateTemplate {
  name: string;
  design: {
    layout: 'portrait' | 'landscape';
    background?: string; // URL or base64
    logo?: string;
    fonts: {
      title: string;
      body: string;
    };
    colors: {
      primary: string;
      secondary: string;
      text: string;
    };
  };
  fields: {
    recipientName: { x: number; y: number; size: number; };
    courseName: { x: number; y: number; size: number; };
    completionDate: { x: number; y: number; size: number; };
    certificateId: { x: number; y: number; size: number; };
    instructorName?: { x: number; y: number; size: number; };
    signature?: { x: number; y: number; size: number; };
  };
}

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  achievementId?: mongoose.Types.ObjectId;
  certificateType: 'course_completion' | 'achievement' | 'skill_mastery' |
                   'exam_pass' | 'participation' | 'custom';
  certificateId: string; // Unique identifier (e.g., CERT-2024-001234)
  title: string;
  description?: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: Date;
  expiryDate?: Date;
  status: 'issued' | 'revoked' | 'expired' | 'pending';
  template: ICertificateTemplate;
  metadata: {
    courseName?: string;
    instructorName?: string;
    instructorTitle?: string;
    grade?: number;
    score?: number;
    creditsEarned?: number;
    skillsAcquired?: string[];
    completionCriteria?: string;
    duration?: string; // e.g., "40 hours"
  };
  verification: {
    verificationUrl: string;
    qrCode?: string; // Base64 QR code image
    publicKey?: string;
    signature?: string; // Digital signature
  };
  blockchain?: {
    enabled: boolean;
    transactionHash?: string;
    network?: string; // e.g., 'ethereum', 'polygon'
    contractAddress?: string;
    tokenId?: string;
  };
  openBadge?: {
    enabled: boolean;
    badgeId?: string;
    badgeUrl?: string;
    assertion?: any; // Open Badges assertion object
  };
  pdf?: {
    url: string;
    s3Key?: string;
    generatedAt: Date;
  };
  share: {
    public: boolean;
    linkedIn: boolean;
    twitter: boolean;
    facebook: boolean;
  };
  views: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  achievementId: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  certificateType: {
    type: String,
    enum: ['course_completion', 'achievement', 'skill_mastery',
           'exam_pass', 'participation', 'custom'],
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  recipientName: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['issued', 'revoked', 'expired', 'pending'],
    default: 'issued',
    index: true
  },
  template: {
    name: { type: String, required: true },
    design: {
      layout: { type: String, enum: ['portrait', 'landscape'], default: 'landscape' },
      background: String,
      logo: String,
      fonts: {
        title: { type: String, default: 'Arial' },
        body: { type: String, default: 'Arial' }
      },
      colors: {
        primary: { type: String, default: '#4A90E2' },
        secondary: { type: String, default: '#50C878' },
        text: { type: String, default: '#333333' }
      }
    },
    fields: Schema.Types.Mixed
  },
  metadata: {
    courseName: String,
    instructorName: String,
    instructorTitle: String,
    grade: Number,
    score: Number,
    creditsEarned: Number,
    skillsAcquired: [String],
    completionCriteria: String,
    duration: String
  },
  verification: {
    verificationUrl: { type: String, required: true },
    qrCode: String,
    publicKey: String,
    signature: String
  },
  blockchain: {
    enabled: { type: Boolean, default: false },
    transactionHash: String,
    network: String,
    contractAddress: String,
    tokenId: String
  },
  openBadge: {
    enabled: { type: Boolean, default: false },
    badgeId: String,
    badgeUrl: String,
    assertion: Schema.Types.Mixed
  },
  pdf: {
    url: String,
    s3Key: String,
    generatedAt: Date
  },
  share: {
    public: { type: Boolean, default: false },
    linkedIn: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false }
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
CertificateSchema.index({ userId: 1, status: 1 });
CertificateSchema.index({ certificateId: 1 }, { unique: true });
CertificateSchema.index({ issueDate: -1 });
CertificateSchema.index({ expiryDate: 1 });

// Check for expired certificates
CertificateSchema.methods.isExpired = function(): boolean {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Auto-update expired status
CertificateSchema.pre('find', function() {
  const now = new Date();
  this.where({
    status: 'issued',
    expiryDate: { $lte: now }
  }).updateMany({ status: 'expired' });
});

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);
