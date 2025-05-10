import React, { useEffect, useRef, useState } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import './MindMap.css';

interface MindMapProps {
  markdown: string;
}

// Default markdown to show when no content is provided
const DEFAULT_MARKDOWN = `# Mind Map\n## No content available\n### Please try again later
`;

const MindMap: React.FC<MindMapProps> = ({ markdown }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  useEffect(() => {
    // Use a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      renderMindMap();
    }, 10);
    
    return () => {
      clearTimeout(timer);
      // Clean up on unmount
      if (markmapRef.current) {
        try {
          // Markmap.create doesn't return a destructor, so manual cleanup is tricky.
          // Setting to null helps GC and avoids stale refs.
          markmapRef.current = null;
        } catch (e) {
          console.error('Error cleaning up markmap:', e);
        }
      }
      // Clear the container as well to prevent duplicated SVGs on fast re-renders
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [markdown]); // markdown is the primary dependency that should trigger re-render
  
  const renderMindMap = () => {
    if (!containerRef.current) return;
    
    setRenderError(null);
    containerRef.current.innerHTML = ''; // Clear previous content
    
    try {
      const containerWidth = containerRef.current.clientWidth || 800;
      const containerHeight = containerRef.current.clientHeight || 600;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', `${containerWidth}px`);
      svg.setAttribute('height', `${containerHeight}px`);
      svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
      containerRef.current.appendChild(svg);
      
      const transformer = new Transformer();
      const contentToUse = markdown && markdown.trim() ? markdown : DEFAULT_MARKDOWN;
      const { root, features } = transformer.transform(contentToUse);
      
      // Ensure all necessary features are loaded for markmap-view
      const { scripts, styles } = transformer.getUsedAssets(features);
      // if (styles) Markmap.styles = styles; // Commented out due to TS2339
      // Scripts are usually for KaTeX, etc. Load them if necessary or ensure they are globally available.
      // For simplicity here, we assume they are handled or not strictly needed for basic rendering.

      markmapRef.current = Markmap.create(svg, {
        autoFit: true,
        maxWidth: 300,
        paddingX: 50,
        duration: 500,
        zoom: true,
        pan: true,
      }, root);
      
      // Fit after a delay
      setTimeout(() => {
        if (markmapRef.current) {
          try {
            markmapRef.current.fit();
          } catch (e) {
            console.error('Error fitting markmap:', e);
            setRenderError('Error rendering mind map visualization');
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error rendering mind map:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setRenderError('Failed to render mind map: ' + errorMessage);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="color: #d32f2f; padding: 20px; text-align: center;">
            <h3>Error Rendering Mind Map</h3>
            <p>${errorMessage}</p>
          </div>
        `;
      }
    }
  };
  
  return (
    <div className="mind-map-container" style={{ width: '100%', height: '600px' }}>
      {renderError && (
        <div className="mind-map-error" style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(211, 47, 47, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 10
        }}>
          {renderError}
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MindMap; 