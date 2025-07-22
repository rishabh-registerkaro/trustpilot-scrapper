const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

class TrustpilotScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent to avoid blocking
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1280, height: 720 });
      
      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  async scrapeAllReviews(url) {
    try {
      console.log(`🚀 Starting to scrape: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Handle cookie consent if present
      try {
        await this.page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await this.page.click('#onetrust-accept-btn-handler');
        await this.page.waitForTimeout(2000);
        console.log('✅ Cookie consent handled');
      } catch (e) {
        console.log('ℹ️ No cookie consent found or already accepted');
      }

      let allReviews = [];
      let currentPage = 1;
      let hasNextPage = true;

      // Get total pages
      const totalPages = await this.getTotalPages();
      console.log(`📄 Found ${totalPages} total pages to scrape`);

      while (hasNextPage && currentPage <= totalPages) {
        console.log(`📖 Scraping page ${currentPage} of ${totalPages}...`);
        
        // Wait for reviews to load
        await this.page.waitForSelector('[data-service-review-card-paper]', { timeout: 10000 });
        
        // Extract reviews from current page
        const pageReviews = await this.extractReviewsFromPage();
        allReviews.push(...pageReviews);
        
        console.log(`✅ Found ${pageReviews.length} reviews on page ${currentPage}`);
        
        // Log image extraction results
        const reviewsWithImages = pageReviews.filter(r => r.reviewerImage);
        console.log(`📸 Reviews with profile images on page ${currentPage}: ${reviewsWithImages.length}/${pageReviews.length}`);
        
        // Try to go to next page
        hasNextPage = await this.goToNextPage();
        if (hasNextPage) {
          currentPage++;
          await this.page.waitForTimeout(2000); // Wait between page requests
        }
      }

      console.log(`🎉 Total reviews scraped: ${allReviews.length}`);
      return allReviews;

    } catch (error) {
      console.error('❌ Error during scraping:', error);
      throw error;
    }
  }

  async getTotalPages() {
    try {
      const paginationInfo = await this.page.evaluate(() => {
        // Look for pagination info
        const paginationElement = document.querySelector('[data-pagination-button-last]');
        if (paginationElement) {
          return parseInt(paginationElement.textContent.trim());
        }
        
        // Alternative method - look for page numbers
        const pageNumbers = Array.from(document.querySelectorAll('[data-pagination-button]'))
          .map(el => parseInt(el.textContent.trim()))
          .filter(num => !isNaN(num));
        
        return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
      });
      
      return paginationInfo || 1;
    } catch (e) {
      console.log('⚠️ Could not determine total pages, defaulting to 1');
      return 1;
    }
  }



  async extractReviewsFromPage() {
    return await this.page.evaluate(() => {
      const reviewElements = document.querySelectorAll('[data-service-review-card-paper]');
      const reviews = [];

      // Simple and direct function to find profile images
      function findProfileImage(reviewElement) {
        // Try multiple selectors in order of reliability
        const selectors = [
          'img[src*="user-images.trustpilot.com"]',  // Direct Trustpilot user images
          '[data-consumer-avatar] img',              // Official avatar data attribute
          '.consumer-avatar img',                    // Avatar class
          'img[alt*="avatar"]',                      // Alt text containing avatar
          'img[alt*="profile"]',                     // Alt text containing profile
          'img[width="73"][height="73"]',            // Common profile image size on Trustpilot
          'img[style*="73px"]'                       // Inline style with profile size
        ];
        
        for (const selector of selectors) {
          const img = reviewElement.querySelector(selector);
          if (img && img.src && img.src.trim() !== '') {
            return img.src;
          }
        }
        
        // Fallback: look for any small square image that's likely a profile
        const allImages = reviewElement.querySelectorAll('img');
        for (const img of allImages) {
          if (img.src && img.src.includes('trustpilot') && !img.src.includes('star')) {
            const width = img.naturalWidth || img.width || 0;
            const height = img.naturalHeight || img.height || 0;
            if (width > 0 && height > 0 && width <= 100 && height <= 100) {
              return img.src;
            }
          }
        }
        
        return '';
      }

      reviewElements.forEach((reviewElement, index) => {
        try {
          const review = {};
          
          // Extract reviewer name
          const nameElement = reviewElement.querySelector('[data-consumer-name-typography]');
          review.reviewerName = nameElement ? nameElement.textContent.trim() : '';
          
          // Extract reviewer profile image
          review.reviewerImage = findProfileImage(reviewElement);
          
          // Ensure we have the full URL if it's a relative path
          if (review.reviewerImage && review.reviewerImage.startsWith('//')) {
            review.reviewerImage = 'https:' + review.reviewerImage;
          }
          
          // Extract rating (stars)
          const ratingElement = reviewElement.querySelector('[data-service-review-rating]');
          review.rating = ratingElement ? parseInt(ratingElement.getAttribute('data-service-review-rating')) : 0;
          
          // Extract review title
          const titleElement = reviewElement.querySelector('[data-service-review-title-typography]');
          review.title = titleElement ? titleElement.textContent.trim() : '';
          
          // Extract review content
          const contentElement = reviewElement.querySelector('[data-service-review-text-typography]');
          review.content = contentElement ? contentElement.textContent.trim() : '';
          
          // Extract review date
          const dateElement = reviewElement.querySelector('time');
          review.reviewDate = dateElement ? dateElement.getAttribute('datetime') : '';
          review.reviewDateFormatted = dateElement ? dateElement.textContent.trim() : '';
          
          // Extract date of experience
          const experienceElement = reviewElement.querySelector('[data-service-review-date-of-experience-typography]');
          review.dateOfExperience = experienceElement ? experienceElement.textContent.replace('Date of experience:', '').trim() : '';
          
          // Extract review images (if any) with comprehensive selectors
          let imageElements = reviewElement.querySelectorAll('[data-service-review-image] img');
          if (imageElements.length === 0) {
            // Try alternative selectors for review images
            imageElements = reviewElement.querySelectorAll('img[src*="review-images"], img[src*="media"]');
          }
          if (imageElements.length === 0) {
            // Look for any images that aren't the profile image
            const allImages = reviewElement.querySelectorAll('img');
            imageElements = Array.from(allImages).filter(img => {
              const src = img.src;
              return src && 
                     !src.includes('user-images.trustpilot.com') && // Exclude profile images
                     !src.includes('avatar') && 
                     !src.includes('star') && 
                     !src.includes('icon') &&
                     src !== review.reviewerImage; // Exclude the reviewer's profile image
            });
          }
          
          review.reviewImages = Array.from(imageElements).map(img => {
            let src = img.src;
            // Ensure full URL
            if (src.startsWith('//')) {
              src = 'https:' + src;
            }
            return src;
          }).filter(src => src && src !== '');
          
          // Extract verification status
          const verifiedElement = reviewElement.querySelector('[data-service-review-verification-typography]');
          review.isVerified = verifiedElement ? verifiedElement.textContent.includes('Verified') : false;
          
          // Extract company reply (if any)
          const replyElement = reviewElement.querySelector('[data-service-review-business-reply-content]');
          review.companyReply = replyElement ? replyElement.textContent.trim() : '';
          
          // Extract review ID (if available)
          review.reviewId = reviewElement.getAttribute('id') || `review-${index}`;
          
          // Extract reviewer location
          const locationElement = reviewElement.querySelector('[data-consumer-country-typography]');
          review.reviewerLocation = locationElement ? locationElement.textContent.trim() : '';
          
          // Extract number of reviews by this reviewer
          const reviewCountElement = reviewElement.querySelector('[data-consumer-reviews-count-typography]');
          review.reviewerTotalReviews = reviewCountElement ? reviewCountElement.textContent.trim() : '';
          
          // Extract helpful votes (if available)
          const helpfulElement = reviewElement.querySelector('[data-service-review-helpful-counter]');
          review.helpfulVotes = helpfulElement ? parseInt(helpfulElement.textContent.trim()) || 0 : 0;
          
          // Add timestamp of scraping
          review.scrapedAt = new Date().toISOString();
          
          reviews.push(review);
          
        } catch (error) {
          console.error(`Error extracting review ${index}:`, error);
        }
      });

      return reviews;
    });
  }

  async goToNextPage() {
    try {
      // Look for next page button
      const nextButton = await this.page.$('[data-pagination-button-next]');
      
      if (nextButton) {
        const isDisabled = await this.page.evaluate(button => {
          return button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true';
        }, nextButton);
        
        if (!isDisabled) {
          await nextButton.click();
          await this.page.waitForTimeout(3000); // Wait for page to load
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.log('⚠️ No next page found or error navigating:', error.message);
      return false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// API Routes

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Trustpilot Review Scraper API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /health': 'Health check',
      'GET /scrape/safeledger': 'Scrape SafeLedger reviews',
      'POST /scrape': 'Scrape any Trustpilot URL'
    },
    usage: {
      safeledger: '/scrape/safeledger',
      custom: {
        method: 'POST',
        url: '/scrape',
        body: {
          url: 'https://www.trustpilot.com/review/example.com'
        }
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});



// Specific endpoint for SafeLedger reviews
app.get('/scrape/safeledger', async (req, res) => {
  const scraper = new TrustpilotScraper();
  
  try {
    console.log('🎯 Starting SafeLedger review scraping...');
    
    await scraper.init();
    const reviews = await scraper.scrapeAllReviews('https://www.trustpilot.com/review/safeledger.ae');
    
    res.json({
      success: true,
      company: 'SafeLedger',
      url: 'https://www.trustpilot.com/review/safeledger.ae',
      scrapedAt: new Date().toISOString(),
      totalReviews: reviews.length,
      reviews: reviews
    });

    console.log(`✅ Successfully returned ${reviews.length} SafeLedger reviews`);
    
  } catch (error) {
    console.error('❌ SafeLedger scraping failed:', error);
    res.status(500).json({
      success: false,
      error: 'Scraping failed',
      message: error.message,
      company: 'SafeLedger'
    });
  } finally {
    await scraper.close();
  }
});

// Generic endpoint for any Trustpilot URL
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  // Validate input
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: url',
      example: {
        url: 'https://www.trustpilot.com/review/example.com'
      }
    });
  }

  // Validate URL format
  if (!url.includes('trustpilot.com/review/')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL. Must be a Trustpilot review URL',
      example: 'https://www.trustpilot.com/review/example.com'
    });
  }

  const scraper = new TrustpilotScraper();
  
  try {
    console.log(`🎯 Starting scraping for: ${url}`);
    
    await scraper.init();
    const reviews = await scraper.scrapeAllReviews(url);
    
    // Extract company name from URL
    const companyName = url.split('/review/')[1]?.split('?')[0] || 'Unknown';
    
    res.json({
      success: true,
      company: companyName,
      url: url,
      scrapedAt: new Date().toISOString(),
      totalReviews: reviews.length,
      reviews: reviews
    });

    console.log(`✅ Successfully returned ${reviews.length} reviews for ${companyName}`);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    res.status(500).json({
      success: false,
      error: 'Scraping failed',
      message: error.message,
      url: url
    });
  } finally {
    await scraper.close();
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /': 'API information',
      'GET /health': 'Health check',
      'GET /scrape/safeledger': 'Scrape SafeLedger reviews',
      'POST /scrape': 'Scrape any Trustpilot URL'
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Trustpilot Review Scraper API server running on ${HOST}:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🎯 SafeLedger Reviews: http://localhost:${PORT}/scrape/safeledger`);
  console.log(`🐳 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 