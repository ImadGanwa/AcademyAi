import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testVimeoAccess() {
  try {
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
    }

    // Test URLs
    const urls = [
      'https://vimeo.com/1017725861/c2cd4540a2',
      'https://vimeo.com/1017726547'
    ];

    for (const videoUrl of urls) {
      console.log(`\nTesting video URL: ${videoUrl}`);
      
      // Extract video ID using both methods
      let videoId1, videoId2;
      
      // Method 1: Original extraction
      videoId1 = videoUrl.split('/').pop()?.split('?')[0];
      
      // Method 2: New extraction
      if (videoUrl.includes('/')) {
        const parts = videoUrl.trim().split('/');
        if (parts.length >= 5) {
          videoId2 = parts[parts.length - 2]; // Get the ID before the hash
        } else {
          videoId2 = parts[parts.length - 1].split('?')[0];
        }
      }
      
      console.log(`Original extraction method: ${videoId1}`);
      console.log(`New extraction method: ${videoId2}`);
      
      // Try API call with both video IDs
      for (const [method, videoId] of [['Original', videoId1], ['New', videoId2]]) {
        if (!videoId) continue;
        
        console.log(`\nTrying ${method} method with ID: ${videoId}`);
        
        const url = `https://api.vimeo.com/videos/${videoId}`;
        const headers = {
          'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        };
        
        console.log(`API URL: ${url}`);
        
        const response = await fetch(url, { 
          method: 'GET',
          headers 
        });
        
        console.log(`Status code: ${response.status}`);
        
        if (response.status === 200) {
          const data = await response.json();
          console.log('Success! Video info retrieved.');
          console.log(`Video name: ${data.name}`);
          console.log(`Duration: ${data.duration} seconds`);
        } else {
          const errorText = await response.text();
          console.log(`Error: ${errorText}`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testVimeoAccess(); 