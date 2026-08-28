export function generateFallbackDeepdive(stepTitle: string) {
  return {
    keyTakeaways: [
      `Master the core architectural mental models of ${stepTitle}.`,
      "Write modular, tested code with predictable failure boundaries.",
      "Understand performance, cost, and latency trade-offs in real production environments.",
    ],
    challengeProject: {
      name: `${stepTitle} Production Benchmark`,
      description: `Build a production-grade prototype applying ${stepTitle} with end-to-end evaluation, structured telemetry, and test coverage.`,
      milestones: [
        "Phase 1: Environment and scaffolding setup",
        "Phase 2: Core functional logic and pipeline integration",
        "Phase 3: Automated testing and edge-case benchmarking",
      ],
      techStack: ["TypeScript", "Node.js", "Jest / Vitest", "Docker"],
    },
    productionPitfalls: [
      "Failing to handle timeout and retry backoffs when calling external services.",
      "Neglecting structured schema validation leading to silent parser exceptions.",
    ],
    interviewQuestions: [
      {
        question: `How would you architect a resilient solution for ${stepTitle} under high concurrency?`,
        answer: "Employ asynchronous task queues, cache frequently accessed intermediate states, and implement circuit breakers with fallback strategies.",
      },
      {
        question: `What are the primary performance metrics you monitor in ${stepTitle}?`,
        answer: "P95 and P99 latency percentiles, error and timeout rates, memory consumption, and unit operational cost.",
      },
    ],
  };
}
