import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

/**
 * Discord Bot for Playwright & Selenium Learning Platform
 *
 * Required Permissions:
 * - Send Messages
 * - Embed Links
 * - Add Reactions
 * - Use Slash Commands
 *
 * Commands:
 * - !learn - Get learning recommendations
 * - !progress - View your learning progress
 * - !leaderboard - View the server leaderboard
 * - !quiz - Take a quick quiz
 */

export const DISCORD_CONFIG = {
  token: process.env.DISCORD_BOT_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
};

export class DiscordBot {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.once('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.registerSlashCommands();
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Handle prefix commands
      if (message.content.startsWith('!learn')) {
        await this.handleLearnCommand(message);
      } else if (message.content.startsWith('!progress')) {
        await this.handleProgressCommand(message);
      } else if (message.content.startsWith('!leaderboard')) {
        await this.handleLeaderboardCommand(message);
      } else if (message.content.startsWith('!quiz')) {
        await this.handleQuizCommand(message);
      }
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { commandName } = interaction;

      if (commandName === 'learn') {
        await this.handleLearnSlashCommand(interaction);
      } else if (commandName === 'progress') {
        await this.handleProgressSlashCommand(interaction);
      } else if (commandName === 'leaderboard') {
        await this.handleLeaderboardSlashCommand(interaction);
      } else if (commandName === 'quiz') {
        await this.handleQuizSlashCommand(interaction);
      }
    });
  }

  private async registerSlashCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('learn')
        .setDescription('Get personalized learning recommendations'),
      new SlashCommandBuilder()
        .setName('progress')
        .setDescription('View your learning progress'),
      new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server leaderboard'),
      new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Take a quick quiz')
        .addStringOption(option =>
          option
            .setName('topic')
            .setDescription('Quiz topic')
            .setRequired(false)
        ),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(DISCORD_CONFIG.token!);

    try {
      console.log('Registering Discord slash commands...');
      await rest.put(
        Routes.applicationGuildCommands(DISCORD_CONFIG.clientId!, DISCORD_CONFIG.guildId!),
        { body: commands }
      );
      console.log('Discord slash commands registered successfully');
    } catch (error) {
      console.error('Error registering Discord commands:', error);
    }
  }

  private async handleLearnCommand(message: any) {
    const userId = message.author.id;
    const recommendations = await this.getLearningRecommendations(userId);

    const embed = {
      color: 0x0099ff,
      title: 'Your Learning Recommendations',
      fields: recommendations.map((lesson: any) => ({
        name: lesson.title,
        value: `${lesson.description}\nDuration: ${lesson.duration} minutes\n[Start Lesson](${lesson.url})`,
      })),
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  private async handleProgressCommand(message: any) {
    const userId = message.author.id;
    const progress = await this.getUserProgress(userId);

    const embed = {
      color: 0x00ff00,
      title: `${message.author.username}'s Learning Progress`,
      fields: [
        {
          name: 'Lessons Completed',
          value: progress.lessonsCompleted.toString(),
          inline: true,
        },
        {
          name: 'Quizzes Passed',
          value: progress.quizzesPassed.toString(),
          inline: true,
        },
        {
          name: 'Current Streak',
          value: `${progress.currentStreak} days`,
          inline: true,
        },
        {
          name: 'Total Points',
          value: progress.totalPoints.toString(),
          inline: true,
        },
        {
          name: 'Achievements',
          value: progress.achievements.toString(),
          inline: true,
        },
        {
          name: 'Rank',
          value: progress.rank,
          inline: true,
        },
      ],
      thumbnail: {
        url: message.author.displayAvatarURL(),
      },
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  private async handleLeaderboardCommand(message: any) {
    const guildId = message.guild.id;
    const leaderboard = await this.getLeaderboard(guildId);

    const embed = {
      color: 0xffd700,
      title: 'Server Leaderboard',
      description: leaderboard
        .map((entry: any, index: number) => {
          const medal = index === 0 ? ':first_place:' : index === 1 ? ':second_place:' : index === 2 ? ':third_place:' : `${index + 1}.`;
          return `${medal} <@${entry.userId}> - ${entry.points} points`;
        })
        .join('\n'),
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  }

  private async handleQuizCommand(message: any) {
    const userId = message.author.id;
    const quiz = await this.getQuickQuiz(userId);

    const embed = {
      color: 0xff9900,
      title: `Quick Quiz: ${quiz.title}`,
      description: quiz.question,
      fields: quiz.options.map((option: string, index: number) => ({
        name: `Option ${index + 1}`,
        value: option,
      })),
      footer: {
        text: 'React with the number emoji to answer (1️⃣, 2️⃣, 3️⃣, 4️⃣)',
      },
    };

    const quizMessage = await message.reply({ embeds: [embed] });

    // Add reaction options
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    for (let i = 0; i < quiz.options.length; i++) {
      await quizMessage.react(emojis[i]);
    }

    // Wait for user reaction
    const filter = (reaction: any, user: any) =>
      emojis.includes(reaction.emoji.name) && user.id === userId;

    try {
      const collected = await quizMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
      const reaction = collected.first();
      const answerIndex = emojis.indexOf(reaction!.emoji.name);
      const isCorrect = await this.checkQuizAnswer(quiz.id, answerIndex);

      const resultEmbed = {
        color: isCorrect ? 0x00ff00 : 0xff0000,
        title: isCorrect ? '✅ Correct!' : '❌ Incorrect',
        description: isCorrect
          ? `Great job! You earned ${quiz.points} points.`
          : `The correct answer was: ${quiz.correctAnswer}`,
      };

      await quizMessage.reply({ embeds: [resultEmbed] });
    } catch {
      await quizMessage.reply('⏰ Time\'s up! Try again with !quiz');
    }
  }

  private async handleLearnSlashCommand(interaction: any) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const recommendations = await this.getLearningRecommendations(userId);

    const embed = {
      color: 0x0099ff,
      title: 'Your Learning Recommendations',
      fields: recommendations.map((lesson: any) => ({
        name: lesson.title,
        value: `${lesson.description}\nDuration: ${lesson.duration} minutes\n[Start Lesson](${lesson.url})`,
      })),
    };

    await interaction.editReply({ embeds: [embed] });
  }

  private async handleProgressSlashCommand(interaction: any) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const progress = await this.getUserProgress(userId);

    const embed = {
      color: 0x00ff00,
      title: `${interaction.user.username}'s Learning Progress`,
      fields: [
        { name: 'Lessons Completed', value: progress.lessonsCompleted.toString(), inline: true },
        { name: 'Quizzes Passed', value: progress.quizzesPassed.toString(), inline: true },
        { name: 'Current Streak', value: `${progress.currentStreak} days`, inline: true },
        { name: 'Total Points', value: progress.totalPoints.toString(), inline: true },
      ],
    };

    await interaction.editReply({ embeds: [embed] });
  }

  private async handleLeaderboardSlashCommand(interaction: any) {
    await interaction.deferReply();
    const guildId = interaction.guildId;
    const leaderboard = await this.getLeaderboard(guildId);

    const embed = {
      color: 0xffd700,
      title: 'Server Leaderboard',
      description: leaderboard
        .map((entry: any, index: number) => `${index + 1}. <@${entry.userId}> - ${entry.points} points`)
        .join('\n'),
    };

    await interaction.editReply({ embeds: [embed] });
  }

  private async handleQuizSlashCommand(interaction: any) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const topic = interaction.options.getString('topic');
    const quiz = await this.getQuickQuiz(userId, topic);

    const embed = {
      color: 0xff9900,
      title: `Quick Quiz: ${quiz.title}`,
      description: quiz.question,
      fields: quiz.options.map((option: string, index: number) => ({
        name: `Option ${index + 1}`,
        value: option,
      })),
    };

    await interaction.editReply({ embeds: [embed] });
  }

  // Helper methods
  private async getLearningRecommendations(userId: string): Promise<any[]> {
    // Implementation
    return [];
  }

  private async getUserProgress(userId: string): Promise<any> {
    // Implementation
    return {
      lessonsCompleted: 0,
      quizzesPassed: 0,
      currentStreak: 0,
      totalPoints: 0,
      achievements: 0,
      rank: 'Beginner',
    };
  }

  private async getLeaderboard(guildId: string): Promise<any[]> {
    // Implementation
    return [];
  }

  private async getQuickQuiz(userId: string, topic?: string): Promise<any> {
    // Implementation
    return {
      id: 'quiz_123',
      title: 'Quick Quiz',
      question: 'What is Playwright?',
      options: ['A testing framework', 'A programming language', 'A database', 'An IDE'],
      correctAnswer: 'A testing framework',
      points: 10,
    };
  }

  private async checkQuizAnswer(quizId: string, answerIndex: number): Promise<boolean> {
    // Implementation
    return answerIndex === 0;
  }

  public async start() {
    await this.client.login(DISCORD_CONFIG.token);
  }

  public async stop() {
    await this.client.destroy();
  }
}

// Export bot instance
export const bot = new DiscordBot();
