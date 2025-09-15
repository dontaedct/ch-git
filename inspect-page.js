import puppeteer from 'puppeteer';

async function inspectPage() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForSelector('[class*="carousel"]', { timeout: 10000 });
  
  // Get all elements with carousel-related classes
  const carouselElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const carouselEls = [];
    
    elements.forEach(el => {
      if (el.className && (
        el.className.includes('carousel') || 
        el.className.includes('overflow') ||
        el.className.includes('mask') ||
        el.style.maskImage ||
        el.style.overflow ||
        el.style.clipPath ||
        el.style.webkitMaskImage
      )) {
        const computedStyle = window.getComputedStyle(el);
        carouselEls.push({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          innerHTML: el.innerHTML.substring(0, 200) + '...',
          styles: {
            overflow: computedStyle.overflow,
            maskImage: computedStyle.maskImage,
            webkitMaskImage: computedStyle.webkitMaskImage,
            clipPath: computedStyle.clipPath,
            width: computedStyle.width,
            maxWidth: computedStyle.maxWidth,
            padding: computedStyle.padding,
            margin: computedStyle.margin
          }
        });
      }
    });
    
    return carouselEls;
  });
  
  console.log('CAROUSEL ELEMENTS FOUND:');
  console.log(JSON.stringify(carouselElements, null, 2));
  
  // Also check for any CSS rules that might be applying fade effects
  const cssRules = await page.evaluate(() => {
    const rules = [];
    for (let sheet of document.styleSheets) {
      try {
        for (let rule of sheet.cssRules) {
          if (rule.selectorText && (
            rule.selectorText.includes('overflow') ||
            rule.selectorText.includes('mask') ||
            rule.selectorText.includes('fade') ||
            rule.selectorText.includes('gradient')
          )) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {
        // Skip cross-origin stylesheets
      }
    }
    return rules;
  });
  
  console.log('\nCSS RULES FOUND:');
  console.log(JSON.stringify(cssRules, null, 2));
  
  await browser.close();
}

inspectPage().catch(console.error);
