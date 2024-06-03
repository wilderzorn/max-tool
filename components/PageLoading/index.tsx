import { Spin } from 'antd';
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
