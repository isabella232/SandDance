/*!
* Copyright (c) Microsoft Corporation.
* Licensed under the MIT License.
*/

import { SignalNames } from '../constants';
import { defaultBins, maxbins, minBarBandWidth } from '../defaults';
import { AxisScales } from '../interfaces';
import { AggregateSquareProps } from '../layouts/aggregateSquare';
import { BandProps } from '../layouts/band';
import { LayoutPair } from '../layouts/layout';
import { SquareProps } from '../layouts/square';
import { StripProps } from '../layouts/strip';
import { TreemapProps } from '../layouts/treemap';
import { allowNoneForSize } from '../size';
import { SpecBuilderProps } from '../specBuilder';
import { SpecContext } from '../types';

export default function (specContext: SpecContext): SpecBuilderProps {
    const { insight, specColumns, specViewOptions } = specContext;
    const axisScales: AxisScales = {
        x: { title: specColumns.x?.name },
        y: { title: specColumns.y?.name },
        z: { title: specColumns.z?.name },
    };
    const backgroundImage =  specColumns.x?.quantitative && specColumns.y?.quantitative && insight.backgroundImage?.extents && insight.backgroundImage;
    const showAxes = !backgroundImage;
    const hBandProps: BandProps = {
        excludeEncodingRuleMap: true,
        orientation: 'horizontal',
        groupby: {
            column: specColumns.y,
            defaultBins,
            maxbinsSignalName: SignalNames.YBins,
            maxbinsSignalDisplayName: specContext.specViewOptions.language.YMaxBins,
            maxbins,
        },
        minBandWidth: minBarBandWidth,
        showAxes,
        outerSignalExtents: backgroundImage && { max: backgroundImage.extents.top, min: backgroundImage.extents.bottom },
    };
    const vBandProps: BandProps = {
        excludeEncodingRuleMap: true,
        orientation: 'vertical',
        groupby: {
            column: specColumns.x,
            defaultBins,
            maxbinsSignalName: SignalNames.XBins,
            maxbinsSignalDisplayName: specContext.specViewOptions.language.XMaxBins,
            maxbins,
        },
        minBandWidth: minBarBandWidth,
        showAxes,
        outerSignalExtents: backgroundImage && { max: backgroundImage.extents.right, min: backgroundImage.extents.left },
    };
    const aggProps: AggregateSquareProps = {
        onBuild: null,
        aggregation: null,
        sumBy: specColumns.size,
    };
    const layouts: LayoutPair[] = [
        {
            layoutType: 'Band',
            props: vBandProps,
        },
        {
            layoutType: 'Band',
            props: hBandProps,
        },
        {
            layoutType: 'AggregateSquare',
            props: aggProps,
        },
    ];
    switch (insight.totalStyle) {
        case 'sum-treemap': {
            aggProps.aggregation = 'sum';
            const treemapProps: TreemapProps = {
                corner: 'bottom-left',
                size: specColumns.size,
                treeMapMethod: specViewOptions.language.treeMapMethod,
                z: specColumns.z,
                showAxes,
            };
            layouts.push({
                layoutType: 'Treemap',
                props: treemapProps,
            });
            break;
        }
        case 'sum-strip': {
            aggProps.aggregation = 'sum';
            const stripProps: StripProps = {
                sortOrder: 'ascending',
                orientation: 'vertical',
                size: specColumns.size,
                sort: specColumns.sort,
                z: specColumns.z,
                showAxes,
            };
            layouts.push({
                layoutType: 'Strip',
                props: stripProps,
            });
            break;
        }
        case 'count-strip': {
            aggProps.aggregation = 'count';
            const stripProps: StripProps = {
                sortOrder: 'ascending',
                orientation: 'vertical',
                sort: specColumns.sort,
                z: specColumns.z,
                showAxes,
            };
            layouts.push({
                layoutType: 'Strip',
                props: stripProps,
            });
            break;
        }
        default: {
            aggProps.aggregation = 'count';
            const squareProps: SquareProps = {
                sortBy: specColumns.sort,
                fillDirection: 'right-down',
                z: specColumns.z,
                maxGroupedUnits: null,
                maxGroupedFillSize: null,
                showAxes,
            };
            aggProps.onBuild = (aggMaxExtent, aggMaxExtentScaled) => {
                squareProps.maxGroupedUnits = aggMaxExtent;
                squareProps.maxGroupedFillSize = aggMaxExtentScaled;
            };
            layouts.push({
                layoutType: 'Square',
                props: squareProps,
            });
            break;
        }
    }
    return {
        axisScales,
        layouts,
        specCapabilities: {
            backgroundImage: true,
            countsAndSums: true,
            roles: [
                {
                    role: 'x',
                    binnable: true,
                    axisSelection: specColumns.x?.quantitative ? 'range' : 'exact',
                    axisSelectionBetweenTicks: true,
                    signals: [SignalNames.XBins],
                },
                {
                    role: 'y',
                    binnable: true,
                    axisSelection: specColumns.y?.quantitative ? 'range' : 'exact',
                    axisSelectionBetweenTicks: true,
                    signals: [SignalNames.YBins],
                },
                {
                    role: 'z',
                    axisSelection: specColumns.z?.quantitative ? 'range' : 'exact',
                    allowNone: true,
                },
                {
                    role: 'color',
                    allowNone: true,
                },
                {
                    role: 'sort',
                    allowNone: true,
                },
                {
                    role: 'size',
                    allowNone: allowNoneForSize,
                    excludeCategoric: true,
                    signals: [SignalNames.TreeMapMethod],
                },
                {
                    role: 'facet',
                    allowNone: true,
                    signals: [SignalNames.FacetBins],
                },
                {
                    role: 'facetV',
                    allowNone: true,
                    signals: [SignalNames.FacetVBins],
                },
            ],
        },
    };
}
