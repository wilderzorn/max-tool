import { Spin } from 'antd';
import React from 'react';
const PageLoading = () => {
  return (
    <div
      style={{
        paddingTop: 100,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      <Spin />
    </div>
  );
};
export default PageLoading;
