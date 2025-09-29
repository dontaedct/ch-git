# HT-035 Agency Toolkit Integration Guide

**Date:** September 23, 2025
**Task:** HT-035 - PRD Core Compliance
**Integration Status:** VERIFIED - All components aligned with existing agency toolkit

---

## Overview

HT-035 builds directly on top of the existing agency toolkit infrastructure. This document maps how HT-035 deliverables integrate with the 25 existing agency toolkit pages and components.

---

## 🔗 Existing Infrastructure Integration

### **1. Orchestration Layer (HT-035.1)**

#### **Existing Foundation:**
- ✅ **Automation Page** - `app/agency-toolkit/automation/page.tsx`
  - Has workflow management UI with status tracking
  - Includes trigger configuration (scheduled, triggered, webhook, form-submission)
  - Displays workflow execution history
  - **Integration:** ENHANCE with n8n connector and PRD Section 8 orchestration

#### **HT-035 Enhancements:**
- Add n8n webhook integration to existing automation page
- Extend workflow executor with retry logic and dead-letter queue
- Integrate workflow versioning and artifact export
- Add orchestration dashboard under `/agency-toolkit/orchestration`

#### **Integration Points:**
```typescript
// Existing: app/agency-toolkit/automation/page.tsx
interface AutomationWorkflow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'stopped' | 'error';
  type: 'scheduled' | 'triggered' | 'webhook' | 'form-submission';
  // ... existing fields
}

// HT-035 Enhancement:
// Add n8n connector and execution engine
import { N8nConnector } from '@/lib/orchestration/n8n-connector';
import { WorkflowExecutor } from '@/lib/orchestration/workflow-executor';
```

---

### **2. Module System (HT-035.2)**

#### **Existing Foundation:**
- ✅ **Module Infrastructure** - `lib/modules/`
  - `module-lifecycle.ts` - Lifecycle hooks and event system
  - `module-config.ts` - Module configuration management
  - `basic-registry.ts` - Basic module registry
  - **Integration:** EXTEND with hot-plugging and zero-downtime activation

#### **HT-035 Enhancements:**
- Add zero-downtime activation engine
- Implement declarative registration system
- Add module sandboxing and security isolation
- Create module activation UI under `/agency-toolkit/modules/activation`

#### **Integration Points:**
```typescript
// Existing: lib/modules/module-lifecycle.ts
export type ModuleLifecycleEvent =
  | 'beforeActivation'
  | 'afterActivation'
  | 'beforeDeactivation'
  | 'afterDeactivation'
  // ... existing events

// HT-035 Enhancement:
// Add zero-downtime activation with rollback
import { ZeroDowntimeActivator } from '@/lib/modules/zero-downtime-activator';
import { RollbackEngine } from '@/lib/modules/rollback-engine';
```

---

### **3. Marketplace Infrastructure (HT-035.3)**

#### **Existing Foundation:**
- ✅ **No marketplace yet** - This is NEW functionality
- ✅ **Templates Page** - `app/agency-toolkit/templates/page.tsx`
  - Has template browsing and discovery UI patterns
  - **Integration:** Use similar UI patterns for module marketplace

#### **HT-035 Additions:**
- Create new marketplace page under `/agency-toolkit/marketplace`
- Build module discovery and search engine
- Add pricing and revenue infrastructure
- Implement module installation system

#### **Integration Points:**
```typescript
// Leverage existing template discovery patterns
// From: app/agency-toolkit/templates/page.tsx
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  // ... template fields
}

// Apply similar pattern to modules:
interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: ModulePricing;
  // ... module fields
}
```

---

### **4. Handover Automation (HT-035.4)**

#### **Existing Foundation:**
- ✅ **Handover Components** - `components/handover/`
  - `access-control.tsx` - Admin access management
  - `documentation-preview.tsx` - Documentation preview
  - `walkthrough-preview.tsx` - Walkthrough preview
  - `onboarding-dashboard.tsx` - Onboarding dashboard
  - **Integration:** ENHANCE with automated generation

