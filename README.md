# Trustpilot Review Scraper API 🚀

A complete Node.js application that scrapes all review data from Trustpilot URLs and returns it as a structured API response.

## Features ✨

- **Complete Review Data**: Extracts all review details including:
  - Reviewer name and profile image
  - Rating (1-5 stars)
  - Review title and content
  - Review date and date of experience
  - Reviewer location and total reviews
  - Verification status
  - Company replies
  - Review images
  - Helpful votes
- **All Pages**: Automatically scrapes ALL review pages, not just the first one
- **REST API**: Easy-to-use HTTP endpoints
- **Error Handling**: Comprehensive error handling and validation
- **SafeLedger Endpoint**: Dedicated endpoint for SafeLedger reviews

## Quick Start 🏃‍♂️

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Test the API
```bash
# Get SafeLedger reviews
curl http://localhost:3001/scrape/safeledger

# Or visit in browser
http://localhost:3001/scrape/safeledger
```

## API Endpoints 📡

### GET `/`
Returns API information and usage instructions.

### GET `/health`
Health check endpoint.

### GET `/scrape/safeledger`
**Purpose**: Scrapes all reviews from SafeLedger's Trustpilot page
**Response**: Array of review objects with complete data

Example response:
```json
{
  "success": true,
  "company": "SafeLedger",
  "url": "https://www.trustpilot.com/review/you-domain",
  "scrapedAt": "2025-01-08T10:30:00.000Z",
  "totalReviews": 15,
  "reviews": [
    {
      "reviewerName": "user",
      "reviewerImage": "https://...",
      "rating": 5,
      "title": "reivew title",
      "content": "review description",
      "reviewDate": "2025-05-12T00:00:00.000Z",
      "reviewDateFormatted": "May 12, 2025",
      "dateOfExperience": "February 15, 2025",
      "reviewerLocation": "IN",
      "reviewerTotalReviews": "2 reviews",
      "isVerified": true,
      "companyReply": "",
      "reviewImages": [],
      "helpfulVotes": 0,
      "reviewId": "review-0",
      "scrapedAt": "2025-01-08T10:30:00.000Z"
    }
  ]
}
```

### POST `/scrape`
**Purpose**: Scrapes reviews from any Trustpilot URL
**Body**: 
```json
{
  "url": "https://www.trustpilot.com/review/example.com"
}
```

## Review Data Structure 📋

Each review object contains:

| Field | Type | Description |
|-------|------|-------------|
| `reviewerName` | string | Name of the reviewer |
| `reviewerImage` | string | URL to reviewer's profile image |
| `rating` | number | Star rating (1-5) |
| `title` | string | Review title/headline |
| `content` | string | Full review text |
| `reviewDate` | string | ISO date when review was posted |
| `reviewDateFormatted` | string | Human-readable review date |
| `dateOfExperience` | string | When the experience occurred |
| `reviewerLocation` | string | Reviewer's country/location |
| `reviewerTotalReviews` | string | Total reviews by this reviewer |
| `isVerified` | boolean | Whether the review is verified |
| `companyReply` | string | Company's response (if any) |
| `reviewImages` | array | URLs of review images |
| `helpfulVotes` | number | Number of helpful votes |
| `reviewId` | string | Unique review identifier |
| `scrapedAt` | string | When this data was scraped |

## Usage Examples 💡

### Using curl
```bash
# Get SafeLedger reviews
curl http://localhost:3001/scrape/safeledger

# Scrape any company
curl -X POST http://localhost:3001/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.trustpilot.com/review/amazon.com"}'
```

### Using JavaScript/fetch
```javascript
// Get SafeLedger reviews
const response = await fetch('http://localhost:3001/scrape/safeledger');
const data = await response.json();
console.log(`Found ${data.totalReviews} reviews!`);

// Scrape any company
const customResponse = await fetch('http://localhost:3001/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://www.trustpilot.com/review/example.com'
  })
});
const customData = await customResponse.json();
```

### Using Python
```python
import requests

# Get SafeLedger reviews
response = requests.get('http://localhost:3001/scrape/safeledger')
data = response.json()
print(f"Found {data['totalReviews']} reviews!")

# Scrape any company
custom_response = requests.post('http://localhost:3001/scrape', json={
    'url': 'https://www.trustpilot.com/review/example.com'
})
custom_data = custom_response.json()
```

## Development 🛠️

### Start in Development Mode
```bash
npm run dev
```

### File Structure
```
trustpiolet_review/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── README.md          # This file
└── node_modules/      # Dependencies (after npm install)
```

## Features in Detail 🔍

### Pagination Handling
- Automatically detects total number of pages
- Scrapes ALL pages, not just the first one
- Handles pagination navigation seamlessly

### Anti-Bot Protection
- Uses realistic user agent strings
- Proper viewport settings
- Delays between page requests
- Handles cookie consent popups

### Error Handling
- Comprehensive error catching
- Detailed error messages
- Graceful browser cleanup
- API error responses

### Data Extraction
- Uses CSS selectors specific to Trustpilot's structure
- Extracts all available review metadata
- Handles missing/optional fields gracefully
- Timestamp tracking for scraping time

## Troubleshooting 🔧

### Common Issues

1. **Browser launch fails**: Make sure you have sufficient permissions and Chrome/Chromium installed
2. **Slow scraping**: This is normal - we add delays to avoid being blocked
3. **Missing reviews**: Some reviews might be dynamically loaded; the scraper waits for content to load
4. **Port already in use**: Change the PORT in app.js or set environment variable

### Performance Tips
- The scraper includes delays to avoid being blocked
- Scraping speed depends on the number of review pages
- Large companies with many reviews will take longer

## License 📄

MIT License - feel free to use this for your projects!

## Support 💬

If you encounter any issues or need help, check the console output for detailed logging and error messages. 