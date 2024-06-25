import React from 'react';
import { Empty } from 'antd';
import { useStaticState } from '#/utils/trHooks';
import dartEmpty from '../../assets/empty.svg';

const PageEmpty = (props = {}) => {
  const { description = '暂无数据', image, imageStyle = {}, style = {} } = props;
  const staticState = useStaticState({
    defaultImg: dartEmpty,
    height: 80,
  });

  return (
    <Empty
      image={image || staticState.defaultImg}
      imageStyle={{
        height: staticState.height,
        margin: '8px 0',
        ...imageStyle,
      }}
      style={style}
      description={description ?? '暂无数据'}
    />
  );
};
export default PageEmpty;
