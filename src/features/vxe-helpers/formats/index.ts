import VXETable from 'vxe-table';
import numeral from 'numeral';
import { isNil } from 'lodash-es';
import dayjs from 'dayjs';

VXETable.formats.add('currency', ({ cellValue }, format = '0,0.00') => {
  if (isNil(cellValue)) {
    return '';
  }
  return numeral(cellValue).format(format);
});

type Mode = 'time' | 'year' | 'month' | 'day' | 'onlyMonth' | 'onlyDay' | 'onlyTime';

VXETable.formats.add('time', ({ cellValue }, mode: Mode = 'time') => {
  if (isNil(cellValue)) {
    return '';
  }

  const MODES = {
    time: 'YYYY-MM-DD hh:mm:ss',
    year: 'YYYY',
    month: 'YYYY-MM',
    day: 'YYYY-MM-DD',
    onlyMonth: 'MM',
    onlyDay: 'DD',
    onlyTime: 'hh:mm:ss',
  };

  return dayjs(cellValue).format(MODES[mode]);
});
