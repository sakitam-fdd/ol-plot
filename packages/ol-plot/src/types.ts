import type Feature from 'ol/Feature';
import type Map from 'ol/Map';
import type { StyleLike } from 'ol/style/Style';
import type { PlotTypes } from './utils/PlotTypes';

export type Coordinate = [number, number];

export interface PlotOptions {
  /** Name used to find or create the SDK vector layer. */
  layerName?: string;
  /** Z-index assigned when the SDK creates its vector layer. */
  zIndex?: number;
  /** Remove a feature from the layer as soon as drawing finishes. */
  isClear?: boolean;
  /** Fit the map view after restoring serialized features. */
  zoomToExtent?: boolean;
  /** Minimum pointer movement, in CSS pixels, accepted as a new control point. */
  pointTolerance?: number;
}

export interface PlotFeatureParams {
  plotType?: PlotTypes;
  style?: StyleLike;
  [key: string]: unknown;
}

export interface PlotSerializedFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties: Record<string, unknown> & {
    type?: PlotTypes;
    points?: Coordinate[];
  };
}

export interface PlotDrawEvent {
  type: 'drawStart' | 'drawEnd';
  feature: Feature | null;
  plotType: PlotTypes;
  originalEvent?: unknown;
}

export type OpenLayersMap = Map;
