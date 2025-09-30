'use client'

import { 
  Type, 
  CheckSquare, 
  Calendar, 
  Upload, 
  Code, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function FormsSection() {
  const fieldTypes = [
    {
      category: 'Text Fields',
      icon: Type,
      fields: ['Text', 'Email', 'Phone', 'Number', 'Password', 'URL'],
      description: 'Basic text input fields with validation and formatting options.'
    },
    {
      category: 'Selection Fields',
      icon: CheckSquare,
      fields: ['Select', 'Multi-select', 'Radio', 'Checkbox'],
      description: 'Choice-based fields for user selection and preferences.'
    },
    {
      category: 'Date/Time',
      icon: Calendar,
      fields: ['Date', 'Time', 'DateTime', 'Date Range'],
      description: 'Temporal input fields with calendar integration and validation.'
    },
    {
      category: 'File Fields',
      icon: Upload,
      fields: ['File Upload', 'Image Upload', 'Signature'],
      description: 'File handling fields with upload capabilities and validation.'
    },
    {
      category: 'Advanced',
      icon: Code,
      fields: ['Rich Text', 'Code', 'JSON', 'Rating', 'Address'],
      description: 'Specialized fields for complex data input and formatting.'
    }
  ]

  const validationTypes = [
    'Required field validation',
    'Email format validation',
    'Phone number validation',
    'Minimum/maximum length',
    'Custom regex patterns',
    'File type validation',
    'File size limits',
    'Date range validation',
    'Number range validation',
    'Conditional validation'
  ]

  return (
    <section id="forms" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Advanced Form Builder
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create sophisticated forms with 21 field types, comprehensive validation, 
            and conditional logic for any business requirement.
          </p>
        </div>

        {/* Field Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {fieldTypes.map((category, index) => (
            <div
              key={category.category}
              className="group p-8 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <category.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                {category.category}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {category.description}
              </p>

              <div className="space-y-2">
                {category.fields.map((field) => (
                  <div key={field} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {field}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Form Builder Features */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Powerful Form Builder Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drag-and-drop interface with advanced customization options and real-time preview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Validation System */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Validation System</h4>
              <div className="space-y-3">
                {validationTypes.map((validation) => (
                  <div key={validation} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {validation}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Features */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Advanced Features</h4>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Drag-and-drop form builder
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Conditional logic and branching
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Real-time form preview
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Custom styling and themes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Multi-step form support
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Progress indicators
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Auto-save functionality
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Form analytics and tracking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Contact Form Example */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">Contact Form Example</h4>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-20 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-purple-600 rounded-lg"></div>
            </div>
          </div>

          {/* Survey Form Example */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">Survey Form Example</h4>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-gray-300" />
                <Star className="w-5 h-5 text-gray-300" />
              </div>
              <div className="h-10 bg-purple-600 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="group bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold text-lg flex items-center mx-auto">
            Start Building Forms
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  )
}
