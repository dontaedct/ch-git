# HT-029 Template Integration Mapping

**Date:** 2025-09-19  
**Purpose:** Mapping HT-029 templates to Agency Toolkit format

## HT-029 Template Data (Source)
```javascript
const ht029Templates = [
  {
    id: "consultation-mvp",
    name: "Consultation MVP",
    type: "consultation",
    description: "Complete consultation workflow with landing page, questionnaire, and PDF generation",
    features: ["AI Integration", "Multi-step Forms", "PDF Export", "Email Automation", "Analytics"]
  },
  {
    id: "landing-basic", 
    name: "Basic Landing Page",
    type: "landing",
    description: "Clean, responsive landing page template with lead capture",
    features: ["Responsive Design", "SEO Optimized", "Form Integration", "Analytics"]
  },
  {
    id: "questionnaire-advanced",
    name: "Advanced Questionnaire", 
    type: "questionnaire",
    description: "Multi-step questionnaire with conditional logic and real-time validation",
    features: ["Conditional Logic", "Multi-format Export", "Real-time Validation", "Progress Save"]
  },
  {
    id: "pdf-consultation",
    name: "PDF Consultation Report",
    type: "document", 
    description: "Professional consultation report template with charts and recommendations",
    features: ["Dynamic Charts", "AI Recommendations", "Professional Layout", "Branding"]
  }
];
```

## Agency Toolkit Format (Target)
```javascript
const agencyTemplates = [
  { id: 'consultation-mvp', name: "Consultation MVP", category: "Consultation" },
  { id: 'landing-basic', name: "Basic Landing Page", category: "Landing Pages" },
  { id: 'questionnaire-advanced', name: "Advanced Questionnaire", category: "Questionnaires" },
  { id: 'pdf-consultation', name: "PDF Consultation Report", category: "Documents" }
];
```

## Integration Strategy
1. Replace template data source in agency toolkit
2. Update create app form options
3. Maintain existing usage statistics logic
4. Preserve all existing functionality
