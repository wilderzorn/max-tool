import _ from 'lodash';

class Jurisdiction {
  constructor() {
    this.PERMISSION_ARRAY = [];
    this.FEEDBACK_LIST = [];
  }
  save(list = []) {
    this.PERMISSION_ARRAY = _.unionWith(list);
  }
  getMenuCode(pathname = '') {
    return this.PERMISSION_ARRAY.filter((n) => pathname === `/${n.component}`)[0]?.menuCode || '';
  }
  getMenuNameByCode(menuCode = '') {
    return this.PERMISSION_ARRAY.filter((n) => menuCode === n.menuCode)[0]?.menuName || '';
  }
  saveFeed(list = []) {
    this.FEEDBACK_LIST = [...list];
  }
  updateFeedById(bId) {
    this.FEEDBACK_LIST = this.FEEDBACK_LIST.filter((n) => n.id !== bId);
  }
}

Jurisdiction.getInstance = (function () {
  let instance;
  return function () {
    instance = instance ? instance : new Jurisdiction();
    return instance;
  };
})();

const jurisdiction = Jurisdiction.getInstance();

export default jurisdiction;
