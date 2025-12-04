import cls from 'classnames';
import styles from './index.less';

const MESSAGE_MAP = {
  empty: '暂无数据',
  error: '系统异常',
  lock: '暂无权限',
  emptysm: '暂无数据',
};

/**
 * 缺省图
 * @param type ['empty', 'emptysm', 'error', 'lock']
 */
export default (props: any) => {
  const { type = 'empty', message = '', size = 0, theme } = props;

  const msg = message || MESSAGE_MAP[type];
  const isSmall = type.indexOf('sm') > -1;
  const imageStyle = {
    height: size ? size : isSmall ? 100 : 250,
  };

  return (
    <div
      className={cls({
        [styles.tr_default]: true,
        [styles.is_small]: isSmall,
      })}
    >
      <div>
        <div
          className={cls({
            [styles.tr_default_img]: true,
            [styles[theme]]: !!theme,
            [styles[type]]: true,
          })}
          style={{ ...imageStyle }}
        />
        <div className={styles.tr_default_desc}>{msg}</div>
      </div>
    </div>
  );
};
