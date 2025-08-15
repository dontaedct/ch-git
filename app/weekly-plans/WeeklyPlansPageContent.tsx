'use client';

import { useState } from "react";
import { WeeklyPlan, Client } from "@/lib/supabase/types";
import Link from 'next/link';

interface WeeklyPlansPageContentProps {
  initialData: {
    plans: WeeklyPlan[];
    clients: Client[];
  };
}

export function WeeklyPlansPageContent({ initialData }: WeeklyPlansPageContentProps) {
  const [plans, setPlans] = useState<WeeklyPlan[]>(initialData.plans);
  const [clients] = useState<Client[]>(initialData.clients);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreatePlan = async (formData: FormData) => {
    setIsCreating(true);
    setMessage(null);

    try {
      const formDataObj = Object.fromEntries(formData.entries());
      const response = await fetch('/api/weekly-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj),
      });
      
      const result = await response.json();
      if (result.ok) {
        setMessage({ type: 'success', text: 'Weekly plan created successfully!' });
        setShowCreateForm(false);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleTask = async (planId: string, taskIndex: number) => {
    try {
      const updatedPlans = plans.map(plan => {
        if (plan.id === planId) {
          const updatedTasks = [...(plan.tasks ?? [])];
          const currentTask = updatedTasks[taskIndex];
          if (currentTask) {
            updatedTasks[taskIndex] = {
              ...currentTask,
              completed: !currentTask.completed
            };
          }
          return { ...plan, tasks: updatedTasks };
        }
        return plan;
      });
      setPlans(updatedPlans);

      // Update in database
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        const updatedTasks = [...(plan.tasks ?? [])];
        const currentTask = updatedTasks[taskIndex];
        if (currentTask) {
          updatedTasks[taskIndex] = {
            ...currentTask,
            completed: !currentTask.completed
          };
        }
        
        const response = await fetch(`/api/weekly-plans?id=${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tasks: updatedTasks }),
        });
        
        if (!response.ok) {
          console.error('Failed to update weekly plan');
        }
      }
    } catch (error) {
      if (process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.error('Failed to update task:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Weekly Plans</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sessions
              </Link>
              <Link href="/trainer-profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-display font-bold text-gray-900 mb-4">
            Manage Weekly Plans
          </h1>
          <p className="text-body text-gray-600 max-w-2xl mx-auto">
            Create personalized weekly plans for your clients with specific goals and actionable tasks.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Create Plan Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showCreateForm ? 'Cancel' : 'Create New Plan'}
          </button>
        </div>

        {/* Create Plan Form */}
        {showCreateForm && (
          <div className="mb-12 animate-fade-in-up">
            <div className="card card-hover p-8">
              <h2 className="text-headline font-semibold text-gray-900 mb-6">Create Weekly Plan</h2>
               
              <form action={handleCreatePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="client_id" className="text-sm font-medium text-gray-700">
                      Client *
                    </label>
                    <select
                      id="client_id"
                      name="client_id"
                      className="input w-full focus-ring"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Plan Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g., Week 1: Foundation Building"
                      className="input w-full focus-ring"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="week_start_date" className="text-sm font-medium text-gray-700">
                      Week Start Date *
                    </label>
                    <input
                      id="week_start_date"
                      name="week_start_date"
                      type="date"
                      className="input w-full focus-ring"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="week_end_date" className="text-sm font-medium text-gray-700">
                      Week End Date *
                    </label>
                    <input
                      id="week_end_date"
                      name="week_end_date"
                      type="date"
                      className="input w-full focus-ring"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of this week's focus..."
                    rows={3}
                    className="input w-full focus-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="goals" className="text-sm font-medium text-gray-700">
                    Weekly Goals *
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    placeholder="Enter goals separated by commas (e.g., Build strength, Improve form, Increase endurance)"
                    rows={2}
                    className="input w-full focus-ring"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    Sample Tasks (you can edit these after creation)
                  </label>
                  <div className="space-y-3">
                    {['Morning workout', 'Nutrition tracking', 'Evening stretching'].map((task, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          name={`task_${index}`}
                          type="text"
                          defaultValue={task}
                          className="input flex-1 focus-ring"
                          required
                        />
                        <select
                          name={`task_category_${index}`}
                          className="input focus-ring"
                          defaultValue="workout"
                        >
                          <option value="workout">Workout</option>
                          <option value="nutrition">Nutrition</option>
                          <option value="mindfulness">Mindfulness</option>
                          <option value="other">Other</option>
                        </select>
                        <select
                          name={`task_frequency_${index}`}
                          className="input focus-ring"
                          defaultValue="daily"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Plan...
                      </>
                    ) : (
                      <>
                        Create Weekly Plan
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plans List */}
        <div className="space-y-8">
          {plans.length > 0 ? (
            plans.map(plan => (
              <div key={plan.id} className="card card-hover p-8 animate-fade-in-up">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-headline font-semibold text-gray-900 mb-2">{plan.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {plan.week_start_date ? new Date(plan.week_start_date).toLocaleDateString() : 'No start date'} - {plan.week_end_date ? new Date(plan.week_end_date).toLocaleDateString() : 'No end date'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' :
                        plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                )}

                {plan.goals && plan.goals.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.goals.map((goal, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {goal.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tasks</h4>
                  <div className="space-y-3">
                    {plan.tasks?.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(plan.id, index)}
                          className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-colors"
                        />
                        <div className="flex-1">
                          <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.category === 'workout' ? 'bg-red-100 text-red-800' :
                            task.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                            task.category === 'mindfulness' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.category}
                          </span>
                          <span className="text-xs text-gray-500">{task.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No weekly plans yet</h3>
              <p className="text-gray-500">Create your first weekly plan to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
