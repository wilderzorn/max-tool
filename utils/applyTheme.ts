/**
 * @description: 全局antd组件配置
 * @param {any}
 * @return {*}
 */
export default function ({ colorPrimary }: any = {}): any {
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
      Pagination: {
        colorBgContainer: 'transparent',
      },
      Button: {
        colorBgContainer: 'transparent',
      },
      Drawer: {
        padding: 8,
        paddingLG: 12,
      },
      Divider: {
        margin: 8,
        marginLG: 12,
      },
    },
  };
}
