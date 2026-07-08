declare module "react-simple-maps" {
  import * as React from "react";

  export interface ComposableMapProps {
    projection?: string | ((...args: unknown[]) => unknown);
    projectionConfig?: Record<string, unknown>;
    className?: string;
    width?: number;
    height?: number;
    role?: string;
    "aria-labelledby"?: string;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => React.ReactNode;
  }

  export interface Geography {
    rsmKey: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface GeographyProps {
    key?: string;
    geography: Geography;
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    filter?: string;
    tabIndex?: number;
    role?: string;
    "aria-label"?: string;
    "aria-pressed"?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
}
