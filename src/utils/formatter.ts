import { divide } from '@sirpho/utils';

/**
 * 存储大小格式化
 */
export const formatSize = (value) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  for (let i = 0, result = value; i < units.length; i++, result = divide(result, 1024)) {
    if (result < 1024) {
      return Number(result.toFixed(2)) + units[i];
    }
    if (i === units.length - 1) {
      return Number(result.toFixed(2)) + units[i];
    }
  }
  return '';
};
