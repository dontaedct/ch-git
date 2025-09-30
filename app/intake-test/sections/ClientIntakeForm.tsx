'use client'

import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Save,
  Send,
  FileText,
  Settings,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export function ClientIntakeForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    
    // Step 2: Business Details
    industry: '',
    companySize: '',
    primaryChallenges: [],
    primaryGoals: [],
    
    // Step 3: Project Requirements
    budget: '',
    timeline: '',
    specificRequirements: '',
    
    // Step 4: Technical Preferences
    preferredModules: [],
    integrations: [],
    customizations: ''
  })

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 
    'Consulting', 'Education', 'Nonprofit', 'Other'
  ]

  const companySizes = [
    'Solo', 'Small (2-10 employees)', 'Medium (11-50 employees)', 
    'Large (51-200 employees)', 'Enterprise (200+ employees)'
  ]

  const challenges = [
    'Growth', 'Efficiency', 'Technology', 'Team', 'Marketing', 
    'Finance', 'Competition', 'Compliance'
  ]

  const goals = [
    'Revenue Growth', 'Cost Reduction', 'Market Expansion', 'Product Development',
    'Team Building', 'Automation', 'Customer Satisfaction', 'Digital Transformation'
  ]

  const budgetRanges = [
    'Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000+'
  ]

  const timelines = [
    'Immediately', 'Within 1 month', 'Within 1 quarter', 'Planning phase'
  ]

  const modules = [
    'Form Builder', 'User Management', 'Analytics & Reporting', 'Communication',
    'Scheduling', 'Configuration', 'Document Management', 'Workflow Automation'
  ]

  const integrations = [
    'Email Service', 'CRM System', 'Payment Gateway', 'Calendar Integration',
    'Social Media', 'Analytics Tools', 'Database', 'API Integration'
  ]

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Business Details', icon: Building },
    { id: 3, title: 'Project Requirements', icon: Target },
    { id: 4, title: 'Technical Preferences', icon: Settings }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const submitForm = () => {
    // Simulate form submission
    console.log('Form submitted:', formData)
    alert('Client intake form submitted successfully!')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select company size</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Challenges (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {challenges.map(challenge => (
                  <label key={challenge} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.primaryChallenges.includes(challenge)}
                      onChange={(e) => handleArrayChange('primaryChallenges', challenge, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Goals (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {goals.map(goal => (
                  <label key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.primaryGoals.includes(goal)}
                      onChange={(e) => handleArrayChange('primaryGoals', goal, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range *
              </label>
              <select
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline *
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select timeline</option>
                {timelines.map(timeline => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Requirements
              </label>
              <textarea
                value={formData.specificRequirements}
                onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe any specific requirements or features needed..."
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Modules (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {modules.map(module => (
                  <label key={module} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.preferredModules.includes(module)}
                      onChange={(e) => handleArrayChange('preferredModules', module, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{module}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Integrations (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {integrations.map(integration => (
                  <label key={integration} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.integrations.includes(integration)}
                      onChange={(e) => handleArrayChange('integrations', integration, e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{integration}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Customizations
              </label>
              <textarea
                value={formData.customizations}
                onChange={(e) => handleInputChange('customizations', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe any additional customizations or special requirements..."
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Client Intake & Project Initialization</h2>
        <p className="text-lg text-gray-600">Fill out the comprehensive client intake form to create a new client project</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Step {currentStep}: {steps[currentStep - 1].title}
          </h3>
          <p className="text-gray-600">
            {currentStep === 1 && "Provide basic contact information for the new client"}
            {currentStep === 2 && "Tell us about the client's business and challenges"}
            {currentStep === 3 && "Define project requirements and timeline"}
            {currentStep === 4 && "Specify technical preferences and customizations"}
          </p>
        </div>

        {renderStepContent()}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-200 ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200">
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitForm}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
              <span>Submit & Create Client</span>
            </button>
          )}
        </div>
      </div>

      {/* DCT CLI Information */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DCT CLI Integration</h3>
            <p className="text-gray-600 mb-4">
              Upon form submission, the DCT CLI will automatically execute to initialize the new client project with the specified configuration.
            </p>
            <div className="bg-white rounded-lg p-4 font-mono text-sm">
              <div className="text-gray-500"># Automatic CLI execution:</div>
              <div className="text-gray-900">npx dct init --ci \</div>
              <div className="text-gray-900 ml-4">--name "{formData.companyName || 'Company Name'}" \</div>
              <div className="text-gray-900 ml-4">--industry {formData.industry || 'technology'} \</div>
              <div className="text-gray-900 ml-4">--size {formData.companySize || 'medium'} \</div>
              <div className="text-gray-900 ml-4">--budget {formData.budget || '15k-50k'} \</div>
              <div className="text-gray-900 ml-4">--timeline {formData.timeline || 'within-month'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
