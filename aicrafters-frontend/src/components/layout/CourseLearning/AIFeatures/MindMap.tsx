import React, { useEffect, useRef, useState, Suspense } from 'react';
import styled from 'styled-components';
import { Paper, Typography, CircularProgress, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';

// Don't use React.lazy for these libraries as they're not React components
// We'll import them dynamically within our effect
// const Markmap = React.lazy(() => import('markmap-view').then(module => ({ default: module.Markmap })));
// const Transformer = React.lazy(() => import('markmap-lib').then(module => ({ default: module.Transformer })));

const MindMapContainer = styled(Paper)<{ isFullscreen: boolean }>`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: ${props => props.isFullscreen ? '100%' : '100%'};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: ${props => props.isFullscreen ? 'fixed' : 'relative'};
  top: ${props => props.isFullscreen ? '0' : 'auto'};
  left: ${props => props.isFullscreen ? '0' : 'auto'};
  right: ${props => props.isFullscreen ? '0' : 'auto'};
  bottom: ${props => props.isFullscreen ? '0' : 'auto'};
  z-index: ${props => props.isFullscreen ? '9999' : '1'};
  background-color: white;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled(Typography)`
  font-weight: 600;
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SVGContainer = styled.div`
  flex: 1;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const GenerateButton = styled(Button)`
  margin-top: 16px;
  align-self: center;
`;

const ErrorMessage = styled(Typography)`
  color: ${props => props.theme.palette.error.main};
  margin: 16px 0;
  text-align: center;
`;

interface MindMapProps {
  courseId: string;
  videoUrl: string;
  onClose?: () => void;
}

const MindMap: React.FC<MindMapProps> = ({ courseId, videoUrl, onClose }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<any>(null);
  const [markdownData, setMarkdownData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      markmapRef.current = null;
      if (svgRef.current && svgRef.current.parentNode) {
        svgRef.current.parentNode.removeChild(svgRef.current);
      }
      svgRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (markdownData && containerRef.current) {
      try {
        // Create SVG element if it doesn't exist
        if (!svgRef.current) {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(svg);
          svgRef.current = svg;
        }

        // Import libraries dynamically to avoid SSR issues
        import('markmap-lib').then(({ Transformer }) => {
          import('markmap-view').then(({ Markmap }) => {
            const transformer = new Transformer();
            const { root } = transformer.transform(markdownData);
            
            // Create or update markmap
            if (!markmapRef.current) {
              markmapRef.current = Markmap.create(svgRef.current!, {
                autoFit: true,
                maxWidth: 300,
                paddingX: 50,
                duration: 500,
                zoom: true,
                pan: true,
              }, root);
            } else {
              markmapRef.current.setData(root);
              markmapRef.current.fit();
            }
          });
        });
      } catch (error) {
        console.error('Error rendering mind map:', error);
        setError('Error rendering mind map. Please try again.');
      }
    }
  }, [markdownData]);

  const handleGenerateMindMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const encodedVideoUrl = encodeURIComponent(videoUrl);
      const response = await api.get(`/api/mindmaps/courses/${courseId}/videos/${encodedVideoUrl}`, {
        headers: {
          Accept: 'text/markdown',
        },
        responseType: 'text',
      });
      
      if (response.status === 200) {
        setMarkdownData(response.data);
      } else {
        throw new Error('Failed to generate mind map');
      }
    } catch (err: any) {
      console.error('Mind map error:', err);
      if (err.response?.status === 409) {
        setError('Transcription is still being processed. Please try again later.');
      } else if (err.response?.status === 404) {
        setError('No transcription found for this video.');
      } else {
        setError(err.message || 'Failed to generate mind map');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    // We need to redraw the mind map when toggling fullscreen
    setTimeout(() => {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    }, 300);
  };

  return (
    <MindMapContainer isFullscreen={isFullscreen}>
      <Header>
        <Title variant="h6">
          <DescriptionIcon color="primary" />
          Mind Map
        </Title>
        <Controls>
          <IconButton onClick={toggleFullscreen} size="small">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Controls>
      </Header>
      
      {!markdownData && !loading && !error && (
        <GenerateButton
          variant="contained"
          color="primary"
          onClick={handleGenerateMindMap}
          startIcon={<DescriptionIcon />}
        >
          Generate Mind Map
        </GenerateButton>
      )}
      
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <CircularProgress />
        </div>
      )}
      
      {error && <ErrorMessage variant="body2">{error}</ErrorMessage>}
      
      {markdownData && !loading && (
        <SVGContainer ref={containerRef} />
      )}
    </MindMapContainer>
  );
};

export default MindMap; 