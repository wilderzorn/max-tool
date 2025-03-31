interface StoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique: boolean }[];
}

class IndexedDBWrapper {
  private db: IDBDatabase | null;
  private dbName: string;
  private version: number;
  private storeConfigs: StoreConfig[];

  /**
   * 创建 IndexedDB 封装实例
   * @param {string} [dbName='defaultDB'] - 数据库名称
   * @param {number} [version=1] - 数据库版本
   * @param {StoreConfig[]} [storeConfigs=[{name: 'users',keyPath: 'id',indexes: [{ name: 'username', keyPath: 'username', unique: true }]}]] - 对象存储配置
   */
  constructor(
    dbName: string = 'defaultDB',
    version: number = 1,
    storeConfigs: StoreConfig[] = [],
  ) {
    this.dbName = dbName;
    this.version = version;
    this.storeConfigs = storeConfigs;
    this.db = null;
  }

  /**
   * 打开数据库连接
   * @returns {Promise<IDBDatabase>} 返回连接成功的数据库实例
   * @throws {Error} 数据库连接失败时抛出错误
   */
  connect(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) return resolve(this.db);

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.storeConfigs.forEach(({ name, keyPath, indexes }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath });
            indexes?.forEach(
              ({ name: idxName, keyPath: idxKeyPath, unique }) => {
                store.createIndex(idxName, idxKeyPath, { unique });
              },
            );
          }
        });
      };

      request.onblocked = () => {
        reject(new Error('数据库升级被现有连接阻塞'));
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.db.onversionchange = () => this.close();
        resolve(this.db);
      };

      request.onerror = (event: Event) => {
        reject(
          new Error(`数据库连接失败: ${(event.target as IDBRequest).error}`),
        );
      };
    });
  }

  /**
   * 安全关闭数据库连接
   * @returns {Promise<void>}
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 执行事务操作（内部方法）
   * @private
   * @template T - 事务操作的返回类型
   * @param {string} storeName - 对象存储名称
   * @param {IDBTransactionMode} mode - 事务模式
   * @param {(store: IDBObjectStore) => IDBRequest<T>} operation - 要执行的操作
   * @returns {Promise<T>} 事务操作结果
   * @throws {Error} 数据库未连接或事务出错时抛出
   */
  private _transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('数据库未连接'));
        return;
      }
      const transaction = this.db.transaction([storeName], mode);
      transaction.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest<T>).result;
        transaction.oncomplete = () => resolve(result);
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  /**
   * 确保数据库连接已建立
   * @returns {Promise<void>}
   * @throws {Error} 连接失败时抛出
   */
  async ensureConnected(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
  }

  /**
   * 向指定对象存储添加数据
   * @template T - 要添加的数据类型
   * @param {string} storeName - 对象存储名称
   * @param {T} data - 要添加的数据
   * @returns {Promise<IDBValidKey>} 返回添加数据的键
   * @throws {Error} 添加操作失败时抛出
   */
  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    await this.ensureConnected();
    return this._transaction(storeName, 'readwrite', (store) => {
      return store.add(data);
    });
  }

  /**
   * 检查指定对象存储是否存在
   * @param {string} storeName - 要检查的对象存储名称
   * @returns {Promise<boolean>} 是否存在
   */
  async containsStore(storeName: string): Promise<boolean> {
    await this.ensureConnected();
    return this.db!.objectStoreNames.contains(storeName);
  }

  /**
   * 获取数据库当前版本
   * @returns {Promise<number>} 当前版本号
   */
  async getCurrentVersion(): Promise<number> {
    await this.ensureConnected();
    return this.db!.version;
  }

  /**
   * 安全添加数据（自动处理存储不存在的情况）
   * @template T - 要添加的数据类型
   * @param {string} storeName - 对象存储名称
   * @param {T} data - 要添加的数据
   * @returns {Promise<IDBValidKey>} 返回添加数据的键
   * @throws {Error} 升级失败或添加失败时抛出
   */
  async safeAdd<T>(storeName: string, data: T): Promise<IDBValidKey> {
    if (!(await this.containsStore(storeName))) {
      await this._autoUpgrade();
    }
    return this.add(storeName, data);
  }

  /**
   * 自动升级数据库版本（内部方法）
   * @private
   * @returns {Promise<IDBDatabase>} 升级后的数据库实例
   */
  private async _autoUpgrade(): Promise<IDBDatabase> {
    this.version++;
    await this.close();
    return this.connect();
  }
}

export default IndexedDBWrapper;
