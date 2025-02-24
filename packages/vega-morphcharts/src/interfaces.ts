/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/

import { Camera, View } from '@msrvida/chart-types';
import { Scene, SceneLine, SceneText } from 'vega-typings';
import { Axes, Core, Renderers } from 'morphcharts';
import { Config } from 'morphcharts/dist/renderers/advanced/config';
import { quat, vec3 } from 'gl-matrix';

export type Position = [number, number, number];
export type RGBAColor = [number, number, number, number];

export { Core as MorphChartsCore };

export interface VegaTextLayerDatum {
    color: RGBAColor;
    text: string;
    position: Position;
    size: number;
    angle?: number;
    //textAnchor?: TextAnchor;                  //TODO
    //alignmentBaseline?: AlignmentBaseline;
    metaData?: any;
}

export interface StyledLine {
    color?: RGBAColor;
    sourcePosition: Vec3;
    strokeWidth?: number;
    targetPosition: Vec3;
}

export interface TickText extends VegaTextLayerDatum {
    value: number | string;
}

export type AxisRole = 'x' | 'y' | 'z';

export interface Axis {
    axisRole: AxisRole;
    domain: StyledLine;
    ticks: StyledLine[];
    tickText: TickText[];
    title?: VegaTextLayerDatum;
}

/**
 * 3 dimensional array of numbers.
 */
export type Vec3 = [number, number, number];

/**
 * Cuboid information. The cube does not need to have equal dimensions.
 */
export interface Cube {

    /**
     * Ordinal position.
     */
    ordinal?: number;

    /**
     * Flag whether this cube is a "placeholder" and is not to be rendered nor contains cube data.
     */
    isEmpty?: boolean;

    color: RGBAColor;
    position: Vec3;
    size: Vec3;
}

export interface Path {
    positions: Position[];
    strokeColor: RGBAColor;
    strokeWidth: number;
}

export interface ImageBounds {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Image {
    bounds: ImageBounds;
    height: number;
    url: string;
    width: number;
}

/**
 * Vega Scene plus camera type.
 */
export interface Scene3d extends Scene {
    view: View;
}

/**
 * Rect area and title for a facet.
 */
export interface FacetRect {
    datum: any;
    lines: StyledLine[];
}

/**
 * Data structure containing all that is necessary to present a chart.
 */
export interface Stage {
    redraw?: boolean;
    backgroundColor?: RGBAColor;
    backgroundImages?: Image[];
    cubeData?: Cube[];
    pathData?: Path[];
    legend?: Legend;
    axes?: { [key in AxisRole]: Axis[] };
    textData?: VegaTextLayerDatum[];
    view?: View;
    gridLines?: StyledLine[];
    facets?: FacetRect[];
}

export interface Legend {
    title?: string;
    rows: { [index: number]: LegendRow };
}

export interface LegendRow {
    label?: string;
    value?: string;
    symbol?: LegendRowSymbol;
}

export interface LegendRowSymbol {
    bounds: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    fill: string;
    shape: string;
}

/**
 * Function that can be called prior to presenting the stage.
 */
export interface PreStage {
    (stage: Stage, colorMapper: MorphChartsColorMapper): void;
}

/**
 * Lengths of time for a transition animation.
 */
export interface TransitionDurations {
    color?: number;
    position?: number;
    stagger?: number;
    view?: number;
}

/**
 * Configuration options to be used by the Presenter.
 */
export interface PresenterConfig {
    getCameraTo?: () => Camera;
    transitionDurations?: TransitionDurations;
    mcColors?: McColors;
    initialMcRendererOptions?: McRendererOptions;
    preStage?: PreStage;
    getCharacterSet?: (stage: Stage) => string[];
    redraw?: () => void;
    onCubeHover?: (e: MouseEvent | PointerEvent | TouchEvent, cube: Cube) => void;
    onCubeClick?: (e: MouseEvent | PointerEvent | TouchEvent, cube: Cube) => void;
    onLayerClick?: (e: MouseEvent) => any;
    onLasso?: (ids: Set<number>, e: MouseEvent | PointerEvent | TouchEvent) => void;
    onLegendClick?: (e: MouseEvent | PointerEvent | TouchEvent, legend: Legend, clickedIndex: number) => void;
    onPresent?: () => void;
    shouldViewstateTransition?: () => boolean;
    preLayer?: (stage: Stage) => void;
    onTextClick?: (e: MouseEvent | PointerEvent | TouchEvent, t: VegaTextLayerDatum) => void;
    onTextHover?: (e: MouseEvent | PointerEvent | TouchEvent, t: VegaTextLayerDatum) => boolean;
    getTextColor?: (o: VegaTextLayerDatum) => RGBAColor;
    getTextHighlightColor?: (o: VegaTextLayerDatum) => RGBAColor;
    onSceneRectAssignCubeOrdinal?: (d: object) => number | undefined;
    onAxisItem?: (vegaItem: SceneLine | SceneText, stageItem: StyledLine | VegaTextLayerDatum, stage: Stage, currAxis: Axis) => void;
    onAxisConfig?: (cartesian: Axes.Cartesian2dAxes | Axes.Cartesian3dAxes, dim3d: number, axis: Axis) => void;
    onAxesComplete?: (cartesian: Axes.Cartesian2dAxes | Axes.Cartesian3dAxes) => void;
    axisPickGridCallback?: (divisions: number[], e: MouseEvent | PointerEvent | TouchEvent) => void;
    onTargetViewState?: (height: number, width: number) => { height: number, width: number, newViewStateTarget?: boolean };
    preserveDrawingBuffer?: boolean;
    zAxisZindex?: number;
    layerSelection?: LayerSelection;
}

export interface PresenterStyle {
    cssPrefix?: string;
    defaultCubeColor?: RGBAColor;
    highlightColor?: RGBAColor;
    fontFamily?: string;
}

/**
 * Options to pass to Presenter.queueAnimation()
 */
export interface QueuedAnimationOptions {

