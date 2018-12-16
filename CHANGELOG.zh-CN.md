# 更新日志

---

## 1.2.0
`2018-12-16`
### 与antd 3.10.x同步

- 🔥🔥🔥 使用了 svg 图标替换了原先的 font 图标，从而带来了以下优势：
  - 可以离线化使用，不需要从支付宝 cdn 下载字体文件，图标不会因为网络问题呈现方块，也无需字体文件本地部署。
  - 在低端设备上 svg 有更好的清晰度。
  - 支持多色图标。
  - 对于内建图标的更换可以提供更多 API，而不需要进行样式覆盖。
  - 😓 但同时带来打包文件过大问题，相关解决方案和讨论可以查看 React 版 ant-design [issue](https://github.com/ant-design/ant-design/issues/12011)。
  - 🌟 新增 `theme` 属性，可以设置图标的主题风格。
  - 🌟 新增 `component` 属性，可以外部传入一个组件来自定义控制渲染结果。
  - 🌟 新增 `twoToneColor` 属性，可以控制双色图标的主题色。
  - 🌟 新增静态方法 `Icon.getTowToneColor()` 和 `Icon.setTwoToneColor(...)`，可以全局性的获取和设置所有双色图标的主题色。
  - 🌟 新增静态方法 `Icon.createFromIconfontCN({...})`，可以更加方便地使用 [`iconfont.cn`](http://iconfont.cn/) 上托管的图标。
- 🔥 增加了一个新组件`Skeleton`
- 🔥 Menu 在 `horizontal` 模式下会自动收起来适应宽度。
- 🔥 Drawer 的 `placement` 支持 `top` 和 `bottom`，可以适应更多场景。
- 🌟 以下组件均新增了 `suffixIcon` 属性，用于设置输入框后面的图标，具体用法可以参考文档。
  - Cascader
  - DatePicker
  - Select
  - TreeSelect
  - TimePicker
- 🌟 新增 Modal.open 方法，用于可自定义图标的快捷对话框。
- 🌟 Modal.info 增加 `getContainer` 的配置。
- 🌟 合并优化了 RangePicker 的日历页脚 UI。
- 🌟 Anchor 组件增加 `click` 事件。
- 🌟 Tab 组件增加 `renderTabBar` 属性。
- 🌟 Input 组件增加 `select` 方法。
- 🌟 Steps 增加 `initial` 属性。
- 🌟 Upload 组件新增 `openFileDialogOnClick` 属性，用于设置点击组件时是否打开上传对话框。
- 🌟 InputNumber 组件新增 `decimalSeparator` 属性，用于设置自定义的小数点。
- 🐞 修复众多隐蔽暂未提issue的bug，再此不在一一列出

## 1.1.10

`2018-12-7`
- 🔥🔥🔥 在1.1.10版本中`Form`组件更好地支持单文件tempalte语法，在以往版本中，对于复杂的组件需求，需要使用JSX才可以实现。为了更好地在template中使用Form表单的自动收集校验功能，我们优化了组件的使用方式。文档全部Demo使用最新语法重构。
不过对于以往API，还是继续支持，你可以不用担心API的改变，导致已有系统出现问题。
````html
<template>
  <a-form :form="form">
    <a-form-item>
      <a-input v-decorator="[id, options]">
    </a-form-item>
  </a-form>
</template>
<script>
export default {
  beforeCreate () {
    this.form = this.$form.createForm(this, options)
  },
}
</script>
````
- 🐞 修复`Steps`组件`labelPlacement`不生效问题 [#281](https://github.com/vueComponent/ant-design-vue/issues/281)
- 🐞 修复`Timeline`组件样式问题，添加`reverse` `mode`属性 [#8e37cd](https://github.com/vueComponent/ant-design-vue/commit/8e37cd89f92ee2541f641fd860785cfd2361b2b3)
- `Tree`
  - 🐞 修复`treeDefaultExpandedKeys`不生效问题 [#284](https://github.com/vueComponent/ant-design-vue/issues/284)
  - 🐞 修复`expandedKeys` `selectedKeys`等其它数组属性通过组件变异方法改变时组件不更新问题 [#239](https://github.com/vueComponent/ant-design-vue/issues/239)


---

## 1.1.9

`2018-11-26`
- 🐞 修复`TreeSelect`组件getPopupContainer不生效问题 [#265](https://github.com/vueComponent/ant-design-vue/issues/265)
- 🐞 修复`Carousel`组件按需加载不生效问题 [#271](https://github.com/vueComponent/ant-design-vue/issues/271)
- 🐞 修复`Upload`组件remove事件无返回值问题 [#259](https://github.com/vueComponent/ant-design-vue/issues/259)


## 1.1.8

`2018-11-11`
- `Progress`
  - 🐞 修复circle类型不支持strokeColor问题 [#238](https://github.com/vueComponent/ant-design-vue/issues/238)
  - 🐞 添加`normal`类型 [#257](https://github.com/vueComponent/ant-design-vue/issues/257)
- 🐞 修复`Cascader`组件getPopupContainer不生效问题 [#257](https://github.com/vueComponent/ant-design-vue/issues/257)
- 🌟 `Tooltip`支持align [#252](https://github.com/vueComponent/ant-design-vue/issues/252)


## 1.1.7

`2018-10-27`
- 🐞 修复`Cascader`组件类型错误问题 [#219](https://github.com/vueComponent/ant-design-vue/issues/219)
- 🐞 修复`Tree`组件自定义Icon时回调参数顺序错误问题 [#223](https://github.com/vueComponent/ant-design-vue/issues/223)
- 🐞 修复`Table`组件多次触发翻页回调问题 [#228](https://github.com/vueComponent/ant-design-vue/issues/228)
- 🌟 优化`Tabs`组件新增tab默认滚动到可视区域 [#215](https://github.com/vueComponent/ant-design-vue/issues/215)
- 🐞 修复`RadioGroup`组件不支持数字0问题 [#226](https://github.com/vueComponent/ant-design-vue/issues/226)
- 🐞 修复`Slider`组件当设置zoom不为1时，位置错误问题，部分浏览器需要visualViewport Polyfill [#227](https://github.com/vueComponent/ant-design-vue/issues/227)

## 1.1.6

`2018-10-10`
- 🐞 修复`Select`组件键盘事件报错问题 [#217](https://github.com/vueComponent/ant-design-vue/issues/217)
- 🐞 修复`Drawer`组件children更新问题 [#209](https://github.com/vueComponent/ant-design-vue/issues/209)

## 1.1.4

`2018-09-29`
- 🛠 重构`vc-tree`组件，并新增目录树组件
- 🐞 修复`tabs`组件属性`tabBarGutter`不生效问题 [#205](https://github.com/vueComponent/ant-design-vue/issues/205)
- 🐞 修复`table`组件数据同步出错问题 [#202](https://github.com/vueComponent/ant-design-vue/issues/202)

## 1.1.3

`2018-09-22`
- 🎉 优化组件注册方式，如Vue.use(Form) [a6620c](https://github.com/vueComponent/ant-design-vue/commit/a6620cbbe58cc1694a994e6714853906d1d794be)
- 🐞 `Select.Option` 组件`value`属性支持`0` [#194](https://github.com/vueComponent/ant-design-vue/issues/194)
- 🐞 修复 `Layout.Sider` 折叠按钮宽度不生效问题 [#201](https://github.com/vueComponent/ant-design-vue/issues/201)
- 🐞 修复 `Menu` 切换inlineCollapsed时，纵向无动画问题 [#200](https://github.com/vueComponent/ant-design-vue/issues/200)
- 🐞 修复 `Steps` `dot`模式下样式问题 [#199](https://github.com/vueComponent/ant-design-vue/issues/199)


## 1.1.2

`2018-09-17`
- 🎉 同步antd3.8.4样式
- 🌟 Tag组件新增`visible`属性及wave效果
- 🐞 修复`Cascader`组件，已选中项未展开问题 [#195](https://github.com/vueComponent/ant-design-vue/issues/195)

## 1.1.1

`2018-09-13`
- 🐞 修复窗口大小改变导致弹窗位置错位问题 [#184](https://github.com/vueComponent/ant-design-vue/issues/184)
- 🐞 tabs容器添加自定义事件监听 [#189](https://github.com/vueComponent/ant-design-vue/issues/189)
- 🐞 修复通过API形式调用Modal窗口时，`centered`不生效问题 [#183](https://github.com/vueComponent/ant-design-vue/issues/183)
- 🐞 Slider marks支持{number: function}形式 [#171](https://github.com/vueComponent/ant-design-vue/issues/171)

## 1.1.0

`2018-09-11`
- 🎉 从[3.4.0](https://github.com/ant-design/ant-design/releases/tag/3.4.0)同步组件到antd [3.8.2](https://github.com/ant-design/ant-design/releases/tag/3.8.2)
- 🌟 新增`Drawer 抽屉`组件
- 🐞 修复`Spin`内容闪烁问题 [#174](https://github.com/vueComponent/ant-design-vue/issues/174)
- 🐞 修复`RangePicker`选择项未禁用问题 [#158](https://github.com/vueComponent/ant-design-vue/issues/158)
- 🐞 修复`Form`值为 `null`时报错问题 [#153](https://github.com/vueComponent/ant-design-vue/issues/153)
- 🐞 修复`Modal`子组件重复`mounted`问题 [#152](https://github.com/vueComponent/ant-design-vue/issues/152)
- 🐞 修复`Transfer`搜索过滤后不能正确显示问题 [#148](https://github.com/vueComponent/ant-design-vue/issues/148)
- 🐞 修复多级`Tabs`组件嵌套导致`size`不生效问题 [#144](https://github.com/vueComponent/ant-design-vue/issues/144)
- 🐞 修复`TreeSelect`searchPlaceholder 不生效 [#125](https://github.com/vueComponent/ant-design-vue/issues/125)
- 🛠 其它未出现在issue中的问题，详见antd changelog

## 1.0.3

`2018-08-11`
- 🐞 修复`Select`子元素不更新问题 [#106](https://github.com/vueComponent/ant-design-vue/issues/106)
- 🐞 修复`Badge` offset属性X Y轴顺序错误问题，并新增支持number类型 [#99](https://github.com/vueComponent/ant-design-vue/issues/99)
- 🐞 修复`Input`在ie下中文placeholder触发input事件问题 [#92](https://github.com/vueComponent/ant-design-vue/issues/92)
- 🐞 修复`Avatar`不接受事件问题 [#102](https://github.com/vueComponent/ant-design-vue/issues/102)
- 🐞 修复`grid.row`gutter类型错误问题 [4af03c4](https://github.com/vueComponent/ant-design-vue/commit/4af03c4ab9596ede9d1b79c8308d0a3ed58b7a11)
- 🐞 修复`CheckboxGroup`在`Form`中报defaultValue warning问题 [#110](https://github.com/vueComponent/ant-design-vue/issues/110)

## 1.0.2

`2018-08-04`
- 🎉 修改组件库名称为`ant-design-vue`
- 🌟 官方站点支持IE9访问[a8a5f8](https://github.com/vueComponent/ant-design-vue/commit/a8a5f854c3b6a78df526caf2fb391e5c9d0848ac)
- 🐞 修复导出未定义变量引起的提醒问题[#87](https://github.com/vueComponent/ant-design-vue/issues/87)
- 🐞 修复部分组件类名重复问题[b48bbac](https://github.com/vueComponent/ant-design-vue/commit/b48bbac695dabec9160d947f9b27b2d91028c455)
- 🐞 修复`Select`组件label不更新问题[da1b924](https://github.com/vueComponent/ant-design-vue/commit/da1b924cba0fcc871b73590ac3ebd96af81b3897)
- 🛠 更正了若干文档错误

## 1.0.1

`2018-07-27`
- 🌟 针对`Input`组件优化中文输入(仅在v-model绑定时生效) [4a5154](https://github.com/vueComponent/ant-design-vue/commit/4a51544bd6470ab628dda80e9d7593e4603dd0b6)
- 🐞 修复`TreeSelect` `treeeData[i].children`为`null`时报错问题[#81](https://github.com/vueComponent/ant-design-vue/issues/81)
- 🐞 修复`Calendar`组件的 change 事件触发两次的问题[#82](https://github.com/vueComponent/ant-design-vue/issues/82)
- 🐞 修复`Card`组件的`description`和`title`属性slot不生效问题[#83](https://github.com/vueComponent/ant-design-vue/issues/83)
- 🐞 修复`DataPicker`组件的`dropdownClassName`属性不生效问题[02ab242](https://github.com/vueComponent/ant-design-vue/commit/02ab242197b923f2157f41d98a7930512475a799)

## 1.0.0

`2018-07-21`
- 🌟 新增`Carousel 走马灯`组件[edddbd](https://github.com/vueComponent/ant-design-vue/commit/edddbd982a279b62229ce825855c14c556866ece)
- 更正了若干文档错误

## 0.7.1

`2018-07-17`
- 🐞 修复`Tooltip`包含`Button`时的样式及功能问题[#73](https://github.com/vueComponent/ant-design-vue/issues/73)
- 🐞 add `Table` panagation deep watch[#b464c6](https://github.com/vueComponent/ant-design-vue/commit/b464c6f6ee4df6df1b6c55f29ac85b2f462763bc)


## 0.7.0

`2018-07-11`
- 🌟 新增`TreeSelect`组件
- 🌟 `Select`组件新增`options`，方便直接生成选择列表[#37](https://github.com/vueComponent/ant-design-vue/issues/37)
- 🐞 修复`Tooltip`中使用`Select`组件时，`blur`事件报错问题[#67](https://github.com/vueComponent/ant-design-vue/issues/67)
- 🐞 修改`Upload`组件`action`属性为可选[#66](https://github.com/vueComponent/ant-design-vue/issues/66)


## 0.6.8

`2018-07-05`
- 🐞 修复`notification` h is not defined[#63](https://github.com/vueComponent/ant-design-vue/issues/63)
- 🐞 修复`Transfer`国际化缺少titles问题[#64](https://github.com/vueComponent/ant-design-vue/issues/64)


## 0.6.7

`2018-07-03`
- 🐞 修复`Form`使用模板语法时组件不能更新[#62](https://github.com/vueComponent/ant-design-vue/issues/62)

## 0.6.6

`2018-07-03`
- 🐞 修复`Upload`的类型校验错误问题并更新相关demo[#61](https://github.com/vueComponent/ant-design-vue/issues/61)
- 🐞 修复`Upload`图片预览不能正确跳转问题[1584b3](https://github.com/vueComponent/ant-design-vue/commit/1584b3839e500d2d6b07abf704f5cd084ca00e87)


## 0.6.5

`2018-07-01`
- 🐞 修复`Select`的`getPopupContainer`不生效问题[#56](https://github.com/vueComponent/ant-design-vue/issues/56)
- 🐞 修复`Select`的弹出框位置不更新问题[8254f7](https://github.com/vueComponent/ant-design-vue/commit/8254f783a32189b63ffcf2c53702b50afef1f3db)

## 0.6.4

`2018-06-28`
- 🐞 修复`InputSearch`的`v-model`返回值错误问题[#53](https://github.com/vueComponent/ant-design-vue/issues/53)

## 0.6.3

`2018-06-26`
- 🐞 修复`Popover`的`v-model`不生效问题[#49](https://github.com/vueComponent/ant-design-vue/issues/49)

## 0.6.2

`2018-06-24`
- 🌟 `Form`组件数据自动校验功能支持`template`语法[7c9232](https://github.com/vueComponent/ant-design-vue/commit/7c923278b3678a822ff90da0cb8db7653d79e15c)
- `Select`: 🐞 添加`focus` `blur`方法[52f6f5](https://github.com/vueComponent/ant-design-vue/commit/52f6f50dbe38631c0e698a6ea23b3686f6c2a375)
- `Radio`
  - 🐞 修复Radiogroup `disabled` className[9df74b](https://github.com/vueComponent/ant-design-vue/commit/9df74bedd7640b6066010c498f942ce544c658b7)
  - 🐞 修复`autoFoucs` `focus` `blur` `mouseenter` `mouseleave` 不生效问题[f7886c](https://github.com/vueComponent/ant-design-vue/commit/f7886c7203730bedf519bc45f5f78726735d3aac)
- `TimePicker`: 🐞 修复`autoFoucs` `focus` `blur`不生效问题[28d009](https://github.com/vueComponent/ant-design-vue/commit/28d009d3ced807051a86a2c09cd2764303de98f7)


## 0.6.1

`2018-06-17`
- 🌟 新增`List`列表组件
- `Table`
  - 🐞 修复更新高度时报错问题[#33](https://github.com/vueComponent/ant-design-vue/issues/33)
  - 🐞 修复`defaultChecked`不生效问题[ec1999](https://github.com/vueComponent/ant-design-vue/commit/ec1999dea4cea126b78e3fd84bef620b876e9841)
  - `columns key`支持数字类型[9b7f5c](https://github.com/vueComponent/ant-design-vue/commit/9b7f5c2f81b6f83190e5b022b2b1e28de3f68a2b)
- `Tooltip`
  - 🛠 更新事件API`change`为`visibleChange`
- `Textarea`: 🐞 修复`autoFoucs`不生效问题[787927](https://github.com/vueComponent/ant-design-vue/commit/787927912307db7edb9821a440feacd216e3a6a2)
- `InputSearch`: 🐞 添加`focus` `blur`方法[3cff62](https://github.com/vueComponent/ant-design-vue/commit/3cff62997d16811ae17618f9b41617973d805d7d)
- `InputNumber`: 🐞 修复`autoFoucs`不生效问题[88f165](https://github.com/vueComponent/ant-design-vue/commit/88f165edb5c3993f4dba90c3267a1ea037e0869b)
- `DatePicker`: 🐞 修复`autoFoucs`不生效问题[264abf](https://github.com/vueComponent/ant-design-vue/commit/264abff59791181b9190ca0914b780a8df6aa81a)
- `Cascader`: 🐞 修复`autoFoucs`不生效问题[be69bd](https://github.com/vueComponent/ant-design-vue/commit/be69bd9af1bae184a4ebe8c4ef9560479ab11027)
- `Rate`: 🐞 修复`autoFoucs`不生效问题，及`blur`报错问题[c2c984](https://github.com/vueComponent/ant-design-vue/commit/c2c9841eb9b8e5ce4decff57a925e60d4bd7d809)
- `RangePicker`: 🐞 修复值类型校验出错问题[228f44](https://github.com/vueComponent/ant-design-vue/commit/228f4478a5d169d22960c97d1d8a8320c58da9cc)


## 0.6.0

`2018-06-04`
- 🌟 新增`Anchor`锚点组件
- `Table`
  - 🐞 修复`loading.spinning`时显示`emptyText`问题[17b9dc](https://github.com/vueComponent/ant-design-vue/commit/17b9dc14f5225eb75542facdb5053f4916b9d77f)
  - 🐞 修复`header style`不生效问题[#30](https://github.com/vueComponent/ant-design-vue/pull/30)
- `DatePicker`: 🐞 修复属性`showTime`为`true`时，重复调用`change`事件问题[81ab82](https://github.com/vueComponent/ant-design-vue/commit/81ab829b1d0f67ee926b106de788fc5b41ec4f9c)
- `InputNumber`: 🐞 修复`placeholder`不生效问题[ce39dc](https://github.com/vueComponent/ant-design-vue/commit/ce39dc3506474a4b31632e03c38b518cf4060cef#diff-c9d10303f22c684e66d71ab1f9dac5f9R50)


## 0.5.4

`2018-05-26`
- 🐞 修复dist目录缺少less文件问题[ca084b9](https://github.com/vueComponent/ant-design-vue/commit/ca084b9e6f0958c25a8278454c864ac8127cce95)

## 0.5.3

`2018-05-25`
- 🐞 修复构建`antd-with-locales.js`包含测试文件的问题[90583a3](https://github.com/vueComponent/ant-design-vue/commit/90583a3c42e8b520747d6f6ac10cfd718d447030)

## 0.5.2

`2018-05-25`

- 🐞 `Timeline`: 修复重复显示loading组件bug[fa5141b](https://github.com/vueComponent/ant-design-vue/commit/fa5141bd0061385f251b9026a07066677426b319)
- `Transfer`
  - 🐞 修复搜索框的清除按钮不起作用问题[4582da3](https://github.com/vueComponent/ant-design-vue/commit/4582da3725e65c47a542f164532ab75a5618c265)
  - 💄 重写了属性变化监听逻辑，避免不必要的[0920d23](https://github.com/vueComponent/ant-design-vue/commit/0920d23f12f6c133f667cd65316f1f0e6af27a33)
- 💄 `Select`: 优化`title`显示逻辑[9314957](https://github.com/vueComponent/ant-design-vue/commit/931495768f8b573d12ce4e058e853c875f22bcd3)
- `Form`
  - 🐞 修复Form组件指令报错问题[#20](https://github.com/vueComponent/ant-design-vue/issues/20)
  - 🌟 优化获取Form包装组件实例功能[c5e421c](https://github.com/vueComponent/ant-design-vue/commit/c5e421cdb2768e93288ce7b4654bee2114f8e5ba)
- 🐞 `DatePicker`: 修复日历键盘事件不起作用问题[e9b6914](https://github.com/vueComponent/ant-design-vue/commit/e9b6914282b1ac8d84b4262b8a6b33aa4e515831)
- `Avatar`: 修复字体大小自适应问题[#22](https://github.com/vueComponent/ant-design-vue/pull/22)
- 🌟 添加了部分组件的单测
- 🌟 整理了组件库依赖(dependencies、devDependencies)，删除不再使用的包，并添加peerDependencies


## 0.5.1

`2018-05-10`

- 🐞 `Table`: 修复 `customRow` 自定义事件不生效问题[#16](https://github.com/vueComponent/ant-design-vue/issues/16)

## 0.5.0

`2018-05-08`

- 🌟 `Form `新增Form表单组件
- 💄 `Upload.Dragger`: 修改组件name名称为`a-upload-dragger`
- 🐞 `Upload`: 修复Upload name属性失效问题


## 0.4.3

`2018-05-02`

- 🐞 修复组件样式丢失问题
- 🌟 站点添加babel-polyfill

## 0.4.2

`2018-04-24`

- 🐞  修复menu 非 inline 模式下的 click bug

## 0.4.1

#### bug

- 将Vue依赖转移到devDependencies，避免与业务版本不一致导致的不稳定bug

## 0.4.0

#### Layout

- 新增 Layout 组件

#### 其它

- 支持导入所有组件[Vue.use(antd)](https://github.com/vueComponent/ant-design-vue/issues/3)


## 0.3.1

#### Features

- 对外第一个版本，提供常用45个[组件](https://github.com/vueComponent/ant-design-vue/blob/c7e83d6142f0c5e72ef8fe794620478e69a50a8e/site/components.js)

