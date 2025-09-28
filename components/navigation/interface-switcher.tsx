/**
 * @fileoverview Interface Switcher Component - HT-034.7.3
 * @module components/navigation/interface-switcher
 * @author OSS Hero System
 * @version 1.0.0
 *
 * Interface switcher component that provides smooth transitions between
 * admin and agency-toolkit interfaces with visual feedback and context preservation.
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Shield,
  Target,
  ArrowRight,
  ExternalLink,
  Settings,
  Home,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InterfaceInfo {
  id: 'admin' | 'agency-toolkit' | 'public';
  name: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  features: string[];
  badge?: string;
}

const interfaces: InterfaceInfo[] = [
  {
    id: 'admin',
    name: 'Admin Panel',
    description: 'System administration and management',
    icon: Shield,
    color: 'blue',
    href: '/admin',
    features: [
      'User Management',
      'System Settings',
      'Security Controls',
      'Analytics Dashboard',
      'Template Management'
    ],
    badge: 'Enterprise'
  },
  {
    id: 'agency-toolkit',
    name: 'Agency Toolkit',
    description: 'Development and client management platform',
    icon: Target,
    color: 'purple',
    href: '/agency-toolkit',
    features: [
      'App Builder',
      'Client Management',
      'Template Library',
      'Form Builder',
      'Deployment Tools'
    ],
    badge: 'Professional'
  }
];

interface InterfaceSwitcherProps {
  currentInterface: 'admin' | 'agency-toolkit' | 'public';
  variant?: 'button' | 'card' | 'dropdown';
  showTransition?: boolean;
  className?: string;
}

interface TransitionState {
  isTransitioning: boolean;
  from: string;
  to: string;
  progress: number;
}

/**
 * Interface Card Component
 */
function InterfaceCard({
  interface: interfaceInfo,
  current,
  onSelect,
  disabled = false
}: {
  interface: InterfaceInfo;
  current: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'bg-blue-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
      accent: 'bg-purple-600'
    }
  };

  const colors = colorClasses[interfaceInfo.color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          current ? colors.border : "hover:border-gray-300 dark:hover:border-gray-600",
          current && colors.bg,
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={disabled ? undefined : onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                current ? colors.accent : "bg-gray-100 dark:bg-gray-800"
              )}>
                <interfaceInfo.icon className={cn(
                  "w-5 h-5",
                  current ? "text-white" : colors.icon
                )} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {interfaceInfo.name}
                </CardTitle>
                {interfaceInfo.badge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {interfaceInfo.badge}
                  </Badge>
                )}
              </div>
            </div>
            {current ? (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Current
              </Badge>
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {interfaceInfo.description}
          </p>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Key Features
            </h4>
            <div className="flex flex-wrap gap-1">
              {interfaceInfo.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {interfaceInfo.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{interfaceInfo.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Transition Animation Component
 */
function TransitionAnimation({ state }: { state: TransitionState }) {
  return (
    <AnimatePresence>
      {state.isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </motion.div>

            <h3 className="text-lg font-semibold mb-2">
              Switching Interface
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transitioning from {state.from} to {state.to}...
            </p>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Quick Switch Button Component
 */
function QuickSwitchButton({
  currentInterface,
  showTransition = true
}: {
  currentInterface: 'admin' | 'agency-toolkit' | 'public';
  showTransition?: boolean;
}) {
  const router = useRouter();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    from: '',
    to: '',
    progress: 0
  });

  const targetInterface = currentInterface === 'admin' ? 'agency-toolkit' : 'admin';
  const targetInfo = interfaces.find(i => i.id === targetInterface);

  if (!targetInfo || currentInterface === 'public') return null;

  const handleSwitch = async () => {
    if (!showTransition) {
      router.push(targetInfo.href);
      return;
    }

    const currentInfo = interfaces.find(i => i.id === currentInterface);
    if (!currentInfo) return;

    setTransitionState({
      isTransitioning: true,
      from: currentInfo.name,
      to: targetInfo.name,
      progress: 0
    });

    // Simulate transition progress
    const progressSteps = [20, 40, 60, 80, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setTransitionState(prev => ({ ...prev, progress: step }));
    }

    // Navigate to target interface
    router.push(targetInfo.href);

    // Reset transition state
    setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        from: '',
        to: '',
        progress: 0
      });
    }, 500);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitch}
              className="relative overflow-hidden group"
            >
              <targetInfo.icon className="w-4 h-4 mr-2" />
              Switch to {targetInfo.name}
              <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {targetInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TransitionAnimation state={transitionState} />
    </>
  );
}

/**
 * Main Interface Switcher Component
 */
export function InterfaceSwitcher({
  currentInterface,
  variant = 'button',
  showTransition = true,
  className
}: InterfaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    from: '',
    to: '',
    progress: 0
  });

  const handleInterfaceSelect = async (targetInterface: InterfaceInfo) => {
    if (targetInterface.id === currentInterface) {
      setOpen(false);
      return;
    }

    setOpen(false);

    if (!showTransition) {
      router.push(targetInterface.href);
      return;
    }

    const currentInfo = interfaces.find(i => i.id === currentInterface);
    if (!currentInfo) return;

    setTransitionState({
      isTransitioning: true,
      from: currentInfo.name,
      to: targetInterface.name,
      progress: 0
    });

    // Simulate transition progress
    const progressSteps = [20, 40, 60, 80, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setTransitionState(prev => ({ ...prev, progress: step }));
    }

    // Navigate to target interface
    router.push(targetInterface.href);

    // Reset transition state
    setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        from: '',
        to: '',
        progress: 0
      });
    }, 500);
  };

  if (variant === 'button') {
    return (
      <>
        <QuickSwitchButton
          currentInterface={currentInterface}
          showTransition={showTransition}
        />
      </>
    );
  }

  return (
    <div className={cn("", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Switch Interface
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Choose Interface</span>
            </DialogTitle>
            <DialogDescription>
              Select the interface that best fits your current workflow. Each interface is optimized for specific tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {interfaces.map((interfaceInfo) => (
              <InterfaceCard
                key={interfaceInfo.id}
                interface={interfaceInfo}
                current={interfaceInfo.id === currentInterface}
                onSelect={() => handleInterfaceSelect(interfaceInfo)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <TransitionAnimation state={transitionState} />
    </div>
  );
}

export { QuickSwitchButton };
export default InterfaceSwitcher;