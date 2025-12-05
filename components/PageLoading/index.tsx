import { Spin } from 'antd';
const PageLoading = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 400,
      }}
    >
      <Spin />
    </div>
  );
};
export default PageLoading;
