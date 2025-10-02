'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getComponentRegistry } from '@/lib/renderer/ComponentRegistry';
import { getTemplateStorage } from '@/lib/template-storage/TemplateStorage';

// Static component definitions to avoid async/await issues
const HeroComponent: React.FC<any> = ({ title, subtitle, ctaText, ctaUrl, layout = 'centered', height = 'large', background = 'solid' }) => (
  <div className={`text-white py-20 text-center ${height === 'large' ? 'py-24' : height === 'medium' ? 'py-20' : 'py-16'} ${
    background === 'gradient' ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700' : 
    background === 'solid' ? 'bg-blue-600' : 'bg-gray-900'
  }`}>
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{title}</h1>
      {subtitle && <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto leading-relaxed opacity-90">{subtitle}</p>}
      {ctaText && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
            {ctaText}
          </button>
          <button className="border-2 border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
            Learn More
          </button>
        </div>
      )}
    </div>
  </div>
);

const SpacerComponent: React.FC<any> = ({ height = 'md' }) => {
  const heightClasses = {
    xs: 'h-4',
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-24',
    xl: 'h-32',
    '2xl': 'h-40'
  };
  return <div className={heightClasses[height as keyof typeof heightClasses] || heightClasses.md} />;
};

const FeatureGridComponent: React.FC<any> = ({ title, description, features = [], columns = 3, layout = 'cards' }) => (
  <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4">
      {title && <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">{title}</h2>}
      {description && <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">{description}</p>}
      <div className={`grid gap-8 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'md:grid-cols-2' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
        {features && Array.isArray(features) && features.map((feature: any, index: number) => (
          <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            {feature?.icon && <div className="text-4xl mb-4">{feature.icon}</div>}
            <h3 className="text-xl font-bold mb-4 text-gray-900">{feature?.title || 'Feature'}</h3>
            <p className="text-gray-600 leading-relaxed">{feature?.description || 'Feature description'}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TextComponent: React.FC<any> = ({ content, alignment = 'left', fontSize = 'medium' }) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };
  return (
    <div className={`py-8 ${alignmentClasses[alignment as keyof typeof alignmentClasses]} ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const TestimonialComponent: React.FC<any> = ({ quote, author, title, company, avatar, rating, layout = 'card' }) => (
  <div className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
    <div className="max-w-5xl mx-auto px-4 text-center">
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100">
        <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8 leading-relaxed">"{quote}"</blockquote>
        <div className="flex items-center justify-center">
          {avatar && <img src={avatar} alt={author} className="w-16 h-16 rounded-full mr-6 border-4 border-blue-100" />}
          <div>
            <div className="font-bold text-gray-900 text-lg">{author}</div>
            {title && <div className="text-gray-600 font-medium">{title}</div>}
            {company && <div className="text-gray-500">{company}</div>}
          </div>
        </div>
        {rating && (
          <div className="flex justify-center mt-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-3xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const CTAComponent: React.FC<any> = ({ title, description, buttons = [], background = 'gradient', alignment = 'center' }) => (
  <div className={`py-20 ${background === 'gradient' ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700' : background === 'solid' ? 'bg-blue-600' : 'bg-transparent'}`}>
    <div className="max-w-5xl mx-auto px-4 text-center">
      {title && <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{title}</h2>}
      {description && <p className="text-xl md:text-2xl text-white mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">{description}</p>}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        {buttons && Array.isArray(buttons) && buttons.map((button: any, index: number) => (
          <button key={index} className={`px-10 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
            button?.style === 'primary' ? 'bg-white text-blue-600 hover:bg-gray-100' :
            button?.style === 'secondary' ? 'border-2 border-white text-white hover:bg-white hover:text-blue-600' :
            'bg-white text-blue-600 hover:bg-gray-100'
          }`}>
            {button?.text || 'Button'}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ProcessComponent: React.FC<any> = ({ title, description, steps = [], layout = 'horizontal' }) => (
  <div id="process" className="py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      {title && <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">{title}</h2>}
      {description && <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">{description}</p>}
      <div className={`${layout === 'horizontal' ? 'grid md:grid-cols-3 gap-8' : 'space-y-8'}`}>
        {steps && Array.isArray(steps) && steps.map((step: any, index: number) => (
          <div key={index} className="text-center group">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                {step?.icon || step?.step || index + 1}
              </div>
              {layout === 'horizontal' && index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-0"></div>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{step?.title || `Step ${index + 1}`}</h3>
            <p className="text-gray-600 leading-relaxed">{step?.description || 'Step description'}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const IndustriesComponent: React.FC<any> = ({ title, description, industries = [], layout = 'grid', columns = 4 }) => (
  <div id="industries" className="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4">
      {title && <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900">{title}</h2>}
      {description && <p className="text-center text-gray-600 mb-16 text-lg max-w-3xl mx-auto">{description}</p>}
      <div className={`grid gap-6 ${
        columns === 1 ? 'grid-cols-1' : 
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 
        columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {industries && Array.isArray(industries) && industries.map((industry: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{industry?.icon || '🏢'}</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{industry?.name || 'Industry'}</h3>
              <p className="text-sm text-gray-600">{industry?.description || 'Industry description'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FormComponent: React.FC<any> = ({ formId, title, showTitle = true, layout = 'vertical' }) => (
  <div className="py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-3xl mx-auto px-4">
      {showTitle && title && <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">{title}</h2>}
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <form className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your email" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Company</label>
            <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your company name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
            <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your phone number" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">How can we help you?</label>
            <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Tell us about your business challenges and goals..."></textarea>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Request Free Consultation
          </button>
        </form>
      </div>
    </div>
  </div>
);

const ContactComponent: React.FC<any> = ({ title, description, contactInfo = [], layout = 'split' }) => (
  <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-6xl mx-auto px-4 text-center">
      {title && <h2 className="text-4xl font-bold mb-6 text-gray-900">{title}</h2>}
      {description && <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">{description}</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {contactInfo && Array.isArray(contactInfo) && contactInfo.map((info: any, index: number) => (
          <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl mb-4">
              {info?.label === 'Email' ? '📧' :
               info?.label === 'Phone' ? '📞' :
               info?.label === 'Office' ? '🏢' :
               info?.label === 'Hours' ? '🕒' : '📋'}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{info?.label || 'Contact'}</h3>
            <p className="text-gray-600 leading-relaxed">{info?.value || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FooterComponent: React.FC<any> = ({ logo, description, links = [], social, copyright }) => (
  <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          {logo && <div className="text-3xl font-bold mb-6 text-white">{logo}</div>}
          {description && <p className="text-gray-300 leading-relaxed mb-6">{description}</p>}
          {social && Array.isArray(social) && (
            <div className="flex space-x-4">
              {social.map((socialLink: any, index: number) => (
                <a key={index} href={socialLink?.url || '#'} className="text-gray-400 hover:text-white transition-colors text-2xl">
                  {socialLink?.platform === 'linkedin' ? '💼' :
                   socialLink?.platform === 'twitter' ? '🐦' :
                   socialLink?.platform === 'facebook' ? '📘' : '🔗'}
                </a>
              ))}
            </div>
          )}
        </div>
        {links && Array.isArray(links) && links.map((linkGroup: any, index: number) => (
          <div key={index}>
            <h3 className="font-bold text-lg mb-6 text-white">{linkGroup?.title || 'Links'}</h3>
            <ul className="space-y-3">
              {linkGroup?.items && Array.isArray(linkGroup.items) && linkGroup.items.map((link: any, linkIndex: number) => (
                <li key={linkIndex}>
                  <a href={link?.url || '#'} className="text-gray-300 hover:text-white transition-colors hover:underline">
                    {link?.text || 'Link'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
        {copyright && <p className="text-sm">{copyright}</p>}
      </div>
    </div>
  </footer>
);

// Placeholder components for other types
const HeaderComponent: React.FC<any> = ({ logo, navigation = [], ctaText, ctaUrl }) => (
  <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          {logo && <div className="text-2xl font-bold text-gray-900">{logo}</div>}
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          {navigation && Array.isArray(navigation) && navigation.map((navItem: any, index: number) => (
            <a key={index} href={navItem?.url || '#'} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              {navItem?.text || 'Link'}
            </a>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {ctaText && (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);
const ButtonComponent: React.FC<any> = ({ text, url, style = 'primary' }) => (
  <button className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
    style === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
    style === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
    'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }`}>
    {text}
  </button>
);
const CardComponent: React.FC<any> = ({ title, description, image, link }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {image && <img src={image} alt={title} className="w-full h-48 object-cover" />}
    <div className="p-6">
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  </div>
);
const ImageComponent: React.FC<any> = ({ src, alt, caption, width = 'full', alignment = 'center' }) => (
  <div className={`py-8 ${alignment === 'center' ? 'text-center' : alignment === 'left' ? 'text-left' : 'text-right'}`}>
    <img src={src} alt={alt} className={`${width === 'full' ? 'w-full' : width === '75' ? 'w-3/4' : width === '50' ? 'w-1/2' : 'w-1/4'} mx-auto`} />
    {caption && <p className="text-sm text-gray-600 mt-2">{caption}</p>}
  </div>
);
const SectionComponent: React.FC<any> = ({ title, subtitle, content, backgroundColor, padding = 'medium' }) => (
  <div className={`py-16 ${backgroundColor || 'bg-white'} ${padding === 'small' ? 'py-8' : padding === 'large' ? 'py-24' : 'py-16'}`}>
    <div className="max-w-4xl mx-auto px-4 text-center">
      {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
      {subtitle && <h3 className="text-xl text-gray-600 mb-8">{subtitle}</h3>}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </div>
  </div>
);
const VideoComponent: React.FC<any> = ({ src, poster, autoplay = false, controls = true, loop = false, muted = false }) => (
  <div className="py-8">
    <video
      src={src}
      poster={poster}
      autoPlay={autoplay}
      controls={controls}
      loop={loop}
      muted={muted}
      className="w-full max-w-4xl mx-auto"
    />
  </div>
);
const DividerComponent: React.FC<any> = ({ style = 'solid', thickness = 'medium', color }) => (
  <div className={`py-8 ${color ? `border-${color}` : 'border-gray-300'} ${
    style === 'solid' ? 'border-t' : style === 'dashed' ? 'border-t border-dashed' : 'border-t border-dotted'
  } ${thickness === 'thin' ? 'border-t' : thickness === 'thick' ? 'border-t-2' : 'border-t'}`} />
);
const PricingComponent: React.FC<any> = ({ title, description, plans = [], layout = 'cards', billing = 'monthly' }) => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      {title && <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>}
      {description && <p className="text-center text-gray-600 mb-12">{description}</p>}
      <div className="grid md:grid-cols-3 gap-8">
        {plans && Array.isArray(plans) && plans.map((plan: any, index: number) => (
          <div key={index} className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">{plan?.name || 'Plan'}</h3>
            <div className="text-4xl font-bold mb-4">${plan?.price || '0'}</div>
            <ul className="space-y-2 mb-8">
              {plan?.features && Array.isArray(plan.features) && plan.features.map((feature: string, featureIndex: number) => (
                <li key={featureIndex} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {plan?.cta || 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
const GridComponent: React.FC<any> = ({ columns = 2, gap = 'medium', responsive = true, children }) => (
  <div className={`grid ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'} ${
    gap === 'small' ? 'gap-4' : gap === 'large' ? 'gap-8' : 'gap-6'
  }`}>
    {children}
  </div>
);
const FlexComponent: React.FC<any> = ({ direction = 'row', justify = 'start', align = 'stretch', children }) => (
  <div className={`flex ${
    direction === 'row' ? 'flex-row' : direction === 'column' ? 'flex-col' : 
    direction === 'row-reverse' ? 'flex-row-reverse' : 'flex-col-reverse'
  } ${
    justify === 'start' ? 'justify-start' : justify === 'center' ? 'justify-center' : 
    justify === 'end' ? 'justify-end' : justify === 'space-between' ? 'justify-between' : 'justify-around'
  } ${
    align === 'start' ? 'items-start' : align === 'center' ? 'items-center' : 
    align === 'end' ? 'items-end' : 'items-stretch'
  }`}>
    {children}
  </div>
);
const ContainerComponent: React.FC<any> = ({ maxWidth = 'lg', padding = 'medium', children }) => (
  <div className={`mx-auto px-4 ${
    maxWidth === 'sm' ? 'max-w-sm' : maxWidth === 'md' ? 'max-w-md' : 
    maxWidth === 'lg' ? 'max-w-4xl' : maxWidth === 'xl' ? 'max-w-6xl' : 'max-w-full'
  } ${
    padding === 'none' ? 'py-0' : padding === 'small' ? 'py-4' : 
    padding === 'large' ? 'py-12' : 'py-8'
  }`}>
    {children}
  </div>
);
const BadgeComponent: React.FC<any> = ({ text, color = 'primary', size = 'medium' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    color === 'primary' ? 'bg-blue-100 text-blue-800' :
    color === 'secondary' ? 'bg-gray-100 text-gray-800' :
    color === 'success' ? 'bg-green-100 text-green-800' :
    color === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    'bg-red-100 text-red-800'
  } ${
    size === 'small' ? 'text-xs px-2 py-1' : size === 'large' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
  }`}>
    {text}
  </span>
);
const ProgressComponent: React.FC<any> = ({ value, label, color = 'primary', size = 'medium' }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
      <span>{label}</span>
      <span>{value}%</span>
    </div>}
    <div className={`w-full bg-gray-200 rounded-full ${
      size === 'small' ? 'h-2' : size === 'large' ? 'h-4' : 'h-3'
    }`}>
      <div className={`h-full rounded-full transition-all duration-300 ${
        color === 'primary' ? 'bg-blue-600' :
        color === 'success' ? 'bg-green-600' :
        color === 'warning' ? 'bg-yellow-600' :
        'bg-red-600'
      }`} style={{ width: `${value}%` }} />
    </div>
  </div>
);
const AccordionComponent: React.FC<any> = ({ items = [], allowMultiple = false, defaultOpen = [] }) => (
  <div className="space-y-4">
    {items && Array.isArray(items) && items.map((item: any, index: number) => (
      <div key={index} className="border border-gray-200 rounded-lg">
        <button className="w-full px-6 py-4 text-left font-semibold bg-gray-50 hover:bg-gray-100 transition-colors">
          {item?.title || 'Accordion Item'}
        </button>
        <div className="px-6 py-4">
          <p className="text-gray-600">{item?.content || 'Content'}</p>
        </div>
      </div>
    ))}
  </div>
);
const TabsComponent: React.FC<any> = ({ tabs = [], defaultTab, style = 'default' }) => (
  <div>
    <div className={`flex border-b border-gray-200 ${
      style === 'pills' ? 'space-x-2' : style === 'underline' ? 'space-x-8' : 'space-x-6'
    }`}>
      {tabs && Array.isArray(tabs) && tabs.map((tab: any, index: number) => (
        <button key={index} className={`py-2 px-4 font-medium ${
          style === 'pills' ? 'rounded-t-lg' : ''
        } ${index === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          {tab?.title || 'Tab'}
        </button>
      ))}
    </div>
    <div className="py-6">
      {tabs && Array.isArray(tabs) && tabs[0] && <div>{tabs[0]?.content || 'Tab content'}</div>}
    </div>
  </div>
);

// Template manifest interface
interface TemplateManifest {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  components: Array<{
    id: string;
    type: string;
    version?: string;
    props: Record<string, any>;
  }>;
  metadata?: {
    version: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
  };
}

export default function PublicAppPage() {
  const params = useParams();
  const [templateManifest, setTemplateManifest] = useState<TemplateManifest | null>(null);
  const [renderedComponents, setRenderedComponents] = useState<React.ReactNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize template system
  useEffect(() => {
    const initializeTemplateSystem = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get template storage and component registry
        const templateStorage = getTemplateStorage();
        const componentRegistry = getComponentRegistry();

        console.log('✅ Template System: Initializing...');
        console.log('✅ Component Registry:', componentRegistry.getStats());

        // Get the slug from params
        const slug = params.slug as string;
        
        // Fetch tenant app data to get the template_id
        let templateId = 'consultation-mvp'; // fallback
        try {
          const appResponse = await fetch(`/api/tenant-apps`);
          if (appResponse.ok) {
            const { apps } = await appResponse.json();
            const currentApp = apps.find((app: any) => app.slug === slug);
            if (currentApp && currentApp.template_id) {
              templateId = currentApp.template_id;
              console.log('✅ Template System: Using template_id from tenant app:', templateId);
            }
          }
        } catch (fetchError) {
          console.warn('⚠️ Template System: Failed to fetch tenant app data, using fallback:', fetchError);
        }
        
        // Try to load a template manifest based on the tenant app's template_id
        
        try {
          const manifest = await templateStorage.loadTemplate(templateId);
          if (manifest) {
            console.log('✅ Template System: Loaded template manifest:', manifest.name);
            setTemplateManifest(manifest as any);
            await renderTemplateComponents(manifest, componentRegistry);
          } else {
            console.log('⚠️ Template System: No template manifest found, using static fallback');
            renderStaticFallback();
          }
        } catch (templateError) {
          console.log('⚠️ Template System: Template loading failed, using static fallback:', templateError);
          renderStaticFallback();
        }

      } catch (error) {
        console.error('❌ Template System: Initialization failed:', error);
        setError('Failed to initialize template system');
        renderStaticFallback();
      } finally {
        setIsLoading(false);
      }
    };

    initializeTemplateSystem();
  }, []);

  // Render template components using static component mapping
  const renderTemplateComponents = async (manifest: TemplateManifest, componentRegistry: any) => {
    const components: React.ReactNode[] = [];
    
    console.log('🔄 Template System: Rendering components...');

    // Static component mapping to avoid async/await issues
    const staticComponents: Record<string, React.ComponentType<any>> = {
      hero: HeroComponent,
      spacer: SpacerComponent,
      feature_grid: FeatureGridComponent,
      text: TextComponent,
      testimonial: TestimonialComponent,
      cta: CTAComponent,
      process: ProcessComponent,
      industries: IndustriesComponent,
      form: FormComponent,
      contact: ContactComponent,
      footer: FooterComponent,
      header: HeaderComponent,
      button: ButtonComponent,
      card: CardComponent,
      image: ImageComponent,
      section: SectionComponent,
      video: VideoComponent,
      divider: DividerComponent,
      pricing: PricingComponent,
      grid: GridComponent,
      flex: FlexComponent,
      container: ContainerComponent,
      badge: BadgeComponent,
      progress: ProgressComponent,
      accordion: AccordionComponent,
      tabs: TabsComponent
    };

    for (const component of manifest.components) {
      try {
        // Use static component mapping instead of registry to avoid async issues
        const Component = staticComponents[component.type];
        
        if (Component) {
          console.log(`✅ Template System: Rendered component ${component.type}`);
          components.push(
            <Component
              key={component.id}
              {...component.props}
            />
          );
        } else {
          console.warn(`⚠️ Template System: Component ${component.type} not found, using fallback`);
          // Add a fallback component
          components.push(
            <div key={component.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-600">Component {component.type} is loading...</p>
            </div>
          );
        }
      } catch (error) {
        console.error(`❌ Template System: Error rendering component ${component.type}:`, error);
        // Add error fallback component
        components.push(
          <div key={component.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-600">Error loading component {component.type}</p>
          </div>
        );
      }
    }
    
    setRenderedComponents(components);
    console.log(`✅ Template System: Rendered ${components.length} components`);
  };

  // Static fallback when template system is not available
  const renderStaticFallback = () => {
    console.log('🔄 Template System: Rendering static fallback...');
    
    const staticComponents = [
      <div key="hero" className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Test #2 App</h1>
        <p className="text-xl mb-8">Your professional consultation platform</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Started
        </button>
      </div>,
      
      <div key="features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Consultation</h3>
              <p className="text-gray-600">Professional consultation services</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Support</h3>
              <p className="text-gray-600">24/7 customer support</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Analytics</h3>
              <p className="text-gray-600">Detailed analytics and reporting</p>
            </div>
          </div>
        </div>
      </div>,
      
      <div key="contact" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
          <p className="text-gray-600 mb-8">Contact us for more information</p>
          <div className="space-y-4">
            <p className="text-lg">Email: contact@test.com</p>
            <p className="text-lg">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
      </div>
    ];
    
    setRenderedComponents(staticComponents);
    console.log('✅ Template System: Static fallback rendered');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template system...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template System Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="w-full">
        {/* Template System Status */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-green-600">✅ Template System Active</span>
              {templateManifest ? (
                <span className="text-blue-600">📄 Template: {templateManifest.name}</span>
              ) : (
                <span className="text-orange-600">🔄 Static Fallback Mode</span>
              )}
              <span className="text-gray-600">Components: {renderedComponents.length}</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Rendered Components */}
        {renderedComponents}
      </div>
    </main>
  );
}