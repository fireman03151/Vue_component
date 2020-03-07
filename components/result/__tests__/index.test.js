import { mount } from '@vue/test-utils';
import Result from '../index';
import Button from '../../button';

describe('Result', () => {
  it('🙂  successPercent should decide the progress status when it exists', () => {
    const wrapper = mount({
      render() {
        return (
          <Result
            status="success"
            title="Successfully Purchased Cloud Server ECS!"
            subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
            extra={
              <Button type="primary" key="console">
                Go Console
              </Button>
            }
          />
        );
      },
    });
    expect(wrapper.findAll('.anticon-check-circle')).toHaveLength(1);
  });

  it('🙂  different status, different class', () => {
    const wrapper = mount(Result, { propsData: { status: 'warning' } });
    expect(wrapper.findAll('.ant-result-warning')).toHaveLength(1);

    wrapper.setProps({
      status: 'error',
    });

    expect(wrapper.findAll('.ant-result-error')).toHaveLength(1);

    wrapper.setProps({
      status: '500',
    });

    expect(wrapper.findAll('.ant-result-500')).toHaveLength(1);
  });

  it('🙂  When status = 404, the icon is an image', () => {
    const wrapper = mount({
      render() {
        return <Result status="404" />;
      },
    });
    expect(wrapper.findAll('.ant-result-404 .ant-result-image')).toHaveLength(1);
  });

  it('🙂  When extra is undefined, the extra dom is undefined', () => {
    const wrapper = mount({
      render() {
        return <Result status="404" />;
      },
    });
    expect(wrapper.findAll('.ant-result-extra')).toHaveLength(0);
  });

  it('🙂  result should support className', () => {
    const wrapper = mount({
      render() {
        return <Result status="404" title="404" class="my-result" />;
      },
    });
    expect(wrapper.findAll('.ant-result.my-result')).toHaveLength(1);
  });
});
