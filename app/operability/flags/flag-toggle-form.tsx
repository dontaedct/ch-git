'use client';

import { useState, useTransition } from 'react';
import { Switch } from '@ui/switch';
import { Badge } from '@ui/badge';
import { toast } from '@ui/use-toast';
import type { FeatureFlag } from '@lib/supabase/types';

interface FlagToggleFormProps {
  flag: FeatureFlag;
}

export function FlagToggleForm({ flag }: FlagToggleFormProps) {
  const [enabled, setEnabled] = useState(flag.enabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (newEnabled: boolean) => {
    setEnabled(newEnabled);
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/flags', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: flag.tenant_id,
            key: flag.key,
            enabled: newEnabled,
            payload: flag.payload,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update flag');
        }

        toast({
          title: 'Flag updated',
          description: `${flag.key} is now ${newEnabled ? 'enabled' : 'disabled'}`,
        });
      } catch {
        // Revert on error
        setEnabled(flag.enabled);
        toast({
          title: 'Error',
          description: 'Failed to update flag',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{flag.key}</span>
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        {Object.keys(flag.payload).length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Payload: {JSON.stringify(flag.payload)}
          </p>
        )}
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label={`Toggle ${flag.key} flag`}
      />
    </div>
  );
}
