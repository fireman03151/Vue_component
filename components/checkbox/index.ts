import { App } from 'vue';
import Checkbox from './Checkbox';
import CheckboxGroup from './Group';

Checkbox.Group = CheckboxGroup;

/* istanbul ignore next */
Checkbox.install = function(app: App) {
  app.component(Checkbox.name, Checkbox);
  app.component(CheckboxGroup.name, CheckboxGroup);
  return app;
};

export default Checkbox;
