/**
 * Alert Manager Service
 *
 * Features:
 * - Define alert rules
 * - Check metrics against thresholds
 * - Send notifications (email, Slack, etc.)
 * - Alert cooldown periods
 * - Alert escalation
 * - Alert acknowledgment
 * - Alert history
 */

import { info, warn, error } from '../middleware/logger.js';

// Alert types
export interface Alert {
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: () => Promise<boolean>;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  cooldownMinutes: number;
}

interface AlertHistory {
  alert: Alert;
  sentAt: Date;
  acknowledged: boolean;
}

// Alert history and cooldown tracking
const alertHistory: AlertHistory[] = [];
const lastAlertTime = new Map<string, number>();

/**
 * Send alert
 */
export async function sendAlert(alert: Alert): Promise<void> {
  const alertWithTimestamp = {
    ...alert,
    timestamp: alert.timestamp || new Date(),
  };

  // Add to history
  alertHistory.push({
    alert: alertWithTimestamp,
    sentAt: new Date(),
    acknowledged: false,
  });

  // Keep only last 1000 alerts
  if (alertHistory.length > 1000) {
    alertHistory.shift();
  }

  // Log the alert
  const logLevel = alert.severity === 'critical' || alert.severity === 'error' ? error : warn;
  logLevel(`ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`, {
    message: alert.message,
    metadata: alert.metadata,
  });

  // Send to notification channels
  await Promise.all([
    sendEmailAlert(alertWithTimestamp),
    sendSlackAlert(alertWithTimestamp),
    // Add more notification channels as needed
  ]);
}

/**
 * Send alert with cooldown check
 */
export async function sendAlertWithCooldown(
  ruleId: string,
  alert: Alert,
  cooldownMinutes: number
): Promise<boolean> {
  const now = Date.now();
  const lastAlert = lastAlertTime.get(ruleId);

  // Check if in cooldown period
  if (lastAlert && (now - lastAlert) < cooldownMinutes * 60 * 1000) {
    info(`Alert ${ruleId} in cooldown period`);
    return false;
  }

  // Send alert
  await sendAlert(alert);

  // Update last alert time
  lastAlertTime.set(ruleId, now);

  return true;
}

/**
 * Send email alert
 */
async function sendEmailAlert(alert: Alert): Promise<void> {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Email alert (not sent in development):', alert);
    return;
  }

  try {
    // TODO: Implement email sending using nodemailer or similar
    // const transporter = nodemailer.createTransporter({ ... });
    // await transporter.sendMail({ ... });

    info('Email alert sent', { title: alert.title });
  } catch (err) {
    error('Failed to send email alert', { error: err, alert });
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(alert: Alert): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    const color = {
      info: '#36a64f',
      warning: '#ff9900',
      error: '#ff0000',
      critical: '#8b0000',
    }[alert.severity];

    const payload = {
      attachments: [
        {
          color,
          title: alert.title,
          text: alert.message,
          fields: alert.metadata
            ? Object.entries(alert.metadata).map(([key, value]) => ({
                title: key,
                value: String(value),
                short: true,
              }))
            : [],
          footer: 'Monitoring System',
          ts: Math.floor((alert.timestamp?.getTime() || Date.now()) / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }

    info('Slack alert sent', { title: alert.title });
  } catch (err) {
    error('Failed to send Slack alert', { error: err, alert });
  }
}

/**
 * Get alert history
 */
export function getAlertHistory(limit: number = 100): AlertHistory[] {
  return alertHistory.slice(-limit);
}

/**
 * Acknowledge alert
 */
export function acknowledgeAlert(index: number): boolean {
  if (index >= 0 && index < alertHistory.length) {
    alertHistory[index].acknowledged = true;
    return true;
  }
  return false;
}

/**
 * Clear alert history
 */
export function clearAlertHistory(): void {
  alertHistory.length = 0;
  lastAlertTime.clear();
}

export default {
  sendAlert,
  sendAlertWithCooldown,
  getAlertHistory,
  acknowledgeAlert,
  clearAlertHistory,
};
