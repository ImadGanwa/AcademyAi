# AICrafters Mind Map Feature Documentation

## Overview

The Mind Map feature automatically generates hierarchical mind maps from video transcriptions. It uses Google's Gemini AI to analyze transcription text and create deeply nested, structured mind maps that help visualize the content and key concepts in course videos.

## Key Features

- **Hierarchical Visualization**: Creates deeply nested mind maps with multiple levels
- **Auto-Generation**: Automatically extracts structure from video transcriptions
- **Interactive Maps**: Supports zooming, panning, and expanding/collapsing nodes
- **Instant Access**: Available directly from the course video interface

## How It Works

1. When a user clicks "Generate Mind Map" for a video, the system checks if a transcription exists
2. If a completed transcription is available, it sends the text to Google's Gemini AI
3. The AI analyzes the transcription and identifies the hierarchical structure, topics, subtopics, and details
4. The backend returns the structured mind map in a format compatible with the frontend visualization
5. The frontend renders an interactive mind map that users can explore

## API Endpoints

### Generate Mind Map for Video

```
GET /api/mindmaps/courses/:courseId/videos/:videoUrl
```

**Authorization Required**: Yes (JWT Bearer Token)

**Parameters**:
- `courseId`: MongoDB ObjectID of the course
- `videoUrl`: URL-encoded URL of the video

**Responses**:
- `200 OK`: Returns the mind map in markdown format (content-type: text/markdown)
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Transcription not found
- `409 Conflict`: Transcription exists but is not yet complete
- `500 Internal Server Error`: Server error during processing
- `503 Service Unavailable`: External AI service unavailable

## Frontend Usage

### Example: Adding a Mind Map Button

```jsx
import React, { useState } from 'react';
import Modal from '../components/Modal';
import MindMap from '../components/MindMap';

const VideoPlayer = ({ courseId, videoUrl }) => {
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleGenerateMindMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/mindmaps/courses/${courseId}/videos/${encodeURIComponent(videoUrl)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Transcription is still being processed. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('No transcription found for this video.');
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Failed to generate mind map');
        }
      }
      
      const markdownContent = await response.text();
      setMindMapData(markdownContent);
      setShowMindMap(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Video player components */}
      
      <div className="video-actions">
        <button
          onClick={handleGenerateMindMap}
          disabled={loading}
          className="mind-map-button"
        >
          {loading ? 'Generating...' : 'Generate Mind Map'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {showMindMap && mindMapData && (
        <Modal onClose={() => setShowMindMap(false)} title="Video Mind Map">
          <MindMap markdown={mindMapData} />
        </Modal>
      )}
    </div>
  );
};

export default VideoPlayer;
```

### Mind Map Component

```jsx
import React, { useEffect, useRef } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import './MindMap.css';

const MindMap = ({ markdown }) => {
  const containerRef = useRef(null);
  const markmapRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      try {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        containerRef.current.appendChild(svg);
        
        // Transform markdown to markmap data
        const transformer = new Transformer();
        const { root } = transformer.transform(markdown);
        
        // Create markmap
        markmapRef.current = Markmap.create(svg, {
          autoFit: true,
          maxWidth: 300,
          paddingX: 50,
          duration: 500,
          zoom: true,
          pan: true,
        }, root);
      } catch (error) {
        console.error('Error rendering mind map:', error);
      }
    }
    
    return () => {
      markmapRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [markdown]);
  
  return (
    <div className="mind-map-container" style={{ width: '100%', height: '600px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MindMap;
```

## Required Dependencies

Add these dependencies to your frontend package.json:

```json
{
  "dependencies": {
    "markmap-lib": "^0.18.11",
    "markmap-view": "^0.18.10",
    "d3": "^7.9.0"
  }
}
```

## Styling

Add a CSS file for styling the mind map:

```css
/* MindMap.css */
.mind-map-container {
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mind-map-container svg {
  display: block;
}

/* Style nodes */
.markmap-node > circle {
  fill: #4f46e5;
  stroke: #4338ca;
}

/* Style for root node */
.markmap-node:first-child > circle {
  fill: #7c3aed;
  stroke: #6d28d9;
  r: 8;
}

/* Style for node text */
.markmap-node > text {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  fill: #1e293b;
}

/* First level node text */
.markmap-node:first-child > text {
  font-weight: bold;
  font-size: 16px;
}
```

## Troubleshooting

### Common Issues

1. **Mind Map Not Displaying**
   - Check console for errors
   - Verify that markmap-lib, markmap-view, and d3 are installed
   - Ensure the markdown format is valid

2. **"Unauthorized" Error**
   - Check that your authentication token is valid and included in the request

3. **"No Transcription Found" Error**
   - Verify that the video has a completed transcription
   - You may need to wait for transcription processing to complete

4. **Mind Map Shows Limited Content**
   - Some transcriptions may be too short or unstructured for deep mind maps
   - Try videos with more educational content for better results

## Limitations

- Depends on the quality and completeness of the video transcription
- Performance may be affected for very large or complex transcriptions
- Mind map generation may take several seconds for longer videos
- The Gemini AI model has a context limit, so extremely long transcriptions may be truncated 