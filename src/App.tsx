import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { LandingPageView } from "./components/LandingPageView";
import { LearnerProfileEngine } from "./components/LearnerProfileEngine";
import { RoadmapGraphView } from "./components/RoadmapGraphView";
import { DashboardView } from "./components/DashboardView";
import { ConversationalAdvisor } from "./components/ConversationalAdvisor";
import { ResourceExplorerView } from "./components/ResourceExplorerView";
import { MilestoneLearningView } from "./components/MilestoneLearningView";
import { AdaptRoadmapModal } from "./components/AdaptRoadmapModal";
import { PresetsModal } from "./components/PresetsModal";
import { ExportRoadmapModal } from "./components/ExportRoadmapModal";
import { CertificateModal } from "./components/CertificateModal";
import { AuthModal } from "./components/AuthModal";
import { NewUserWelcomeModal } from "./components/NewUserWelcomeModal";
import { ProfileCompletionBanner } from "./components/ProfileCompletionBanner";
import { NextStepsGuide } from "./components/NextStepsGuide";
import { SplashScreen } from "./components/SplashScreen";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { DEFAULT_USER_PROFILE } from "./data/presets";
import { apiService } from "./services/apiService";
import { calculateOnboardingStatus } from "./utils/helpers";
import {
  UserProfile,
  LearningRoadmap,
  RoadmapStep,
  ChatMessage,
  CareerPathPreset,
  AuthUser,
} from "./types";

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash screen on first visit in the session
    const hasSeenSplash = sessionStorage.getItem("auralearn_splash_shown");
    return !hasSeenSplash;
  });

  // Authentication state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("auralearn_auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    "landing" | "roadmap" | "dashboard" | "profile" | "chat" | "resources"
  >(() => {
    const savedUser = localStorage.getItem("auralearn_auth_user");
    return savedUser ? "roadmap" : "landing";
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("auralearn_profile") || localStorage.getItem("pathforge_profile");
    return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
  });

  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(() => {
    const saved = localStorage.getItem("auralearn_roadmap") || localStorage.getItem("pathforge_roadmap");
    return saved ? JSON.parse(saved) : null;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("auralearn_chat") || localStorage.getItem("pathforge_chat");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "msg-welcome",
        sender: "assistant",
        text: `### 👋 Welcome to AuraLearn!

I am **Aura**, your personalized AI Learning Architect. I've designed an adaptive learning roadmap tailored specifically for your transition to **${DEFAULT_USER_PROFILE.targetRole}**.

Here is what you can do:
1. 🧭 **Explore your Roadmap**: View sequentially sequenced milestones, prerequisite graphs, and deliverables.
2. 📊 **Inspect Skill Gaps**: Check your diagnostic radar comparing current baseline vs target proficiency.
3. 💬 **Ask & Adapt**: Ask me "Why did you recommend this step?" or type "I only have 5h/week" to recalibrate anytime.

Where would you like to start?`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: "🧭 View Roadmap Milestones", action: "tab_roadmap" },
          { label: "📊 Check Skill Gap Diagnostic", action: "tab_dashboard" },
          { label: "🎯 Why was Step 1 Recommended?", action: "explain_step_1" },
        ],
      },
    ];
  });

  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // New user onboarding and profile customization states
  const [hasCustomizedProfile, setHasCustomizedProfile] = useState<boolean>(() => {
    return localStorage.getItem("auralearn_has_customized_profile") === "true";
  });
  const [isNewUserWelcomeOpen, setIsNewUserWelcomeOpen] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(true);

  // Onboarding action telemetry & interactive override state
  const [hasVisitedRadar, setHasVisitedRadar] = useState<boolean>(() => {
    return localStorage.getItem("auralearn_visited_radar") === "true";
  });
  const [manualActionOverrides, setManualActionOverrides] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("auralearn_manual_actions");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (activeTab === "dashboard") {
      setHasVisitedRadar(true);
      localStorage.setItem("auralearn_visited_radar", "true");
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("auralearn_manual_actions", JSON.stringify(manualActionOverrides));
  }, [manualActionOverrides]);

  const onboardingStatus = useMemo(() => {
    return calculateOnboardingStatus(
      profile,
      roadmap,
      chatHistory,
      hasVisitedRadar,
      manualActionOverrides,
      hasCustomizedProfile
    );
  }, [profile, roadmap, chatHistory, hasVisitedRadar, manualActionOverrides, hasCustomizedProfile]);

  const handleToggleOnboardingAction = (actionId: string) => {
    setManualActionOverrides((prev) => {
      const current = onboardingStatus.items.find((i) => i.id === actionId)?.isCompleted ?? false;
      return {
        ...prev,
        [actionId]: !current,
      };
    });
  };

  // Sync to local storage
  useEffect(() => {
    if (authUser) {
      localStorage.setItem("auralearn_auth_user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("auralearn_auth_user");
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem("auralearn_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (roadmap) {
      localStorage.setItem("auralearn_roadmap", JSON.stringify(roadmap));
    }
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem("auralearn_chat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Initial load: auto-generate roadmap only if a user is authenticated
  // and no roadmap exists yet — prevents firing for fresh registrations or
  // unauthenticated visitors who haven't set up a profile yet.
  useEffect(() => {
    const savedUser = localStorage.getItem("auralearn_auth_user");
    if (!roadmap && savedUser) {
      handleGenerateRoadmap(profile);
    }
  }, []);

  // Handle Login / Registration Success
  const handleLoginSuccess = (user: AuthUser, isNewRegistration: boolean = false) => {
    setAuthUser(user);
    setIsAuthModalOpen(false);
    setActiveTab("roadmap");

    if (isNewRegistration) {
      // ── New Registration: wipe ALL stale data ────────────────────────────
      // Clear every key that could hold old "Alex Morgan" / demo session data
      const keysToWipe = [
        "auralearn_profile",
        "auralearn_roadmap",
        "auralearn_chat",
        "pathforge_profile",
        "pathforge_roadmap",
        "pathforge_chat",
        "auralearn_has_customized_profile",
        "auralearn_visited_radar",
        "auralearn_manual_actions",
      ];
      keysToWipe.forEach((k) => localStorage.removeItem(k));

      // Build a fresh profile seeded with real auth user data
      const freshProfile: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        name: user.name,
        targetRole: user.roleTitle || DEFAULT_USER_PROFILE.targetRole,
        weeklyCommitmentHours: user.weeklyHours || 10,
        // Clear old skills so new user isn't shown Alex Morgan's skills
        knownSkills: [],
        completedCourses: [],
        learningGoalsText: "",
      };
      setProfile(freshProfile);
      setRoadmap(null);
      setHasCustomizedProfile(false);
      setHasVisitedRadar(false);
      setManualActionOverrides({});

      // Reset chat with a personalized welcome for the real user
      setChatHistory([
        {
          id: "msg-welcome",
          sender: "assistant",
          text: `### 👋 Welcome to AuraLearn, ${user.name}!\n\nI'm **Aura**, your AI Learning Architect. I'll build you a personalized roadmap toward **${user.roleTitle || "your target role"}**.\n\nLet's start by customizing your profile — fill in your background, known skills, and weekly availability so I can generate the most accurate learning path for you.\n\nWhat would you like to do first?`,
          timestamp: new Date().toISOString(),
          suggestedActions: [
            { label: "🎯 Set up my full profile", action: "tab_profile" },
            { label: "⚡ Quick-generate roadmap now", action: "tab_roadmap" },
          ],
        },
      ]);

      setIsNewUserWelcomeOpen(true);
    } else {
      // ── Returning Sign-In: merge auth data into existing profile ─────────
      const updatedProfile: UserProfile = {
        ...profile,
        name: user.name || profile.name,
        targetRole: user.roleTitle || profile.targetRole,
        weeklyCommitmentHours: user.weeklyHours || profile.weeklyCommitmentHours,
      };
      setProfile(updatedProfile);

      if (!hasCustomizedProfile) {
        setIsNewUserWelcomeOpen(true);
      }
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    setAuthUser(null);
    setActiveTab("landing");
    setIsMobileSidebarOpen(false);
  };

  // Open Auth Modal helper
  const handleOpenAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Generate roadmap via API
  const handleGenerateRoadmap = async (userProfile: UserProfile) => {
    setIsLoadingRoadmap(true);
    try {
      const data = await apiService.generateRoadmap(userProfile);
      if (data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error("[App] Failed to generate roadmap:", err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Adapt roadmap with prompt
  const handleAdaptRoadmap = async (feedback: string) => {
    if (!roadmap) return;
    setIsLoadingRoadmap(true);
    try {
      const data = await apiService.adaptRoadmap(roadmap, feedback, profile);
      if (data.roadmap) {
        setRoadmap(data.roadmap);
        // Add chat confirmation
        setChatHistory((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "assistant",
            text: `✅ **Roadmap Calibrated**: I've adapted your learning path according to: *"${feedback}"*.\n\nAll prerequisites, timeline estimates, and milestones have been re-optimized.`,
            timestamp: new Date().toISOString(),
            suggestedActions: [
              { label: "View Updated Roadmap", action: "tab_roadmap" },
            ],
          },
        ]);
      }
    } catch (err) {
      console.error("[App] Failed to adapt roadmap:", err);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Send message in Chat Advisor
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const data = await apiService.sendChatMessage(
        text,
        profile,
        roadmap,
        [...chatHistory, userMsg]
      );
      const reply = data.reply;

      if (reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: reply.text || "I understand your goal. Let's optimize your path.",
          timestamp: new Date().toISOString(),
          suggestedActions: reply.suggestedActions,
          extractedProfileUpdates: reply.extractedProfileUpdates,
        };

        setChatHistory((prev) => [...prev, assistantMsg]);

        // If AI recommended profile updates, merge them
        if (reply.extractedProfileUpdates) {
          setProfile((prev) => ({ ...prev, ...reply.extractedProfileUpdates }));
        }
      }
    } catch (err) {
      console.error("[App] Chat error:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "I'm ready to help. Please let me know what questions you have about your roadmap.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Toggle step completion and auto-unlock next step
  const handleToggleStepComplete = (stepId: string) => {
    if (!roadmap) return;
    const currentSteps = [...roadmap.steps];
    const targetIdx = currentSteps.findIndex((s) => s.id === stepId);
    if (targetIdx === -1) return;

    const currentStatus = currentSteps[targetIdx].status;
    const isNowCompleted = currentStatus !== "completed";

    currentSteps[targetIdx] = {
      ...currentSteps[targetIdx],
      status: isNowCompleted ? "completed" : "in_progress",
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };

    // If completed, automatically unlock next locked step if prerequisites are fulfilled
    if (isNowCompleted && targetIdx + 1 < currentSteps.length) {
      if (currentSteps[targetIdx + 1].status === "locked" || currentSteps[targetIdx + 1].status === "up_next") {
        currentSteps[targetIdx + 1] = {
          ...currentSteps[targetIdx + 1],
          status: "in_progress",
        };
      }
    }

    const updatedRoadmap = { ...roadmap, steps: currentSteps };
    setRoadmap(updatedRoadmap);

    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(currentSteps[targetIdx]);
    }
  };

  // Save notes for a step
  const handleSaveStepNotes = (stepId: string, notes: string) => {
    if (!roadmap) return;
    const updatedSteps = roadmap.steps.map((s) =>
      s.id === stepId ? { ...s, userNotes: notes } : s
    );
    setRoadmap({ ...roadmap, steps: updatedSteps });
  };

  // Quiz submission callback
  const handleQuizSubmit = (stepId: string, score: number, passed: boolean) => {
    if (!roadmap) return;
    const updatedSteps = roadmap.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          assessment: {
            ...s.assessment,
            passed,
            score,
          },
          status: passed ? ("completed" as const) : s.status,
        };
      }
      return s;
    });

    setRoadmap({ ...roadmap, steps: updatedSteps });

    // If passed and was selected, update selected step modal
    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep((prev) =>
        prev
          ? {
              ...prev,
              assessment: { ...prev.assessment, passed, score },
              status: passed ? "completed" : prev.status,
            }
          : null
      );
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: CareerPathPreset) => {
    const updatedProfile: UserProfile = {
      ...profile,
      ...preset.defaultProfile,
      name: profile.name || authUser?.name || "Learner",
      targetRole: preset.targetRole,
    };
    setProfile(updatedProfile);
    handleGenerateRoadmap(updatedProfile);
    if (!authUser) {
      handleOpenAuthModal("signup");
    } else {
      setActiveTab("roadmap");
    }
  };

  // Execute interactive AI chat actions
  const handleExecuteChatAction = (action: string, payload?: any) => {
    if (action === "tab_roadmap") {
      setActiveTab("roadmap");
    } else if (action === "tab_dashboard") {
      setActiveTab("dashboard");
    } else if (action === "tab_resources") {
      setActiveTab("resources");
    } else if (action === "tab_profile") {
      setActiveTab("profile");
    } else if (action === "generate_roadmap") {
      handleGenerateRoadmap(profile);
    } else if (action === "browse_presets") {
      setIsPresetsModalOpen(true);
    } else if (action === "view_milestone") {
      const step = roadmap?.steps.find((s) => s.id === payload?.stepId);
      if (step) setSelectedStep(step);
      else setActiveTab("roadmap");
    } else if (action === "adapt_hours") {
      const hours = payload?.hours || 5;
      const updated = { ...profile, weeklyCommitmentHours: hours };
      setProfile(updated);
      handleAdaptRoadmap(`Recalibrate and condense my roadmap for ${hours} hours per week.`);
    } else if (action === "add_topic") {
      const topic = payload?.topic || "Advanced Systems";
      handleAdaptRoadmap(`Add a dedicated focus and milestone on ${topic}.`);
    } else if (action === "explain_step_1") {
      handleSendMessage("Can you explain in detail why Step 1 was recommended for my specific background and what foundational skill gap it closes?");
    }
  };

  // Show sidebar only when in application workspace (NOT on landing page) AND user is logged in
  const shouldShowSidebar = activeTab !== "landing" && authUser !== null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Superb Flashscreen Component */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
            sessionStorage.setItem("auralearn_splash_shown", "true");
          }}
        />
      )}

      {/* SaaS Vertical Sidebar - Visible ONLY in the main app when the user is logged in */}
      {shouldShowSidebar && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedStep(null);
            setActiveTab(tab);
          }}
          roadmap={roadmap}
          profile={profile}
          authUser={authUser}
          onboardingStatus={onboardingStatus}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenNewPathModal={() => setIsPresetsModalOpen(true)}
          onOpenAuthModal={() => handleOpenAuthModal("signin")}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-clip">
        {/* Navigation Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedStep(null);
            setActiveTab(tab);
          }}
          roadmap={roadmap}
          profile={profile}
          authUser={authUser}
          selectedStep={selectedStep}
          onClearSelectedStep={() => setSelectedStep(null)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenNewPathModal={() => setIsPresetsModalOpen(true)}
          onOpenAuthModal={handleOpenAuthModal}
          onSignOut={handleSignOut}
        />

        {/* PWA Install Notification & Offline Banner */}
        <PWAInstallBanner />

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col min-h-0">
          {activeTab === "landing" && (
            <LandingPageView
              onGetStarted={() => {
                if (authUser) {
                  setActiveTab("roadmap");
                } else {
                  handleOpenAuthModal("signup");
                }
              }}
              onSelectPreset={handleSelectPreset}
              onNavigateToTab={(tab) => {
                if (!authUser && tab !== "landing") {
                  handleOpenAuthModal("signin");
                } else {
                  setSelectedStep(null);
                  setActiveTab(tab);
                }
              }}
              roadmap={roadmap}
              onOpenAuth={handleOpenAuthModal}
              authUser={authUser}
            />
          )}

          {activeTab !== "landing" && selectedStep && (
            <MilestoneLearningView
              step={selectedStep}
              roadmap={roadmap}
              onBack={() => setSelectedStep(null)}
              onSelectStep={(step) => setSelectedStep(step)}
              onToggleComplete={handleToggleStepComplete}
              onSaveNotes={handleSaveStepNotes}
              onQuizSubmit={handleQuizSubmit}
              onAskAIAboutStep={(title) => {
                setSelectedStep(null);
                setActiveTab("chat");
                handleSendMessage(`Can you explain the key concepts and recommended study strategy for "${title}" in detail?`);
              }}
            />
          )}

          {/* Full-Height & Full-Width Native Chat Experience */}
          {activeTab === "chat" && !selectedStep && (
            <ConversationalAdvisor
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingChat}
              profile={profile}
              roadmap={roadmap}
              onExecuteAction={handleExecuteChatAction}
            />
          )}

          {/* Standard Dashboard & Profile Views */}
          {activeTab !== "landing" && activeTab !== "chat" && !selectedStep && (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {/* Reminder banner if default profile is currently loaded */}
              {!hasCustomizedProfile && showProfileBanner && (
                <ProfileCompletionBanner
                  profile={profile}
                  onOpenProfileTab={() => {
                    setSelectedStep(null);
                    setActiveTab("profile");
                  }}
                  onOpenWelcomeModal={() => setIsNewUserWelcomeOpen(true)}
                  onDismiss={() => setShowProfileBanner(false)}
                />
              )}

              {/* "What You Should Do Next" Guided Action Hub */}
              <NextStepsGuide
                roadmap={roadmap}
                profile={profile}
                authUser={authUser}
                onboardingStatus={onboardingStatus}
                onToggleAction={handleToggleOnboardingAction}
                onNavigateToTab={(tab) => {
                  setSelectedStep(null);
                  setActiveTab(tab);
                }}
                onOpenCalibrate={() => setIsAdaptModalOpen(true)}
              />

              {/* Specific View Containers */}
              {activeTab === "roadmap" && (
                <RoadmapGraphView
                  roadmap={roadmap}
                  onSelectStep={(step) => setSelectedStep(step)}
                  onToggleComplete={handleToggleStepComplete}
                  onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
                />
              )}

              {activeTab === "dashboard" && (
                <DashboardView
                  roadmap={roadmap}
                  profile={profile}
                  authUser={authUser}
                  onSelectStep={(step) => setSelectedStep(step)}
                  onToggleComplete={handleToggleStepComplete}
                  onNavigateToRoadmap={() => setActiveTab("roadmap")}
                  onNavigateToChat={() => setActiveTab("chat")}
                  onOpenCertificate={() => setIsCertModalOpen(true)}
                />
              )}

              {activeTab === "resources" && (
                <ResourceExplorerView roadmap={roadmap} />
              )}

              {activeTab === "profile" && (
                <LearnerProfileEngine
                  profile={profile}
                  onUpdateProfile={(updated) => {
                    setProfile(updated);
                    setHasCustomizedProfile(true);
                    localStorage.setItem("auralearn_has_customized_profile", "true");
                  }}
                  onGenerateRoadmap={async (updated) => {
                    setHasCustomizedProfile(true);
                    localStorage.setItem("auralearn_has_customized_profile", "true");
                    await handleGenerateRoadmap(updated);
                  }}
                  isLoading={isLoadingRoadmap}
                  onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* New User Profile Completion / Welcome Modal */}
      <NewUserWelcomeModal
        key={`welcome-${profile.name}-${profile.targetRole}`}
        isOpen={isNewUserWelcomeOpen}
        onClose={() => setIsNewUserWelcomeOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          setHasCustomizedProfile(true);
          localStorage.setItem("auralearn_has_customized_profile", "true");
        }}
        onGenerateRoadmap={async (updated) => {
          setHasCustomizedProfile(true);
          localStorage.setItem("auralearn_has_customized_profile", "true");
          await handleGenerateRoadmap(updated);
        }}
        onNavigateToFullProfile={() => {
          setSelectedStep(null);
          setActiveTab("profile");
        }}
      />

      {/* Auth Modal (Real SaaS Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      <AdaptRoadmapModal
        isOpen={isAdaptModalOpen}
        onClose={() => setIsAdaptModalOpen(false)}
        roadmap={roadmap}
        onAdaptRoadmap={handleAdaptRoadmap}
        isLoading={isLoadingRoadmap}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <ExportRoadmapModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        roadmap={roadmap}
        weeklyCommitmentHours={profile.weeklyCommitmentHours}
      />

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        roadmap={roadmap}
        profile={profile}
      />
    </div>
  );
}

