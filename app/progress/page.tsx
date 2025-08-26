import ProgressDashboard from "@/components/progress-dashboard";
import { getProgressSummary, logProgressEntry } from "@/app/adapters/progressService";

export default async function ProgressPage() {
  const summary = await getProgressSummary(); // server fetch

  async function onLogProgress(data: Parameters<typeof logProgressEntry>[0]) {
    "use server";
    await logProgressEntry(data);
    // optionally: revalidatePath('/progress');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your fitness journey and monitor your progress</p>
        </div>
        
        <ProgressDashboard 
          clientId={summary.client?.id ?? ''}
          client={summary.client}
          weeklyPlan={summary.weeklyPlan}
          checkIns={summary.checkIns}
          progressMetrics={summary.progressMetrics}
          onLogProgress={onLogProgress}
        />
      </div>
    </div>
  );
}
