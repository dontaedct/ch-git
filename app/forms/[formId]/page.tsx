/**
 * @fileoverview Individual Form View Page
 * Detailed form view with analytics and customization options
 */
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function FormDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  // Mock form data - in real app, this would be fetched based on formId
  const form = {
    id: params.formId,
    name: "Contact Form",
    description: "Simple contact form with name, email, and message fields for customer inquiries",
    category: "contact",
    type: "Basic",
    status: "active",
    created: "2024-01-01",
    lastUpdated: "2024-01-15",
    fields: [
      { name: "name", type: "text", label: "Full Name", required: true },
      { name: "email", type: "email", label: "Email Address", required: true },
      { name: "phone", type: "phone", label: "Phone Number", required: false },
      { name: "message", type: "textarea", label: "Message", required: true }
    ],
    submissions: {
      total: 1250,
      thisMonth: 156,
      thisWeek: 42,
      today: 8
    },
    analytics: {
      conversionRate: 85,
      averageTime: "2m 34s",
      completionRate: 92,
      abandonmentPoints: [
        { field: "phone", rate: 8 },
        { field: "message", rate: 15 }
      ]
    },
    integrations: ["Email", "CRM", "Slack"],
    settings: {
      redirectUrl: "/thank-you",
      emailNotifications: true,
      saveResponses: true,
      requireCaptcha: false,
      allowFileUploads: false
    }
  };

  const submissionData = [
    { date: "2024-01-15", submissions: 8, conversions: 7 },
    { date: "2024-01-14", submissions: 12, conversions: 10 },
    { date: "2024-01-13", submissions: 6, conversions: 5 },
    { date: "2024-01-12", submissions: 15, conversions: 13 },
    { date: "2024-01-11", submissions: 9, conversions: 8 },
    { date: "2024-01-10", submissions: 11, conversions: 9 },
    { date: "2024-01-09", submissions: 14, conversions: 12 }
  ];

  const recentSubmissions = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      message: "Interested in your services...",
      submitted: "2024-01-15T10:30:00Z",
      status: "new"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "",
      message: "Need help with project...",
      submitted: "2024-01-15T09:15:00Z",
      status: "reviewed"
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1234567891",
      message: "Quick question about pricing...",
      submitted: "2024-01-15T08:45:00Z",
      status: "responded"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "text-blue-600 bg-blue-50 border-blue-200";
      case "reviewed": return "text-orange-600 bg-orange-50 border-orange-200";
      case "responded": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/forms"
              className="text-black/60 hover:text-black transition-colors"
            >
              ← Back to Forms
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold tracking-wide uppercase text-black">
                  {form.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  form.status === "active" ? "text-green-600 bg-green-50 border-green-200" :
                  "text-gray-600 bg-gray-50 border-gray-200"
                }`}>
                  {form.status}
                </span>
              </div>
              <p className="text-black/80 mb-4 leading-relaxed">
                {form.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-black/60">
                <span>📊 {form.submissions.total} total submissions</span>
                <span>📈 {form.analytics.conversionRate}% conversion rate</span>
                <span>⏱️ {form.analytics.averageTime} avg. completion time</span>
                <span>📝 {form.fields.length} fields</span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex gap-3">
              <button className="px-6 py-3 bg-white text-black rounded-lg border-2 border-black/30 font-bold transition-all duration-300 hover:border-black/50">
                Preview Form
              </button>
              <Link
                href={`/forms/${form.id}/edit`}
                className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black"
              >
                Edit Form
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-6 rounded-lg border-2 border-black/30 bg-black/5">
            <div className="text-2xl font-bold text-black">{form.submissions.total}</div>
            <div className="text-sm text-black/60">Total Submissions</div>
            <div className="mt-2 text-xs text-green-600">+{form.submissions.thisMonth} this month</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-green-300 bg-green-50">
            <div className="text-2xl font-bold text-green-600">{form.analytics.conversionRate}%</div>
            <div className="text-sm text-green-600">Conversion Rate</div>
            <div className="mt-2 text-xs text-green-600">+3% from last month</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{form.analytics.completionRate}%</div>
            <div className="text-sm text-blue-600">Completion Rate</div>
            <div className="mt-2 text-xs text-blue-600">+5% from last month</div>
          </div>
          <div className="p-6 rounded-lg border-2 border-purple-300 bg-purple-50">
            <div className="text-2xl font-bold text-purple-600">{form.submissions.today}</div>
            <div className="text-sm text-purple-600">Today&apos;s Submissions</div>
            <div className="mt-2 text-xs text-purple-600">{form.submissions.thisWeek} this week</div>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  timeRange === range
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/30 hover:border-black/50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 border-b border-black/20">
            {["overview", "submissions", "analytics", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 transition-all duration-300 text-sm font-medium uppercase tracking-wide ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-black/60 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Form Fields</h3>
                <div className="space-y-3">
                  {form.fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-black/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <div>
                          <div className="font-medium text-black">{field.label}</div>
                          <div className="text-sm text-black/60 capitalize">{field.type}</div>
                        </div>
                      </div>
                      {field.required && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-black mb-4 mt-8">Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {form.integrations.map((integration, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/5 text-black/70 text-sm rounded border border-black/20"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-4">Submissions Chart</h3>
                <div className="space-y-3">
                  {submissionData.reverse().map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm text-black/60 w-20">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-black h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(item.submissions / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-black w-16 text-right">
                        {item.submissions}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-black mb-4 mt-8">Form Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/60">Category:</span>
                    <span className="text-black font-medium">{form.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Type:</span>
                    <span className="text-black font-medium">{form.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Created:</span>
                    <span className="text-black font-medium">{new Date(form.created).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Last Updated:</span>
                    <span className="text-black font-medium">{new Date(form.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black">Recent Submissions</h3>
                <button className="px-4 py-2 bg-black text-white rounded-lg border-2 border-black transition-all duration-300 hover:bg-white hover:text-black">
                  Export CSV
                </button>
              </div>
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="p-6 border-2 border-black/30 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-black">{submission.name}</h4>
                        <p className="text-black/60 text-sm">{submission.email}</p>
                        {submission.phone && (
                          <p className="text-black/60 text-sm">{submission.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        <div className="text-xs text-black/60 mt-1">
                          {new Date(submission.submitted).toLocaleDateString()} at{" "}
                          {new Date(submission.submitted).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black mb-1">Message:</div>
                      <p className="text-black/80 text-sm bg-black/5 p-3 rounded border border-black/20">
                        {submission.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Form Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Abandonment Points</h4>
                  <div className="space-y-3">
                    {form.analytics.abandonmentPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-black/20 rounded-lg">
                        <div>
                          <div className="font-medium text-black capitalize">{point.field} Field</div>
                          <div className="text-sm text-black/60">Users who abandoned at this field</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">{point.rate}%</div>
                          <div className="text-xs text-black/60">abandonment rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="p-4 border border-black/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-black/60">Average Completion Time</span>
                        <span className="font-bold text-black">{form.analytics.averageTime}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }} />
                      </div>
                    </div>
                    <div className="p-4 border border-black/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-black/60">Completion Rate</span>
                        <span className="font-bold text-black">{form.analytics.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${form.analytics.completionRate}%` }} />
                      </div>
                    </div>
                    <div className="p-4 border border-black/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-black/60">Conversion Rate</span>
                        <span className="font-bold text-black">{form.analytics.conversionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${form.analytics.conversionRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h3 className="text-xl font-bold text-black mb-6">Form Settings</h3>
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Redirect URL</label>
                  <input
                    type="url"
                    value={form.settings.redirectUrl}
                    className="w-full px-4 py-3 border-2 border-black/30 rounded-lg focus:border-black outline-none transition-all duration-300"
                    placeholder="https://example.com/thank-you"
                  />
                  <p className="text-xs text-black/60 mt-1">Where to redirect users after form submission</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.settings.emailNotifications}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-black">Email Notifications</div>
                      <div className="text-sm text-black/60">Send email when form is submitted</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.settings.saveResponses}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-black">Save Responses</div>
                      <div className="text-sm text-black/60">Store form submissions in database</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.settings.requireCaptcha}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-black">Require CAPTCHA</div>
                      <div className="text-sm text-black/60">Add CAPTCHA verification to prevent spam</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.settings.allowFileUploads}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="font-medium text-black">Allow File Uploads</div>
                      <div className="text-sm text-black/60">Enable file upload fields in the form</div>
                    </div>
                  </label>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-3 bg-black text-white rounded-lg border-2 border-black font-bold transition-all duration-300 hover:bg-white hover:text-black">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}