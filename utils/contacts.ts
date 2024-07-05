enum HttpCode {
  SUCCESS = '1000', // 请求正常
  SYS_1001 = '1001', // 请求参数校验异常,请检查
  SYS_1002 = '1002', // 空指针异常
  SYS_1003 = '1003', // 重置Redis缓存失败
  SYS_1004 = '1004', // 系统异常
  SYS_1005 = '1005', // 返回内容为空
  FAILURE = '2018', // 用户名或者密码错误
  EFFICACYTOKEN = '1006', // token失效
  VERCODEFAILED = '2303', // 验证码失效
  FAILE_DERROR = '2100', // 内容不能删除
  DELETE_FALSE = '4001',
}

enum AlertResult {
  SUCCESS = 1,
  CANCEL = 0,
}

export { HttpCode, AlertResult };
