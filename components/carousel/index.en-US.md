---
category: Components
type: Data Display
title: Carousel
cover: https://gw.alipayobjects.com/zos/antfincdn/%24C9tmj978R/Carousel.svg
---

A carousel component. Scales with its container.

## When To Use

- When there is a group of content on the same level.
- When there is insufficient content space, it can be used to save space in the form of a revolving door.
- Commonly used for a group of pictures/cards.

## API

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| afterChange | Callback function called after the current index changes | function(current) | - |  |
| autoplay | Whether to scroll automatically | boolean | `false` |  |
| beforeChange | Callback function called before the current index changes | function(from, to) | - |  |
| dots | Whether to show the dots at the bottom of the gallery | boolean | `true` |  |
| dotPosition | The position of the dots, which can be one of `top` `bottom` `left` `right` | string | bottom | 1.5.0 |
| dotsClass | Class name of the dots | string | `slick-dots` |  |
| easing | Transition interpolation function name | string | `linear` |  |
| effect | Transition effect | `scrollx` \| `fade` | `scrollx` |  |

## Methods

| Name | Description | Version |
| --- | --- | --- |
| goTo(slideNumber, dontAnimate) | Go to slide index, if dontAnimate=true, it happens without animation |  |
| next() | Change current slide to next slide |  |
| prev() | Change current slide to previous slide |  |

For more info on the parameters, refer to the [vc-slick props](https://github.com/vueComponent/ant-design-vue/blob/next/components/vc-slick/src/default-props.js#L3)
