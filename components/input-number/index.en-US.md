---
category: Components
type: Data Entry
title: InputNumber
cover: https://gw.alipayobjects.com/zos/alicdn/XOS8qZ0kU/InputNumber.svg
---

Enter a number within certain range with the mouse or keyboard.

## When To Use

When a numeric value needs to be provided.

## API

| property | description | type | default |
| --- | --- | --- | --- | --- |
| autofocus | get focus when component mounted | boolean | false |
| defaultValue | initial value | number |  |
| disabled | disable the input | boolean | false |
| formatter | Specifies the format of the value presented | function(value: number \| string): string | - |
| max | max value | number | Infinity |
| min | min value | number | -Infinity |
| parser | Specifies the value extracted from formatter | function( string): number | - |
| precision | precision of input value | number | - |
| decimalSeparator | decimal separator | string | - |
| size | height of input box | string | - |
| step | The number to which the current value is increased or decreased. It can be an integer or decimal. | number\|string | 1 |
| value(v-model) | current value | number |  |
| bordered | Whether has border style | boolean | true | 3.0 |
| addonAfter | The label text displayed after (on the right side of) the input field | slot | - | 3.0 |
| addonBefore | The label text displayed before (on the left side of) the input field | slot | - | 3.0 |
| controls | Whether to show `+-` controls | boolean | true | 3.0 |
| keyboard | If enable keyboard behavior | boolean | true | 3.0 |
| stringMode | Set value as string to support high precision decimals. Will return string value by `change` | boolean | false | 3.0 |

### events

| Events Name | Description | Arguments | Version |
| --- | --- | --- | --- | --- |
| change | The callback triggered when the value is changed. | function(value: number \| string) |  |  |
| pressEnter | The callback function that is triggered when Enter key is pressed. | function(e) |  | 1.5.0 |
| step | The callback function that is triggered when click up or down buttons | (value: number, info: { offset: number, type: 'up' \| 'down' }) => void | 3.0 |

## Methods

| Name    | Description  |
| ------- | ------------ |
| blur()  | remove focus |
| focus() | get focus    |

## FAQ

### Why `value` can exceed `min` or `max` in control?

Developer handle data by their own in control. It will make data out of sync if InputNumber change display value. It also cause potential data issues when use in form.

### Why dynamic change `min` or `max` which makes `value` out of range will not trigger `change`?

`change` is user trigger event. Auto trigger will makes form lib can not detect data modify source.
