async function testImageExtraction() {
    console.log('🧪 Testing Trustpilot Image Extraction...');
    
    try {
      const response = await fetch('http://localhost:4000/scrape/safeledger');
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
          console.log(`   Rating: ${review.rating} stars`);
        });
        
        // Check for review content images
        const reviewsWithContentImages = data.reviews.filter(review => review.reviewImages?.length > 0);
        console.log(`🖼️  Found ${reviewsWithContentImages.length} reviews with content images`);
        
        // Test health endpoint
        console.log('\n🏥 Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:4000/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData.status);
        
      } else {
        console.error('❌ Failed to scrape:', data.error);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      console.log('💡 Make sure the server is running with: npm start');
    }
  }
  
  // Test the API info endpoint
  async function testApiInfo() {
    console.log('\n📖 Testing API info endpoint...');
    try {
      const response = await fetch('http://localhost:4000/');
      const data = await response.json();
      console.log('API Status:', data.status);
      console.log('Available endpoints:', Object.keys(data.endpoints).length);
    } catch (error) {
      console.error('❌ API info test failed:', error.message);
    }
  }
  
  // Run all tests if this file is executed directly
  if (import.meta.url === `file://${process.argv[1]}`) {
    testImageExtraction();
    setTimeout(testApiInfo, 1000);
  }
  
  export default testImageExtraction;
  