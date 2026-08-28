import {
  UserProfile,
  LearningRoadmap,
  ChatMessage,
} from "../types";

// ─────────────────────────────────────────────
// Existing response types
// ─────────────────────────────────────────────

export interface GenerateRoadmapResponse {
  success: boolean;
  roadmap?: LearningRoadmap;
  isFallback?: boolean;
  errorMessage?: string;
}

export interface AdaptRoadmapResponse {
  success: boolean;
  roadmap?: LearningRoadmap;
  isFallback?: boolean;
  adaptationSummary?: string;
  error?: string;
}

export interface ChatAdvisorResponse {
  success: boolean;
  reply?: {
    text: string;
    extractedProfileUpdates?: Partial<UserProfile>;
    suggestedActions?: Array<{
      label: string;
      action: string;
      payload?: any;
    }>;
  };
  isFallback?: boolean;
  error?: string;
}

export interface DeliverableReviewResult {
  score: number;
  status: "passed" | "needs_revision" | "exceptional";
  summary: string;
  rubricScores: {
    functionality: number;
    cleanliness: number;
    architecture: number;
    security: number;
  };
  strengths: string[];
  improvements: Array<{
    title: string;
    description: string;
    suggestedDiffOrSnippet?: string;
  }>;
  securityAndEdgeCases: string[];
  verdictText: string;
}

export interface ReviewDeliverableResponse {
  success: boolean;
  review?: DeliverableReviewResult;
  isFallback?: boolean;
  error?: string;
}

export interface StepDeepdiveResponse {
  success: boolean;
  deepdive?: {
    keyTakeaways: string[];
    challengeProject: {
      name: string;
      description: string;
      milestones: string[];
      techStack: string[];
    };
    productionPitfalls: string[];
    interviewQuestions: Array<{
      question: string;
      answer: string;
    }>;
  };
  isFallback?: boolean;
  error?: string;
}

// ─────────────────────────────────────────────
// Auth types
// ─────────────────────────────────────────────

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  plan: "Starter" | "Pro Architect" | "Team & Org";
  weeklyHours: number;
  streakDays: number;
  createdAt: string;
  emailVerified: boolean;
}

export interface AuthApiResponse {
  success: boolean;
  token?: string;
  user?: AuthUserData;
  isNewUser?: boolean;
  message?: string;
  error?: string;
  resetToken?: string;
}

// ─────────────────────────────────────────────
// Token helper (persists in localStorage)
// ─────────────────────────────────────────────
export const authToken = {
  get: (): string | null => localStorage.getItem("auralearn_token"),
  set: (t: string): void => { localStorage.setItem("auralearn_token", t); },
  clear: (): void => { localStorage.removeItem("auralearn_token"); },
};

// ─────────────────────────────────────────────
// API Service
// ─────────────────────────────────────────────
class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = authToken.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async postJson<T>(endpoint: string, payload: any, withAuth = false): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(withAuth ? this.getAuthHeaders() : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`[ApiService] Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // ── Auth Endpoints ──────────────────────────────────────────────

  /** Register a new account — sends verification OTP to email */
  async register(payload: {
    name: string;
    email: string;
    password: string;
    roleTitle?: string;
  }): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/register", payload);
  }

  /** Verify OTP (for registration, passwordless login, or password reset) */
  async verifyOtp(email: string, otp: string): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/verify-otp", { email, otp });
  }

  /** Sign in with email + password */
  async login(email: string, password: string): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/login", { email, password });
  }

  /** Send a magic/passwordless OTP to an existing account */
  async sendOtpLogin(email: string): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/send-otp-login", { email });
  }

  /** Send a password reset OTP */
  async sendOtpReset(email: string): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/send-otp-reset", { email });
  }

  /** Set a new password after OTP-based password reset flow */
  async resetPassword(resetToken: string, newPassword: string): Promise<AuthApiResponse> {
    return this.postJson<AuthApiResponse>("/api/auth/reset-password", { resetToken, newPassword });
  }

  /** Fetch the currently authenticated user via stored token */
  async getMe(): Promise<AuthApiResponse> {
    const token = authToken.get();
    if (!token) return { success: false, error: "No session token" };
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      return await res.json();
    } catch {
      return { success: false, error: "Session check failed" };
    }
  }

  /** Logout and clear local token */
  async logout(): Promise<void> {
    const token = authToken.get();
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    authToken.clear();
  }

  // ── Core App Endpoints ───────────────────────────────────────────

  /** Generates a new personalized learning roadmap based on learner profile */
  async generateRoadmap(
    profile: UserProfile,
    conversationHistory?: any[]
  ): Promise<GenerateRoadmapResponse> {
    return this.postJson<GenerateRoadmapResponse>("/api/generate-roadmap", {
      profile,
      conversationHistory,
    });
  }

  /** Adapts and recalibrates an existing roadmap based on feedback or constraints */
  async adaptRoadmap(
    currentRoadmap: LearningRoadmap,
    userFeedback: string,
    profile: UserProfile
  ): Promise<AdaptRoadmapResponse> {
    return this.postJson<AdaptRoadmapResponse>("/api/adapt-roadmap", {
      currentRoadmap,
      userFeedback,
      profile,
    });
  }

  /** Communicates with Aura, the AI Learning Advisor */
  async sendChatMessage(
    message: string,
    profile: UserProfile,
    currentRoadmap: LearningRoadmap | null,
    chatHistory: ChatMessage[]
  ): Promise<ChatAdvisorResponse> {
    return this.postJson<ChatAdvisorResponse>("/api/chat-advisor", {
      message,
      profile,
      currentRoadmap,
      chatHistory,
    });
  }

  /** Requests an advanced deep-dive and practice challenge for a milestone */
  async generateStepDeepdive(
    stepTitle: string,
    stepSkills?: string[],
    userLevel?: string
  ): Promise<StepDeepdiveResponse> {
    return this.postJson<StepDeepdiveResponse>("/api/generate-step-deepdive", {
      stepTitle,
      stepSkills,
      userLevel,
    });
  }

  /** Submits code for AI code review & rubric evaluation */
  async reviewDeliverable(payload: {
    stepTitle: string;
    deliverableSpec: string;
    skillsAcquired: string[];
    submissionCode: string;
    submissionNotes?: string;
    programmingLanguage?: string;
    userLevel?: string;
  }): Promise<ReviewDeliverableResponse> {
    return this.postJson<ReviewDeliverableResponse>("/api/review-deliverable", payload);
  }

  /** Performs server health check */
  async checkHealth(): Promise<{ status: string }> {
    const res = await fetch("/api/health");
    return res.json();
  }
}

export const apiService = new ApiService();
