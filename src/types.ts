export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type LearningStyle = 'hands-on-projects' | 'video-first' | 'academic-papers' | 'interactive-code' | 'case-studies' | 'balanced';

export type LearningPace = 'steady' | 'accelerated' | 'intensive';

export type BudgetPreference = 'free-only' | 'open-and-paid' | 'cert-focused';

export type GapSeverity = 'critical' | 'moderate' | 'minor' | 'mastered';

export type StepStatus = 'locked' | 'up_next' | 'in_progress' | 'completed';

export interface UserSkill {
  skill: string;
  level: number; // 1 to 5
}

export interface UserProfile {
  name: string;
  currentRole: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  domainsOfInterests: string[];
  knownSkills: UserSkill[];
  weeklyCommitmentHours: number;
  learningStyle: LearningStyle;
  learningPace: LearningPace;
  preferredBudget: BudgetPreference;
  completedCourses: string[];
  learningGoalsText: string;
}

export interface SkillGapAnalysis {
  skill: string;
  category: string;
  currentProficiency: number; // 0 - 100
  targetProficiency: number; // 0 - 100
  gapSeverity: GapSeverity;
  importance: string;
  recommendedFocus: string;
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  type: 'course' | 'project' | 'article' | 'video' | 'interactive' | 'assessment' | 'book';
  url: string;
  duration: string;
  cost: 'Free' | 'Paid' | 'Audit Free' | string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  skillsCovered: string[];
  aiRecommendationRationale: string;
}

export interface MilestoneQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  shortSummary: string;
  detailedDescription: string;
  phaseIndex: number;
  phaseName: string;
  estimatedHours: number;
  order: number;
  prerequisites: string[];
  skillsAcquired: string[];
  deliverable: string;
  status: StepStatus;
  userNotes: string;
  completedAt?: string;
  reasoning?: string;
  aiWhyRecommended: string;
  aiTips: string[];
  resources: LearningResource[];
  assessment: {
    title: string;
    questions: MilestoneQuizQuestion[];
    passed?: boolean;
    score?: number;
  };
}

export interface RoadmapPhase {
  phaseIndex: number;
  title: string;
  description: string;
  estimatedHours: number;
}

export interface LearningRoadmap {
  id: string;
  title: string;
  summary: string;
  targetRole: string;
  totalEstimatedWeeks: number;
  totalEstimatedHours: number;
  difficulty: string;
  aiPersonalizationNotes: string;
  skillGaps: SkillGapAnalysis[];
  phases: RoadmapPhase[];
  steps: RoadmapStep[];
  createdAt: string;
  lastAdaptedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  extractedProfileUpdates?: Partial<UserProfile>;
}

export interface CareerPathPreset {
  id: string;
  title: string;
  category: string;
  icon: string;
  tagline: string;
  targetRole: string;
  defaultProfile: Partial<UserProfile>;
  estimatedWeeks: number;
  skillsHighlighted: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleTitle: string;
  plan: 'Starter' | 'Pro Architect' | 'Team & Org';
  weeklyHours: number;
  streakDays: number;
  createdAt: string;
}

export interface OnboardingActionItem {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel: string;
  targetTab: 'roadmap' | 'dashboard' | 'profile' | 'chat' | 'resources';
  highlight?: boolean;
}

export interface OnboardingStatus {
  items: OnboardingActionItem[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}
