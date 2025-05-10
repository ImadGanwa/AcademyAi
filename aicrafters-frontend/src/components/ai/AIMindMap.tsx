import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Box, Typography, Paper, CircularProgress, Alert, Link, IconButton } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MarkdownRenderer from '../common/MarkdownRenderer';

const MindMapContainer = styled(Paper)<{ isFullscreen?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: ${props => props.isFullscreen ? '0' : '12px'};
  overflow: hidden;
  background-color: #fff;
  box-shadow: ${props => props.isFullscreen ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)'};
  ${props => props.isFullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1300;
    width: 100vw;
    height: 100vh;
  `}
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
`;

const MindMapHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: ${props => props.theme.palette.primary.main};
  color: #fff;
  position: relative;
`;

const HeaderButtonsContainer = styled(Box)`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 8px;
`;

const FullscreenButton = styled(IconButton)`
  color: white !important;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  & svg {
    fill: white !important;
  }
`;

const MindMapContent = styled(Box)<{ isFullscreen?: boolean }>`
  flex: 1;
  overflow: hidden;
  background-color: #f9fafc;
  position: relative;
  ${props => props.isFullscreen && `
    height: calc(100vh - 57px); // Account for header height
  `}
  transition: height 0.15s cubic-bezier(0.4, 0, 0.2, 1);
`;

// Create an overlay backdrop for fullscreen mode
const FullscreenBackdrop = styled(Box)<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1299;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s cubic-bezier(0.4, 0, 0.2, 1);
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const TextContent = styled(Box)`
  padding: 20px;
  overflow-y: auto;
  height: 100%;
`;

interface AIMindMapProps {
  mindMap: string;
  loading: boolean;
  error: string | null;
}

export const AIMindMap: React.FC<AIMindMapProps> = ({
  mindMap,
  loading,
  error
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const markmapRef = useRef<any>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [useTextFallback, setUseTextFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Effect to ensure container is visible and sized before creating markmap
  useEffect(() => {
    if (!mindMap || loading || error) return;
    
    // Clear previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Create SVG element immediately but don't initialize markmap yet
    if (containerRef.current) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.display = 'block'; // Ensure it's displayed
      containerRef.current.appendChild(svg);
      svgRef.current = svg;
    }
    
    // Delay initialization to ensure container is visible and sized
    const timeoutId = setTimeout(() => {
      renderMindMap();
    }, 100); // Reduced delay for faster rendering
    
    return () => {
      clearTimeout(timeoutId);
      markmapRef.current = null;
      svgRef.current = null;
    };
  }, [mindMap, loading, error]);
  
  // Separate function to render mind map
  const renderMindMap = async () => {
    try {
      setRenderError(null);
      
      if (!containerRef.current || !svgRef.current || !mindMap) return;
      
      // Check if container has dimensions
      const containerRect = containerRef.current.getBoundingClientRect();
      if (containerRect.width <= 0 || containerRect.height <= 0) {
        console.warn('Mind map container has no dimensions yet, retrying...');
        setTimeout(renderMindMap, 50); // Faster retry
        return;
      }
      
      // Set explicit dimensions on SVG before initializing markmap
      svgRef.current.setAttribute('width', `${containerRect.width}px`);
      svgRef.current.setAttribute('height', `${containerRect.height}px`);
      
      // Need to dynamically import these libraries
      let Markmap, Transformer;
      try {
        const markmapViewModule = await import('markmap-view');
        const markmapLibModule = await import('markmap-lib');
        Markmap = markmapViewModule.Markmap;
        Transformer = markmapLibModule.Transformer;
      } catch (err) {
        console.error('Error importing markmap libraries:', err);
        setUseTextFallback(true);
        return;
      }
      
      // Transform markdown to markmap data
      const transformer = new Transformer();
      const { root } = transformer.transform(mindMap);
      
      // Create markmap with error handling
      try {
        markmapRef.current = Markmap.create(svgRef.current, {
          autoFit: true,
          maxWidth: 300,
          paddingX: 50,
          duration: 300, // Reduced for snappier animations
          zoom: true,
          pan: true,
        }, root);
      } catch (err) {
        console.error('Error creating markmap:', err);
        setRenderError('Failed to render mind map. Please try again later.');
        setUseTextFallback(true);
      }
    } catch (err) {
      console.error('Error rendering mind map:', err);
      setRenderError('Failed to render mind map. Please try again later.');
      setUseTextFallback(true);
    }
  };
  
  // Effect to update markmap when fullscreen changes
  useEffect(() => {
    // After fullscreen state changes, wait for transition and resize the mind map
    const timeoutId = setTimeout(() => {
      if (markmapRef.current) {
        try {
          // Set explicit dimensions on SVG before fitting
          if (svgRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            if (containerRect.width > 0 && containerRect.height > 0) {
              svgRef.current.setAttribute('width', `${containerRect.width}px`);
              svgRef.current.setAttribute('height', `${containerRect.height}px`);
              markmapRef.current.fit();
            }
          }
        } catch (err) {
          console.error('Error fitting mind map:', err);
        }
      }
    }, 150); // Reduced delay for snappier transitions
    
    return () => clearTimeout(timeoutId);
  }, [isFullscreen]);
  
  // Add event listener for ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Set body overflow when in fullscreen to prevent scrolling
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };
  
  // Handle viewport size changes (including fullscreen toggle)
  useEffect(() => {
    const handleResize = () => {
      if (markmapRef.current && svgRef.current && containerRef.current) {
        try {
          const containerRect = containerRef.current.getBoundingClientRect();
          if (containerRect.width > 0 && containerRect.height > 0) {
            svgRef.current.setAttribute('width', `${containerRect.width}px`);
            svgRef.current.setAttribute('height', `${containerRect.height}px`);
            markmapRef.current.fit();
          }
        } catch (err) {
          console.error('Error handling resize:', err);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <CircularProgress size={30} />
        </LoadingContainer>
      );
    }
    
    if (error || renderError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || renderError}
          </Alert>
        </Box>
      );
    }
    
    if (!mindMap) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            No mind map available for this video.
          </Alert>
        </Box>
      );
    }
    
    if (useTextFallback) {
      return (
        <TextContent>
          <MarkdownRenderer content={mindMap} />
        </TextContent>
      );
    }
    
    return null; // Mind map rendering is handled by the useEffect
  };
  
  return (
    <>
      <FullscreenBackdrop isVisible={isFullscreen} onClick={() => setIsFullscreen(false)} />
      <MindMapContainer elevation={0} isFullscreen={isFullscreen}>
        <MindMapHeader>
          <Typography variant="subtitle1" fontWeight={600}>
            Mind Map
          </Typography>
          <HeaderButtonsContainer>
            <FullscreenButton 
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              sx={{ color: 'white' }}
            >
              {isFullscreen ? 
                <FullscreenExitIcon fontSize="small" sx={{ color: 'white' }} /> : 
                <FullscreenIcon fontSize="small" sx={{ color: 'white' }} />
              }
            </FullscreenButton>
          </HeaderButtonsContainer>
        </MindMapHeader>
        
        <MindMapContent isFullscreen={isFullscreen}>
          {renderContent()}
          <Box 
            ref={containerRef} 
            sx={{ 
              width: '100%', 
              height: '100%',
              display: loading || error || renderError || !mindMap || useTextFallback ? 'none' : 'block',
              position: 'relative'
            }} 
          />
        </MindMapContent>
      </MindMapContainer>
    </>
  );
};

export default AIMindMap; 