import { Empty } from 'antd';
import styles from './index.less';
import { DEFAULT_MSG } from './helper';
import emptyImg from '../../assets/empty.svg';

const TREmpty = ({ type = 'empty', message = '', size = null }) => {
  const defaultMsg = message || DEFAULT_MSG[type];
  const imageHeight = size ?? 100;
  return (
    <div className={`${styles.tr_default}`}>
      <Empty
        image={emptyImg}
        imageStyle={{ height: imageHeight }}
        description={<div className={styles.tr_default_desc}>{defaultMsg}</div>}
      />
    </div>
  );
};
export default TREmpty;
