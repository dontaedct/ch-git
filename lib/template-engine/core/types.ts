export interface TemplateData {
  [key: string]: any
}

export interface TemplateMetadata {
  id: string
  name: string
  description?: string
  tags: string[]
  category: string
  createdAt: Date
  updatedAt: Date
  author?: string
  version: string
}

export interface TemplateSchema {
  variables: TemplateVariable[]
  sections: TemplateSection[]
  layout: TemplateLayout
  styling: TemplateStyling
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object'
  required: boolean
  defaultValue?: any
  description?: string
  validation?: ValidationRule[]
}

export interface TemplateSection {
  id: string
  name: string
  type: 'header' | 'content' | 'footer' | 'sidebar' | 'custom'
  content: string
  variables: string[]
  conditional?: TemplateCondition
}

export interface TemplateLayout {
  type: 'single-page' | 'multi-page' | 'dashboard' | 'custom'
  orientation: 'portrait' | 'landscape'
  margins: TemplateMargins
  header?: LayoutSection
  footer?: LayoutSection
  sections: LayoutSection[]
}

export interface TemplateStyling {
  fonts: FontConfiguration[]
  colors: ColorPalette
  spacing: SpacingConfiguration
  customCss?: string
}

export interface TemplateCondition {
  variable: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  value: any
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface TemplateMargins {
  top: number
  right: number
  bottom: number
  left: number
}

export interface LayoutSection {
  id: string
  type: string
  height?: number
  width?: number
  position: 'relative' | 'absolute' | 'fixed'
  content: string
}

export interface FontConfiguration {
  family: string
  size: number
  weight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  style: 'normal' | 'italic'
  color: string
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border: string
}

export interface SpacingConfiguration {
  small: number
  medium: number
  large: number
  xlarge: number
}

export interface Template {
  id: string
  name: string
  version: string
  type: 'document' | 'page' | 'component' | 'layout'
  schema: TemplateSchema
  content: TemplateContent
  metadata: TemplateMetadata
  inheritance?: TemplateInheritance
  branding?: ClientBranding
}

export interface TemplateContent {
  html: string
  css?: string
  javascript?: string
  assets?: TemplateAsset[]
}

export interface TemplateAsset {
  id: string
  name: string
  type: 'image' | 'font' | 'icon' | 'document'
  url: string
  size?: number
  alt?: string
}

export interface TemplateInheritance {
  parentId?: string
  overrides: TemplateOverride[]
  mergeStrategy: 'merge' | 'replace' | 'extend'
}

export interface TemplateOverride {
  path: string
  value: any
  operation: 'set' | 'merge' | 'delete'
}

export interface ClientBranding {
  id: string
  clientId: string
  name: string
  colorPalette: BrandColors
  typography: BrandTypography
  spacing: BrandSpacing
  components: BrandComponentOverrides
  assets: BrandAssets
  customCss?: string
}

export interface BrandColors {
  primary: string
  secondary: string
  accent: string
  neutral: ColorScale
  semantic: SemanticColors
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface SemanticColors {
  success: string
  warning: string
  error: string
  info: string
}

export interface BrandTypography {
  fontFamily: string
  headingFont?: string
  fontSizes: FontSizeScale
  fontWeights: FontWeightScale
  lineHeights: LineHeightScale
}

export interface FontSizeScale {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface FontWeightScale {
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
}

export interface LineHeightScale {
  tight: number
  normal: number
  relaxed: number
  loose: number
}

export interface BrandSpacing {
  scale: SpacingScale
  containerPadding: string
  sectionSpacing: string
}

export interface SpacingScale {
  px: string
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  8: string
  10: string
  12: string
  16: string
  20: string
  24: string
  32: string
}

export interface BrandComponentOverrides {
  button: ComponentOverride
  input: ComponentOverride
  card: ComponentOverride
  [key: string]: ComponentOverride
}

export interface ComponentOverride {
  styles: { [key: string]: string }
  variants?: { [variantName: string]: { [key: string]: string } }
}

export interface BrandAssets {
  logo: BrandAsset
  favicon?: BrandAsset
  images: BrandAsset[]
  fonts: BrandAsset[]
}

export interface BrandAsset {
  name: string
  url: string
  alt?: string
  variants?: BrandAssetVariant[]
}

export interface BrandAssetVariant {
  name: string
  url: string
  size?: string
  format?: string
}

export interface ComposedTemplate {
  template: Template
  data: TemplateData
  compiledContent: CompiledContent
  metadata: CompositionMetadata
}

export interface CompiledContent {
  html: string
  css: string
  javascript?: string
  assets: ResolvedAsset[]
}

export interface ResolvedAsset {
  id: string
  name: string
  type: string
  resolvedUrl: string
  optimized?: boolean
}

export interface CompositionMetadata {
  composedAt: Date
  renderTime: number
  cacheKey: string
  dependencies: string[]
}

export interface RenderedOutput {
  content: string
  format: 'html' | 'pdf' | 'docx' | 'json'
  metadata: RenderMetadata
  assets?: RenderedAsset[]
}

export interface RenderMetadata {
  renderedAt: Date
  renderTime: number
  size: number
  format: string
  quality?: number
}

export interface RenderedAsset {
  id: string
  name: string
  content: Buffer | string
  mimeType: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  path: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  path: string
  message: string
  code: string
  suggestion?: string
}

export interface VersionedTemplate {
  template: Template
  version: TemplateVersion
  changelog: VersionChange[]
}

export interface TemplateVersion {
  version: string
  timestamp: Date
  changes: VersionChange[]
  compatibility: CompatibilityInfo
  rollbackPoint: boolean
}

export interface VersionChange {
  type: 'added' | 'modified' | 'removed'
  path: string
  description: string
  impact: 'breaking' | 'feature' | 'fix' | 'style'
}

export interface CompatibilityInfo {
  minVersion: string
  maxVersion: string
  breaking: boolean
  migrations: Migration[]
}

export interface Migration {
  fromVersion: string
  toVersion: string
  script: string
  description: string
  automatic: boolean
}

export interface DocumentTemplate extends Template {
  type: 'document'
  documentType: 'pdf' | 'html' | 'docx' | 'txt'
  pageSettings: PageSettings
  sections: DocumentSection[]
}

export interface PageSettings {
  size: PageSize
  orientation: 'portrait' | 'landscape'
  margins: PageMargins
  header?: PageHeader
  footer?: PageFooter
}

export interface PageSize {
  width: number
  height: number
  unit: 'px' | 'in' | 'cm' | 'mm'
}

export interface PageMargins {
  top: number
  right: number
  bottom: number
  left: number
  unit: 'px' | 'in' | 'cm' | 'mm'
}

export interface PageHeader {
  height: number
  content: string
  showOnFirstPage: boolean
}

export interface PageFooter {
  height: number
  content: string
  showOnFirstPage: boolean
}

export interface DocumentSection {
  id: string
  name: string
  type: 'title' | 'content' | 'table' | 'image' | 'pageBreak' | 'custom'
  content: string
  variables: string[]
  styling?: SectionStyling
  conditional?: TemplateCondition
}

export interface SectionStyling {
  padding: number
  margin: number
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  fontSize?: number
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

// Missing types that are being imported but not defined
export interface DocumentTemplateData {
  [key: string]: any
}

export interface DocumentRenderedOutput {
  content: string
  format: 'html' | 'pdf' | 'docx' | 'txt'
  metadata: RenderMetadata
  assets?: RenderedAsset[]
}

export interface TemplateOverrides {
  [key: string]: any
}

export interface TemplateLayer {
  id: string
  name: string
  type: string
  content: any
  order: number
}

export interface ResolvedTemplate {
  template: Template
  data: TemplateData
  compiledContent: CompiledContent
  metadata: CompositionMetadata
}

export interface ResponsiveTemplate extends Template {
  breakpoints: ResponsiveBreakpoint[]
  variants: ResponsiveVariant[]
}

export interface ResponsiveBreakpoint {
  name: string
  minWidth: number
  maxWidth?: number
  orientation?: 'portrait' | 'landscape'
}

export interface ResponsiveVariant {
  breakpoint: string
  content: TemplateContent
  overrides: TemplateOverride[]
}

export interface ResponsiveContext {
  breakpoint: string
  device: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
  width: number
  height: number
}

export interface MicroAppTemplate {
  id: string
  name: string
  version: string
  type: 'micro-app'
  appId: string
  routes: MicroAppRoute[]
  components: MicroAppComponent[]
  schema: TemplateSchema
  content: TemplateContent
  metadata: TemplateMetadata
  inheritance?: TemplateInheritance
  branding?: ClientBranding
}

export interface MicroAppRoute {
  path: string
  component: string
  props?: Record<string, any>
  layout?: string
}

export interface MicroAppComponent {
  id: string
  name: string
  type: string
  props: Record<string, any>
  children?: MicroAppComponent[]
}

export interface CompiledTemplate {
  template: Template
  compiledContent: CompiledContent
  metadata: CompositionMetadata
}

export interface VersionCreateOptions {
  description: string
  changes: VersionChange[]
  rollbackPoint?: boolean
}

export interface VersionRollbackOptions {
  targetVersion: string
  preserveData?: boolean
}

export interface VersionComparisonResult {
  current: TemplateVersion
  target: TemplateVersion
  changes: VersionChange[]
  breaking: boolean
  migrationRequired: boolean
}