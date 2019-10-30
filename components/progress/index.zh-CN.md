## API

各类型共用的属性。

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 类型，可选 `line` `circle` `dashboard` | string | `line` |
| format | 内容的模板函数 | function(percent, successPercent) \| v-slot:format="percent, successPercent" | `percent => percent + '%'` |
| percent | 百分比 | number | 0 |
| showInfo | 是否显示进度数值或状态图标 | boolean | true |
| status | 状态，可选：`success` `exception` `active` `normal` | string | - |
| strokeLinecap |  | Enum{ 'round', 'square' } | `round` |
| strokeColor | 进度条的色彩 | string | - |
| successPercent | 已完成的分段百分比 | number | 0 |

### `type="line"`

| 属性        | 说明                    | 类型   | 默认值 |
| ----------- | ----------------------- | ------ | ------ |
| strokeWidth | 进度条线的宽度，单位 px | number | 10     |

### `type="circle"`

| 属性        | 说明                                             | 类型   | 默认值 |
| ----------- | ------------------------------------------------ | ------ | ------ |
| width       | 圆形进度条画布宽度，单位 px                      | number | 132    |
| strokeWidth | 圆形进度条线的宽度，单位是进度条画布宽度的百分比 | number | 6      |

### `type="dashboard"`

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| width | 仪表盘进度条画布宽度，单位 px | number | 132 |
| strokeWidth | 仪表盘进度条线的宽度，单位是进度条画布宽度的百分比 | number | 6 |
| gapDegree | 仪表盘进度条缺口角度，可取值 0 ~ 360 | number | 0 |
| gapPosition | 仪表盘进度条缺口位置 | Enum{ 'top', 'bottom', 'left', 'right' } | `top` |
