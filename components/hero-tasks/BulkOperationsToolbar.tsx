/**
 * Hero Tasks - Bulk Operations Toolbar Component
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Separator } from '@ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/alert-dialog';
import {
  CheckCircle,
  CheckCircle2,
  Play,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Brain,
  Wrench,
  CheckSquare,
  Trash2,
  MoreHorizontal,
  X,
  Users,
  Tag,
  ChevronDown
} from 'lucide-react';
import { BulkOperation, BulkOperationResult } from '@/hooks/useBulkOperations';
import { TaskStatus, TaskPriority, WorkflowPhase } from '@/types/hero-tasks';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  isProcessing: boolean;
  bulkOperations: BulkOperation[];
  onExecuteOperation: (operation: BulkOperation, operationData?: any) => Promise<BulkOperationResult>;
  onClearSelection: () => void;
  className?: string;
}

export function BulkOperationsToolbar({
  selectedCount,
  totalCount,
  isProcessing,
  bulkOperations,
  onExecuteOperation,
  onClearSelection,
  className
}: BulkOperationsToolbarProps) {
  const [pendingOperation, setPendingOperation] = useState<{
    operation: BulkOperation;
    operationData?: any;
  } | null>(null);

  const handleOperationClick = (operation: BulkOperation, operationData?: any) => {
    if (operation.requiresConfirmation) {
      setPendingOperation({ operation, operationData });
    } else {
      onExecuteOperation(operation, operationData);
    }
  };

  const confirmOperation = () => {
    if (pendingOperation) {
      onExecuteOperation(pendingOperation.operation, pendingOperation.operationData);
      setPendingOperation(null);
    }
  };

  const cancelOperation = () => {
    setPendingOperation(null);
  };

  // Group operations by type
  const statusOperations = bulkOperations.filter(op => op.type === 'status');
  const priorityOperations = bulkOperations.filter(op => op.type === 'priority');
  const phaseOperations = bulkOperations.filter(op => op.type === 'phase');
  const otherOperations = bulkOperations.filter(op => !['status', 'priority', 'phase'].includes(op.type));

  const getOperationIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      CheckCircle,
      CheckCircle2,
      Play,
      AlertCircle,
      ArrowUp,
      ArrowDown,
      Minus,
      Search,
      Brain,
      Wrench,
      CheckSquare,
      Trash2,
      Users,
      Tag
    };
    const IconComponent = icons[iconName] || MoreHorizontal;
    return <IconComponent className="w-4 h-4" />;
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedCount} of {totalCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isProcessing}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            {/* Operations */}
            <div className="flex items-center gap-2">
              {/* Status Operations */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Status
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusOperations.map((operation) => (
                    <DropdownMenuItem
                      key={operation.id}
                      onClick={() => handleOperationClick(operation, { status: getStatusFromOperation(operation) })}
                      className="flex items-center gap-2"
                    >
                      {getOperationIcon(operation.icon)}
                      {operation.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Operations */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}>
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Priority
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {priorityOperations.map((operation) => (
                    <DropdownMenuItem
                      key={operation.id}
                      onClick={() => handleOperationClick(operation, { priority: getPriorityFromOperation(operation) })}
                      className="flex items-center gap-2"
                    >
                      {getOperationIcon(operation.icon)}
                      {operation.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Phase Operations */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isProcessing}>
                    <Search className="w-4 h-4 mr-2" />
                    Phase
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Phase</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {phaseOperations.map((operation) => (
                    <DropdownMenuItem
                      key={operation.id}
                      onClick={() => handleOperationClick(operation, { phase: getPhaseFromOperation(operation) })}
                      className="flex items-center gap-2"
                    >
                      {getOperationIcon(operation.icon)}
                      {operation.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              {/* Other Operations */}
              {otherOperations.map((operation) => (
                <Button
                  key={operation.id}
                  variant={operation.destructive ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleOperationClick(operation)}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {getOperationIcon(operation.icon)}
                  {operation.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingOperation} onOpenChange={cancelOperation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {pendingOperation?.operation.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingOperation?.operation.description}
              {pendingOperation?.operation.destructive && (
                <span className="block mt-2 text-red-600 font-medium">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelOperation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmOperation}
              className={pendingOperation?.operation.destructive ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper functions to extract values from operation IDs
function getStatusFromOperation(operation: BulkOperation): TaskStatus {
  const statusMap: Record<string, TaskStatus> = {
    'status-ready': TaskStatus.READY,
    'status-in-progress': TaskStatus.IN_PROGRESS,
    'status-completed': TaskStatus.COMPLETED,
    'status-blocked': TaskStatus.BLOCKED,
    'status-cancelled': TaskStatus.CANCELLED,
    'status-draft': TaskStatus.DRAFT,
    'status-pending': TaskStatus.PENDING
  };
  return statusMap[operation.id] || TaskStatus.READY;
}

function getPriorityFromOperation(operation: BulkOperation): TaskPriority {
  const priorityMap: Record<string, TaskPriority> = {
    'priority-critical': TaskPriority.CRITICAL,
    'priority-high': TaskPriority.HIGH,
    'priority-medium': TaskPriority.MEDIUM,
    'priority-low': TaskPriority.LOW
  };
  return priorityMap[operation.id] || TaskPriority.MEDIUM;
}

function getPhaseFromOperation(operation: BulkOperation): WorkflowPhase {
  const phaseMap: Record<string, WorkflowPhase> = {
    'phase-audit': WorkflowPhase.AUDIT,
    'phase-decide': WorkflowPhase.DECIDE,
    'phase-apply': WorkflowPhase.APPLY,
    'phase-verify': WorkflowPhase.VERIFY
  };
  return phaseMap[operation.id] || WorkflowPhase.AUDIT;
}

export default BulkOperationsToolbar;
