import { App } from 'vue';
import Tree from './Tree';
import DirectoryTree from './DirectoryTree';

Tree.TreeNode.name = 'ATreeNode';
Tree.DirectoryTree = DirectoryTree;
/* istanbul ignore next */
Tree.install = function(app: App) {
  app.component(Tree.name, Tree);
  app.component(Tree.TreeNode.name, Tree.TreeNode);
  app.component(DirectoryTree.name, DirectoryTree);
  return app;
};

export default Tree;
