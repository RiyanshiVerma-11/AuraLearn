import { LearningRoadmap, RoadmapStep } from "../types";

/**
 * Calculates start and end dates for roadmap steps based on weekly hours and start date.
 */
export function calculateStepDates(
  roadmap: LearningRoadmap,
  startDate: Date = new Date(),
  weeklyCommitmentHours: number = 15
): Array<{ step: RoadmapStep; startDate: Date; dueDate: Date }> {
  let currentTimestamp = startDate.getTime();
  const effectiveHoursPerWeek = Math.max(1, weeklyCommitmentHours);

  return roadmap.steps.map((step) => {
    const hours = Math.max(1, step.estimatedHours || 5);
    const durationDays = Math.max(1, Math.ceil((hours / effectiveHoursPerWeek) * 7));
    
    const stepStart = new Date(currentTimestamp);
    const stepEnd = new Date(currentTimestamp + durationDays * 24 * 60 * 60 * 1000);
    
    // Increment timestamp for next sequential step
    currentTimestamp = stepEnd.getTime();

    return {
      step,
      startDate: stepStart,
      dueDate: stepEnd,
    };
  });
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatDateOnlyToICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generates an RFC 5545 standard .ics calendar file content.
 */
export function generateICSContent(
  roadmap: LearningRoadmap,
  startDate: Date = new Date(),
  weeklyHours: number = 15
): string {
  const stepDates = calculateStepDates(roadmap, startDate, weeklyHours);
  const nowStr = formatDateToICS(new Date());

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AuraLearn//AI Learning Path Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICSText(`AuraLearn: ${roadmap.targetRole}`)}`,
    "X-WR-TIMEZONE:UTC",
  ];

  stepDates.forEach(({ step, startDate: stepStart, dueDate: stepEnd }, index) => {
    const uid = `auralearn-${roadmap.id}-${step.id}-${index}@auralearn.app`;
    const summary = `[AuraLearn Milestone ${index + 1}] ${step.title}`;
    const description = [
      `🎯 Milestone: ${step.title}`,
      `📌 Target Role: ${roadmap.targetRole}`,
      `⏱️ Estimated Hours: ${step.estimatedHours}h`,
      `📦 Deliverable: ${step.deliverable}`,
      `💡 Skills Acquired: ${step.skillsAcquired.join(", ")}`,
      ``,
      `Summary: ${step.shortSummary}`,
    ].join("\n");

    ics.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART;VALUE=DATE:${formatDateOnlyToICS(stepStart)}`,
      `DTEND;VALUE=DATE:${formatDateOnlyToICS(stepEnd)}`,
      `SUMMARY:${escapeICSText(summary)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      `CATEGORIES:EDUCATION,AURALEARN`,
      `STATUS:CONFIRMED`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICSText(`Reminder: Due date approaching for ${step.title}`)}`,
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Downloads the .ics file directly to learner's device
 */
export function downloadICSFile(
  roadmap: LearningRoadmap,
  startDate: Date = new Date(),
  weeklyHours: number = 15
): void {
  const icsData = generateICSContent(roadmap, startDate, weeklyHours);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auralearn-${roadmap.targetRole.toLowerCase().replace(/\s+/g, "-")}-schedule.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Google Calendar Web URL for a specific milestone event
 */
export function generateGoogleCalendarUrl(
  step: RoadmapStep,
  roadmap: LearningRoadmap,
  startDate: Date,
  dueDate: Date
): string {
  const title = encodeURIComponent(`[AuraLearn] ${step.title}`);
  const details = encodeURIComponent(
    `Milestone: ${step.title}\nRole: ${roadmap.targetRole}\nDeliverable: ${step.deliverable}\nSkills: ${step.skillsAcquired.join(", ")}\nSummary: ${step.shortSummary}`
  );
  const startStr = formatDateToICS(startDate);
  const endStr = formatDateToICS(dueDate);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
}
