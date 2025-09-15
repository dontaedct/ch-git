/**
 * @fileoverview HT-008.5.5: Typography and Spacing Preview Page
 * @module app/design/typography-spacing/page
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.5 - Create systematic spacing and typography scales
 * Focus: Vercel/Apply-level typography and spacing demonstration
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and readability)
 */

import React from "react"
import {
  Display2XL,
  DisplayXL,
  DisplayLG,
  DisplayMD,
  DisplaySM,
  HeadingXL,
  HeadingLG,
  HeadingMD,
  HeadingSM,
  HeadingXS,
  BodyXL,
  BodyLG,
  BodyMD,
  BodySM,
  BodyXS,
  LabelLG,
  LabelMD,
  LabelSM,
  LabelXS,
  CaptionLG,
  CaptionMD,
  CaptionSM,
  CodeLG,
  CodeMD,
  CodeSM,
  Lead,
  Large,
  Small,
  Muted,
  Blockquote,
  List,
  ListItem,
  InlineCode,
  TypographyContainer,
} from "@/components/ui/typography"
import {
  Padding,
  PaddingX,
  PaddingY,
  PaddingTop,
  PaddingRight,
  PaddingBottom,
  PaddingLeft,
  Margin,
  MarginX,
  MarginY,
  MarginTop,
  MarginRight,
  MarginBottom,
  MarginLeft,
  Gap,
  GapX,
  GapY,
  Space,
  SpaceX,
  SpaceY,
} from "@/components/ui/spacing"

// HT-008.5.5: Enhanced Typography and Spacing Preview
// Comprehensive demonstration of our systematic design system

