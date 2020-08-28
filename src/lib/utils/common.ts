import * as Utils from '.';
import { Props, State } from '../types';
import { getItemsCount } from '.';

export const getIsStageContentPartial = (stageWidth = 0, contentWidth = 0) => {
	return stageWidth >= contentWidth;
};

export const getStageContentWidth = (state: Partial<State>) => {
	const { infinite, itemsCount = 0, itemsInSlide = 1, itemsOffset = 0, transformationSet = [] } = state;

	if (infinite) {
		const cursor = itemsOffset + itemsInSlide;
		const items = transformationSet.slice(cursor, cursor + itemsCount);

		return items.reduce((acc, item) => (acc += item.width), 0);
	}

	const { position = 0, width = 0 } = transformationSet[itemsCount - 1] || {};
	return position + width;
};

export const getItemsInSlide = (itemsCount: number, props: Props) => {
	let itemsInSlide = 1;
	const { responsive, autoWidth = false, infinite = false } = props;

	if (autoWidth && infinite) {
		itemsInSlide = itemsCount;
	} else if (responsive) {
		const configKeys = Object.keys(responsive);

		if (configKeys.length) {
			configKeys.forEach((key) => {
				if (Number(key) < window.innerWidth) {
					itemsInSlide = Math.min(responsive[key].items, itemsCount) || itemsInSlide;
				}
			});
		}
	}
	return itemsInSlide;
};

export const calculateInitialProps = (props: Props, el): State => {
	let transformationSet;
	const { animationDuration, infinite = false, autoPlay = false, autoWidth = false } = props;
	const clones = Utils.createClones(props);
	const transition = Utils.getTransitionProperty();
	const itemsCount = getItemsCount(props);
	const itemsOffset = Utils.getItemsOffset(props);
	const itemsInSlide = getItemsInSlide(itemsCount, props);
	const activeIndex = Utils.getStartIndex(props.activeIndex, itemsCount);
	const { width: stageWidth } = Utils.getElementDimensions(el);

	if (autoWidth) {
		transformationSet = Utils.createAutowidthTransformationSet(el);
	} else {
		transformationSet = Utils.createDefaultTransformationSet(clones, stageWidth, itemsInSlide);
	}

	const { position: swipeAllowedPositionMax } = Utils.getTransformationSetItem(-itemsInSlide, transformationSet);

	const stageContentWidth = getStageContentWidth({
		itemsCount,
		itemsInSlide,
		itemsOffset,
		transformationSet,
		infinite,
	});

	const isStageContentPartial = getIsStageContentPartial(stageWidth, stageContentWidth);

	const swipeLimitMin = Utils.getSwipeLimitMin({ itemsOffset, transformationSet }, props);
	const swipeLimitMax = Utils.getSwipeLimitMax({ itemsCount, itemsOffset, itemsInSlide, transformationSet }, props);
	const swipeShiftValue = Utils.getSwipeShiftValue(itemsCount, transformationSet);

	const translate3d = Utils.getTranslate3dProperty(activeIndex, {
		itemsInSlide,
		itemsOffset,
		transformationSet,
		autoWidth,
		infinite,
	});

	return {
		activeIndex,
		autoWidth,
		animationDuration,
		clones,
		infinite,
		itemsCount,
		itemsInSlide,
		itemsOffset,
		translate3d,
		stageWidth,
		stageContentWidth,
		initialStageHeight: 0,
		isStageContentPartial,
		isAutoPlaying: Boolean(autoPlay),
		isAutoPlayCanceledOnAction: false,
		transformationSet,
		transition,
		fadeoutAnimationIndex: null,
		fadeoutAnimationPosition: null,
		fadeoutAnimationProcessing: false,
		swipeLimitMin,
		swipeLimitMax,
		swipeAllowedPositionMax,
		swipeShiftValue,
	};
};
