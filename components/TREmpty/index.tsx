import { Empty } from 'antd';
import emptyImg from '../../assets/empty.svg';
import { DEFAULT_MSG } from './helper';
import styles from './index.less';

const TREmpty = ({ type = 'empty', message = '', size = null }) => {
  const defaultMsg = message || DEFAULT_MSG[type];
  const imageHeight = size ?? 100;
  return (
    <div className={`${styles.tr_default}`}>
      <Empty
        image={emptyImg}
        styles={{
          image: { height: imageHeight },
        }}
        description={<div className={styles.tr_default_desc}>{defaultMsg}</div>}
      />
    </div>
  );
};
export default TREmpty;
