import React from 'react';
import TweenOne from 'rc-tween-one';
import Children from 'rc-tween-one/lib/plugin/ChildrenPlugin';

TweenOne.plugins.push(Children);

interface MotionNumerProps {
  className?: string;
  value?: number;
  onClick?: () => void;
  duration?: number;
  floatLength?: number; // 控制小数点后的位数
}

/**
 * 数字动画组件，用于实现数值的平滑过渡动画效果
 * @param className - 自定义样式类名
 * @param value - 要显示的数值
 * @param onClick - 点击事件回调函数
 * @param duration - 动画持续时间(毫秒)，默认1000ms
 * @param floatLength - 小数点保留位数，默认0位
 * @returns 返回带有动画效果的数字展示组件
 */
const MotionNumer: React.FC<MotionNumerProps> = ({
  className = '',
  value = 0,
  onClick = () => {},
  duration = 1000,
  floatLength = 0,
}) => {
  return (
    <TweenOne
      className={className}
      onClick={onClick}
      animation={{
        Children: {
          value: Number(value) || 0,
          floatLength: floatLength,
        },
        duration,
      }}
    />
  );
};

export default MotionNumer;
