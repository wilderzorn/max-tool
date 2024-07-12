import { Empty } from 'antd';
import React from 'react';
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
        imageStyle={{ height: imageHeight }}
        description={<div className={styles.tr_default_desc}>{defaultMsg}</div>}
      />
    </div>
  );
};
export default TREmpty;
