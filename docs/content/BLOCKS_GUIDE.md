# Blocks Guide - HT-006 Phase 3

**RUN_DATE**: 2025-01-27T20:32:00.000Z  
**Status**: ✅ **COMPLETED** - Phase 3 Implementation  
**Focus**: JSON-Driven Block Architecture with Zod Validation  

---

## 🎯 Overview

The Blocks system transforms pages from hardcoded components into JSON-driven compositions with comprehensive validation, error handling, and token-driven styling. This guide covers schema patterns, content authoring, and migration strategies.

## 🏗️ Architecture

### Block Structure
Each block follows a consistent pattern:
```
blocks-sandbox/
├── BlockName/
│   ├── schema.ts      # Zod validation schema
│   ├── view.tsx       # React component
│   └── demo.json      # Example content
├── registry.ts        # Block registry and validation
└── components-sandbox/
    └── BlocksRenderer.tsx  # Main renderer with error boundaries
```

### Content Structure
```json
{
  "id": "unique-block-id",
  "type": "block-type",
  "content": { /* block-specific content */ },
  "layout": { /* layout configuration */ },
  "accessibility": { /* a11y metadata */ },
  "seo": { /* SEO metadata */ }
}
```

## 📋 Available Blocks

### 1. Hero Block (`hero`)
**Purpose**: Primary landing section with headline, CTA, and visual elements

**Schema Features**:
- Dynamic headlines with semantic HTML levels
- Call-to-action buttons with routing
- Visual elements (carousel, image, video, animation)
- Badge/announcement support
- Accessibility and SEO metadata

**Example**:
```json
{
  "id": "hero-main",
  "type": "hero",
  "content": {
    "headline": {
      "text": "Welcome to Our Platform",
      "level": "h1"
    },
    "cta": {
      "primary": {
        "text": "Get Started",
        "href": "/get-started",
        "variant": "primary"
      }
    }
  }
}
```

### 2. Features Block (`features`)
**Purpose**: Showcase features with grid layouts and interactive cards

**Schema Features**:
- Grid layouts with responsive columns
- Feature cards with icons, images, and CTAs
- Interactive hover effects
- Pricing integration
- Tag system for categorization

**Example**:
```json
{
  "id": "features-showcase",
  "type": "features",
  "content": {
    "header": {
      "title": "Our Features",
      "alignment": "center"
    },
    "features": [
      {
        "id": "feature-1",
        "title": "Fast Delivery",
        "description": "Get your app in one week",
        "icon": { "type": "emoji", "value": "⚡" }
      }
    ]
  }
}
```

### 3. Testimonials Block (`testimonials`)
**Purpose**: Customer testimonials with carousel or grid layout

**Schema Features**:
- Carousel and grid display options
- Customer feedback with ratings
- Author information with avatars
- Verification badges
- Featured testimonial highlighting

**Example**:
```json
{
  "id": "testimonials-carousel",
  "type": "testimonials",
  "content": {
    "testimonials": [
      {
        "id": "testimonial-1",
        "content": "Great service!",
        "author": {
          "name": "John Doe",
          "title": "CEO",
          "company": "Acme Corp",
          "verified": true
        },
        "rating": { "value": 5, "max": 5 }
      }
    ]
  }
}
```

### 4. Pricing Block (`pricing`)
**Purpose**: Pricing tiers with comparison and CTA integration

**Schema Features**:
- Multiple pricing tiers
- Feature comparison lists
- Popular tier highlighting
- CTA integration per tier
- Pricing badges and discounts

**Example**:
```json
{
  "id": "pricing-tiers",
  "type": "pricing",
  "content": {
    "tiers": [
      {
        "id": "basic",
        "name": "Basic",
        "price": { "amount": "499", "currency": "$" },
        "features": ["Core functionality", "Email support"],
        "cta": { "text": "Get Started", "href": "/signup" }
      }
    ]
  }
}
```

### 5. FAQ Block (`faq`)
**Purpose**: Frequently asked questions with accordion functionality

