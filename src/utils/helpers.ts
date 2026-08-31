import {
  LearningRoadmap,
  RoadmapStep,
  UserProfile,
  ChatMessage,
  OnboardingActionItem,
  OnboardingStatus,
} from "../types";

export function calculateRoadmapStats(roadmap: LearningRoadmap | null) {
  if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) {
    return {
      totalSteps: 0,
      completedSteps: 0,
      inProgressSteps: 0,
      lockedSteps: 0,
      percentComplete: 0,
      completedHours: 0,
      totalHours: 0,
      passedQuizzes: 0,
    };
  }

  const totalSteps = roadmap.steps.length;
  const completedSteps = roadmap.steps.filter((s) => s.status === "completed").length;
  const inProgressSteps = roadmap.steps.filter((s) => s.status === "in_progress").length;
  const lockedSteps = roadmap.steps.filter((s) => s.status === "locked").length;

  const totalHours = roadmap.steps.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);
  const completedHours = roadmap.steps
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + (s.estimatedHours || 0), 0);

  const passedQuizzes = roadmap.steps.filter((s) => s.assessment?.passed).length;
  const percentComplete = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    totalSteps,
    completedSteps,
    inProgressSteps,
    lockedSteps,
    percentComplete,
    completedHours,
    totalHours: totalHours || roadmap.totalEstimatedHours || 0,
    passedQuizzes,
  };
}

export function calculateOnboardingStatus(
  profile: UserProfile,
  roadmap: LearningRoadmap | null,
  chatHistory: ChatMessage[] = [],
  hasVisitedRadar: boolean = false,
  manualOverrides: Record<string, boolean> = {},
  hasCustomizedProfile: boolean = true
): OnboardingStatus {
  const stats = calculateRoadmapStats(roadmap);
  const currentActiveStep = roadmap?.steps.find(
    (s) => s.status === "in_progress" || s.status === "up_next"
  );
  const hasChatted = chatHistory.some((m) => m.sender === "user");

  const isProfileDone =
    manualOverrides["profile_setup"] !== undefined
      ? manualOverrides["profile_setup"]
      : Boolean(hasCustomizedProfile && roadmap !== null);

  const isRadarDone =
    manualOverrides["radar_check"] !== undefined
      ? manualOverrides["radar_check"]
      : Boolean(hasVisitedRadar && roadmap !== null && roadmap.skillGaps && roadmap.skillGaps.length > 0);

  const isDeliverableDone =
    manualOverrides["active_deliverable"] !== undefined
      ? manualOverrides["active_deliverable"]
      : stats.completedSteps > 0;

  const isDiagnosticDone =
    manualOverrides["diagnostic_test"] !== undefined
      ? manualOverrides["diagnostic_test"]
      : stats.passedQuizzes > 0;

  const isChatDone =
    manualOverrides["ai_calibration"] !== undefined
      ? manualOverrides["ai_calibration"]
      : hasChatted;

  const items: OnboardingActionItem[] = [
    {
      id: "profile_setup",
      stepNumber: "01",
      title: isProfileDone
        ? "Target Role & Skill Baseline Configured"
        : "Configure Target Role & Skill Baseline",
      description: isProfileDone
        ? `Targeting: ${profile.targetRole || "Engineer"} • Committed: ${profile.weeklyCommitmentHours} hrs/week`
        : `Targeting: ${profile.targetRole || "Engineer"}. Personalize your known skills & weekly hours in the Profile Engine.`,
      isCompleted: isProfileDone,
      actionLabel: isProfileDone ? "Edit Profile" : "Configure Profile",
      targetTab: "profile",
      highlight: !isProfileDone,
    },
    {
      id: "radar_check",
      stepNumber: "02",
      title: "Inspect Your Skill Gap Radar & Critical Deltas",
      description: "Review mathematical competency gaps calculated across your target domains.",
      isCompleted: isRadarDone,
      actionLabel: "View Radar",
      targetTab: "dashboard",
      highlight: isProfileDone && !isRadarDone,
    },
    {
      id: "active_deliverable",
      stepNumber: "03",
      title: `Build Deliverable: ${currentActiveStep?.title || "Foundational Milestone"}`,
      description: currentActiveStep?.deliverable || "Implement hands-on code project and review curated labs.",
      isCompleted: isDeliverableDone,
      actionLabel: "Start Milestone",
      targetTab: "roadmap",
      highlight: isProfileDone && isRadarDone && !isDeliverableDone && Boolean(roadmap),
    },
    {
      id: "diagnostic_test",
      stepNumber: "04",
      title: "Pass Milestone Diagnostic Assessment",
      description: "Complete the 3-question conceptual quiz to verify mastery and unlock Stage 2.",
      isCompleted: isDiagnosticDone,
      actionLabel: "Take Assessment",
      targetTab: "roadmap",
      highlight: isDeliverableDone && !isDiagnosticDone,
    },
    {
      id: "ai_calibration",
      stepNumber: "05",
      title: "Calibrate Path or Chat with Aura (AI Advisor)",
      description: "Adapt roadmap pacing, ask architecture questions, or simulate interview rounds.",
      isCompleted: isChatDone,
      actionLabel: "Ask Aura",
      targetTab: "chat",
      highlight: isDiagnosticDone && !isChatDone,
    },
  ];

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    items,
    completedCount,
    totalCount,
    progressPercent,
  };
}

export function getNextRecommendedSteps(roadmap: LearningRoadmap | null, count: number = 3): RoadmapStep[] {
  if (!roadmap || !roadmap.steps) return [];

  // Return currently in_progress or up_next steps first
  const active = roadmap.steps.filter((s) => s.status === "in_progress" || s.status === "up_next");
  if (active.length >= count) return active.slice(0, count);

  // If not enough, append the first available locked step
  const locked = roadmap.steps.filter((s) => s.status === "locked");
  return [...active, ...locked].slice(0, count);
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} mins`;
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}
