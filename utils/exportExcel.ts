// @ts-expect-error
import * as XLSX from 'xlsx';

// 列宽配置类型
type ColumnWidth = {
  wch: number; // 字符宽度
};

// 合并单元格配置
type MergeCell = {
  s: { r: number; c: number }; // 起始位置 (row, column)
  e: { r: number; c: number }; // 结束位置 (row, column)
};

// 通用导出配置
interface ExcelExportConfig<T = any> {
  data: T[]; // 要导出的数据
  fileName?: string; // 文件名（不含扩展名）
  sheetName?: string; // 工作表名称
  headers?: string[]; // 自定义表头
  fields?: string[]; // 要导出的字段列表
  columnWidths?: ColumnWidth[]; // 列宽配置
  autoColumnWidth?: boolean; // 是否自动调整列宽
  dataFormatter?: (item: T) => any; // 数据格式化函数
  mergeCells?: MergeCell[]; // 合并单元格配置
}

// 工作表配置（用于多工作表导出）
interface SheetConfig<T = any> {
  data: T[];
  sheetName?: string;
  headers?: string[];
  fields?: string[];
  columnWidths?: ColumnWidth[];
}

// 导出结果类型
interface ExportResult {
  success: boolean;
  message?: string;
  fileName?: string;
  error?: Error;
}

/**
 * 通用的 Excel 导出函数
 * @param config 导出配置
 * @returns 导出结果
 */