**Schema Features**:
- Accordion-style Q&A display
- Category organization
- Featured FAQ highlighting
- Keyboard navigation support
- Search and filtering capabilities

**Example**:
```json
{
  "id": "faq-section",
  "type": "faq",
  "content": {
    "faqs": [
      {
        "id": "faq-1",
        "question": "How long does delivery take?",
        "answer": "Most apps are delivered within 5-7 business days.",
        "featured": true
      }
    ]
  }
}
```

### 6. CTA Block (`cta`)
**Purpose**: Conversion-focused call-to-action with trust indicators

**Schema Features**:
- Primary and secondary CTAs
- Trust indicators and badges
- Visual elements and icons
- Conversion optimization
- Brand awareness integration

**Example**:
```json
{
  "id": "cta-main",
  "type": "cta",
  "content": {
    "headline": "Ready to get started?",
    "primary": {
      "text": "Get Started",
      "href": "/get-started"
    }
  }
}
```

## 🔧 Schema Patterns

### Common Schema Structure
All blocks follow this pattern:
```typescript
export const BlockSchema = z.object({
  id: z.string().min(1, 'Block must have an ID'),
  type: z.literal('block-type'),
  content: z.object({
    // Block-specific content
  }),
  layout: z.object({
    // Layout configuration
  }),
  accessibility: z.object({
    // Accessibility metadata
  }).optional(),
  seo: z.object({
    // SEO metadata
  }).optional(),
});
```

### Layout Configuration
```typescript
layout: z.object({
  alignment: z.enum(['left', 'center', 'right']).default('center'),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', '2xl', 'full']).default('lg'),
  padding: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('lg'),
  background: z.enum(['none', 'subtle', 'gradient', 'pattern']).default('subtle'),
  className: z.string().optional(),
})
```

### Accessibility Integration
```typescript
accessibility: z.object({
  ariaLabel: z.string().optional(),
  ariaDescribedBy: z.string().optional(),
  role: z.string().optional(),
}).optional()
```

## 📝 Content Authoring Guidelines

### 1. Block ID Naming
- Use descriptive, kebab-case IDs
- Include context (e.g., `hero-main`, `features-showcase`)
- Ensure uniqueness across the page

### 2. Content Structure
- Keep content focused and scannable
- Use semantic HTML levels appropriately
- Include alt text for all images
- Provide fallbacks for optional content

### 3. Layout Considerations
- Choose appropriate max-width for content
- Use responsive padding and spacing
- Consider mobile-first design
- Test across different screen sizes

### 4. Accessibility Best Practices
- Provide meaningful aria-labels
- Use proper heading hierarchy
- Include alt text for images
- Ensure keyboard navigation works
- Test with screen readers

## 🚀 Usage Examples

### Basic Page Composition
```typescript
import { BlocksRenderer } from '@/components-sandbox/BlocksRenderer';
import pageContent from '@/content-sandbox/pages/home.json';

export default function HomePage() {
  const blocks = pageContent.page.blocks;
  
  return (
    <BlocksRenderer 
      blocks={blocks}
      className="home-page"
    />
  );
}
```

### Content Validation
```typescript
import { validateBlockContent } from '@/blocks-sandbox/registry';

const validation = validateBlockContent(blockData);
if (!validation.valid) {
  console.error('Validation error:', validation.error);
}
```

### Error Handling
```typescript
import { usePageContentValidation } from '@/components-sandbox/BlocksRenderer';

function PageEditor({ blocks }) {
  const { valid, errors, validBlocks } = usePageContentValidation(blocks);
  
  if (!valid) {
    return <ValidationErrors errors={errors} />;
  }
  
  return <BlocksRenderer blocks={validBlocks} />;
}
```

## 🔄 Migration Strategies

### From Hardcoded Components
1. **Identify Page Sections**: Map existing page sections to block types
2. **Extract Content**: Move hardcoded content to JSON files
3. **Create Schemas**: Define Zod schemas for each block type
4. **Implement Views**: Build React components using token-driven styling
5. **Test Validation**: Ensure all content passes schema validation

