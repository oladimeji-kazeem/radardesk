export type UserRole = 'Writer' | 'Editor' | 'Senior Editor' | 'Quality Checker' | 'Publisher' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
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

export interface WorkflowConfig {
  aiScoreThreshold: number;
  maxReviewCycles: number;
  claimDurationMinutes: number;
  categories: string[];
  rejectionReasons: string[];
}

export interface WebAnalytics {
  pageViews: number;
  submissionsCount: number;
  approvalsCount: number;
  escalationsCount: number;
  avgTimeSeconds: number;
  activeUsers: number;
}