export default function TypographySpacingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <DisplayLG className="mb-4">Typography & Spacing System</DisplayLG>
          <Lead className="mb-6">
            Comprehensive demonstration of our systematic typography and spacing scales,
            following Vercel/Apply design principles for enterprise-grade consistency.
          </Lead>
          <BodyMD color="muted">
            This page showcases all typography variants, spacing utilities, and design tokens
            implemented as part of HT-008.5.5.
          </BodyMD>
        </div>

        {/* Typography Scale */}
        <section className="mb-16">
          <HeadingXL className="mb-8">Typography Scale</HeadingXL>
          
          {/* Display Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Display Styles</HeadingLG>
            <TypographyContainer spacing="loose">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <Display2XL>Display 2XL - Hero Headlines</Display2XL>
                <DisplayXL>Display XL - Major Headlines</DisplayXL>
                <DisplayLG>Display LG - Section Headlines</DisplayLG>
                <DisplayMD>Display MD - Page Headlines</DisplayMD>
                <DisplaySM>Display SM - Component Headlines</DisplaySM>
              </div>
            </TypographyContainer>
          </div>

          {/* Heading Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Heading Styles</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <HeadingXL>Heading XL - Section Titles</HeadingXL>
                <HeadingLG>Heading LG - Subsection Titles</HeadingLG>
                <HeadingMD>Heading MD - Component Titles</HeadingMD>
                <HeadingSM>Heading SM - Card Titles</HeadingSM>
                <HeadingXS>Heading XS - Small Titles</HeadingXS>
              </div>
            </TypographyContainer>
          </div>

          {/* Body Text Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Body Text Styles</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <BodyXL>
                  Body XL - Large body text for important content and introductory paragraphs.
                  Perfect for lead text and emphasized content that needs to stand out.
                </BodyXL>
                <BodyLG>
                  Body LG - Standard large body text for regular content. This size provides
                  excellent readability while maintaining visual hierarchy.
                </BodyLG>
                <BodyMD>
                  Body MD - Default body text size for most content. This is our primary
                  text size for articles, descriptions, and general content.
                </BodyMD>
                <BodySM>
                  Body SM - Smaller body text for secondary content, captions, and metadata.
                  Still highly readable while being more compact.
                </BodySM>
                <BodyXS>
                  Body XS - Smallest body text for fine print, timestamps, and metadata.
                  Used sparingly for non-critical information.
                </BodyXS>
              </div>
            </TypographyContainer>
          </div>

          {/* Label Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Label Styles</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <LabelLG>Label LG - Form Labels</LabelLG>
                <LabelMD>Label MD - Standard Labels</LabelMD>
                <LabelSM>Label SM - Small Labels</LabelSM>
                <LabelXS>Label XS - Micro Labels</LabelXS>
              </div>
            </TypographyContainer>
          </div>

          {/* Caption Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Caption Styles</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <CaptionLG>Caption LG - Image captions and metadata</CaptionLG>
                <CaptionMD>Caption MD - Standard captions and secondary info</CaptionMD>
                <CaptionSM>Caption SM - Small captions and timestamps</CaptionSM>
              </div>
            </TypographyContainer>
          </div>

          {/* Code Styles */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Code Styles</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                <CodeLG>Code LG - Large code blocks and snippets</CodeLG>
                <CodeMD>Code MD - Standard code text and inline code</CodeMD>
                <CodeSM>Code SM - Small code text and compact snippets</CodeSM>
              </div>
            </TypographyContainer>
          </div>

          {/* Specialized Components */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Specialized Components</HeadingLG>
            <TypographyContainer spacing="normal">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <Lead>
                  Lead text component for introductory paragraphs. This provides
                  a larger, more prominent text style for opening content.
                </Lead>
                <Large>
                  Large text component for emphasized content that needs to stand out
                  from regular body text while maintaining readability.
                </Large>
                <Small>
                  Small text component for fine print, metadata, and secondary information
                  that should be less prominent but still accessible.
                </Small>
                <Muted>
                  Muted text component for secondary information that should be
                  visually de-emphasized while remaining readable.
                </Muted>
                <Blockquote>
                  "Blockquote component for quoted content. This provides proper
                  styling for citations, testimonials, and quoted material."
                </Blockquote>
                <div>
                  Inline <InlineCode>code</InlineCode> component for highlighting
                  code snippets within regular text content.
                </div>
              </div>
            </TypographyContainer>
          </div>

          {/* List Components */}
          <div className="mb-12">
            <HeadingLG className="mb-6">List Components</HeadingLG>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <List>
                <ListItem>First list item with proper spacing</ListItem>
                <ListItem>Second list item with consistent styling</ListItem>
                <ListItem>Third list item maintaining visual hierarchy</ListItem>
                <ListItem>Fourth list item with systematic spacing</ListItem>
              </List>
            </div>
          </div>
        </section>

        {/* Spacing Scale */}
        <section className="mb-16">
          <HeadingXL className="mb-8">Spacing Scale</HeadingXL>
          
          {/* Padding Examples */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Padding Examples</HeadingLG>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <Padding size="2" className="bg-blue-50 dark:bg-blue-900/20">
                  <BodySM>Padding 2 (0.5rem)</BodySM>
                </Padding>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <Padding size="4" className="bg-green-50 dark:bg-green-900/20">
                  <BodySM>Padding 4 (1rem)</BodySM>
                </Padding>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <Padding size="8" className="bg-purple-50 dark:bg-purple-900/20">
                  <BodySM>Padding 8 (2rem)</BodySM>
                </Padding>
              </div>
            </div>
          </div>

          {/* Margin Examples */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Margin Examples</HeadingLG>
            <div className="space-y-4">
              <MarginBottom size="4" className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
                <BodySM>Margin Bottom 4 (1rem)</BodySM>
              </MarginBottom>
              <MarginBottom size="8" className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                <BodySM>Margin Bottom 8 (2rem)</BodySM>
              </MarginBottom>
              <MarginBottom size="12" className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded">
                <BodySM>Margin Bottom 12 (3rem)</BodySM>
              </MarginBottom>
            </div>
          </div>

          {/* Gap Examples */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Gap Examples</HeadingLG>
            <div className="space-y-6">
              <div>
                <BodySM className="mb-2">Gap 2 (0.5rem)</BodySM>
                <div className="flex gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">Item 1</div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">Item 2</div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">Item 3</div>
                </div>
              </div>
              <div>
                <BodySM className="mb-2">Gap 4 (1rem)</BodySM>
                <div className="flex gap-4">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded">Item 1</div>
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded">Item 2</div>
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded">Item 3</div>
                </div>
              </div>
              <div>
                <BodySM className="mb-2">Gap 8 (2rem)</BodySM>
                <div className="flex gap-8">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">Item 1</div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">Item 2</div>
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded">Item 3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Space Examples */}
          <div className="mb-12">
            <HeadingLG className="mb-6">Space Examples</HeadingLG>
            <div className="space-y-6">
              <div>
                <BodySM className="mb-2">Space Y 2 (0.5rem vertical spacing)</BodySM>
                <SpaceY size="2">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">Element 1</div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">Element 2</div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded">Element 3</div>
                </SpaceY>
              </div>
              <div>
                <BodySM className="mb-2">Space Y 4 (1rem vertical spacing)</BodySM>
                <SpaceY size="4">
                  <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded">Element 1</div>
                  <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded">Element 2</div>
                  <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded">Element 3</div>
                </SpaceY>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Container Examples */}
        <section className="mb-16">
          <HeadingXL className="mb-8">Typography Container Examples</HeadingXL>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Tight Spacing</HeadingMD>
              <TypographyContainer spacing="tight">
                <BodyMD>First paragraph with tight spacing.</BodyMD>
                <BodyMD>Second paragraph with tight spacing.</BodyMD>
                <BodyMD>Third paragraph with tight spacing.</BodyMD>
              </TypographyContainer>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Normal Spacing</HeadingMD>
              <TypographyContainer spacing="normal">
                <BodyMD>First paragraph with normal spacing.</BodyMD>
                <BodyMD>Second paragraph with normal spacing.</BodyMD>
                <BodyMD>Third paragraph with normal spacing.</BodyMD>
              </TypographyContainer>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Loose Spacing</HeadingMD>
              <TypographyContainer spacing="loose">
                <BodyMD>First paragraph with loose spacing.</BodyMD>
                <BodyMD>Second paragraph with loose spacing.</BodyMD>
                <BodyMD>Third paragraph with loose spacing.</BodyMD>
              </TypographyContainer>
            </div>
          </div>
        </section>

        {/* Color Variants */}
        <section className="mb-16">
          <HeadingXL className="mb-8">Color Variants</HeadingXL>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Primary</HeadingMD>
              <BodyMD color="primary">Primary text color for main content</BodyMD>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Secondary</HeadingMD>
              <BodyMD color="secondary">Secondary text color for supporting content</BodyMD>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Muted</HeadingMD>
              <BodyMD color="muted">Muted text color for less important content</BodyMD>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HeadingMD className="mb-4">Accent</HeadingMD>
              <BodyMD color="accent">Accent text color for highlighted content</BodyMD>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-16">
          <HeadingXL className="mb-8">Usage Guidelines</HeadingXL>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <HeadingLG className="mb-4">Typography Guidelines</HeadingLG>
              <List>
                <ListItem>Use Display styles for hero sections and major headlines</ListItem>
                <ListItem>Use Heading styles for section titles and component headers</ListItem>
                <ListItem>Use Body styles for content and readable text</ListItem>
                <ListItem>Use Label styles for form labels and UI elements</ListItem>
                <ListItem>Use Caption styles for metadata and secondary information</ListItem>
                <ListItem>Use Code styles for code snippets and technical content</ListItem>
              </List>
            </div>
            
            <div>
              <HeadingLG className="mb-4">Spacing Guidelines</HeadingLG>
              <List>
                <ListItem>Use systematic spacing scale for consistent layouts</ListItem>
                <ListItem>Apply padding for internal component spacing</ListItem>
                <ListItem>Apply margins for external component spacing</ListItem>
                <ListItem>Use gaps for flex and grid layouts</ListItem>
                <ListItem>Use space utilities for vertical rhythm</ListItem>
                <ListItem>Follow 8px grid system for visual consistency</ListItem>
              </List>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <BodySM color="muted" align="center">
            HT-008.5.5: Systematic Typography and Spacing Scales Implementation Complete
          </BodySM>
        </div>
      </div>
    </div>
  )
}