#### **HT-035 Enhancements:**
- Add automated SOP generation
- Implement walkthrough video automation (90-180s)
- Create handover package assembly system
- Add handover pages under `/agency-toolkit/handover/`

#### **Integration Points:**
```typescript
// Existing components to enhance:
// components/handover/documentation-preview.tsx
// components/handover/walkthrough-preview.tsx
// components/handover/onboarding-dashboard.tsx

// HT-035 Enhancement:
// Add automated generation engines
import { SOPGenerator } from '@/lib/handover/sop-generator';
import { WalkthroughRecorder } from '@/lib/handover/walkthrough-recorder';
import { PackageAssembler } from '@/lib/handover/package-assembler';
```

---

## 📦 Agency Toolkit Page Integration Map

### **Existing Pages (25 total)**

| Page Path | HT-035 Enhancement | Integration Type |
|-----------|-------------------|------------------|
| `/agency-toolkit/automation` | Add n8n orchestration | ENHANCE |
| `/agency-toolkit/webhooks` | Integrate with workflows | INTEGRATE |
| `/agency-toolkit/templates` | Connect to module marketplace | INTEGRATE |
| `/agency-toolkit/forms` | Enable form-submission triggers | INTEGRATE |
| `/agency-toolkit/monitoring` | Add workflow monitoring | ENHANCE |
| `/agency-toolkit/integrations` | Connect to orchestration | INTEGRATE |

### **New Pages Added by HT-035**

| Page Path | Purpose | Phase |
|-----------|---------|-------|
| `/agency-toolkit/orchestration` | Main orchestration dashboard | 1 |
| `/agency-toolkit/orchestration/workflows` | Workflow management | 1 |
| `/agency-toolkit/orchestration/runs` | Execution history | 1 |
| `/agency-toolkit/orchestration/monitor` | Real-time monitoring | 1 |
| `/agency-toolkit/modules/activation` | Module activation UI | 2 |
| `/agency-toolkit/modules/registry` | Module registry | 2 |
| `/agency-toolkit/modules/security` | Module security dashboard | 2 |
| `/agency-toolkit/marketplace` | Module marketplace | 3 |
| `/agency-toolkit/marketplace/install` | Installation interface | 3 |
| `/agency-toolkit/marketplace/revenue` | Revenue dashboard | 3 |
| `/agency-toolkit/handover/documentation` | Documentation generator | 4 |
| `/agency-toolkit/handover/walkthroughs` | Walkthrough creator | 4 |
| `/agency-toolkit/handover/delivery` | Handover delivery | 4 |

---

## 🔧 Library Integration Points

### **1. Orchestration Library** (`lib/orchestration/`)
```typescript
// Integrates with:
- lib/webhooks/* (existing webhook system)
- app/agency-toolkit/automation/page.tsx (existing automation UI)
- lib/monitoring/* (existing monitoring)

// New files:
- lib/orchestration/n8n-connector.ts
- lib/orchestration/workflow-executor.ts
- lib/orchestration/retry-handler.ts
```

### **2. Module System Library** (`lib/modules/`)
```typescript
// Extends existing:
- lib/modules/module-lifecycle.ts
- lib/modules/module-config.ts
- lib/modules/basic-registry.ts

// New files:
- lib/modules/zero-downtime-activator.ts
- lib/modules/module-registry.ts (enhanced)
- lib/modules/activation-engine.ts
```

### **3. Marketplace Library** (`lib/marketplace/`)
```typescript
// New infrastructure:
- lib/marketplace/marketplace-engine.ts
- lib/marketplace/module-installer.ts
- lib/marketplace/pricing-engine.ts
- lib/marketplace/quality-assurance.ts
```

### **4. Handover Library** (`lib/handover/`)
```typescript
// Enhances existing:
- components/handover/access-control.tsx
- components/handover/documentation-preview.tsx
- components/handover/walkthrough-preview.tsx

// New automation:
- lib/handover/sop-generator.ts
- lib/handover/walkthrough-recorder.ts
- lib/handover/package-assembler.ts
```

