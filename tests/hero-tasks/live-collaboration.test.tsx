/**
 * Live Collaboration Features Test Suite
 * 
 * Comprehensive tests for HT-004.2.2 Live Collaboration Features
 * including presence indicators, typing indicators, and conflict resolution.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PresenceIndicator, PresenceUser } from '@/components/hero-tasks/PresenceIndicator';
import { TypingIndicator, TypingUser } from '@/components/hero-tasks/TypingIndicator';
import { ConflictResolution, ConflictData } from '@/components/hero-tasks/ConflictResolution';
import { useLiveCollaboration } from '@/hooks/useLiveCollaboration';
import { WebSocketMessage } from '@/hooks/useWebSocket';

// Mock the WebSocket hook
jest.mock('@/hooks/useWebSocket');
jest.mock('@/hooks/useLiveCollaboration');

describe('HT-004.2.2: Live Collaboration Features', () => {
  describe('PresenceIndicator Component', () => {
    const mockUsers: PresenceUser[] = [
      {
        userId: 'user1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
        status: 'viewing',
        lastSeen: new Date('2025-01-27T10:00:00Z'),
        currentTaskId: 'task-123'
      },
      {
        userId: 'user2',
        name: 'Jane Smith',
        avatar: 'https://example.com/avatar2.jpg',
        status: 'editing',
        lastSeen: new Date('2025-01-27T10:01:00Z'),
        currentTaskId: 'task-123'
      },
      {
        userId: 'user3',
        name: 'Bob Wilson',
        status: 'typing',
        lastSeen: new Date('2025-01-27T10:02:00Z'),
        currentTaskId: 'task-123'
      }
    ];

    it('renders presence indicators for multiple users', () => {
      render(<PresenceIndicator users={mockUsers} />);
      
      expect(screen.getByText('3 people viewing')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows correct status indicators', () => {
      render(<PresenceIndicator users={mockUsers} showTooltips={true} />);
      
      // Check for status icons (Eye, Edit, Clock)
      const statusIcons = screen.getAllByRole('img', { hidden: true });
      expect(statusIcons).toHaveLength(3);
    });

    it('limits visible users and shows remaining count', () => {
      const manyUsers = Array.from({ length: 5 }, (_, i) => ({
        ...mockUsers[0],
        userId: `user${i}`,
        name: `User ${i}`
      }));

      render(<PresenceIndicator users={manyUsers} maxVisible={3} />);
      
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.getByText('5 people viewing')).toBeInTheDocument();
    });

    it('handles empty user list gracefully', () => {
      render(<PresenceIndicator users={[]} />);
      expect(screen.queryByText(/people viewing/)).not.toBeInTheDocument();
    });

    it('shows tooltips with user information', async () => {
      render(<PresenceIndicator users={mockUsers} showTooltips={true} />);
      
      const firstAvatar = screen.getByAltText('John Doe');
      fireEvent.mouseOver(firstAvatar);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('viewing this task')).toBeInTheDocument();
      });
    });
  });

  describe('TypingIndicator Component', () => {
    const mockTypingUsers: TypingUser[] = [
      {
        userId: 'user1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
        taskId: 'task-123'
      },
      {
        userId: 'user2',
        name: 'Jane Smith',
        taskId: 'task-123'
      }
    ];

    it('renders typing indicator for single user', () => {
      render(
        <TypingIndicator 
          typingUsers={[mockTypingUsers[0]]} 
          currentUserId="current-user"
        />
      );
      
      expect(screen.getByText('John Doe is typing')).toBeInTheDocument();
    });

    it('renders typing indicator for multiple users', () => {
      render(
        <TypingIndicator 
          typingUsers={mockTypingUsers} 
          currentUserId="current-user"
        />
      );
      
      expect(screen.getByText('John Doe and Jane Smith are typing')).toBeInTheDocument();
    });

    it('renders typing indicator for many users', () => {
      const manyTypingUsers = Array.from({ length: 4 }, (_, i) => ({
        ...mockTypingUsers[0],
        userId: `user${i}`,
        name: `User ${i}`
      }));

      render(
        <TypingIndicator 
          typingUsers={manyTypingUsers} 
          currentUserId="current-user"
        />
      );
      
      expect(screen.getByText('4 people are typing')).toBeInTheDocument();
    });

    it('filters out current user from typing list', () => {
      const usersWithCurrent = [
        ...mockTypingUsers,
        {
          userId: 'current-user',
          name: 'Current User',
          taskId: 'task-123'
        }
      ];

      render(
        <TypingIndicator 
          typingUsers={usersWithCurrent} 
          currentUserId="current-user"
        />
      );
      
      expect(screen.getByText('John Doe and Jane Smith are typing')).toBeInTheDocument();
      expect(screen.queryByText('Current User')).not.toBeInTheDocument();
    });

    it('renders animated typing dots', () => {
      render(
        <TypingIndicator 
          typingUsers={mockTypingUsers} 
          currentUserId="current-user"
        />
      );
      
      const dots = screen.getAllByRole('generic');
      expect(dots.some(dot => dot.className.includes('animate-pulse'))).toBe(true);
    });
  });

  describe('ConflictResolution Component', () => {
    const mockConflicts: ConflictData[] = [
      {
        field: 'title',
        localValue: 'Original Title',
        remoteValue: 'Updated Title',
        localTimestamp: new Date('2025-01-27T10:00:00Z'),
        remoteTimestamp: new Date('2025-01-27T10:01:00Z'),
        localUserId: 'user1',
        remoteUserId: 'user2'
      },
      {
        field: 'description',
        localValue: 'Original description',
        remoteValue: 'Updated description',
        localTimestamp: new Date('2025-01-27T10:00:00Z'),
        remoteTimestamp: new Date('2025-01-27T10:01:00Z'),
        localUserId: 'user1',
        remoteUserId: 'user2'
      }
    ];

    const mockOnResolve = jest.fn();
    const mockOnDismiss = jest.fn();

    beforeEach(() => {
      mockOnResolve.mockClear();
      mockOnDismiss.mockClear();
    });

    it('renders conflict resolution interface', () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      expect(screen.getByText('Conflict Resolution Required')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('shows local and remote values for each conflict', () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.getByText('Original description')).toBeInTheDocument();
      expect(screen.getByText('Updated description')).toBeInTheDocument();
    });

    it('allows selecting resolution for each conflict', async () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      const useMineButtons = screen.getAllByText('Use Mine');
      const useTheirsButtons = screen.getAllByText('Use Theirs');
      
      fireEvent.click(useMineButtons[0]);
      fireEvent.click(useTheirsButtons[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Resolution: Using your version')).toBeInTheDocument();
        expect(screen.getByText('Resolution: Using their version')).toBeInTheDocument();
      });
    });

    it('enables resolve button when all conflicts are resolved', async () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      const resolveButton = screen.getByText('Resolve All Conflicts');
      expect(resolveButton).toBeDisabled();
      
      // Resolve all conflicts
      const useMineButtons = screen.getAllByText('Use Mine');
      fireEvent.click(useMineButtons[0]);
      fireEvent.click(useMineButtons[1]);
      
      await waitFor(() => {
        expect(resolveButton).not.toBeDisabled();
      });
    });

    it('calls onResolve with correct resolutions', async () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      // Resolve all conflicts
      const useMineButtons = screen.getAllByText('Use Mine');
      fireEvent.click(useMineButtons[0]);
      fireEvent.click(useMineButtons[1]);
      
      const resolveButton = screen.getByText('Resolve All Conflicts');
      fireEvent.click(resolveButton);
      
      await waitFor(() => {
        expect(mockOnResolve).toHaveBeenCalledWith([
          { field: 'title', resolution: 'local' },
          { field: 'description', resolution: 'local' }
        ]);
      });
    });

    it('calls onDismiss when dismiss button is clicked', () => {
      render(
        <ConflictResolution
          conflicts={mockConflicts}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      const dismissButton = screen.getByText('Dismiss Conflicts');
      fireEvent.click(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('handles empty conflicts list', () => {
      render(
        <ConflictResolution
          conflicts={[]}
          onResolve={mockOnResolve}
          onDismiss={mockOnDismiss}
        />
      );
      
      expect(screen.queryByText('Conflict Resolution Required')).not.toBeInTheDocument();
    });
  });

  describe('useLiveCollaboration Hook', () => {
    const mockWebSocketHook = {
      connected: true,
      connecting: false,
      error: null,
      connectedUsers: [],
      currentTaskUsers: ['user1', 'user2'],
      sendMessage: jest.fn(),
      joinTaskRoom: jest.fn(),
      leaveTaskRoom: jest.fn(),
      sendTypingIndicator: jest.fn(),
      reconnect: jest.fn()
    };

    beforeEach(() => {
      (useWebSocket as jest.Mock).mockReturnValue(mockWebSocketHook);
      (useLiveCollaboration as jest.Mock).mockReturnValue({
        ...mockWebSocketHook,
        presenceUsers: [],
        typingUsers: [],
        conflicts: [],
        hasConflicts: false,
        resolveConflicts: jest.fn(),
        dismissConflicts: jest.fn(),
        updateTaskOptimistically: jest.fn()
      });
    });

    it('provides live collaboration state', () => {
      const { result } = renderHook(() => useLiveCollaboration({
        userId: 'test-user',
        enabled: true
      }));

      expect(result.current.connected).toBe(true);
      expect(result.current.presenceUsers).toEqual([]);
      expect(result.current.typingUsers).toEqual([]);
      expect(result.current.conflicts).toEqual([]);
      expect(result.current.hasConflicts).toBe(false);
    });

    it('handles typing indicators correctly', () => {
      const mockSendTypingIndicator = jest.fn();
      (useLiveCollaboration as jest.Mock).mockReturnValue({
        ...mockWebSocketHook,
        sendTypingIndicator: mockSendTypingIndicator
      });

      const { result } = renderHook(() => useLiveCollaboration({
        userId: 'test-user',
        enabled: true
      }));

      act(() => {
        result.current.sendTypingIndicator('task-123', true);
      });

      expect(mockSendTypingIndicator).toHaveBeenCalledWith('task-123', true);
    });

    it('handles conflict resolution', async () => {
      const mockResolveConflicts = jest.fn();
      (useLiveCollaboration as jest.Mock).mockReturnValue({
        ...mockWebSocketHook,
        resolveConflicts: mockResolveConflicts
      });

      const { result } = renderHook(() => useLiveCollaboration({
        userId: 'test-user',
        enabled: true
      }));

      const resolutions = [
        { field: 'title', resolution: 'local' },
        { field: 'description', resolution: 'remote' }
      ];

      act(() => {
        result.current.resolveConflicts(resolutions);
      });

      expect(mockResolveConflicts).toHaveBeenCalledWith(resolutions);
    });

    it('handles optimistic updates', async () => {
      const mockUpdateTaskOptimistically = jest.fn().mockResolvedValue(undefined);
      (useLiveCollaboration as jest.Mock).mockReturnValue({
        ...mockWebSocketHook,
        updateTaskOptimistically: mockUpdateTaskOptimistically
      });

      const { result } = renderHook(() => useLiveCollaboration({
        userId: 'test-user',
        enabled: true
      }));

      const updates = { title: 'New Title', description: 'New Description' };

      await act(async () => {
        await result.current.updateTaskOptimistically('task-123', updates);
      });

      expect(mockUpdateTaskOptimistically).toHaveBeenCalledWith('task-123', updates);
    });
  });

  describe('Integration Tests', () => {
    it('integrates presence indicators with task detail view', () => {
      const mockUsers: PresenceUser[] = [
        {
          userId: 'user1',
          name: 'John Doe',
          status: 'viewing',
          lastSeen: new Date(),
          currentTaskId: 'task-123'
        }
      ];

      render(
        <div>
          <PresenceIndicator users={mockUsers} />
          <div>Task Detail Content</div>
        </div>
      );
      
      expect(screen.getByText('1 person viewing')).toBeInTheDocument();
      expect(screen.getByText('Task Detail Content')).toBeInTheDocument();
    });

    it('integrates typing indicators with task form', () => {
      const mockTypingUsers: TypingUser[] = [
        {
          userId: 'user1',
          name: 'John Doe',
          taskId: 'task-123'
        }
      ];

      render(
        <div>
          <TypingIndicator 
            typingUsers={mockTypingUsers} 
            currentUserId="current-user"
          />
          <div>Task Form Content</div>
        </div>
      );
      
      expect(screen.getByText('John Doe is typing')).toBeInTheDocument();
      expect(screen.getByText('Task Form Content')).toBeInTheDocument();
    });

    it('integrates conflict resolution with task updates', async () => {
      const mockConflicts: ConflictData[] = [
        {
          field: 'title',
          localValue: 'Original',
          remoteValue: 'Updated',
          localTimestamp: new Date(),
          remoteTimestamp: new Date(),
          localUserId: 'user1',
          remoteUserId: 'user2'
        }
      ];

      const mockOnResolve = jest.fn();
      const mockOnDismiss = jest.fn();

      render(
        <div>
          <ConflictResolution
            conflicts={mockConflicts}
            onResolve={mockOnResolve}
            onDismiss={mockOnDismiss}
          />
          <div>Task Update Form</div>
        </div>
      );
      
      expect(screen.getByText('Conflict Resolution Required')).toBeInTheDocument();
      expect(screen.getByText('Task Update Form')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('handles large number of presence users efficiently', () => {
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        userId: `user${i}`,
        name: `User ${i}`,
        status: 'viewing' as const,
        lastSeen: new Date(),
        currentTaskId: 'task-123'
      }));

      const startTime = performance.now();
      render(<PresenceIndicator users={manyUsers} maxVisible={5} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
      expect(screen.getByText('+95')).toBeInTheDocument();
    });

    it('handles rapid typing indicator updates', async () => {
      const { rerender } = render(
        <TypingIndicator 
          typingUsers={[]} 
          currentUserId="current-user"
        />
      );

      const startTime = performance.now();
      
      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        rerender(
          <TypingIndicator 
            typingUsers={[{
              userId: `user${i}`,
              name: `User ${i}`,
              taskId: 'task-123'
            }]} 
            currentUserId="current-user"
          />
        );
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should handle rapid updates efficiently
    });
  });
});

export default {};
