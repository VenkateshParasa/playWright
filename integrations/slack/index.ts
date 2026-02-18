import express from 'express';
import { WebhookService } from '../../backend/src/services/webhookService.js';

const router = express.Router();

/**
 * Slack App Configuration
 *
 * OAuth Scopes Required:
 * - commands (for slash commands)
 * - chat:write (for posting messages)
 * - users:read (for user information)
 *
 * Slash Commands:
 * - /learn - Get learning recommendations
 * - /progress - View your learning progress
 * - /quiz - Take a quick quiz
 */

// Slack OAuth configuration
export const SLACK_CONFIG = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: process.env.SLACK_REDIRECT_URI || 'https://api.playwright-learning.com/integrations/slack/oauth/callback',
  scopes: ['commands', 'chat:write', 'users:read'],
};

// Slash command handlers
router.post('/commands/learn', async (req, res) => {
  const { user_id, channel_id, team_id, text } = req.body;

  try {
    // Get user's learning recommendations
    const recommendations = await getLearningRecommendations(user_id);

    res.json({
      response_type: 'ephemeral',
      text: 'Your Learning Recommendations',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Your Learning Recommendations*',
          },
        },
        ...recommendations.map((lesson: any) => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${lesson.title}*\n${lesson.description}\nEstimated time: ${lesson.duration} minutes`,
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Start Lesson',
            },
            url: `https://app.playwright-learning.com/lessons/${lesson.id}`,
            action_id: 'start_lesson',
          },
        })),
      ],
    });
  } catch (error) {
    console.error('Slack /learn command error:', error);
    res.json({
      response_type: 'ephemeral',
      text: 'Sorry, I could not fetch your recommendations. Please try again later.',
    });
  }
});

router.post('/commands/progress', async (req, res) => {
  const { user_id } = req.body;

  try {
    const progress = await getUserProgress(user_id);

    res.json({
      response_type: 'ephemeral',
      text: 'Your Learning Progress',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Your Learning Progress*',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Lessons Completed:*\n${progress.lessonsCompleted}`,
            },
            {
              type: 'mrkdwn',
              text: `*Quizzes Passed:*\n${progress.quizzesPassed}`,
            },
            {
              type: 'mrkdwn',
              text: `*Current Streak:*\n${progress.currentStreak} days`,
            },
            {
              type: 'mrkdwn',
              text: `*Total Points:*\n${progress.totalPoints}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Full Progress',
              },
              url: 'https://app.playwright-learning.com/progress',
            },
          ],
        },
      ],
    });
  } catch (error) {
    console.error('Slack /progress command error:', error);
    res.json({
      response_type: 'ephemeral',
      text: 'Sorry, I could not fetch your progress. Please try again later.',
    });
  }
});

router.post('/commands/quiz', async (req, res) => {
  const { user_id } = req.body;

  try {
    const quiz = await getQuickQuiz(user_id);

    res.json({
      response_type: 'ephemeral',
      text: 'Quick Quiz',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Quick Quiz: ${quiz.title}*\n${quiz.question}`,
          },
        },
        {
          type: 'actions',
          elements: quiz.options.map((option: string, index: number) => ({
            type: 'button',
            text: {
              type: 'plain_text',
              text: option,
            },
            value: `${quiz.id}_${index}`,
            action_id: `quiz_answer_${index}`,
          })),
        },
      ],
    });
  } catch (error) {
    console.error('Slack /quiz command error:', error);
    res.json({
      response_type: 'ephemeral',
      text: 'Sorry, I could not fetch a quiz. Please try again later.',
    });
  }
});

// Interactive component handlers
router.post('/interactions', async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  if (payload.type === 'block_actions') {
    const action = payload.actions[0];

    if (action.action_id.startsWith('quiz_answer_')) {
      // Handle quiz answer
      const [quizId, answerIndex] = action.value.split('_');
      const isCorrect = await checkQuizAnswer(quizId, parseInt(answerIndex));

      res.json({
        replace_original: true,
        text: isCorrect
          ? ':white_check_mark: Correct! Great job!'
          : ':x: Incorrect. Keep learning!',
      });
      return;
    }
  }

  res.status(200).send();
});

// OAuth flow
router.get('/oauth/authorize', (req, res) => {
  const url = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CONFIG.clientId}&scope=${SLACK_CONFIG.scopes.join(',')}&redirect_uri=${SLACK_CONFIG.redirectUri}`;
  res.redirect(url);
});

router.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CONFIG.clientId!,
        client_secret: SLACK_CONFIG.clientSecret!,
        code: code as string,
        redirect_uri: SLACK_CONFIG.redirectUri,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      // Store access token for the team
      await storeSlackToken(data.team.id, data.access_token);
      res.send('Slack integration successful! You can close this window.');
    } else {
      res.status(400).send('OAuth failed');
    }
  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.status(500).send('OAuth failed');
  }
});

// Send notification to Slack
export async function sendSlackNotification(
  teamId: string,
  channelId: string,
  message: string,
  blocks?: any[]
) {
  const token = await getSlackToken(teamId);

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel: channelId,
      text: message,
      blocks,
    }),
  });

  return response.json();
}

// Helper functions (to be implemented)
async function getLearningRecommendations(userId: string): Promise<any[]> {
  // Implementation to fetch learning recommendations
  return [];
}

async function getUserProgress(userId: string): Promise<any> {
  // Implementation to fetch user progress
  return {
    lessonsCompleted: 0,
    quizzesPassed: 0,
    currentStreak: 0,
    totalPoints: 0,
  };
}

async function getQuickQuiz(userId: string): Promise<any> {
  // Implementation to fetch a quick quiz
  return {
    id: 'quiz_123',
    title: 'Quick Quiz',
    question: 'What is Playwright?',
    options: ['A testing framework', 'A programming language', 'A database'],
  };
}

async function checkQuizAnswer(quizId: string, answerIndex: number): Promise<boolean> {
  // Implementation to check quiz answer
  return answerIndex === 0;
}

async function storeSlackToken(teamId: string, token: string): Promise<void> {
  // Implementation to store Slack token
}

async function getSlackToken(teamId: string): Promise<string> {
  // Implementation to retrieve Slack token
  return '';
}

export default router;
