import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

export const feedbackRouter = Router();

export interface FeedbackItem {
  id: string;
  name: string;
  roleTitle?: string;
  rating: number; // e.g. 4.8, 5.0
  comment: string;
  createdAt: string;
  status: "approved" | "internal_feedback" | "rejected";
  moderationReason?: string;
  isFeatured?: boolean;
}

const DATA_DIR = path.join(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Default curated showcase reviews (including Riyanshi Verma as featured)
const DEFAULT_REVIEWS: FeedbackItem[] = [
  {
    id: "fb-1",
    name: "Riyanshi Verma",
    roleTitle: "AI & Full-Stack Engineer • Verified Learner",
    rating: 4.8,
    comment:
      "AuraLearn completely changed how I organize my technical learning. Instead of getting stuck in tutorial hell, the prerequisite graph pinpointed my exact skill gaps and generated a structured, hands-on roadmap that actually matched my weekly schedule. Truly exceptional!",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "approved",
    isFeatured: true,
  },
  {
    id: "fb-2",
    name: "David Kim",
    roleTitle: "Staff Cloud Architect • Verified Learner",
    rating: 5.0,
    comment:
      "The explainability feature is what sets AuraLearn apart. Knowing WHY each course was selected based on my diagnostics made me trust the path 100%. Transitioned to Staff Platform role in 4 months.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: "approved",
  },
  {
    id: "fb-3",
    name: "Elena Martinez",
    roleTitle: "MLOps Specialist • Verified Learner",
    rating: 5.0,
    comment:
      "The AI code reviewer on milestone submissions feels like having a senior staff engineer reviewing your pull requests in real time. Absolute game changer for portfolio building.",
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    status: "approved",
  },
];

function loadStore(): { users: Record<string, any>; sessions: Record<string, any>; feedback: FeedbackItem[] } {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = { users: {}, sessions: {}, feedback: DEFAULT_REVIEWS };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!data.feedback || !Array.isArray(data.feedback)) {
      data.feedback = DEFAULT_REVIEWS;
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
    }
    return data;
  } catch (err) {
    console.error("[FeedbackStore] Failed to load store:", err);
    return { users: {}, sessions: {}, feedback: DEFAULT_REVIEWS };
  }
}

function saveStore(data: { users: Record<string, any>; sessions: Record<string, any>; feedback: FeedbackItem[] }) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[FeedbackStore] Failed to save store:", err);
  }
}

// ─────────────────────────────────────────────
// Content Moderation & Quality Guard Engine
// ─────────────────────────────────────────────
const PROFANITY_AND_SPAM_PATTERNS = [
  /http[s]?:\/\//i, // Unsolicited external promotional links
  /\b(viagra|casino|crypto pump|telegram group|whatsapp me|free money)\b/i,
  /\b(fuck|shit|bitch|bastard|asshole|crap)\b/i,
];

function moderateSubmission(name: string, comment: string, rating: number): {
  status: "approved" | "internal_feedback" | "rejected";
  reason: string;
} {
  const textToScan = `${name} ${comment}`.toLowerCase();

  // 1. Check for spam / malicious keywords
  for (const pattern of PROFANITY_AND_SPAM_PATTERNS) {
    if (pattern.test(textToScan)) {
      return {
        status: "rejected",
        reason: "Contains promotional links or disallowed language.",
      };
    }
  }

  // 2. Check for minimal gibberish
  if (comment.trim().length < 10) {
    return {
      status: "rejected",
      reason: "Feedback is too short or ambiguous.",
    };
  }

  // 3. Automated quality / sentiment triage:
  // Ratings 4.0+ with thoughtful feedback are auto-approved to public community showcase
  if (rating >= 4.0) {
    return {
      status: "approved",
      reason: "High-quality constructive rating.",
    };
  }

  // Lower ratings (< 4.0) or critical bug reports are routed to internal product improvement triage
  return {
    status: "internal_feedback",
    reason: "Low rating queued for internal product improvement triage.",
  };
}

// ─────────────────────────────────────────────
// GET /api/feedback — Retrieve approved showcase reviews
// ─────────────────────────────────────────────
feedbackRouter.get("/feedback", (_req: Request, res: Response) => {
  const store = loadStore();
  const approved = (store.feedback || [])
    .filter((f) => f.status === "approved")
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    reviews: approved,
    totalCount: approved.length,
  });
});

// ─────────────────────────────────────────────
// POST /api/feedback — Submit new learner feedback
// ─────────────────────────────────────────────
feedbackRouter.post("/feedback", (req: Request, res: Response) => {
  const { name, roleTitle, rating, comment } = req.body;

  if (!name?.trim() || !comment?.trim() || rating === undefined) {
    return res.status(400).json({
      success: false,
      error: "Name, rating, and feedback comment are required.",
    });
  }

  const numRating = parseFloat(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      error: "Rating must be between 1.0 and 5.0.",
    });
  }

  // Run automated moderation
  const moderation = moderateSubmission(name, comment, numRating);

  if (moderation.status === "rejected") {
    return res.status(400).json({
      success: false,
      error: `Feedback could not be accepted: ${moderation.reason}`,
    });
  }

  const newFeedback: FeedbackItem = {
    id: `fb-${Date.now()}`,
    name: name.trim(),
    roleTitle: roleTitle?.trim() || "Verified Learner",
    rating: numRating,
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
    status: moderation.status,
    moderationReason: moderation.reason,
  };

  const store = loadStore();
  store.feedback = store.feedback || [];
  store.feedback.unshift(newFeedback);
  saveStore(store);

  // Terminal logging
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  [AuraLearn Feedback Received]                       ║`);
  console.log(`║  Author  : ${name.slice(0, 42).padEnd(42)}║`);
  console.log(`║  Rating  : ${numRating.toFixed(1)} / 5.0 (${moderation.status.padEnd(23)})║`);
  console.log(`║  Comment : ${comment.slice(0, 42).padEnd(42)}║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  return res.json({
    success: true,
    status: moderation.status,
    message:
      moderation.status === "approved"
        ? "Thank you! Your feedback has been approved and published to the community."
        : "Thank you! Your feedback has been received by our product team for review.",
    item: moderation.status === "approved" ? newFeedback : undefined,
  });
});
