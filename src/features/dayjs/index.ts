import dayjs, { Dayjs } from 'dayjs';

/**
 * 日期范围选择器后处理
 * 格式 YYYY-MM-DD HH:mm:ss
 * 取开始时间的 startOf
 * 取结束时间的 endOf
 */
export const timeRangeHandler = (
  timeRange?: [Dayjs, Dayjs],
  options = {},
): [string, string] | [] => {
  const { hasTime, format } = { hasTime: true, format: 'YYYY-MM-DD HH:mm:ss', ...options };
  if (!Array.isArray(timeRange)) {
    return [];
  }
  try {
    const [start, end] = timeRange || [];
    const s = hasTime ? dayjs(start).format(format) : dayjs(start).startOf('day').format(format);
    const e = hasTime ? dayjs(end).format(format) : dayjs(end).endOf('day').format(format);
    return [s, e];
  } catch (e) {
    console.log(e);
    return [];
  }
};
