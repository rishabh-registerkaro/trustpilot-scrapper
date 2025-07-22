const TrustpilotScraper = require('./app');

async function testImageExtraction() {
  console.log('🧪 Testing Trustpilot Image Extraction...');
  
  try {
    const response = await fetch('http://localhost:3001/scrape/safeledger');
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Successfully scraped ${data.totalReviews} reviews`);
      
      // Check for reviewer images
      const reviewsWithImages = data.reviews.filter(review => review.reviewerImage);
      console.log(`📸 Found ${reviewsWithImages.length} reviews with profile images`);
      
      // Display first few reviewer images
      reviewsWithImages.slice(0, 3).forEach((review, index) => {
        console.log(`👤 Review ${index + 1}: ${review.reviewerName}`);
        console.log(`   Profile Image: ${review.reviewerImage}`);
        console.log(`   Debug Images:`, review.debugImages?.length || 0, 'images found');
      });
      
      // Check for review content images
      const reviewsWithContentImages = data.reviews.filter(review => review.reviewImages?.length > 0);
      console.log(`🖼️  Found ${reviewsWithContentImages.length} reviews with content images`);
      
    } else {
      console.error('❌ Failed to scrape:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running with: npm start');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testImageExtraction();
}

module.exports = testImageExtraction; 