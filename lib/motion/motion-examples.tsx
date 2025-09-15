/**
 * @fileoverview HT-007 Motion System Examples & Documentation
 * @module lib/motion/motion-examples
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 2 - Motion System & Animation Framework
 * Purpose: Comprehensive examples and documentation for mono-theme motion system
 * Safety: Sandbox-isolated motion examples with accessibility support
 * Status: Phase 2 implementation - Motion system examples
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  monoThemeMotionTokens,
  pageVariants,
  cardHoverVariants,
  buttonVariants,
  modalVariants,
  staggerContainerVariants,
  listItemVariants,
  iconVariants,
  spinnerVariants,
  progressVariants,
  tooltipVariants,
  createAdvancedMotionConfig,
  createAccessibleMotion,
  createSpringConfig,
  createMotionIntersection,
  createMotionGestures,
  createMotionOrchestrator,
  EnhancedMotionPage,
  EnhancedMotionCard,
  EnhancedMotionButton,
  useMonoMotionPreferences,
} from './mono-theme-motion';

/* ========================================
   HT-007 Motion System Examples
   Comprehensive examples showcasing motion capabilities
======================================== */

// HT-007: Basic Motion Examples
export const BasicMotionExamples: React.FC = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Basic Motion Examples</h2>
      
      {/* Page Transition Example */}
      <motion.div
        variants={createAccessibleMotion(pageVariants, prefersReducedMotion)}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 bg-card rounded-lg border"
      >
        <h3 className="text-lg font-semibold mb-2">Page Transition</h3>
        <p>This card demonstrates the basic page transition animation.</p>
      </motion.div>
      
      {/* Card Hover Example */}
      <motion.div
        variants={createAccessibleMotion(cardHoverVariants, prefersReducedMotion)}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="p-6 bg-card rounded-lg border cursor-pointer"
      >
        <h3 className="text-lg font-semibold mb-2">Card Hover Effect</h3>
        <p>Hover and tap this card to see the interaction effects.</p>
      </motion.div>
      
      {/* Button Interaction Example */}
      <motion.button
        variants={createAccessibleMotion(buttonVariants, prefersReducedMotion)}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        Interactive Button
      </motion.button>
    </div>
  );
};

// HT-007: Advanced Motion Examples
export const AdvancedMotionExamples: React.FC = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const [isVisible, setIsVisible] = React.useState(false);
  const { ref, isVisible: intersectionVisible } = createMotionIntersection(0.1);
  const { gestureState, gestureHandlers } = createMotionGestures();
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Advanced Motion Examples</h2>
      
      {/* Intersection Observer Example */}
      <motion.div
        ref={ref}
        variants={createAccessibleMotion(pageVariants, prefersReducedMotion)}
        initial="initial"
        animate={intersectionVisible ? "animate" : "initial"}
        className="p-6 bg-card rounded-lg border"
      >
        <h3 className="text-lg font-semibold mb-2">Intersection Observer</h3>
        <p>This card animates when it comes into view.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Visibility: {intersectionVisible ? 'Visible' : 'Hidden'}
        </p>
      </motion.div>
      
      {/* Gesture Handling Example */}
      <motion.div
        variants={createAccessibleMotion(cardHoverVariants, prefersReducedMotion)}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        {...gestureHandlers}
        className="p-6 bg-card rounded-lg border cursor-grab active:cursor-grabbing"
      >
        <h3 className="text-lg font-semibold mb-2">Drag Gesture</h3>
        <p>Drag this card around to see gesture handling in action.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Gesture State: {JSON.stringify(gestureState, null, 2)}
        </p>
      </motion.div>
      
      {/* Spring Configuration Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['gentle', 'wobbly', 'stiff', 'slow', 'molasses'] as const).map((springType) => (
          <motion.div
            key={springType}
            variants={createAccessibleMotion(buttonVariants, prefersReducedMotion)}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            transition={createSpringConfig(springType)}
            className="p-4 bg-card rounded-lg border cursor-pointer text-center"
          >
            <h4 className="font-semibold capitalize">{springType} Spring</h4>
            <p className="text-sm text-muted-foreground">Hover to feel the difference</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// HT-007: Stagger Animation Examples
export const StaggerAnimationExamples: React.FC = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const [items, setItems] = React.useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
    { id: 4, text: 'Item 4' },
    { id: 5, text: 'Item 5' },
  ]);
  
  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    setItems(prev => [...prev, { id: newId, text: `Item ${newId}` }]);
  };
  
  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Stagger Animation Examples</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={addItem}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Add Item
        </button>
      </div>
      
      <motion.div
        variants={createAccessibleMotion(staggerContainerVariants, prefersReducedMotion)}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={createAccessibleMotion(listItemVariants, prefersReducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className="flex items-center justify-between p-4 bg-card rounded-lg border"
            >
              <span>{item.text}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// HT-007: Loading State Examples
export const LoadingStateExamples: React.FC = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  
  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Loading State Examples</h2>
      
      <button
        onClick={startLoading}
        disabled={isLoading}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Start Loading'}
      </button>
      
      {/* Spinner Example */}
      {isLoading && (
        <motion.div
          variants={createAccessibleMotion(spinnerVariants, prefersReducedMotion)}
          animate="animate"
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
        />
      )}
      
      {/* Progress Bar Example */}
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          variants={createAccessibleMotion(progressVariants, prefersReducedMotion)}
          initial="initial"
          animate="animate"
          style={{ scaleX: progress / 100 }}
          className="h-2 bg-primary rounded-full origin-left"
        />
      </div>
      
      <p className="text-center text-muted-foreground">
        Progress: {progress}%
      </p>
    </div>
  );
};