    /**
     * Debug label to observe which animation is waiting.
     */
    waitingLabel?: string;

    /**
     * Debug label to observe which handler is invoked.
     */
    handlerLabel?: string;

    /**
     * Function to invoke if animation was interrupted when another animation is queued.
     */
    animationCanceled?: () => void;
}

export interface UnitColorMap {
    ids: Uint32Array;
    minColor: number;
    maxColor: number;
    colors: Float64Array;
    palette: Uint8Array;
}

/**
 * MorphCharts interfaces
 */

export interface AdvancedRendererOptions extends Partial<Config> { }
export interface BasicRendererOptions extends Renderers.Basic.IRendererOptions { }

export interface McRendererOptions {
    advanced: boolean;
    advancedOptions: AdvancedRendererOptions;
    basicOptions: BasicRendererOptions;
}

export interface MorphChartsRef {
    reset: () => void;
    core: Core;
    isCameraMovement: boolean;
    isTransitioning: boolean;
    cameraTime: number;
    transitionTime: number;
    transitionModel: boolean;
    setMcRendererOptions: (value: McRendererOptions) => void;
    lastMcRendererOptions: McRendererOptions;
    qModelFrom: quat;
    qModelTo: quat;
    qModelCurrent: quat;
    qCameraRotationFrom: quat;
    qCameraRotationTo: quat;
    qCameraRotationCurrent: quat;
    vCameraPositionFrom: vec3;
    vCameraPositionTo: vec3;
    vCameraPositionCurrent: vec3;
    supportedRenders: {
        advanced: boolean;
        basic: boolean;
    }
}

export interface ILayerProps {
    ref: MorphChartsRef;
    stage: Stage;
    height: number;
    width: number;
    bounds?: IBounds;
    config: PresenterConfig;
}

export interface IBounds {
    minBoundsX: number;
    minBoundsY: number;
    minBoundsZ: number;
    maxBoundsX: number;
    maxBoundsY: number;
    maxBoundsZ: number;
}

export interface ILayer {
    bounds: IBounds;
    update?: (bounds: IBounds, selected?: Set<number>) => void;
    unitColorMap?: UnitColorMap
}

export type ILayerCreator = (props: ILayerProps) => ILayer;

export interface LayerSelection {
    cubes?: Set<number>;
    lines?: Set<number>;
    texts?: Set<number>;
}

export interface MorphChartsColorMapper {
    getCubeUnitColorMap: () => UnitColorMap;
    setCubeUnitColorMap: (unitColorMap: UnitColorMap) => void;
}

export interface MorphChartsRendering extends MorphChartsColorMapper {
    activate(id: number),
    update: (layerSelection: LayerSelection) => void;
    moveCamera: (position: vec3, rotation: quat) => void;
}

export type McColor = [number, number, number];

export interface McColors {
    activeItemColor: string;
    backgroundColor: string;
    textColor: string;
    textBorderColor: string;
    axesTextLabelColor: string;
    axesTextTitleColor: string;
    axesTextHeadingColor: string;
    axesGridBackgroundColor: string;
    axesGridHighlightColor: string;
    axesGridMinorColor: string;
    axesGridMajorColor: string;
    axesGridZeroColor: string;
}
