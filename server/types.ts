export interface BackendUserProfile {
  name?: string;
  currentRole?: string;
  targetRole?: string;
  experienceLevel?: string;
  domainsOfInterests?: string[];
  knownSkills?: Array<{ skill: string; level: number }>;
  weeklyCommitmentHours?: number;
  learningStyle?: string;
  learningPace?: string;
  preferredBudget?: string;
  completedCourses?: string[];
  learningGoalsText?: string;
}

export interface GenerateRoadmapRequest {
  profile: BackendUserProfile;
  conversationHistory?: any[];
}

export interface AdaptRoadmapRequest {
  currentRoadmap: any;
  userFeedback: string;
  profile: BackendUserProfile;
}

export interface ChatAdvisorRequest {
  message: string;
  profile: BackendUserProfile;
  currentRoadmap?: any;
  chatHistory?: any[];
}

export interface StepDeepdiveRequest {
  stepTitle: string;
  stepSkills?: string[];
  userLevel?: string;
}
