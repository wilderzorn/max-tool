import { useStaticState } from '#/hooks/trHooks';
import { Empty } from 'antd';
import dartEmpty from '../../assets/empty.svg';

const PageEmpty = (props = {}) => {
  const {
    description = '暂无数据',
    image,
    imageStyle = {},
    style = {},
    className,
  } = props;
  const staticState = useStaticState({
    defaultImg: dartEmpty,
    height: 80,
  });

  return (
    <Empty
      className={className}
      image={image || staticState.defaultImg}
      styles={{
        image: {
          height: staticState.height,
          margin: '8px 0',
          ...imageStyle,
        },
      }}
      style={style}
      description={description ?? '暂无数据'}
    />
  );
};
export default PageEmpty;
