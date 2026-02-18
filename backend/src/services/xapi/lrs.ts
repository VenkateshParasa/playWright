import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface XAPIStatement {
  id?: string;
  actor: XAPIActor;
  verb: XAPIVerb;
  object: XAPIObject;
  result?: XAPIResult;
  context?: XAPIContext;
  timestamp?: string;
  stored?: string;
  authority?: XAPIActor;
  version?: string;
  attachments?: XAPIAttachment[];
}

export interface XAPIActor {
  objectType?: 'Agent' | 'Group';
  name?: string;
  mbox?: string;
  mbox_sha1sum?: string;
  openid?: string;
  account?: {
    homePage: string;
    name: string;
  };
  members?: XAPIActor[]; // For Group
}

export interface XAPIVerb {
  id: string; // IRI
  display?: { [lang: string]: string };
}

export interface XAPIObject {
  objectType?: 'Activity' | 'Agent' | 'Group' | 'SubStatement' | 'StatementRef';
  id?: string; // IRI for Activity
  definition?: XAPIActivityDefinition;
  // For other object types
  [key: string]: any;
}

export interface XAPIActivityDefinition {
  name?: { [lang: string]: string };
  description?: { [lang: string]: string };
  type?: string; // IRI
  moreInfo?: string; // URL
  extensions?: { [key: string]: any };
  interactionType?: 'true-false' | 'choice' | 'fill-in' | 'long-fill-in' |
                    'matching' | 'performance' | 'sequencing' | 'likert' |
                    'numeric' | 'other';
  correctResponsesPattern?: string[];
  choices?: XAPIInteractionComponent[];
  scale?: XAPIInteractionComponent[];
  source?: XAPIInteractionComponent[];
  target?: XAPIInteractionComponent[];
  steps?: XAPIInteractionComponent[];
}

export interface XAPIInteractionComponent {
  id: string;
  description?: { [lang: string]: string };
}

export interface XAPIResult {
  score?: XAPIScore;
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string; // ISO 8601 duration
  extensions?: { [key: string]: any };
}

export interface XAPIScore {
  scaled?: number; // -1 to 1
  raw?: number;
  min?: number;
  max?: number;
}

export interface XAPIContext {
  registration?: string; // UUID
  instructor?: XAPIActor;
  team?: XAPIActor;
  contextActivities?: {
    parent?: XAPIObject[];
    grouping?: XAPIObject[];
    category?: XAPIObject[];
    other?: XAPIObject[];
  };
  revision?: string;
  platform?: string;
  language?: string;
  statement?: {
    objectType: 'StatementRef';
    id: string;
  };
  extensions?: { [key: string]: any };
}

export interface XAPIAttachment {
  usageType: string; // IRI
  display: { [lang: string]: string };
  description?: { [lang: string]: string };
  contentType: string; // MIME type
  length: number;
  sha2: string;
  fileUrl?: string;
}

export interface StatementQuery {
  statementId?: string;
  voidedStatementId?: string;
  agent?: string; // JSON
  verb?: string; // IRI
  activity?: string; // IRI
  registration?: string; // UUID
  related_activities?: boolean;
  related_agents?: boolean;
  since?: string; // ISO 8601
  until?: string; // ISO 8601
  limit?: number;
  format?: 'ids' | 'exact' | 'canonical';
  attachments?: boolean;
  ascending?: boolean;
}

export interface StatementResult {
  statements: XAPIStatement[];
  more?: string; // IRL for more results
}

export interface XAPIState {
  activityId: string;
  agent: string; // JSON
  stateId: string;
  registration?: string;
  content: any;
  contentType: string;
  etag?: string;
  updated: Date;
}

export interface XAPIActivityProfile {
  activityId: string;
  profileId: string;
  content: any;
  contentType: string;
  etag?: string;
  updated: Date;
}

export interface XAPIAgentProfile {
  agent: string; // JSON
  profileId: string;
  content: any;
  contentType: string;
  etag?: string;
  updated: Date;
}

/**
 * Learning Record Store (LRS) Implementation
 * Compliant with xAPI (Experience API) Specification
 */
export class LearningRecordStore extends EventEmitter {
  private statements: Map<string, XAPIStatement> = new Map();
  private states: Map<string, XAPIState> = new Map();
  private activityProfiles: Map<string, XAPIActivityProfile> = new Map();
  private agentProfiles: Map<string, XAPIAgentProfile> = new Map();
  private version = '1.0.3'; // xAPI version

  constructor() {
    super();
  }

  /**
   * Store a single statement
   */
  async putStatement(statement: XAPIStatement): Promise<string[]> {
    const statementId = statement.id || this.generateUUID();
    const now = new Date().toISOString();

    const storedStatement: XAPIStatement = {
      ...statement,
      id: statementId,
      stored: now,
      timestamp: statement.timestamp || now,
      version: this.version
    };

    // Validate statement
    this.validateStatement(storedStatement);

    this.statements.set(statementId, storedStatement);
    this.emit('statementStored', storedStatement);

    return [statementId];
  }

