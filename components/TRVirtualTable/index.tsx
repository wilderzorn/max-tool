import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './index.less';
import {
  AutoSizer,
  MultiGrid,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import { Pagination, PaginationProps } from 'antd';
import { TRDefault } from '#/components';
import { useStaticState } from '../../index';
import { useSize } from 'ahooks';

// 列定义类型
export interface ColumnType<T = any> {
  title: React.ReactNode | ((column: ColumnType<T>) => React.ReactNode); // 允许函数类型
  dataIndex?: string;
  key?: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  fixed?: 'left' | 'right';
  sort?: boolean | ((a: T, b: T) => number); // 支持布尔值或自定义排序函数
  unit?: string;
  render?: (text: T, record: T, rowIndex: number) => any;
}

// 分页配置类型
export interface PaginationConfig
  extends Omit<PaginationProps, 'onChange' | 'onShowSizeChange'> {
  current?: number;
  pageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// 排序状态类型
interface SortState {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

// 静态状态类型
interface StaticState {
  cache: CellMeasurerCache;
  allRatio: number;
  allWidth: number;
  flexColumnsCount: number;
  dataObj: any[];
  timer: NodeJS.Timeout | null;
}

// Table 变化参数类型
export interface TableChangeParams<T = any> {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: Record<string, any>; // 暂时留空，未来可以支持过滤
  sorter: {
    field?: string;
    order?: 'asc' | 'desc' | null;
    columnKey?: string;
  };
  extra: {
    currentDataSource: T[];
    action: 'paginate' | 'sort';
  };
}

// 组件 Props 类型
export interface TRVirtualTableProps<T = any> {
  columns?: ColumnType<T>[];
  dataList?: T[];
  headerHeight?: number;
  pagination?: PaginationConfig | false;
  onChange?: (params: TableChangeParams<T>) => void;
}

const TRVirtualTable = <T extends Record<string, any>>({
  columns = [],
  dataList = [],
  headerHeight = 35,
  pagination = false,
  onChange,
}: TRVirtualTableProps<T>) => {
  const tableRef = useRef<MultiGrid>(null);
  const [resizeKey, setResizeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const paginationContainerRef = useRef<HTMLDivElement>(null);

  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: null,
  });

  // 内部状态管理分页
  const [internalPagination, setInternalPagination] = useState({
    current: 1,
    pageSize: pagination ? pagination.pageSize || 10 : 10,
  });

  // 用于防止重复触发 onChange 的标记
  const isPageSizeChanging = useRef(false);

  const staticState = useStaticState<StaticState>({
    cache: new CellMeasurerCache({
      defaultHeight: 40,
      fixedHeight: true,
    }),
    allRatio: 0,
    allWidth: 0,
    flexColumnsCount: 0,
    dataObj: [],
    timer: null,
  });

  // 计算分页相关数据
  const paginationData = useMemo(() => {
    // 如果 pagination 为 false，不显示分页
    if (pagination === false) {
      return {
        currentPage: 1,
        pageSize: dataList.length,
        total: dataList.length,
        showPagination: false,
      };
    }

    // 如果 pagination 为 undefined 或空对象，也不显示分页
    if (!pagination) {
      return {
        currentPage: 1,
        pageSize: dataList.length,
        total: dataList.length,
        showPagination: false,
      };
    }

    // pagination 是 PaginationConfig 类型
    const currentPage = pagination.current || internalPagination.current || 1;
    const pageSize = pagination.pageSize || internalPagination.pageSize || 10;
    const total = pagination.total || dataList.length;

    return {
      currentPage,
      pageSize,
      total,
      showPagination: total > 0 && pageSize < total,
    };
  }, [pagination, dataList.length, internalPagination]);

  // 根据分页获取当前页数据
  const getCurrentPageData = useCallback(
    (data: T[]) => {
      // 如果 pagination 为 false，返回所有数据
      if (pagination === false) {
        return data;
      }

      // 如果 pagination 不存在或为空对象，返回所有数据
      if (!pagination) {
        return data;
      }

      const { currentPage, pageSize } = paginationData;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      return data.slice(start, end);
    },
    [pagination, paginationData],
  );

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return dataList;
    }

    const columnIndex = columns.findIndex(
      (col) => (col.key || col.dataIndex) === sortState.key,
    );

    if (columnIndex === -1) {
      return dataList;
    }

    const column = columns[columnIndex];

    // 如果 column.sort 是函数，使用自定义排序函数
    if (typeof column.sort === 'function') {
      const sorter = column.sort as (a: T, b: T) => number;
      return [...dataList].sort((a, b) => {
        const compareResult = sorter(a, b);
        return sortState.direction === 'asc' ? compareResult : -compareResult;
      });
    }

    // 默认排序逻辑
    return [...dataList].sort((a, b) => {
      const aValue = a[sortState.key!];
      const bValue = b[sortState.key!];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortState.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [dataList, sortState.key, sortState.direction, columns]);

  // 获取当前页的显示数据
  const displayData = useMemo(() => {
    return getCurrentPageData(sortedData);
  }, [sortedData, getCurrentPageData]);

  // 触发 onChange 回调
  const triggerChange = useCallback(
    (
      action: 'paginate' | 'sort',
      paginationChanges?: { current?: number; pageSize?: number },
      sorterChanges?: { field?: string; order?: 'asc' | 'desc' | null },
    ) => {
      if (!onChange) return;

      const params: TableChangeParams<T> = {
        pagination: {
          current: paginationChanges?.current || paginationData.currentPage,
          pageSize: paginationChanges?.pageSize || paginationData.pageSize,
          total: paginationData.total,
        },
        filters: {}, // 暂时为空
        sorter: {
          field: sorterChanges?.field || sortState.key || undefined,
          order: sorterChanges?.order || sortState.direction || undefined,
          columnKey: sorterChanges?.field || sortState.key || undefined,
        },
        extra: {
          currentDataSource: sortedData,
          action,
        },
      };

      onChange(params);
    },
    [onChange, paginationData, sortState, sortedData],
  );

  // 处理分页变化（页码变化和页大小变化都通过这里处理）
  const handlePaginationChange = useCallback(
    (page: number, pageSize?: number) => {
      // 如果正在处理 pageSize 变化，则跳过
      if (isPageSizeChanging.current) {
        isPageSizeChanging.current = false;
        return;
      }

      // 更新内部状态
      setInternalPagination((prev) => ({
        current: page,
        pageSize: pageSize || prev.pageSize,
      }));

      // 如果外部传入了分页配置，调用其 onChange
      if (pagination && pagination.onChange) {
        pagination.onChange(page, pageSize || paginationData.pageSize);
      }

      // 触发统一的 onChange 回调
      triggerChange('paginate', { current: page, pageSize });
    },
    [pagination, paginationData.pageSize, triggerChange],
  );

  // 处理每页显示数量变化（只在页大小选择器变化时调用）
  const handlePageSizeChange = useCallback(
    (current: number, size: number) => {
      // 设置标记，表示正在处理 pageSize 变化
      isPageSizeChanging.current = true;

      // 更新内部状态
      setInternalPagination((prev) => ({
        current: 1, // 切换到第一页
        pageSize: size,
      }));

      // 如果外部传入了分页配置，调用其 onShowSizeChange
      if (pagination && pagination.onShowSizeChange) {
        pagination.onShowSizeChange(current, size);
      }

      // 触发统一的 onChange 回调
      triggerChange('paginate', { current: 1, pageSize: size });
    },
    [pagination, triggerChange],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    if (staticState.timer) return;

    clearTimeout(staticState.timer as NodeJS.Timeout);
    staticState.timer = setTimeout(() => {
      setResizeKey((prev) => prev + 1);
      staticState.timer = null;
    }, 100);

    return () => {
      if (staticState.timer) {
        clearTimeout(staticState.timer);
        staticState.timer = null;
      }
    };
  }, [containerSize?.width]);

  useEffect(() => {
    const { nw, nu, flexCount } = columnsRatio(columns);
    staticState.allRatio = nu;
    staticState.allWidth = nw;
    staticState.flexColumnsCount = flexCount;
  }, [columns]);

  // 优化的列宽计算函数
  const getColumnWidth = useCallback(
    (index: number, containerWidth: number) => {
      const column = columns[index];

      const SCROLLBAR_WIDTH = 6;
      const availableContainerWidth = containerWidth - SCROLLBAR_WIDTH;

      // 情况1：所有列都是固定宽度，且总和小于容器宽度
      if (
        staticState.flexColumnsCount === 0 &&
        staticState.allWidth < availableContainerWidth
      ) {
        const scaleFactor = availableContainerWidth / staticState.allWidth;
        return Math.floor(
          (column.width || column.minWidth || 100) * scaleFactor,
        );
      }

      // 情况2：有固定宽度
      if (column.width) {
        return column.width;
      }

      // 情况3：flex列处理
      const availableWidth = Math.max(
        availableContainerWidth - staticState.allWidth,
        0,
      );

      if (staticState.flexColumnsCount === 0 || availableWidth <= 0) {
        return column.minWidth || 100;
      }

      const flexWidth =
        (availableWidth / staticState.allRatio) * (column.flex || 1);
      return Math.max(flexWidth, column.minWidth || 80);
    },
    [
      columns,
      staticState.allWidth,
      staticState.allRatio,
      staticState.flexColumnsCount,
    ],
  );

  // 排序处理函数
  const handleSort = useCallback(
    (columnIndex: number) => {
      const columnSlide = columns[columnIndex] || {};
      const sortField = columnSlide.key || columnSlide.dataIndex;

      if (!sortField) return;

      setSortState((prev) => {
        let newDirection: 'asc' | 'desc' | null;

        if (prev.key !== sortField) {
          newDirection = 'desc';
        } else {
          switch (prev.direction) {
            case 'desc':
              newDirection = 'asc';
              break;
            case 'asc':
              newDirection = null;
              break;
            default:
              newDirection = 'desc';
              break;
          }
        }

        const newSortState = {
          key: newDirection ? sortField : null,
          direction: newDirection,
        };

        // 触发 onChange 回调
        setTimeout(() => {
          triggerChange('sort', undefined, {
            field: newSortState.key || undefined,
            order: newSortState.direction || undefined,
          });
        }, 0);

        return newSortState;
      });
    },
    [columns, triggerChange],
  );

  const cellRenderer = ({
    columnIndex,
    key,
    rowIndex,
    parent,
    style,
  }: {
    columnIndex: number;
    key: string;
    rowIndex: number;
    parent: any;
    style: React.CSSProperties;
  }) => {
    const dataSlide = displayData[rowIndex - 1] || {};
    const isHeader = rowIndex === 0;
    const isEvenRow = rowIndex % 2 === 0;

    return (
      <CellMeasurer
        cache={staticState.cache}
        columnIndex={columnIndex}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div
          style={{
            ...style,
            background: isHeader
              ? 'var(--bg-form)'
              : isEvenRow
              ? 'var(--bg-zebra)'
              : 'var(--bg-main)',
            fontWeight: isHeader ? '600' : '400',
            whiteSpace: isHeader ? 'normal' : 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isHeader ? 'center' : 'flex-start',
            border: '1px solid var(--bd)',
            borderTop: isHeader ? '1px solid var(--bd)' : 'inherit',
            borderLeft: columnIndex === 0 ? '1px solid var(--bd)' : 'inherit',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {isHeader
            ? onHeaderRender(columnIndex)
            : onContentRender(columnIndex, dataSlide, rowIndex - 1)}
        </div>
      </CellMeasurer>
    );
  };

  const onHeaderRender = useCallback(
    (columnIndex: number) => {
      const columnSlide = columns[columnIndex] || {};
      const isSortable =
        columnSlide.sort !== undefined && columnSlide.sort !== false;
      const sortField = columnSlide.key || columnSlide.dataIndex;
      const isCurrentSort = sortState.key === sortField;

      // 处理 title 的渲染
      const renderTitle = () => {
        if (typeof columnSlide.title === 'function') {
          return columnSlide.title(columnSlide);
        }
        return columnSlide.title;
      };

      const titleContent = renderTitle();

      return (
        <div
          className={`${styles.title} ${isSortable ? styles.sortable : ''}`}
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            lineHeight: '1.2',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '35px',
            width: '100%',
          }}
        >
          <div className={styles.headerContent}>
            <div className={styles.titleText}>
              <span className={styles.name}>{titleContent}</span>
              {columnSlide.unit ? (
                <span className={styles.unit}>({columnSlide.unit})</span>
              ) : (
                ''
              )}
            </div>
            {isSortable && (
              <div
                className={styles.sortIconsContainer}
                onClick={() => handleSort(columnIndex)}
              >
                <div className={styles.sortIcons}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    className={`${styles.sortArrow} ${
                      isCurrentSort && sortState.direction === 'asc'
                        ? styles.active
                        : ''
                    }`}
                  >
                    <path d="M6 3L3 6H9L6 3Z" fill="currentColor" />
                  </svg>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    className={`${styles.sortArrow} ${
                      isCurrentSort && sortState.direction === 'desc'
                        ? styles.active
                        : ''
                    }`}
                  >
                    <path d="M6 9L9 6H3L6 9Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
    [columns, sortState.key, sortState.direction, handleSort],
  );

  const onContentRender = useCallback(
    (columnIndex: number, dataSlide: T, rowIndex: number): React.ReactNode => {
      const columnSlide = columns[columnIndex] || {};
      const text = dataSlide?.[columnSlide?.dataIndex || ''] as any;

      if (columnSlide?.render) {
        return columnSlide.render(text, dataSlide, rowIndex);
      }

      return (
        <div className={styles.contentCell} title={String(text || '')}>
          {text != null ? String(text) : '-'}
        </div>
      );
    },
    [columns],
  );

  const fixedColumnCount = useMemo(() => {
    return columns.filter((col) => col.fixed === 'left').length;
  }, [columns]);

  // 渲染分页组件
  const renderPagination = () => {
    // 如果 pagination 为 false，不显示分页
    if (pagination === false) {
      return null;
    }

    // 如果 pagination 不存在或为空对象，不显示分页
    if (!pagination) {
      return null;
    }

    // 如果不显示分页
    if (!paginationData.showPagination) {
      return null;
    }

    const paginationProps: PaginationProps = {
      size: 'small',
      showTotal: (total, range) =>
        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      showQuickJumper: true,
      showSizeChanger: true,
      ...pagination,
      current: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      total: paginationData.total,
      onChange: handlePaginationChange,
      onShowSizeChange: handlePageSizeChange,
    };

    return (
      <div className={styles.paginationContainer} ref={paginationContainerRef}>
        <Pagination {...paginationProps} />
      </div>
    );
  };

  return (
    <div className={styles.virtualTableWrapper}>
      <div
        className={styles.container_content}
        ref={containerRef}
        key={resizeKey}
      >
        {!displayData || displayData.length === 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
            }}
          >
            <TRDefault type="emptysm" />
          </div>
        ) : null}
        <AutoSizer>
          {({ width, height }) => (
            <MultiGrid
              ref={tableRef}
              style={{
                overflowY: 'hidden',
              }}
              cellRenderer={cellRenderer}
              columnCount={columns.length || 0}
              columnWidth={({ index }) => getColumnWidth(index, width)}
              deferredMeasurementCache={staticState.cache}
              fixedColumnCount={fixedColumnCount}
              fixedRowCount={1}
              height={height ?? 0}
              overscanColumnCount={0}
              overscanRowCount={0}
              width={width ?? 0}
              rowCount={(displayData.length ?? 0) + 1}
              rowHeight={({ index }) => (index === 0 ? headerHeight : 35)}
            />
          )}
        </AutoSizer>
      </div>
      {renderPagination()}
    </div>
  );
};

export default TRVirtualTable;

const columnsRatio = (list: ColumnType[] = []) => {
  let nu = 0;
  let nw = 0;
  let flexCount = 0;

  list.forEach((j) => {
    if (j.flex) {
      nu = nu + (j.flex ?? 1);
      flexCount++;
    }
    if (j.width) {
      nw = nw + (j.width ?? 0);
    }
  });

  return {
    nw,
    nu: Math.max(1, nu),
    flexCount,
  };
};
