import { App } from 'vue';
import Avatar from './Avatar';
import Group from './Group';

export { AvatarProps, AvatarSize, avatarProps } from './Avatar';
export { AvatarGroupProps } from './Group';

Avatar.Group = Group;

/* istanbul ignore next */
Avatar.install = function(app: App) {
  app.component(Avatar.name, Avatar);
  app.component(Group.name, Group);
  return app;
};

export default Avatar as typeof Avatar &
  Plugin & {
    readonly Group: typeof Group;
  };
