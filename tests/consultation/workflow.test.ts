import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/consultation',
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
    },
  })),
}));

// Mock consultation components
jest.mock('../../components/consultation/landing-hero', () => ({
  LandingHero: () => <div data-testid="landing-hero">Landing Hero Component</div>,
}));

jest.mock('../../components/consultation/lead-capture', () => ({
  LeadCapture: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <form data-testid="lead-capture" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ name: 'Test User', email: 'test@example.com', company: 'Test Corp' });
    }}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <input name="company" placeholder="Company" />
      <button type="submit">Submit</button>
    </form>
  ),
}));

jest.mock('../../components/questionnaire-engine', () => ({
  QuestionnaireEngine: ({ onComplete }: { onComplete: (data: any) => void }) => (
    <div data-testid="questionnaire-engine">
      <h2>Questionnaire</h2>
      <button onClick={() => onComplete({
        responses: {
          business_type: 'SaaS',
          team_size: '10-50',
          budget: '$10k-50k',
          challenges: ['scaling', 'automation'],
          timeline: '3-6 months'
        }
      })}>
        Complete Questionnaire
      </button>
    </div>
  ),
}));

jest.mock('../../components/consultation/ai-recommendations', () => ({
  AIRecommendations: ({ data }: { data: any }) => (
    <div data-testid="ai-recommendations">
      <h2>AI Recommendations</h2>
      <div>Business Type: {data?.business_type}</div>
      <div>Recommended Package: Enterprise Growth</div>
    </div>
  ),
}));

// Mock API routes
global.fetch = jest.fn();

describe('Consultation Workflow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/consultation/submit')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            consultation_id: 'test-consultation-id',
            data: { id: 'test-consultation-id' }
          }),
        });
      }
      if (url.includes('/api/consultation/generate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            consultation: {
              id: 'test-consultation-id',
              recommendations: ['Enterprise Growth Package', 'Custom Development'],
              analysis: 'Based on your SaaS business with 10-50 team members...',
              next_steps: ['Schedule consultation call', 'Review proposal'],
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Landing Page Flow', () => {
    it('should render landing page components correctly', async () => {
      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      expect(screen.getByTestId('landing-hero')).toBeInTheDocument();
      expect(screen.getByTestId('lead-capture')).toBeInTheDocument();
    });

    it('should handle lead capture form submission', async () => {
      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const form = screen.getByTestId('lead-capture');
      const submitButton = screen.getByText('Submit');

      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/consultation/submit'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('Test User'),
          })
        );
      });
    });

    it('should navigate to questionnaire after successful lead capture', async () => {
      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/consultation/questionnaire?id=test-consultation-id');
      });
    });
  });

  describe('Questionnaire Flow', () => {
    it('should render questionnaire components correctly', async () => {
      const { QuestionnairePage } = await import('../../app/consultation/questionnaire/page');
      render(<QuestionnairePage />);

      expect(screen.getByTestId('questionnaire-engine')).toBeInTheDocument();
      expect(screen.getByText('Questionnaire')).toBeInTheDocument();
    });

    it('should handle questionnaire completion', async () => {
      const { QuestionnairePage } = await import('../../app/consultation/questionnaire/page');
      render(<QuestionnairePage />);

      const completeButton = screen.getByText('Complete Questionnaire');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/consultation/generate'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('SaaS'),
          })
        );
      });
    });

    it('should navigate to results after questionnaire completion', async () => {
      const { QuestionnairePage } = await import('../../app/consultation/questionnaire/page');
      render(<QuestionnairePage />);

      const completeButton = screen.getByText('Complete Questionnaire');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/consultation/results?id=test-consultation-id');
      });
    });
  });

  describe('Results Page Flow', () => {
    it('should render consultation results correctly', async () => {
      const { ResultsPage } = await import('../../app/consultation/results/page');
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-recommendations')).toBeInTheDocument();
        expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      });
    });

    it('should display consultation analysis and recommendations', async () => {
      const { ResultsPage } = await import('../../app/consultation/results/page');
      render(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByText('Business Type: SaaS')).toBeInTheDocument();
        expect(screen.getByText('Recommended Package: Enterprise Growth')).toBeInTheDocument();
      });
    });
  });

  describe('End-to-End Workflow', () => {
    it('should complete full consultation workflow', async () => {
      // Start with landing page
      const { LandingPage } = await import('../../app/consultation/landing/page');
      const { rerender } = render(<LandingPage />);

      // Submit lead capture form
      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/consultation/questionnaire?id=test-consultation-id');
      });

      // Navigate to questionnaire
      const { QuestionnairePage } = await import('../../app/consultation/questionnaire/page');
      rerender(<QuestionnairePage />);

      // Complete questionnaire
      const completeButton = screen.getByText('Complete Questionnaire');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/consultation/results?id=test-consultation-id');
      });

      // Navigate to results
      const { ResultsPage } = await import('../../app/consultation/results/page');
      rerender(<ResultsPage />);

      await waitFor(() => {
        expect(screen.getByTestId('ai-recommendations')).toBeInTheDocument();
      });

      // Verify full workflow completion
      expect(global.fetch).toHaveBeenCalledTimes(2); // Submit + Generate calls
      expect(mockPush).toHaveBeenCalledTimes(2); // Two navigation calls
    });
  });

  describe('Data Persistence', () => {
    it('should persist consultation data across pages', async () => {
      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/consultation/submit'),
          expect.objectContaining({
            body: expect.stringContaining('"name":"Test User"'),
          })
        );
      });
    });

    it('should maintain state between questionnaire and results', async () => {
      const { QuestionnairePage } = await import('../../app/consultation/questionnaire/page');
      render(<QuestionnairePage />);

      const completeButton = screen.getByText('Complete Questionnaire');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/consultation/generate'),
          expect.objectContaining({
            body: expect.stringContaining('"business_type":"SaaS"'),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal Server Error' }),
        })
      );

      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText('Error occurred')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error('Network Error'))
      );

      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should load pages within performance targets', async () => {
      const startTime = performance.now();

      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      await waitFor(() => {
        expect(screen.getByTestId('landing-hero')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(2000); // <2 seconds target
    });

    it('should handle form submissions within time limits', async () => {
      const { LandingPage } = await import('../../app/consultation/landing/page');
      render(<LandingPage />);

      const startTime = performance.now();

      const form = screen.getByTestId('lead-capture');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const submissionTime = endTime - startTime;

      expect(submissionTime).toBeLessThan(5000); // <5 seconds target
    });
  });
});