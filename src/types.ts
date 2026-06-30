export type UserRole = 'Writer' | 'Editor' | 'Senior Editor' | 'Quality Checker' | 'Publisher' | 'Admin' | 'Visitor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  approved?: boolean;
}

export interface ReviewReason {
  id: string;
  label: string;
}

export type ArticleStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Minor Revision'
  | 'Rejected'
  | 'Escalated'
  | 'Approved'
  | 'Banned'
  | 'Published';

export interface ArticleRevision {
  version: number;
  title: string;
  content: string;
  updatedAt: string;
  score: number;
}

export interface AIPreValidation {
  score: number;
  grammar: string;
  readability: string;
  sourcesFound: boolean;
  sourcesList: string[];
  factualInconsistencies: string[];
  styleGuideViolations: string[];
  headlineSuggestions: string[];
  isDuplicate: boolean;
  duplicateScore: number;
  semanticSimilarityToPrevious: number; // For detecting resubmission without changes
  improvementSuggestions?: string[];     // Automated suggestions on how the writer can improve the post
  editorRating?: {                       // Feedback rating from editors on the AI precheck quality
    score: number;                       // 1-5 star rating
    comments?: string;                   // Qualitative comment/rating details
    ratedByName?: string;                // Name of reviewer who checked the AI validation
    ratedAt?: string;                    // ISO timestamp of rating
  };
}

export interface Article {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  writerId: string;
  writerName: string;
  editorId: string | null;     // Only one editor can handle a review
  editorName: string | null;
  topicId: string | null;
  score: number;               // 0 - 100
  reviewCycles: number;        // Max 2, then auto-escalates to Senior Editor
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string;
  revisions: ArticleRevision[];
  aiValidation: AIPreValidation | null;
  comments: Comment[];
  history: AuditLog[];
  categories?: string[];
  sections?: string[];
  pages?: string[];
  headerImage?: string;
  excerpt?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  details: string;
}

export type TopicStatus = 'Proposed' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Released';

export interface TopicModerationEvent {
  action: 'Proposed' | 'Approved' | 'Rejected' | 'Expired' | 'Released';
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  reasons?: string[];
  comments?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TopicStatus;
  submitterId: string;
  submitterName: string;
  claimedById: string | null;
  claimedByName: string | null;
  claimedAt: string | null;
  durationMinutes: number;   // E.g., 5-60 mins for claims
  moderationHistory: TopicModerationEvent[];
  releasedCount: number;
}

export interface StakeholderTarget {
  userId: string;
  articlesTarget: number;
  scoreTarget: number;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  senderName: string;
  senderEmail: string;
  digestEnabled: boolean;
  digestFrequency: 'instantly' | 'daily' | 'weekly';
}

export interface AuthSettings {
  authType: 'password' | 'oauth2' | 'sso';
  clientId: string;
  clientSecret: string;
  enforceMfa: boolean;
  sessionTimeoutMinutes: number;
  allowedDomains: string[];
}

export interface RolePrivilege {
  role: UserRole;
  allowedActions: string[]; // e.g., 'propose_topic', 'claim_topic', 'submit_article', 'review_article', 'quality_audit', 'publish_live', 'manage_system'
}

export interface WorkflowConfig {
  aiScoreThreshold: number;
  maxReviewCycles: number;
  claimDurationMinutes: number;
  categories: string[];
  rejectionReasons: string[];
  stakeholderTargets?: StakeholderTarget[];
  emailSettings?: EmailSettings;
  authSettings?: AuthSettings;
  rolePrivileges?: RolePrivilege[];
}

export type SystemConfig = WorkflowConfig;


export interface WebAnalytics {
  pageViews: number;
  submissionsCount: number;
  approvalsCount: number;
  escalationsCount: number;
  avgTimeSeconds: number;
  activeUsers: number;
}

export interface SectorStat {
  id: string;
  sector: string;
  metricName: string;
  metricValue: string;
  metricUnit?: string;
  trend: 'up' | 'down' | 'stable';
  pulseStatus: 'Critical' | 'Nominal' | 'Active' | 'Steady' | 'Strategic';
  chartData: number[];
  updatedAt: string;
  subPage?: string;
}

export interface PortalDeal {
  id: string;
  origin: string;
  destination: string;
  price: string;
  expiration: string;
  sector: string;
  status: string;
  currency: string;
  createdAt: string;
}

export interface PortalContent {
  id: string;
  contentType: string; // 'video', 'newsletter', 'cta', 'hero'
  title: string;
  description: string;
  resourceUrl?: string;
  thumbnailUrl?: string;
  metadata?: any;
  categories: string[];
  sections: string[];
  pages: string[];
  active: boolean;
  createdAt: string;
}
