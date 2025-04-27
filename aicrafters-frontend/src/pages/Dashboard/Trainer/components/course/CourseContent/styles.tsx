import styled from 'styled-components';
import { Box, TextField } from '@mui/material';

export const Section = styled.section`
  padding: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  margin-bottom: 2rem;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
`;

export const DroppableContainer = styled.div`
  min-height: 100px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 2px dashed ${({ theme }) => theme.palette.divider};
  position: relative;

  &[data-type="preview"] {
    border: 3px dashed #D710C1;
    background: rgba(0, 0, 0, 0.02);
  }

  &[data-type="editor"] {
    border: 3px dashed rgba(0, 0, 0, 0.6);
    background: white;
  }
`;

export const EditorContainer = styled(Box)`
  margin-bottom: 16px;
  
  .quill {
    .ql-toolbar {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      background: #f8f9fa;
    }
    
    .ql-container {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      min-height: 200px;
    }
  }
`;

export const MediaPreview = styled(Box)`
  margin-top: 16px;
  margin-bottom: 16px;
  
  img, video {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    object-fit: contain;
  }
`;

export const ZoneTitle = styled(Box)`
  position: absolute;
  top: -12px;
  left: 16px;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: 0 8px;
  font-size: 0.875rem;
`;

export const DragHandle = styled(Box)`
  cursor: grab;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-right: 8px;
  
  &:hover {
    color: #ffffff;
  }
`;

export const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 16px;
    
    .MuiInputBase-input {
      color: ${({ theme }) => theme.palette.text.secondary};
    }
    
    .MuiOutlinedInput-root {
      &.Mui-focused fieldset {
        border-color: ${({ theme }) => theme.palette.secondary.main};
      }
    }
  }
`; 