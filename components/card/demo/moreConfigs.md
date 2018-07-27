<cn>
  #### 支持更多内容配置
  一种支持封面、头像、标题和描述信息的卡片。
</cn>

<us>
  #### Support more content configuration
  A Card that supports `cover`, `avatar`, `title` and `description`.
</us>

```html
<template>
<a-card
  hoverable
  style="width: 300px"
>
  <img
    alt="example"
    src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    slot="cover"
  />
  <ul class="ant-card-actions" slot="actions">
    <li style="width: 33.3333%;"><a-icon type="setting" /></li>
    <li style="width: 33.3333%;"><a-icon type="edit" /></li>
    <li style="width: 33.3333%;"> <a-icon type="ellipsis" /></li>
  </ul>
  <a-card-meta
    title="Card title"
    description="This is the description">
    <a-avatar slot="avatar" src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
  </a-card-meta>
</a-card>
</template>
```
