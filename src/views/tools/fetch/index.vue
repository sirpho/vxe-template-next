<template>
  <VxeContainer>
    <PageContainer style="width: 800px; margin: 0 auto">
      <Divider>音乐文件处理</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleGenerateMusic" :loading="loadingGenerateMusic" type="primary">
          音乐文件处理
        </Button>
        <Button @click="handleMd5" :loading="loadingMd5" type="primary"> 音乐文件更新md5 </Button>
        <Button
          @click="handleGenerateMusicTagger"
          :loading="loadingGenerateMusicTagger"
          type="primary"
        >
          音乐文件元数据处理
        </Button>
      </div>
      <br />
      <br />
      <br />
      <Divider>博客批量导出</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleExportBlog" :loading="loadingExport" type="primary"> 导出 </Button>
      </div>
      <Progress v-if="exportTask" :percent="exportProgress" size="small" />
      <br />
      <Divider>文件柜整理</Divider>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <Button @click="handleResize" :loading="loadingResize" type="primary">
          整理文件大小
        </Button>
      </div>
      <br />
      <br />
      <template v-if="tableList.length > 0">
        <br />
        <br />
        <br />
        <Divider>文件处理结果</Divider>
        <vxe-grid
          v-bind="{ ...gridOptions }"
          :columns="tableColumns"
          :data="tableList"
          ref="xTable"
        />
      </template>
    </PageContainer>
  </VxeContainer>
</template>

<script lang="ts" setup>
  import { Button, Divider, message, Progress } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import {
    generateMusic,
    browseArticle,
    getArticleList,
    musicColumns,
    generateMusicTagger,
    generateResize,
    updateMd5,
  } from './service';
  import { VxeContainer, PageContainer } from '@/components/Layout';
  import { VxeGridProps } from 'vxe-table';
  import JSZip from 'jszip';
  import dayjs from 'dayjs';
  import { adds, thousandsSeparator } from '@sirpho/utils';
  import { formatSize } from '@/utils/formatter';

  const loadingMd5 = ref(false);
  const loadingGenerateMusic = ref(false);
  const loadingGenerateMusicTagger = ref(false);
  const loadingExport = ref(false);
  const loadingResize = ref(false);
  const exportTask = ref(false);
  const exportProgress = ref<number>(0);
  const tableList = ref<any[]>([]);
  const tableColumns = ref<any[]>(musicColumns);
  const gridOptions = reactive<VxeGridProps>({
    showHeaderOverflow: 'tooltip',
    height: '400px',
    rowStyle: ({ row }) => {
      return {
        background: row.exception ? 'rgb(252 86 51 / 20%)' : 'unset',
      };
    },
    showFooter: true,
    footerMethod: ({ columns, data }) => {
      return [
        columns.map((column, columnIndex) => {
          if (columnIndex === 1) {
            return '合计';
          }
          // 文件大小 时长
          if (['size', 'duration'].includes(column.field)) {
            const result = adds(...data.map((item) => item[column.field] || 0));
            if (column.field === 'size') {
              return formatSize(result || 0);
            }
            if (column.field === 'duration') {
              const minute = Math.floor(result / 60);
              const second = result % 60;

              return result
                ? `${(minute ? minute + '分钟' : '') + (second ? second + '秒' : '')}`
                : '';
            }
            return thousandsSeparator(result);
          }
          return null;
        }),
      ];
    },
  });

  /**
   * 音乐文件处理
   */
  const handleGenerateMusic = async () => {
    loadingGenerateMusic.value = true;
    const res = await generateMusic().finally(() => {
      loadingGenerateMusic.value = false;
    });
    tableColumns.value = musicColumns;
    tableList.value = (res.data.resultList || []).map((item) => ({
      ...item,
      exception: item.duration === 0,
    }));
    message.success(`新增文件记录${res.data.increaseCount}条`);
  };

  /**
   * 音乐文件md5更新
   */
  const handleMd5 = async () => {
    loadingMd5.value = true;
    const res = await updateMd5().finally(() => {
      loadingMd5.value = false;
    });
    tableColumns.value = musicColumns;
    const resultList = (res.data.resultList || []).map((item) => ({
      ...item,
      exception: false,
    }));
    const exceptionList = (res.data.exceptionList || []).map((item) => ({
      ...item,
      exception: true,
    }));
    tableList.value = [...exceptionList, ...resultList];
    message.success(`更新文件md5记录${resultList.length}条`);
  };

  /**
   * 整理文件大小
   */
  const handleResize = async () => {
    loadingResize.value = true;
    await generateResize().finally(() => {
      loadingResize.value = false;
    });
    message.success(`整理完成`);
  };

  /**
   * 音乐文件元数据处理
   */
  const handleGenerateMusicTagger = async () => {
    loadingGenerateMusicTagger.value = true;
    const res = await generateMusicTagger().finally(() => {
      loadingGenerateMusicTagger.value = false;
    });
    tableColumns.value = musicColumns;
    tableList.value = (res.data.resultList || []).map((item) => ({
      ...item,
      exception: item.duration === 0,
    }));
    message.success(`修改文件记录${res.data.increaseCount}条`);
  };

  /**
   * 博客导出
   */
  const handleExportBlog = async () => {
    loadingExport.value = true;
    exportTask.value = true;
    const zip = new JSZip();
    let count = 0;
    const resArticle = await getArticleList();
    if (resArticle.code === 200) {
      const articleIdList = resArticle.data?.records?.map((item) => item.id);
      for (const item of articleIdList) {
        const res = await browseArticle(item);
        exportProgress.value = Number(((++count / articleIdList.length) * 100).toFixed(2));
        if (res && res.code === 200) {
          // 创建带目录结构的文件
          zip.folder(res.data?.category || '其他')?.file(`${res.data?.title}.md`, res.data.content);
        }
      }
    }
    // 生成 ZIP 文件
    const blob = await zip.generateAsync({ type: 'blob' });
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `博客导出 ${dayjs().format('YYYY-MM-DD')}.zip`;
    link.click();

    // 清理资源
    URL.revokeObjectURL(link.href);
    loadingExport.value = false;

    message.success(`成功导出${count}篇博客！`);
  };
</script>
<script lang="ts">
  export default {
    name: 'Fetch',
  };
</script>
