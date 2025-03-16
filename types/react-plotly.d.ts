declare module 'react-plotly.js' {
  import * as React from 'react';

  export interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    frames?: any[];
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any, graphDiv: any) => void;
    onUpdate?: (figure: any, graphDiv: any) => void;
    onPurge?: (figure: any, graphDiv: any) => void;
    onError?: (err: Error) => void;
    onClick?: (event: any) => void;
    onHover?: (event: any) => void;
    onUnhover?: (event: any) => void;
    useResizeHandler?: boolean;
    revision?: number;
    divId?: string;
  }

  export default class Plot extends React.Component<PlotParams> {}
}
