/**
 * @description: 定制主题全局antd组件配置 https://ant-design.antgroup.com/theme-editor-cn
 * @param {any}
 * @return {*}
 */
export default function ({ colorPrimary }: any = {}): any {
  return {
    token: {
      borderRadius: 5,
      colorPrimary: colorPrimary ?? 'var(--base)',
    },
    components: {
      Table: {
        algorithm: true,
        padding: 6,
        headerBg: 'var(--base-form)',
        headerSortActiveBg: 'var(--base-form)',
        rowHoverBg: 'var(--base-RowHover)',
        borderColor: 'var(--bd)',
        cellFontSize: 12,
      },
      Select: {
        optionSelectedBg: 'var(--base-bg)',
        optionSelectedColor: 'var(--font)',
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
      Popover: {
        colorBgElevated: 'var(--bg-main)',
      },
    },
  };
}
