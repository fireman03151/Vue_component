import { mount } from '@vue/test-utils';
import { asyncExpect, sleep } from '@/tests/utils';
import Popconfirm from '..';
function $$(className) {
  return document.body.querySelectorAll(className);
}
describe('Popconfirm', () => {
  // const eventObject = expect.objectContaining({
  //   target: expect.anything(),
  //   preventDefault: expect.any(Function),
  // })
  it('should popup Popconfirm dialog', async () => {
    const onVisibleChange = jest.fn();

    const wrapper = mount(
      {
        render() {
          return (
            <Popconfirm
              title={<span class="popconfirm-test">Are you sure delete this task?</span>}
              okText="Yes"
              cancelText="No"
              mouseEnterDelay={0}
              mouseLeaveDelay={0}
              onVisibleChange={onVisibleChange}
            >
              <span>Delete</span>
            </Popconfirm>
          );
        },
      },
      { sync: false, attachTo: 'body' },
    );
    let triggerNode = null;
    await asyncExpect(() => {
      triggerNode = wrapper.findAll('span')[0];
      triggerNode.trigger('click');
    });
    await asyncExpect(() => {
      expect(onVisibleChange).toHaveBeenLastCalledWith(true, undefined);
      expect($$('.popconfirm-test').length).toBe(1);
      triggerNode.trigger('click');
    }, 1000);
    await asyncExpect(() => {
      expect(onVisibleChange).toHaveBeenLastCalledWith(false, undefined);
    });
  });

  it('should show overlay when trigger is clicked', async () => {
    const popconfirm = mount(
      {
        render() {
          return (
            <Popconfirm ref="popconfirm" title="code">
              <span>show me your code</span>
            </Popconfirm>
          );
        },
      },
      { sync: false },
    );

    await asyncExpect(() => {
      expect(popconfirm.vm.$refs.popconfirm.getPopupDomNode()).toBe(null);

      popconfirm.find('span').trigger('click');
    }, 1000);
    await asyncExpect(() => {
      const popup = popconfirm.vm.$refs.popconfirm.getPopupDomNode();
      expect(popup).not.toBe(null);
      expect(popup.className).toContain('ant-popover-placement-top');
      expect(popup.innerHTML).toMatchSnapshot();
    }, 1000);
  });

  fit('should not open in disabled', async () => {
    const popconfirm = mount(
      {
        render() {
          return (
            <Popconfirm ref="popconfirm" title="code" disabled={true}>
              <span>click me</span>
            </Popconfirm>
          );
        },
      },
      { sync: false },
    );
    popconfirm.find('span').trigger('click');
    popconfirm.vm.$refs.popconfirm.$forceUpdate();
    const popup = popconfirm.vm.$refs.popconfirm.getPopupDomNode();
    expect(popup).toBeFalsy();
  });
});
