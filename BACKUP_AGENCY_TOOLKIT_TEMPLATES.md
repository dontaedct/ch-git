# Backup: Agency Toolkit Template System (Pre-HT-029 Integration)

**Date:** 2025-09-19  
**Purpose:** Backup of original template system before HT-029 integration

## Current Template Configuration

### Template Data Source (app/agency-toolkit/page.tsx, lines 88-100)
```javascript
const templates = useMemo(() => {
  const templateUsage = [
    { id: 'lead-form-pdf', name: "Lead Form + PDF Receipt", category: "Lead Generation" },
    { id: 'consultation-booking', name: "Consultation Booking System", category: "Business" },
    { id: 'ecommerce-catalog', name: "E-Commerce Product Catalog", category: "E-Commerce" },
    { id: 'survey-feedback', name: "Survey & Feedback System", category: "Survey" },
    { id: 'consultation-ai', name: "AI Consultation Generator", category: "AI/Consultation" },
  ].map(template => ({
    ...template,
    usage: apps.filter(app => app.template_id === template.id).length
  })).sort((a, b) => b.usage - a.usage);

  return templateUsage;
}, [apps]);
```

### Create App Form Options (app/agency-toolkit/page.tsx, lines 2097-2103)
```html
<option value="">Select a template...</option>
<option value="lead-form-pdf">Lead Form + PDF Receipt</option>
<option value="consultation-booking">Consultation Booking System</option>
<option value="consultation-engine">AI-Powered Consultation Engine</option>
<option value="ecommerce-catalog">E-Commerce Product Catalog</option>
<option value="survey-feedback">Survey & Feedback System</option>
```

## Template Mapping for Migration
- 'lead-form-pdf' → 'consultation-mvp' (closest match)
- 'consultation-booking' → 'consultation-mvp' (exact match)
- 'ecommerce-catalog' → 'landing-basic' (closest match)
- 'survey-feedback' → 'questionnaire-advanced' (exact match)
- 'consultation-ai' → 'consultation-mvp' (exact match)

## Notes
- All existing apps with these template_ids will continue to work
- The database schema supports any template_id string
- No API changes needed - /api/tenant-apps already handles any template_id
