import { runJob, JobResult } from "./runner";
import { getConfigSummary } from "@/app.config";
import { checkEnvironmentHealth, getEnv } from "@/lib/env";
import { getCurrentWeekStartIso } from "@/lib/date/week";
import logger, { Logger } from "@/lib/logger";
import { sendWeeklyRecap } from "@/lib/email";

type RunArgs = { dryRun?: boolean };

export async function runWeeklyDigest(args: RunArgs = {}): Promise<JobResult> {
  return runJob("weekly-digest", async () => {
    const op = Logger.operation("weekly-digest");
    const env = getEnv();

    // Gate: Only run for Pro and above
    const tier = env.APP_TIER ?? "starter";
    if (!(tier === "pro" || tier === "advanced")) {
      op.warn("Weekly digest is Pro+ only", { tier });
      return { meta: { skippedReason: "TIER_NOT_ELIGIBLE" } };
    }

    // Determine recipients
    const recipients = parseRecipients(env.DIGEST_RECIPIENTS, env.RESEND_FROM);
    if (recipients.length === 0) {
      op.warn("No recipients configured for weekly digest");
      return { meta: { skippedReason: "NO_RECIPIENTS" } };
    }

    // Build digest HTML
    const html = buildDigestHtml();

    if (args.dryRun) {
      op.info("Dry run enabled – not sending emails", { previewLength: html.length });
      return { meta: { dryRun: true, htmlPreview: html.slice(0, 500) } };
    }

    // Send emails
    let sent = 0;
    for (const to of recipients) {
      const res = await sendWeeklyRecap({ to, summaryHtml: html });
      if (res.ok) {
        sent += 1;
      } else {
        logger.warn("Weekly digest send failed", { to, code: res.code, message: res.message });
      }
    }

    return { meta: { sentCount: sent, recipientCount: recipients.length } };
  }, { timeoutMs: 30_000 });
}

function parseRecipients(csv?: string, fallbackFrom?: string): string[] {
  const list = (csv || "").split(",").map(s => s.trim()).filter(Boolean);
  if (list.length > 0) return list;
  if (fallbackFrom && fallbackFrom.includes("@")) return [fallbackFrom];
  return [];
}

function buildDigestHtml(): string {
  const weekStart = getCurrentWeekStartIso();
  const summary = getConfigSummary();
  const health = checkEnvironmentHealth();

  const featureList = Object.entries(summary?.featuresEnabled || {})
    .map(([k]) => k)
    .concat([]);

  // Simple KPI placeholders – extend with real metrics as available
  const kpis = [
    { label: "Tier", value: summary.tier },
    { label: "Preset", value: summary.preset },
    { label: "Features Enabled", value: (summary.featuresEnabled || []).length },
    { label: "Critical Env Missing", value: health.criticalMissing.length },
    { label: "Warnings", value: health.warnings.length },
  ];

  const listItems = (items: string[]) => items.map(i => `<li>${escapeHtml(i)}</li>`).join("");

  return `
  <h1>Weekly KPI Digest</h1>
  <p>Week starting <strong>${weekStart}</strong></p>

  <h2>Summary</h2>
  <ul>
    ${kpis.map(k => `<li><strong>${k.label}:</strong> ${escapeHtml(String(k.value))}</li>`).join("")}
  </ul>

  <h3>Enabled Features</h3>
  <ul>
    ${summary.featuresEnabled.map((f: string) => `<li>${escapeHtml(f)}</li>`).join("")}
  </ul>

  <h3>Environment Health</h3>
  <p>Status: <strong>${escapeHtml(health.status)}</strong></p>
  ${health.criticalMissing.length ? `<p><strong>Critical Missing:</strong></p><ul>${listItems(health.criticalMissing)}</ul>` : '<p>No critical missing variables</p>'}
  ${health.warnings.length ? `<p><strong>Warnings:</strong></p><ul>${listItems(health.warnings)}</ul>` : '<p>No warnings</p>'}
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