  /**
   * Store multiple statements
   */
  async postStatements(statements: XAPIStatement[]): Promise<string[]> {
    const ids: string[] = [];

    for (const statement of statements) {
      const [id] = await this.putStatement(statement);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Retrieve a single statement by ID
   */
  async getStatement(
    statementId: string,
    format: 'exact' | 'canonical' = 'exact',
    attachments: boolean = false
  ): Promise<XAPIStatement | null> {
    const statement = this.statements.get(statementId);

    if (!statement) {
      return null;
    }

    // Apply format transformations if needed
    if (format === 'canonical') {
      return this.canonicalizeStatement(statement);
    }

    return statement;
  }

  /**
   * Query statements
   */
  async queryStatements(query: StatementQuery): Promise<StatementResult> {
    let statements = Array.from(this.statements.values());

    // Filter by statementId
    if (query.statementId) {
      const statement = this.statements.get(query.statementId);
      return {
        statements: statement ? [statement] : []
      };
    }

    // Filter by agent
    if (query.agent) {
      const agentFilter = JSON.parse(query.agent);
      statements = statements.filter(s =>
        this.agentMatches(s.actor, agentFilter)
      );
    }

    // Filter by verb
    if (query.verb) {
      statements = statements.filter(s => s.verb.id === query.verb);
    }

    // Filter by activity
    if (query.activity) {
      statements = statements.filter(s =>
        s.object.objectType === 'Activity' && s.object.id === query.activity
      );
    }

    // Filter by registration
    if (query.registration) {
      statements = statements.filter(s =>
        s.context?.registration === query.registration
      );
    }

    // Filter by time range
    if (query.since) {
      const since = new Date(query.since);
      statements = statements.filter(s => {
        const stored = new Date(s.stored!);
        return stored > since;
      });
    }

    if (query.until) {
      const until = new Date(query.until);
      statements = statements.filter(s => {
        const stored = new Date(s.stored!);
        return stored < until;
      });
    }

    // Sort
    statements.sort((a, b) => {
      const aTime = new Date(a.stored!).getTime();
      const bTime = new Date(b.stored!).getTime();
      return query.ascending ? aTime - bTime : bTime - aTime;
    });

    // Limit
    const limit = query.limit || 50;
    const limitedStatements = statements.slice(0, limit);

    // Format
    const format = query.format || 'exact';
    const formattedStatements = format === 'canonical'
      ? limitedStatements.map(s => this.canonicalizeStatement(s))
      : limitedStatements;

    return {
      statements: formattedStatements,
      more: statements.length > limit ? this.generateMoreURL(query, limit) : undefined
    };
  }

  /**
   * Store state data
   */
  async putState(state: XAPIState): Promise<void> {
    const key = this.generateStateKey(
      state.activityId,
      state.agent,
      state.stateId,
      state.registration
    );

    const etag = this.generateETag(state.content);

    const storedState: XAPIState = {
      ...state,
      etag,
      updated: new Date()
    };

    this.states.set(key, storedState);
    this.emit('stateStored', storedState);
  }

  /**
   * Retrieve state data
   */
  async getState(
    activityId: string,
    agent: string,
    stateId: string,
    registration?: string
  ): Promise<XAPIState | null> {
    const key = this.generateStateKey(activityId, agent, stateId, registration);
    return this.states.get(key) || null;
  }

  /**
   * Delete state data
   */
  async deleteState(
    activityId: string,
    agent: string,
    stateId: string,
    registration?: string
  ): Promise<void> {
    const key = this.generateStateKey(activityId, agent, stateId, registration);
    this.states.delete(key);
    this.emit('stateDeleted', { activityId, agent, stateId, registration });
  }

  /**
   * Get state IDs
   */
  async getStateIds(
    activityId: string,
    agent: string,
    registration?: string,
    since?: string
  ): Promise<string[]> {
    const states = Array.from(this.states.values()).filter(state => {
      if (state.activityId !== activityId) return false;
      if (state.agent !== agent) return false;
      if (registration && state.registration !== registration) return false;
      if (since && state.updated < new Date(since)) return false;
      return true;
    });

    return states.map(s => s.stateId);
  }

  /**
   * Store activity profile
   */
  async putActivityProfile(profile: XAPIActivityProfile): Promise<void> {
    const key = `${profile.activityId}:${profile.profileId}`;
    const etag = this.generateETag(profile.content);

    const storedProfile: XAPIActivityProfile = {
      ...profile,
      etag,
      updated: new Date()
    };

    this.activityProfiles.set(key, storedProfile);
    this.emit('activityProfileStored', storedProfile);
  }

  /**
   * Get activity profile
   */
  async getActivityProfile(
    activityId: string,
    profileId: string
  ): Promise<XAPIActivityProfile | null> {
    const key = `${activityId}:${profileId}`;
    return this.activityProfiles.get(key) || null;
  }

  /**
   * Store agent profile
   */
  async putAgentProfile(profile: XAPIAgentProfile): Promise<void> {
    const key = `${profile.agent}:${profile.profileId}`;
    const etag = this.generateETag(profile.content);

    const storedProfile: XAPIAgentProfile = {
      ...profile,
      etag,
      updated: new Date()
    };

    this.agentProfiles.set(key, storedProfile);
    this.emit('agentProfileStored', storedProfile);
  }

  /**
   * Get agent profile
   */
  async getAgentProfile(
    agent: string,
    profileId: string
  ): Promise<XAPIAgentProfile | null> {
    const key = `${agent}:${profileId}`;
    return this.agentProfiles.get(key) || null;
  }

  /**
   * Generate xAPI statement for common learning activities
   */
  generateStatement(
    actorId: string,
    actorName: string,
    verbId: string,
    verbDisplay: string,
    objectId: string,
    objectName: string,
    result?: Partial<XAPIResult>,
    context?: Partial<XAPIContext>
  ): XAPIStatement {
    return {
      actor: {
        objectType: 'Agent',
        name: actorName,
        account: {
          homePage: process.env.APP_URL || 'http://localhost:3000',
          name: actorId
        }
      },
      verb: {
        id: verbId,
        display: { 'en-US': verbDisplay }
      },
      object: {
        objectType: 'Activity',
        id: objectId,
        definition: {
          name: { 'en-US': objectName }
        }
      },
      result,
      context,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get analytics from stored statements
   */
  async getAnalytics(filters?: {
    activityId?: string;
    agentId?: string;
    verbId?: string;
    since?: Date;
    until?: Date;
  }): Promise<{
    totalStatements: number;
    uniqueActors: number;
    uniqueActivities: number;
    verbCounts: { [verbId: string]: number };
    completionRate: number;
    averageScore: number;
  }> {
    let statements = Array.from(this.statements.values());

    // Apply filters
    if (filters?.activityId) {
      statements = statements.filter(s =>
        s.object.objectType === 'Activity' && s.object.id === filters.activityId
      );
    }

    if (filters?.verbId) {
      statements = statements.filter(s => s.verb.id === filters.verbId);
    }

    if (filters?.since) {
      statements = statements.filter(s => new Date(s.stored!) >= filters.since!);
    }

    if (filters?.until) {
      statements = statements.filter(s => new Date(s.stored!) <= filters.until!);
    }

    // Calculate analytics
    const uniqueActors = new Set(statements.map(s => JSON.stringify(s.actor))).size;
    const uniqueActivities = new Set(
      statements
        .filter(s => s.object.objectType === 'Activity')
        .map(s => s.object.id)
    ).size;

    const verbCounts: { [verbId: string]: number } = {};
    statements.forEach(s => {
      verbCounts[s.verb.id] = (verbCounts[s.verb.id] || 0) + 1;
    });

    const completedStatements = statements.filter(
      s => s.result?.completion === true
    );
    const completionRate = statements.length > 0
      ? completedStatements.length / statements.length
      : 0;

    const statementsWithScores = statements.filter(
      s => s.result?.score?.scaled !== undefined
    );
    const averageScore = statementsWithScores.length > 0
      ? statementsWithScores.reduce((sum, s) => sum + (s.result!.score!.scaled || 0), 0) /
        statementsWithScores.length
      : 0;

    return {
      totalStatements: statements.length,
      uniqueActors,
      uniqueActivities,
      verbCounts,
      completionRate,
      averageScore
    };
  }

  // Private helper methods

  private validateStatement(statement: XAPIStatement): void {
    if (!statement.actor) {
      throw new Error('Statement must have an actor');
    }
    if (!statement.verb || !statement.verb.id) {
      throw new Error('Statement must have a verb with an id');
    }
    if (!statement.object) {
      throw new Error('Statement must have an object');
    }
  }

  private agentMatches(actor: XAPIActor, filter: XAPIActor): boolean {
    if (filter.mbox && actor.mbox === filter.mbox) return true;
    if (filter.openid && actor.openid === filter.openid) return true;
    if (filter.account &&
        actor.account?.homePage === filter.account.homePage &&
        actor.account?.name === filter.account.name) {
      return true;
    }
    return false;
  }

  private canonicalizeStatement(statement: XAPIStatement): XAPIStatement {
    // Implement canonical format transformation
    // For simplicity, returning as-is
    return statement;
  }

  private generateMoreURL(query: StatementQuery, offset: number): string {
    // Generate URL for pagination
    return `/xapi/statements/more?offset=${offset}`;
  }

  private generateStateKey(
    activityId: string,
    agent: string,
    stateId: string,
    registration?: string
  ): string {
    return `${activityId}:${agent}:${stateId}:${registration || 'none'}`;
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }

  private generateETag(content: any): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(content));
    return hash.digest('hex');
  }
}

export const lrs = new LearningRecordStore();