// HT-007: Modal Animation Examples
export const ModalAnimationExamples: React.FC = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Modal Animation Examples</h2>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        Open Modal
      </button>
      
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={createAccessibleMotion({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }, prefersReducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              variants={createAccessibleMotion(modalVariants, prefersReducedMotion)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card rounded-lg border p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Modal Example</h3>
                <p className="text-muted-foreground mb-6">
                  This modal demonstrates sophisticated entrance and exit animations.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Close Modal
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// HT-007: Enhanced Components Examples
export const EnhancedComponentsExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Enhanced Components Examples</h2>
      
      {/* Enhanced Motion Page */}
      <EnhancedMotionPage
        enableLayoutAnimation={true}
        enableIntersectionObserver={true}
        debugMode={false}
        className="p-6 bg-card rounded-lg border"
      >
        <h3 className="text-lg font-semibold mb-2">Enhanced Motion Page</h3>
        <p>This page component includes advanced features like layout animation and intersection observer.</p>
      </EnhancedMotionPage>
      
      {/* Enhanced Motion Card */}
      <EnhancedMotionCard
        enableHoverEffects={true}
        enableTapEffects={true}
        enableDragEffects={false}
        springType="gentle"
        className="p-6 bg-card rounded-lg border cursor-pointer"
      >
        <h3 className="text-lg font-semibold mb-2">Enhanced Motion Card</h3>
        <p>This card component includes sophisticated hover and tap effects with configurable spring animations.</p>
      </EnhancedMotionCard>
      
      {/* Enhanced Motion Button */}
      <EnhancedMotionButton
        enableRippleEffect={true}
        enableHoverGlow={true}
        enablePressFeedback={true}
        springType="wobbly"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
      >
        Enhanced Motion Button
      </EnhancedMotionButton>
    </div>
  );
};

// HT-007: Motion Orchestration Examples
export const MotionOrchestrationExamples: React.FC = () => {
  const { orchestration, playSequence, pauseSequence, resumeSequence, stopSequence, nextStep, previousStep } = createMotionOrchestrator();
  
  const sequences = [
    ['fadeIn', 'slideUp', 'scaleIn'],
    ['slideLeft', 'fadeIn', 'slideRight'],
    ['scaleIn', 'rotate', 'fadeOut'],
  ];
  
  const playRandomSequence = () => {
    const randomSequence = sequences[Math.floor(Math.random() * sequences.length)];
    playSequence(randomSequence);
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Motion Orchestration Examples</h2>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={playRandomSequence}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Play Random Sequence
        </button>
        <button
          onClick={pauseSequence}
          disabled={!orchestration.isPlaying || orchestration.isPaused}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={resumeSequence}
          disabled={!orchestration.isPaused}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50"
        >
          Resume
        </button>
        <button
          onClick={stopSequence}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg"
        >
          Stop
        </button>
        <button
          onClick={nextStep}
          disabled={!orchestration.isPlaying}
          className="px-4 py-2 bg-outline text-outline-foreground rounded-lg disabled:opacity-50"
        >
          Next Step
        </button>
        <button
          onClick={previousStep}
          disabled={!orchestration.isPlaying}
          className="px-4 py-2 bg-outline text-outline-foreground rounded-lg disabled:opacity-50"
        >
          Previous Step
        </button>
      </div>
      
      <div className="p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Orchestration Status</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Playing:</strong> {orchestration.isPlaying ? 'Yes' : 'No'}</p>
          <p><strong>Paused:</strong> {orchestration.isPaused ? 'Yes' : 'No'}</p>
          <p><strong>Current Step:</strong> {orchestration.currentStep}</p>
          <p><strong>Sequence:</strong> {orchestration.sequence.join(' → ')}</p>
        </div>
      </div>
    </div>
  );
};

// HT-007: Complete Motion System Demo
export const MotionSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('basic');
  
  const tabs = [
    { id: 'basic', label: 'Basic', component: BasicMotionExamples },
    { id: 'advanced', label: 'Advanced', component: AdvancedMotionExamples },
    { id: 'stagger', label: 'Stagger', component: StaggerAnimationExamples },
    { id: 'loading', label: 'Loading', component: LoadingStateExamples },
    { id: 'modal', label: 'Modal', component: ModalAnimationExamples },
    { id: 'enhanced', label: 'Enhanced', component: EnhancedComponentsExamples },
    { id: 'orchestration', label: 'Orchestration', component: MotionOrchestrationExamples },
  ];
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BasicMotionExamples;
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">HT-007 Motion System Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive demonstration of the mono-theme motion system capabilities.
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Active Tab Content */}
      <ActiveComponent />
    </div>
  );
};

export default MotionSystemDemo;
