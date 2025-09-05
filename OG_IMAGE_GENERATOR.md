# OG Image Generator

Since we can't create files in the public directory directly, here's the SVG code for the OG image that should be saved as `/public/og-image.svg`:

```svg
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="50" fill="url(#accent)" opacity="0.1"/>
  <circle cx="1100" cy="530" r="80" fill="url(#accent)" opacity="0.1"/>
  <rect x="950" y="50" width="200" height="200" rx="20" fill="url(#accent)" opacity="0.05"/>
  
  <!-- Main content -->
  <g transform="translate(100, 200)">
    <!-- Logo/Icon -->
    <rect x="0" y="0" width="80" height="80" rx="16" fill="url(#accent)"/>
    <text x="40" y="50" text-anchor="middle" fill="white" font-family="Inter, sans-serif" font-size="32" font-weight="600">MA</text>
    
    <!-- Title -->
    <text x="120" y="40" fill="#1f2937" font-family="Inter, sans-serif" font-size="48" font-weight="700">Build Better Products</text>
    <text x="120" y="80" fill="url(#accent)" font-family="Inter, sans-serif" font-size="48" font-weight="700">Faster Than Ever</text>
    
    <!-- Description -->
    <text x="120" y="120" fill="#6b7280" font-family="Inter, sans-serif" font-size="24" font-weight="400">Transform your ideas into production-ready applications</text>
    <text x="120" y="150" fill="#6b7280" font-family="Inter, sans-serif" font-size="24" font-weight="400">with our comprehensive development platform</text>
    
    <!-- Features -->
    <g transform="translate(120, 200)">
      <text x="0" y="0" fill="#374151" font-family="Inter, sans-serif" font-size="18" font-weight="500">✓ Development Tools</text>
      <text x="0" y="30" fill="#374151" font-family="Inter, sans-serif" font-size="18" font-weight="500">✓ UI Components</text>
      <text x="0" y="60" fill="#374151" font-family="Inter, sans-serif" font-size="18" font-weight="500">✓ Database &amp; Auth</text>
      <text x="0" y="90" fill="#374151" font-family="Inter, sans-serif" font-size="18" font-weight="500">✓ One-Click Deploy</text>
    </g>
  </g>
  
  <!-- URL -->
  <text x="100" y="580" fill="#9ca3af" font-family="Inter, sans-serif" font-size="20" font-weight="400">microapp.example.com</text>
</svg>
```

## Square OG Image (for Twitter)

Save this as `/public/og-image-square.svg`:

```svg
<svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="1200" fill="url(#bg)"/>
  
  <!-- Decorative elements -->
  <circle cx="200" cy="200" r="100" fill="url(#accent)" opacity="0.1"/>
  <circle cx="1000" cy="1000" r="150" fill="url(#accent)" opacity="0.1"/>
  <rect x="800" y="100" width="300" height="300" rx="30" fill="url(#accent)" opacity="0.05"/>
  
  <!-- Main content -->
  <g transform="translate(200, 400)">
    <!-- Logo/Icon -->
    <rect x="0" y="0" width="120" height="120" rx="24" fill="url(#accent)"/>
    <text x="60" y="75" text-anchor="middle" fill="white" font-family="Inter, sans-serif" font-size="48" font-weight="600">MA</text>
    
    <!-- Title -->
    <text x="160" y="60" fill="#1f2937" font-family="Inter, sans-serif" font-size="64" font-weight="700">Build Better</text>
    <text x="160" y="120" fill="#1f2937" font-family="Inter, sans-serif" font-size="64" font-weight="700">Products</text>
    <text x="160" y="180" fill="url(#accent)" font-family="Inter, sans-serif" font-size="64" font-weight="700">Faster Than Ever</text>
    
    <!-- Description -->
    <text x="160" y="240" fill="#6b7280" font-family="Inter, sans-serif" font-size="32" font-weight="400">Transform your ideas into production-ready</text>
    <text x="160" y="280" fill="#6b7280" font-family="Inter, sans-serif" font-size="32" font-weight="400">applications with our comprehensive</text>
    <text x="160" y="320" fill="#6b7280" font-family="Inter, sans-serif" font-size="32" font-weight="400">development platform</text>
  </g>
  
  <!-- URL -->
  <text x="200" y="1100" fill="#9ca3af" font-family="Inter, sans-serif" font-size="28" font-weight="400">microapp.example.com</text>
</svg>
```

## Instructions

1. Create the `/public` directory if it doesn't exist
2. Save the first SVG as `/public/og-image.svg`
3. Save the second SVG as `/public/og-image-square.svg`
4. Convert to PNG format (1200x630 and 1200x1200 respectively) for better compatibility

The metadata in `app/layout.tsx` is already configured to reference these images.