### Gradual Migration
1. **Start with Simple Blocks**: Begin with Hero and CTA blocks
2. **Migrate One Page at a Time**: Convert pages incrementally
3. **Maintain Fallbacks**: Keep original components as fallbacks
4. **Test Thoroughly**: Validate each migration step
5. **Update Documentation**: Keep guides current

## 🛠️ Development Workflow

### Adding New Blocks
1. **Create Schema**: Define Zod schema in `blocks-sandbox/NewBlock/schema.ts`
2. **Implement View**: Build React component in `blocks-sandbox/NewBlock/view.tsx`
3. **Add Demo Content**: Create example JSON in `blocks-sandbox/NewBlock/demo.json`
4. **Register Block**: Add to registry in `blocks-sandbox/registry.ts`
5. **Test Integration**: Verify block works with BlocksRenderer

### Content Updates
1. **Edit JSON Files**: Update content in `content-sandbox/pages/`
2. **Validate Changes**: Run schema validation
3. **Test Rendering**: Verify blocks render correctly
4. **Check Accessibility**: Ensure a11y compliance
5. **Deploy Changes**: Push validated content

## 🧪 Testing & Validation

### Schema Validation
```typescript
import { validateBlockContent } from '@/blocks-sandbox/registry';

// Validate individual block
const result = validateBlockContent(blockData);

// Validate entire page
const pageValidation = blocks.map(validateBlockContent);
```

### Visual Testing
- Use Storybook for component testing
- Capture screenshots for regression testing
- Test across different themes and brands
- Validate responsive behavior

### Accessibility Testing
- Run axe-core accessibility scans
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios

## 📊 Performance Considerations

### Optimization Strategies
- Lazy load block components
- Use React.memo for expensive renders
- Implement virtual scrolling for long lists
- Optimize images and media assets

### Bundle Size Management
- Tree-shake unused block types
- Use dynamic imports for blocks
- Minimize CSS bundle size
- Optimize token processing

## 🔍 Troubleshooting

### Common Issues

#### Validation Errors
```typescript
// Check schema compliance
const validation = validateBlockContent(content);
if (!validation.valid) {
  console.error('Schema validation failed:', validation.error);
}
```

#### Rendering Issues
```typescript
// Check block registration
const BlockView = getBlockView(blockType);
if (!BlockView) {
  console.error('No view component found for:', blockType);
}
```

#### Performance Problems
- Check for unnecessary re-renders
- Verify lazy loading implementation
- Monitor bundle size impact
- Profile component performance

## 📚 Additional Resources

### Documentation
- [Token System Guide](/docs/design/TOKENS_GUIDE.md)
- [Elements Guide](/docs/design/ELEMENTS_GUIDE.md)
- [Accessibility Guidelines](/docs/accessibility/README.md)

### Examples
- [Home Page Demo](/app/_sandbox/home/page.tsx)
- [Questionnaire Demo](/app/_sandbox/questionnaire/page.tsx)
- [Block Examples](/blocks-sandbox/*/demo.json)

### Tools
- [Block Registry](/blocks-sandbox/registry.ts)
- [Blocks Renderer](/components-sandbox/BlocksRenderer.tsx)
- [Validation Utilities](/blocks-sandbox/registry.ts#validateBlockContent)

---

## 🎯 Next Steps

### Phase 4: Refactoring Toolkit
- Implement where-used scanner
- Create automated codemods
- Build safe transformation tools
- Add rollback procedures

### Phase 5: Visual Regression Safety
- Set up Storybook configuration
- Implement screenshot baselines
- Create visual diff detection
- Establish approval workflows

### Phase 6: Documentation & Developer Experience
- Create comprehensive guides
- Build interactive demos
- Implement AI-optimized artifacts
- Establish maintenance procedures

---

*This guide represents the completion of HT-006 Phase 3, establishing a robust foundation for JSON-driven block architecture with comprehensive validation and error handling.*
