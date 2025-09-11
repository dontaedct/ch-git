/**
 * Hero Tasks - Main Page
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 * Updated: 2025-09-08T23:19:46.000Z - Redesigned to match home page UI/UX
 */

import { HeroTasksDashboard } from '@/components/hero-tasks/HeroTasksDashboard';

export default function HeroTasksPage() {
  // Allow access without authentication for testing/demo purposes
  return (
    <main role="main" aria-label="Hero Tasks Dashboard">
      <HeroTasksDashboard />
    </main>
  );
}
