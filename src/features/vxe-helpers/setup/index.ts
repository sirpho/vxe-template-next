import VXETable from 'vxe-table';
import { merge } from 'lodash-es';
import { vxeTableDefaultConfig } from '@/features/config';

VXETable.config(
  merge(
    {
      table: {
        clipConfig: {
          isCut: false,
          isPaste: false,
        },
        checkboxConfig: {
          range: false,
          isShiftKey: true,
        },
      },
    },
    vxeTableDefaultConfig,
  ),
);
