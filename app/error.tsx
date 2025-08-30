'use client';

import { ErrorPage } from '@/components/ui/error-notification';
import { SystemError } from '@/lib/errors/types';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  // Convert the error to AppError for better handling
  const appError = new SystemError(
    error?.message || 'An error occurred in this route',
    {
      digest: error?.digest,
      stack: error?.stack,
      source: 'next-error-boundary'
    }
  );

  return (
    <ErrorPage
      error={appError}
      title="Something went wrong"
      onRetry={reset}
      onSupport={() => {
        // Could integrate with support system here
        const mailto = `mailto:support@example.com?subject=Error Report&body=Error ID: ${appError.correlationId}%0A%0AError: ${encodeURIComponent(error?.message || 'Unknown error')}`;
        window.open(mailto);
      }}
      className="min-h-[400px]"
    />
  );
}
