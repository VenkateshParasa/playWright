import mongoose, { Document, Schema } from 'mongoose';

export interface IReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface IReportMetric {
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface IReportDimension {
  field: string;
  alias?: string;
}

export interface IReportVisualization {
  type: 'bar' | 'line' | 'pie' | 'table' | 'area' | 'scatter' | 'heatmap';
  config?: {
    xAxis?: string;
    yAxis?: string;
    series?: string[];
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

export interface IReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel';
  lastRun?: Date;
  nextRun?: Date;
}

export interface ICustomReport extends Document {
  name: string;
  description?: string;
  category: 'user' | 'content' | 'engagement' | 'progress' | 'srs' | 'custom';
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  isTemplate: boolean;

  // Data source
  dataSource: 'users' | 'progress' | 'lessons' | 'quizzes' | 'flashcards' | 'combined';

  // Query configuration
  dateRange?: {
    type: 'fixed' | 'relative';
    startDate?: Date;
    endDate?: Date;
    relativeDays?: number;
  };
  filters: IReportFilter[];
  metrics: IReportMetric[];
  dimensions: IReportDimension[];

  // Visualization
  visualization: IReportVisualization;

  // Scheduling
  schedule?: IReportSchedule;

  // Metadata
  lastGenerated?: Date;
  generationCount: number;
  averageGenerationTime: number;
  tags: string[];

  // Sharing and permissions
  sharedWith: {
    userId: mongoose.Types.ObjectId;
    permission: 'view' | 'edit';
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const CustomReportSchema = new Schema<ICustomReport>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['user', 'content', 'engagement', 'progress', 'srs', 'custom'],
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    dataSource: {
      type: String,
      enum: ['users', 'progress', 'lessons', 'quizzes', 'flashcards', 'combined'],
      required: true,
    },
    dateRange: {
      type: {
        type: String,
        enum: ['fixed', 'relative'],
        required: true,
      },
      startDate: Date,
      endDate: Date,
      relativeDays: Number,
    },
    filters: [
      {
        field: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains'],
          required: true,
        },
        value: Schema.Types.Mixed,
      },
    ],
    metrics: [
      {
        field: {
          type: String,
          required: true,
        },
        aggregation: {
          type: String,
          enum: ['count', 'sum', 'avg', 'min', 'max', 'distinct'],
          required: true,
        },
        alias: String,
      },
    ],
    dimensions: [
      {
        field: {
          type: String,
          required: true,
        },
        alias: String,
      },
    ],
    visualization: {
      type: {
        type: String,
        enum: ['bar', 'line', 'pie', 'table', 'area', 'scatter', 'heatmap'],
        required: true,
      },
      config: {
        xAxis: String,
        yAxis: String,
        series: [String],
        colors: [String],
        showLegend: {
          type: Boolean,
          default: true,
        },
        showGrid: {
          type: Boolean,
          default: true,
        },
      },
    },
    schedule: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      dayOfWeek: Number,
      dayOfMonth: Number,
      time: String,
      recipients: [String],
      format: {
        type: String,
        enum: ['pdf', 'csv', 'excel'],
      },
      lastRun: Date,
      nextRun: Date,
    },
    lastGenerated: Date,
    generationCount: {
      type: Number,
      default: 0,
    },
    averageGenerationTime: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    sharedWith: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        permission: {
          type: String,
          enum: ['view', 'edit'],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
CustomReportSchema.index({ createdBy: 1, category: 1 });
CustomReportSchema.index({ isPublic: 1, isTemplate: 1 });
CustomReportSchema.index({ tags: 1 });
CustomReportSchema.index({ 'schedule.enabled': 1, 'schedule.nextRun': 1 });

// Transform output
CustomReportSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const CustomReport = mongoose.model<ICustomReport>('CustomReport', CustomReportSchema);
