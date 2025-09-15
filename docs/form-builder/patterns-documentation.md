# Form Builder Patterns Documentation

## Overview

This documentation provides comprehensive guidance on form patterns, templates, and best practices for the Form Builder system. It covers common use cases, design patterns, and implementation strategies for creating effective forms.

## Table of Contents

1. [Form Design Patterns](#form-design-patterns)
2. [Template Categories](#template-categories)
3. [Field Types and Usage](#field-types-and-usage)
4. [Validation Patterns](#validation-patterns)
5. [UX Best Practices](#ux-best-practices)
6. [Industry-Specific Patterns](#industry-specific-patterns)
7. [Implementation Examples](#implementation-examples)

## Form Design Patterns

### 1. Progressive Disclosure Pattern

**When to use:** Complex forms with many fields that can be grouped logically.

**Benefits:**
- Reduces cognitive load
- Improves completion rates
- Better mobile experience

**Implementation:**
```typescript
// Multi-step form structure
const steps = [
  { id: "basic", title: "Basic Information", fields: ["name", "email"] },
  { id: "details", title: "Additional Details", fields: ["phone", "address"] },
  { id: "preferences", title: "Preferences", fields: ["newsletter", "notifications"] }
]
```

### 2. Conditional Logic Pattern

**When to use:** Forms where certain fields should only appear based on previous answers.

**Benefits:**
- Personalized user experience
- Shorter forms for most users
- Reduced errors

**Implementation:**
```typescript
// Show additional fields based on selection
const conditionalFields = {
  "user_type": {
    "business": ["company_name", "tax_id", "employee_count"],
    "individual": ["date_of_birth", "occupation"]
  }
}
```

### 3. Smart Defaults Pattern

**When to use:** Forms where you can pre-populate fields with likely values.

**Benefits:**
- Faster completion
- Reduced user effort
- Higher conversion rates

**Examples:**
- Country based on IP location
- Current date for "today" selections
- Previous form data for returning users

### 4. Inline Validation Pattern

**When to use:** All forms, especially those with specific format requirements.

**Benefits:**
- Immediate feedback
- Prevents form submission errors
- Better user confidence

**Implementation:**
```typescript
const validationRules = [
  { type: "email", message: "Please enter a valid email address" },
  { type: "minLength", value: 8, message: "Password must be at least 8 characters" }
]
```

## Template Categories

### Contact & Lead Generation

**Purpose:** Capture potential customer information for follow-up.

**Key Fields:**
- Name (required)
- Email (required)
- Phone (optional)
- Company (B2B contexts)
- Message/Inquiry details

**Best Practices:**
- Keep initial fields minimal
- Use progressive disclosure for additional information
- Clear privacy policy link

### Registration & Onboarding

**Purpose:** Create user accounts and collect profile information.

**Key Fields:**
- Personal information
- Account credentials
- Preferences and settings
- Terms acceptance

**Best Practices:**
- Password strength indicator
- Email verification
- Optional fields clearly marked
- Social login options

### Feedback & Surveys

**Purpose:** Collect user opinions, satisfaction ratings, and feedback.

**Key Fields:**
- Rating scales
- Multiple choice questions
- Open-ended feedback
- Demographic information (optional)

**Best Practices:**
- Mix of question types
- Progress indication
- Anonymous option
- Clear time estimate

### Booking & Appointments

**Purpose:** Schedule services, appointments, or reservations.

**Key Fields:**
- Service/appointment type
- Date and time preferences
- Contact information
- Special requirements

**Best Practices:**
- Calendar integration
- Real-time availability
- Confirmation details
- Cancellation policy

## Field Types and Usage

### Text Inputs

| Field Type | Best For | Validation |
|------------|----------|------------|
| `text` | Names, titles, short responses | Length limits, character restrictions |
| `email` | Email addresses | Email format validation |
| `phone` | Phone numbers | Format validation, international support |
| `url` | Website addresses | URL format validation |
| `textarea` | Long text, comments, descriptions | Character limits, rich text options |

### Selection Fields

| Field Type | Best For | When to Use |
|------------|----------|-------------|
| `select` | Single choice from many options | 5+ options, save space |
| `radio` | Single choice from few options | 2-4 options, show all choices |
| `checkbox` | Multiple selections | Independent choices |
| `switch` | Boolean toggle | Simple yes/no, enable/disable |

### Date and Time

| Field Type | Best For | Considerations |
|------------|----------|----------------|
| `date` | Birthdate, appointment date | Date format, validation range |
| `time` | Appointment time, deadlines | Time format, timezone handling |

### Advanced Fields

| Field Type | Best For | Implementation Notes |
|------------|----------|---------------------|
| `file` | Document upload, images | File type restrictions, size limits |
| `signature` | Legal documents, contracts | Touch/mouse support, validation |
| `rating` | Reviews, satisfaction | Visual indicators, scale definition |
| `slider` | Range values, preferences | Min/max values, step size |

## Validation Patterns

### Real-time Validation

```typescript
// Immediate validation on field blur
const emailValidation = {
  type: "email",
  message: "Please enter a valid email address",
  validateOnBlur: true
}
```

### Dependent Validation

```typescript
// Password confirmation must match password
const passwordConfirmValidation = {
  type: "custom",
  validator: (value, formData) => value === formData.password,
  message: "Passwords must match"
}
```

### Async Validation

```typescript
// Check if username is available
const usernameValidation = {
  type: "async",
  validator: async (value) => {
    const response = await checkUsernameAvailability(value)
    return response.available
  },
  message: "Username is already taken"
}
```

## UX Best Practices

### Form Layout

1. **Single Column Layout**
   - Easier scanning and completion
   - Better mobile experience
   - Clear visual hierarchy

2. **Logical Grouping**
   - Group related fields together
   - Use visual separators
   - Clear section headings

3. **Field Spacing**
   - Adequate white space between fields
   - Consistent spacing throughout
   - Clear field boundaries

### Labels and Instructions

1. **Clear Labels**
   - Descriptive and concise
   - Above or to the left of fields
   - Avoid jargon and abbreviations

2. **Helpful Placeholders**
   - Show expected format
   - Provide examples
   - Don't replace labels

3. **Error Messages**
   - Specific and actionable
   - Appear near the field
   - Positive tone when possible

### Accessibility

1. **Keyboard Navigation**
   - Logical tab order
   - Visible focus indicators
   - Skip links for long forms

2. **Screen Reader Support**
   - Proper label associations
   - ARIA attributes
   - Error announcements

3. **Visual Design**
   - Sufficient color contrast
   - Don't rely on color alone
   - Scalable text and controls

## Industry-Specific Patterns

### Healthcare Forms

**Compliance:** HIPAA, ADA
**Key Features:**
- Patient privacy protection
- Medical history collection
- Insurance information
- Emergency contacts

**Special Considerations:**
- Secure data transmission
- Audit trails
- Consent management
- Multilingual support

### Financial Services

**Compliance:** KYC, AML, SOX
**Key Features:**
- Identity verification
- Income documentation
- Risk assessment
- Regulatory disclosures

**Special Considerations:**
- Strong authentication
- Document upload
- Digital signatures
- Compliance reporting

### Real Estate

**Compliance:** RESPA, Fair Housing
**Key Features:**
- Property search criteria
- Financial qualification
- Document collection
- Communication preferences

**Special Considerations:**
- MLS integration
- Market data
- Lead scoring
- CRM synchronization

### Education

**Compliance:** FERPA, ADA
**Key Features:**
- Student information
- Course enrollment
- Academic records
- Payment processing

**Special Considerations:**
- Age verification
- Parental consent
- Academic calendar integration
- Grade reporting

## Implementation Examples

### Basic Contact Form

```typescript
const contactForm: TemplatePattern = {
  id: "basic-contact",
  name: "Basic Contact Form",
  fields: [
    {
      id: "name",
      type: "text",
      label: "Full Name",
      required: true,
      validation: [
        { type: "required", message: "Name is required" },
        { type: "minLength", value: 2 }
      ]
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      required: true,
      validation: [
        { type: "required", message: "Email is required" },
        { type: "email", message: "Please enter a valid email" }
      ]
    },
    {
      id: "message",
      type: "textarea",
      label: "Message",
      required: true,
      validation: [
        { type: "required", message: "Message is required" },
        { type: "minLength", value: 10 }
      ]
    }
  ]
}
```

### Multi-step Registration

```typescript
const registrationForm: TemplatePattern = {
  id: "user-registration",
  name: "User Registration",
  fields: [
    // Step 1: Basic Information
    {
      id: "first_name",
      type: "text",
      label: "First Name",
      required: true,
      step: 1
    },
    {
      id: "last_name",
      type: "text",
      label: "Last Name",
      required: true,
      step: 1
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      required: true,
      step: 1
    },
    // Step 2: Account Details
    {
      id: "password",
      type: "password",
      label: "Password",
      required: true,
      step: 2
    },
    {
      id: "confirm_password",
      type: "password",
      label: "Confirm Password",
      required: true,
      step: 2
    },
    // Step 3: Preferences
    {
      id: "newsletter",
      type: "switch",
      label: "Subscribe to Newsletter",
      required: false,
      step: 3
    }
  ]
}
```

### Conditional Logic Example

```typescript
const applicationForm: TemplatePattern = {
  id: "job-application",
  name: "Job Application",
  fields: [
    {
      id: "experience_level",
      type: "select",
      label: "Experience Level",
      required: true,
      options: ["Entry Level", "Mid Level", "Senior Level", "Executive"]
    },
    {
      id: "years_experience",
      type: "number",
      label: "Years of Experience",
      required: true,
      conditionalLogic: {
        showWhen: {
          field: "experience_level",
          operator: "not_equals",
          value: "Entry Level"
        }
      }
    },
    {
      id: "portfolio_url",
      type: "url",
      label: "Portfolio URL",
      required: false,
      conditionalLogic: {
        showWhen: {
          field: "experience_level",
          operator: "in",
          value: ["Mid Level", "Senior Level", "Executive"]
        }
      }
    }
  ]
}
```

## Performance Optimization

### Form Loading

1. **Lazy Loading**
   - Load complex fields on demand
   - Progressive enhancement
   - Minimize initial bundle size

2. **Caching**
   - Cache form templates
   - Store user progress
   - Offline capabilities

### Validation Performance

1. **Debounced Validation**
   - Reduce API calls
   - Smooth user experience
   - Battery optimization

2. **Client-side First**
   - Validate locally when possible
   - Server validation for business rules
   - Clear error states

## Testing Strategies

### Usability Testing

1. **A/B Testing**
   - Form layouts
   - Field ordering
   - Button text and placement

2. **User Journey Testing**
   - Completion rates
   - Drop-off points
   - Error recovery

### Accessibility Testing

1. **Automated Testing**
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast

2. **Manual Testing**
   - Real user testing
   - Assistive technology
   - Various devices and browsers

## Conclusion

Effective form design combines user experience principles, technical implementation, and business requirements. By following these patterns and best practices, you can create forms that are both user-friendly and functionally robust.

For specific implementation details, refer to the form builder components and template library documentation.