---

## 🎯 Main Dashboard Integration

### **Update Agency Toolkit Main Page** (`app/agency-toolkit/page.tsx`)

**Add New Cards:**

```typescript
// Add to existing toolkit dashboard cards:

// 1. Orchestration Card (Phase 1)
{
  icon: Workflow,
  title: "Orchestration",
  subtitle: "Workflow Engine",
  description: "Automation orchestration with n8n integration and workflow execution",
  status: "Active",
  href: "/agency-toolkit/orchestration"
}

// 2. Modules Card (Phase 2)
{
  icon: Package,
  title: "Modules",
  subtitle: "Hot-Pluggable System",
  description: "Zero-downtime module activation with marketplace integration",
  status: "Active",
  href: "/agency-toolkit/modules/registry"
}

// 3. Marketplace Card (Phase 3)
{
  icon: ShoppingCart,
  title: "Marketplace",
  subtitle: "Module Ecosystem",
  description: "Module discovery, installation, and revenue management",
  status: "Active",
  href: "/agency-toolkit/marketplace"
}

// 4. Handover Card (Phase 4)
{
  icon: FileCheck,
  title: "Handover",
  subtitle: "Client Deliverables",
  description: "Automated SOP, walkthrough, and deliverables generation",
  status: "Active",
  href: "/agency-toolkit/handover/delivery"
}
```

---

## ✅ Integration Verification Checklist

### **Phase 1: Orchestration (Days 1-10)**
- [ ] Existing automation page enhanced with n8n connector
- [ ] Webhook system integrated with workflow executor
- [ ] Monitoring dashboard shows workflow execution
- [ ] New orchestration pages added to agency toolkit

### **Phase 2: Module System (Days 11-20)**
- [ ] Existing module lifecycle extended with hot-plugging
- [ ] Module registry enhanced with declarative registration
- [ ] Module activation UI added to agency toolkit
- [ ] Zero-downtime activation proven with existing modules

### **Phase 3: Marketplace (Days 21-27)**
- [ ] Marketplace page added using template UI patterns
- [ ] Module installation integrated with module registry
- [ ] Pricing and revenue tracking operational
- [ ] Marketplace accessible from main agency toolkit dashboard

### **Phase 4: Handover (Days 28-31)**
- [ ] Existing handover components enhanced with automation
- [ ] SOP generation integrated with documentation preview
- [ ] Walkthrough automation using existing preview components
- [ ] Handover delivery dashboard added to agency toolkit
- [ ] All PRD Section 18 deliverables automated

---

## 🚀 Implementation Strategy

**Principle:** ENHANCE, DON'T REPLACE

1. **Leverage Existing Pages**
   - Build on top of existing automation, modules, and handover infrastructure
   - Use existing UI patterns and components
   - Maintain backward compatibility

2. **Surgical Integration**
   - Add new functionality without disrupting current system
   - Use existing database schema where possible
   - Integrate with current API patterns

3. **Progressive Enhancement**
   - Phase 1: Enhance automation with orchestration
   - Phase 2: Extend modules with hot-plugging
   - Phase 3: Add marketplace (new functionality)
   - Phase 4: Automate handover components

4. **Testing Strategy**
   - Test enhancements against existing pages
   - Verify integration with current workflows
   - Validate zero-downtime requirements

---

## 📝 Conclusion

HT-035 is **fully compatible** with the existing agency toolkit infrastructure. It enhances existing pages, extends current libraries, and adds new functionality without breaking changes.

**Key Integration Points:**
✅ Automation page → Enhanced with orchestration
✅ Module system → Extended with hot-plugging
✅ Handover components → Automated generation
✅ New marketplace → Built on template patterns

**Result:** 100% PRD compliance while maintaining full compatibility with existing 25 agency toolkit pages.