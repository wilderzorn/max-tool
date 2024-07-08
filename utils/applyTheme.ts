/**
 * 全局antd组件配置
 */
export default function ({ colorPrimary }) {
  return {
    token: {
      borderRadius: 5,
      colorPrimary: colorPrimary ?? '#1677ff',
    },
    components: {
      Table: { algorithm: true, padding: 6 },
      Select: {
        optionSelectedBg: 'var(--base)',
        selectorBg: 'transparent',
      },
      Input: {
        colorBgContainer: 'transparent',
      },
      InputNumber: {
        colorBgContainer: 'transparent',
      },
      DatePicker: {
        colorBgContainer: 'transparent',
      },
      Checkbox: {
        colorBgContainer: 'transparent',
      },
    },
  };
}