export const exportToExcel = <T = any>(
  config: ExcelExportConfig<T>,
): ExportResult => {
  const {
    data,
    fileName = '导出数据',
    sheetName = 'Sheet1',
    headers,
    fields,
    columnWidths,
    autoColumnWidth = false,
    dataFormatter,
    mergeCells,
  } = config;

  try {
    // 参数验证
    if (!data || !Array.isArray(data)) {
      throw new Error('data 参数必须是数组');
    }

    if (data.length === 0) {
      return {
        success: false,
        message: '没有数据可导出',
      };
    }

    // 验证 headers 和 fields 的匹配关系
    if (headers && fields && headers.length !== fields.length) {
      console.warn('headers 和 fields 长度不一致，可能影响导出结果');
    }

    // 创建工作簿
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // 处理数据
    let exportData: any[] = [...data];

    // 应用数据格式化函数
    if (dataFormatter && typeof dataFormatter === 'function') {
      exportData = exportData.map((item: T) => dataFormatter(item));
    }

    // 筛选字段
    if (fields && Array.isArray(fields) && fields.length > 0) {
      exportData = exportData.map((item: any) => {
        const newItem: Record<string, any> = {};
        fields.forEach((field: string) => {
          if (
            item !== null &&
            typeof item === 'object' &&
            Object.prototype.hasOwnProperty.call(item, field)
          ) {
            newItem[field] = item[field];
          }
        });
        return newItem;
      });
    }

    // 创建工作表
    let ws: XLSX.WorkSheet;

    if (headers && Array.isArray(headers) && headers.length > 0) {
      // 使用自定义表头
      const wsData: any[][] = [headers];

      // 确定要导出的字段顺序
      const fieldKeys: string[] =
        fields || (exportData[0] ? Object.keys(exportData[0]) : []);

      exportData.forEach((item: any) => {
        const row: any[] = fieldKeys.map((key: string) => item[key] ?? '');
        wsData.push(row);
      });

      ws = XLSX.utils.aoa_to_sheet(wsData);
    } else {
      // 直接使用数据对象
      ws = XLSX.utils.json_to_sheet(exportData);
    }

    // 设置列宽
    if (columnWidths && Array.isArray(columnWidths)) {
      ws['!cols'] = columnWidths;
    } else if (autoColumnWidth) {
      // 自动计算列宽
      const maxWidths: Record<number, ColumnWidth> = {};

      // 获取工作表范围
      if (ws['!ref']) {
        const range: XLSX.Range = XLSX.utils.decode_range(ws['!ref']);

        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10; // 最小宽度
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell: XLSX.CellObject | undefined = ws[cellAddress];
            if (cell && cell.v !== undefined && cell.v !== null) {
              const cellWidth: number = String(cell.v).length;
              if (cellWidth > maxWidth) {
                maxWidth = cellWidth;
              }
            }
          }
          maxWidths[C] = { wch: Math.min(maxWidth + 2, 50) }; // 限制最大宽度
        }

        ws['!cols'] = Object.values(maxWidths);
      }
    }

    // 设置合并单元格
    if (mergeCells && Array.isArray(mergeCells)) {
      ws['!merges'] = mergeCells;
    }

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 生成文件名
    const timestamp: number = new Date().getTime();
    const finalFileName: string = `${fileName}_${timestamp}.xlsx`;

    // 写入文件并下载
    XLSX.writeFile(wb, finalFileName);

    return {
      success: true,
      message: '导出成功',
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('导出 Excel 文件时出错:', error);
    return {
      success: false,
      message: '导出失败',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * 导出多个工作表到同一个 Excel 文件
 * @param sheets 工作表配置数组
 * @param fileName 文件名
 * @returns 导出结果
 */
export const exportMultipleSheets = (
  sheets: SheetConfig[],
  fileName: string = '导出数据',
): ExportResult => {
  try {
    // 参数验证
    if (!sheets || !Array.isArray(sheets)) {
      throw new Error('sheets 参数必须是数组');
    }

    if (sheets.length === 0) {
      return {
        success: false,
        message: '没有工作表可导出',
      };
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    sheets.forEach((sheetConfig: SheetConfig, index: number) => {
      const {
        data,
        sheetName = `Sheet${index + 1}`,
        headers,
        fields,
        columnWidths,
      } = sheetConfig;

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn(`工作表 ${sheetName} 没有数据，跳过`);
        return;
      }

      let exportData: any[] = [...data];

      // 筛选字段
      if (fields && Array.isArray(fields) && fields.length > 0) {
        exportData = exportData.map((item: any) => {
          const newItem: Record<string, any> = {};
          fields.forEach((field: string) => {
            if (
              item !== null &&
              typeof item === 'object' &&
              Object.prototype.hasOwnProperty.call(item, field)
            ) {
              newItem[field] = item[field];
            }
          });
          return newItem;
        });
      }

      let ws: XLSX.WorkSheet;

      if (headers && Array.isArray(headers) && headers.length > 0) {
        const wsData: any[][] = [headers];
        const fieldKeys: string[] =
          fields || (exportData[0] ? Object.keys(exportData[0]) : []);

        exportData.forEach((item: any) => {
          const row: any[] = fieldKeys.map((key: string) => item[key] ?? '');
          wsData.push(row);
        });

        ws = XLSX.utils.aoa_to_sheet(wsData);
      } else {
        ws = XLSX.utils.json_to_sheet(exportData);
      }

      // 设置列宽
      if (columnWidths && Array.isArray(columnWidths)) {
        ws['!cols'] = columnWidths;
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const timestamp: number = new Date().getTime();
    const finalFileName: string = `${fileName}_${timestamp}.xlsx`;

    XLSX.writeFile(wb, finalFileName);

    return {
      success: true,
      message: '导出成功',
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('导出多工作表 Excel 文件时出错:', error);
    return {
      success: false,
      message: '导出失败',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * 简化导出函数 - 最常用的场景
 * @param data 数据数组
 * @param fileName 文件名
 * @param headers 表头（可选）
 * @returns 导出结果
 */
export const simpleExportExcel = <T = any>(
  data: T[],
  fileName: string = '导出数据',
  headers?: string[],
): ExportResult => {
  return exportToExcel<T>({
    data,
    fileName,
    headers,
    autoColumnWidth: true,
  });
};

/**
 * 下载 Excel 模板
 * @param headers 表头数组
 * @param fileName 模板文件名
 * @returns 导出结果
 */
export const downloadExcelTemplate = (
  headers: string[],
  fileName: string = '模板',
): ExportResult => {
  try {
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return {
        success: false,
        message: '没有表头数据',
      };
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const wsData: any[][] = [headers];
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // 设置表头样式（通过冻结第一行）
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // 设置列宽
    const columnWidths: ColumnWidth[] = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, '模板');

    const timestamp: number = new Date().getTime();
    const finalFileName: string = `${fileName}_${timestamp}.xlsx`;

    XLSX.writeFile(wb, finalFileName);

    return {
      success: true,
      message: '模板下载成功',
      fileName: finalFileName,
    };
  } catch (error) {
    console.error('下载 Excel 模板时出错:', error);
    return {
      success: false,
      message: '模板下载失败',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

/**
 * 检查浏览器是否支持导出功能
 * @returns 是否支持
 */
export const isExportSupported = (): boolean => {
  try {
    // 检查 FileSaver API 支持
    return (
      typeof Blob !== 'undefined' &&
      typeof URL !== 'undefined' &&
      typeof URL.createObjectURL !== 'undefined'
    );
  } catch {
    return false;
  }
};

/**
 * 导出为 CSV 格式（轻量级替代方案）
 * @param data 数据数组
 * @param fileName 文件名
 * @param headers 表头
 * @returns 导出结果
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  fileName: string = '导出数据',
  headers?: string[],
): ExportResult => {
  try {
    if (!data || data.length === 0) {
      return {
        success: false,
        message: '没有数据可导出',
      };
    }

    let csvContent: string = '';

    // 处理表头
    if (headers && headers.length > 0) {
      csvContent += headers.map((header) => `"${header}"`).join(',') + '\n';
    } else if (data[0]) {
      // 使用数据的键作为表头
      csvContent +=
        Object.keys(data[0])
          .map((key) => `"${key}"`)
          .join(',') + '\n';
    }

    // 处理数据行
    data.forEach((item: T) => {
      const rowValues: string[] = Object.values(item).map((value) => {
        // 处理特殊字符
        const stringValue =
          value !== null && value !== undefined ? String(value) : '';
        // 转义引号并包裹值
        return `"${stringValue.replace(/"/g, '""')}"`;
      });
      csvContent += rowValues.join(',') + '\n';
    });

    // 创建 Blob 并下载
    const blob: Blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const link: HTMLAnchorElement = document.createElement('a');
    const url: string = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理 URL
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return {
      success: true,
      message: 'CSV 导出成功',
    };
  } catch (error) {
    console.error('导出 CSV 文件时出错:', error);
    return {
      success: false,
      message: 'CSV 导出失败',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

// 默认导出主要函数
export default {
  exportToExcel,
  exportMultipleSheets,
  simpleExportExcel,
  downloadExcelTemplate,
  exportToCSV,
  isExportSupported,
};
