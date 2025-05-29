import React from 'react';
import { Box } from '@mui/material';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const MarkdownContainer = styled(Box)`
  width: 100%;
  
  p {
    margin: 0.5em 0;
    line-height: 1.6;
    font-size: 0.9rem !important;
  }
  
  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  
  li {
    margin: 0.25em 0;
    font-size: 0.9rem !important;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 1em 0 0.5em 0;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 {
    font-size: 1.5rem !important;
  }
  
  h2 {
    font-size: 1.3rem !important;
  }
  
  h3 {
    font-size: 1.15rem !important;
  }
  
  h4, h5, h6 {
    font-size: 1rem !important;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.06);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.85em !important;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.06);
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;
    
    code {
      background-color: transparent;
      padding: 0;
      white-space: pre;
    }
  }
  
  blockquote {
    border-left: 3px solid #ccc;
    margin: 1em 0;
    padding-left: 1em;
    color: #666;
    font-size: 0.9rem !important;
  }
  
  a {
    color: ${props => props.theme.palette.primary.main};
    text-decoration: none;
    font-size: 0.9rem !important;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 0.9rem !important;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  }
`;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  return (
    <MarkdownContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer; 