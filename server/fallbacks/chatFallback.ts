import { BackendUserProfile } from "../types";

export function generateFallbackChatReply(message: string, profile: BackendUserProfile = {}, currentRoadmap: any = null) {
  const lower = (message || "").toLowerCase();
  const role = profile?.targetRole || "Generative AI & Systems Engineer";

  // Free / best resources questions
  if (
    lower.includes("free resource") ||
    lower.includes("best resource") ||
    lower.includes("free course") ||
    lower.includes("best course") ||
    lower.includes("where to learn") ||
    lower.includes("learning material") ||
    lower.includes("study material")
  ) {
    return {
      text: `### 📚 Best Free Resources for **${role}**

Here are the top free learning resources curated for your path:

**🔵 Foundational AI / ML**
- [fast.ai – Practical Deep Learning](https://fast.ai) — Project-first, free, world-class
- [Google ML Crash Course](https://developers.google.com/machine-learning/crash-course) — Bite-sized, interactive
- [Andrej Karpathy's Neural Networks Zero-to-Hero](https://karpathy.ai/zero-to-hero.html) — Best hands-on LLM course

**🟣 Generative AI & LLMs**
- [DeepLearning.AI Short Courses](https://learn.deeplearning.ai) — Free courses on LangChain, RAG, Agents
- [Hugging Face NLP Course](https://huggingface.co/learn/nlp-course) — Transformers & fine-tuning, free
- [Google Gemini API Quickstart](https://ai.google.dev/gemini-api/docs) — Official, free API + docs

**🟢 Systems / Cloud / MLOps**
- [CS 329S: ML Systems Design (Stanford)](https://stanford-cs329s.github.io) — Free lecture notes
- [Full Stack Deep Learning](https://fullstackdeeplearning.com) — Production ML, free content
- [The Missing Semester of Your CS Education](https://missing.csail.mit.edu) — CLI, Git, systems essentials

**🟡 Practice & Projects**
- [Kaggle](https://kaggle.com) — Free notebooks + competitions
- [LeetCode](https://leetcode.com) — Coding interview prep (free tier is enough)
- [Papers With Code](https://paperswithcode.com) — Implement SOTA research for free

Would you like me to add these to a custom milestone in your roadmap?`,
      suggestedActions: [
        { label: "Add Free Resources to Roadmap", action: "add_topic", payload: { topic: "Free Learning Resources Phase" } },
        { label: "Generate My Full Roadmap", action: "generate_roadmap" },
        { label: "Recommend Portfolio Projects", action: "recommend_projects" },
      ],
    };
  }

  // Project / portfolio questions
  if (
    lower.includes("project") ||
    lower.includes("portfolio") ||
    lower.includes("capstone") ||
    lower.includes("build")
  ) {
    return {
      text: `### 🚀 Portfolio Projects That Will Impress Hiring Managers for **${role}**

Here are 3 high-impact projects tailored to your target role:

**1. 🤖 RAG-Powered Knowledge Assistant**
Build a Retrieval-Augmented Generation chatbot using your own documents. Stack: Gemini API, LangChain, ChromaDB/Pinecone, FastAPI.
*Why it impresses*: Demonstrates end-to-end LLM pipeline + vector search skills.

**2. 🛠️ Autonomous AI Agent**
Create an agent that can browse the web, write code, and self-correct using tool-calling. Stack: Gemini Function Calling or LangGraph, Python.
*Why it impresses*: Agentic AI is the hottest skill in 2025 hiring.

**3. ⚙️ ML Model Serving at Scale**
Deploy a fine-tuned model with a REST API, Docker, and monitoring. Stack: HuggingFace, FastAPI, Docker, Prometheus.
*Why it impresses*: Shows you can ship real production ML systems.

Want me to add a dedicated **Capstone Project milestone** to your roadmap?`,
      suggestedActions: [
        { label: "Add Capstone to Roadmap", action: "add_topic", payload: { topic: "Capstone Project: RAG Assistant" } },
        { label: "Best Free Resources", action: "free_resources" },
        { label: "Interview Prep Advice", action: "interview_prep" },
      ],
    };
  }

  // Interview prep questions
  if (
    lower.includes("interview") ||
    lower.includes("hire") ||
    lower.includes("job") ||
    lower.includes("career")
  ) {
    return {
      text: `### 🎯 Interview Prep Strategy for **${role}**

Here's a focused interview preparation plan:

**📌 Technical Topics to Master:**
- LLM internals: Transformer architecture, attention, tokenization
- RAG pipelines: chunking strategies, embedding models, vector stores
- System design for AI: latency, throughput, caching, A/B testing
- Python proficiency: async, decorators, type hints, testing
- MLOps basics: Docker, CI/CD, model versioning

**📌 Common Interview Questions:**
- "Explain how you'd build a production RAG system from scratch"
- "How do you evaluate an LLM's output quality?"
- "Design a feature flag system for model rollouts"
- "What's the difference between fine-tuning and in-context learning?"

**📌 Recommended Practice:**
- 2–3 LeetCode mediums daily (focus: arrays, graphs, dynamic programming)
- One mock system design session per week
- Contribute to an open-source AI project for credibility

Want me to add an **Interview Prep phase** to your roadmap?`,
      suggestedActions: [
        { label: "Add Interview Prep Phase", action: "add_topic", payload: { topic: "Interview Prep & Mock Interviews" } },
        { label: "Generate Full Roadmap", action: "generate_roadmap" },
        { label: "Best Free Resources", action: "free_resources" },
      ],
    };
  }

  // Skill gap questions
  if (
    lower.includes("skill gap") ||
    lower.includes("what should i learn") ||
    lower.includes("missing skill") ||
    lower.includes("weakest")
  ) {
    return {
      text: `### 🔍 Skill Gap Analysis for **${role}**

Based on your profile, here are the most critical gaps to close:

| Skill | Current | Target | Priority |
|-------|---------|--------|----------|
| LLM Fine-tuning | Beginner | Advanced | 🔴 High |
| RAG & Vector Search | Beginner | Advanced | 🔴 High |
| Agentic AI (LangGraph) | None | Intermediate | 🟡 Medium |
| MLOps & Deployment | Beginner | Intermediate | 🟡 Medium |
| System Design for AI | Intermediate | Advanced | 🟢 Lower |

**Recommended next steps:**
1. Start with the **Gemini API & Prompting** milestone (1–2 weeks)
2. Build a **mini RAG project** immediately after (learning by doing > passive study)
3. Then tackle fine-tuning with LoRA on a free Colab GPU

Want me to generate a detailed roadmap addressing all these gaps?`,
      suggestedActions: [
        { label: "Generate Personalized Roadmap", action: "generate_roadmap" },
        { label: "View Best Free Resources", action: "free_resources" },
        { label: "Adapt for My Weekly Hours", action: "adapt_hours", payload: { hours: profile?.weeklyCommitmentHours || 10 } },
      ],
    };
  }

  // Roadmap explanation questions
  if (lower.includes("why") || lower.includes("recommend") || lower.includes("reason") || lower.includes("sequence")) {
    return {
      text: `### 🎯 Why These Recommendations Were Personalized For You:

1. **Target Role Alignment**: Your goal is **${role}**, which demands hands-on mastery of LLM APIs, vector retrieval, and production deployment.
2. **Identified Skill Gap**: Your current proficiency in Semantic Retrieval and Agentic Systems has the highest gap severity. We sequenced foundations first so you won't encounter blockers during the capstone.
3. **Pace & Modality**: Curated for **${profile?.weeklyCommitmentHours || 10} hours/week**, prioritizing **interactive project deliverables** rather than passive video lectures.

Would you like me to adjust any milestone or add more domain-specific projects?`,
      suggestedActions: [
        { label: "Show Next Milestone Actions", action: "view_milestone", payload: { stepId: "step-1" } },
        { label: "Add Real-Time Speech/Vision Module", action: "add_topic", payload: { topic: "Multimodal Live API" } },
        { label: "Adapt For 5 Hours/Week", action: "adapt_hours", payload: { hours: 5 } },
      ],
    };
  }

  // Time / hours adjustment questions
  if (lower.includes("hours") || lower.includes("time") || lower.includes("busy") || lower.includes("schedule") || /\b[0-9]+\s*h/.test(lower)) {
    return {
      text: `Understood! I've noted that you'd like to adjust your weekly schedule. I can recalibrate your roadmap to compress foundational steps and focus exclusively on core deliverables.`,
      extractedProfileUpdates: {
        weeklyCommitmentHours: 5,
      },
      suggestedActions: [
        { label: "Adapt Roadmap for 5h/week", action: "adapt_hours", payload: { hours: 5 } },
        { label: "View Updated Timeline", action: "tab_roadmap" },
      ],
    };
  }

  // Default fallback — only reached if nothing matches
  return {
    text: `Hello ${profile?.name || "there"}! I'm **Aura**, your AI Learning Path Advisor for **${role}**.

I can help you with:
- 📚 **Best Free Resources** — Curated courses, docs & tutorials for your path
- 🚀 **Portfolio Projects** — Capstone ideas that impress hiring managers
- 🎯 **Skill Gap Analysis** — Identify exactly what to learn next
- 🗺️ **Roadmap Explanation** — Understand why each step was chosen
- 💼 **Interview Prep** — Technical topics and mock question strategy
- ⚡ **Pace Adjustment** — Adapt your timeline to your weekly hours

What would you like to explore today?`,
    suggestedActions: [
      { label: "Best Free Resources", action: "free_resources" },
      { label: "Recommend Portfolio Projects", action: "recommend_projects" },
      { label: "Analyze My Skill Gaps", action: "analyze_gaps" },
    ],
  };
}

