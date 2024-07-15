import _ from 'lodash';

// 定义权限项的类型
interface Permission {
  component: string;
  menuCode: string;
  menuName: string;
}

// 定义反馈项的类型
interface Feedback {
  id: string | number;
  // 你可以添加更多属性根据需要
}

class Jurisdiction {
  private PERMISSION_ARRAY: Permission[];
  private FEEDBACK_LIST: Feedback[];

  private constructor() {
    this.PERMISSION_ARRAY = [];
    this.FEEDBACK_LIST = [];
  }

  // 保存权限列表
  save(list: Permission[] = []): void {
    this.PERMISSION_ARRAY = _.unionWith(list, this.PERMISSION_ARRAY, _.isEqual);
  }

  // 根据路径名获取菜单代码
  getMenuCode(pathname: string = ''): string {
    return (
      this.PERMISSION_ARRAY.find((n) => pathname === `/${n.component}`)
        ?.menuCode || ''
    );
  }

  // 根据菜单代码获取菜单名称
  getMenuNameByCode(menuCode: string = ''): string {
    return (
      this.PERMISSION_ARRAY.find((n) => menuCode === n.menuCode)?.menuName || ''
    );
  }

  // 保存反馈列表
  saveFeed(list: Feedback[] = []): void {
    this.FEEDBACK_LIST = [...list];
  }

  // 根据反馈ID更新反馈列表
  updateFeedById(bId: string | number): void {
    this.FEEDBACK_LIST = this.FEEDBACK_LIST.filter((n) => n.id !== bId);
  }

  // 单例模式
  private static instance: Jurisdiction;

  static getInstance(): Jurisdiction {
    if (!Jurisdiction.instance) {
      Jurisdiction.instance = new Jurisdiction();
    }
    return Jurisdiction.instance;
  }
}

// 获取单例实例
const jurisdiction = Jurisdiction.getInstance();

export default jurisdiction;
