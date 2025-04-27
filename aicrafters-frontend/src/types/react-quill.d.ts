declare module 'react-quill' {
  import React from 'react';

  export interface ReactQuillProps {
    value: string;
    onChange: (value: string) => void;
    modules?: any;
    formats?: string[];
    theme?: string;
    placeholder?: string;
    preserveWhitespace?: boolean;
    bounds?: string | HTMLElement;
    readOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  declare class ReactQuill extends React.Component<ReactQuillProps> {}

  export default ReactQuill;
} 