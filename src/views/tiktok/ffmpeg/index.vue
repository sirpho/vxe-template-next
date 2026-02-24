<template>
  <PageContainer>
    <VxeContainer direction="vertical" :size="[20, 80]">
      <div class="operation-bar">
        <Upload
          v-model:file-list="fileList"
          :before-upload="beforeUpload"
          list-type="picture"
          multiple
        >
          <Button> 选择文件 </Button>
        </Upload>
        <Button class="clear-btn" type="primary" @click="handeClear()">清空</Button>
      </div>
      <div
        class="content"
        style="display: flex; flex-direction: column; height: 100%; padding: 12px"
      >
        <Divider>去掉开头部分（从指定秒截取到结尾）</Divider>
        <div class="btn-row">
          <Input v-model:value="dropBeforeTime" placeholder="格式：00:00:00" style="width: 140px" />
          <Button type="primary" @click="handleDrop">去掉开头部分</Button>

          <div class="up-down-wrapper">
            <div class="up-down-inner inner1">
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('dropBeforeTime', event, 0)"
                />
              </div>
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('dropBeforeTime', event, 1)"
                />
              </div>
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('dropBeforeTime', event, 2)"
                />
              </div>
            </div>
          </div>
        </div>

        <Divider>截取中间一部分（精确截取时间段）</Divider>
        <div class="btn-row">
          <Input v-model:value="startTime" placeholder="开始时间：00:00:00" style="width: 140px" />
          <Input v-model:value="endTime" placeholder="结束时间：00:00:00" style="width: 140px" />
          <Button type="primary" @click="handleCapture">截取中间一部分</Button>

          <div class="up-down-wrapper">
            <div class="up-down-inner inner2">
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('startTime', event, 0)"
                />
              </div>
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('startTime', event, 1)"
                />
              </div>
              <div class="up-down-cell">
                <column-height-outlined
                  @wheel="(event) => handleWheelEvent('startTime', event, 2)"
                />
              </div>
            </div>
          </div>
          <div class="up-down-wrapper">
            <div class="up-down-inner inner3">
              <div class="up-down-cell">
                <column-height-outlined @wheel="(event) => handleWheelEvent('endTime', event, 0)" />
              </div>
              <div class="up-down-cell">
                <column-height-outlined @wheel="(event) => handleWheelEvent('endTime', event, 1)" />
              </div>
              <div class="up-down-cell">
                <column-height-outlined @wheel="(event) => handleWheelEvent('endTime', event, 2)" />
              </div>
            </div>
          </div>
        </div>

        <Divider>裁剪视频比例</Divider>
        <div class="btn-row">
          <Button type="primary" @click="handleLeft">
            保留视频左侧 {{ rate1 }}/{{ rate2 }} 的部分
          </Button>
          <InputNumber
            v-model:value="rate1"
            :min="1"
            :precision="0"
            style="width: 140px"
            placeholder="分子"
          />
          <InputNumber
            v-model:value="rate2"
            :min="1"
            :precision="0"
            style="width: 140px"
            placeholder="分母"
          />
          <Button type="primary" @click="handleRight">
            保留视频右侧 {{ rate1 }}/{{ rate2 }} 的部分
          </Button>
        </div>

        <Divider>操作</Divider>
        <div class="btn-row">
          <Button @click="handleMetadata">删除元数据</Button>
          <Button type="primary" @click="handleNvidia">重新编码 英伟达</Button>
          <Button type="primary" @click="handleAmd">重新编码 AMD</Button>
          <Button type="primary" @click="handleTranspose">旋转90度</Button>
        </div>

        <Divider>
          <Button type="primary" @click="handleCopy" size="small">复制</Button>
          脚本
          <Button type="primary" @click="handleDownloadBat" size="small">下载bat</Button>
        </Divider>
        <pre
          class="m-0 p-4 overflow-auto w-full"
          style="flex: 1; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 12px"
        >
          <code ref="ffmpegCode" class="language-bash"></code>
        </pre>
      </div>
    </VxeContainer>
  </PageContainer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Upload, Button, Divider, Input, InputNumber, message } from 'ant-design-vue';
  import { VxeContainer, PageContainer } from '@sirpho/components';
  import dayjs from 'dayjs';
  import hljs from 'highlight.js/lib/core';
  import { copyText } from '@/utils/copyTextToClipboard';
  import { ColumnHeightOutlined } from '@ant-design/icons-vue';

  // 时间参数
  const dropBeforeTime = ref('00:00:00');
  const startTime = ref('00:00:00');
  const endTime = ref('00:00:00');
  // 总序号
  const totalIndex = ref<number>(1);
  // 裁剪比例参数
  const rate1 = ref(1);
  const rate2 = ref(3);
  // 文件列表
  const fileList = ref<any[]>([]);
  // FFmpeg命令代码容器
  const ffmpegCode = ref<HTMLElement | null>(null);
  const scriptList = ref<any[]>([]);

  /**
   * 清空文件列表
   */
  const handeClear = () => {
    copyText('', null);
    fileList.value = [];
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = '';
      scriptList.value = [];
    }
  };

  /**
   * 选择文件前校验（仅收集文件信息，不实际上传）
   */
  const beforeUpload = (file: any) => {
    // 校验是否为视频文件（可选）
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      return false;
    }
    // 添加文件到列表（去重）
    const isExist = fileList.value.some((item) => item.uid === file.uid);
    if (!isExist) {
      fileList.value = [...fileList.value, file];
    }
    return false; // 阻止默认上传行为（仅本地处理）
  };

  /**
   * 获取文件后缀名
   */
  const getSuffix = (fileName: string) => {
    const suffix = fileName?.split('.').pop() || 'mp4'; // 默认MP4格式
    return suffix.toLowerCase();
  };

  /**
   * 去掉开头部分（从指定时间截取到结尾）
   */
  const handleDrop = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -ss ${dropBeforeTime.value} -i "${item.name}" -c:v copy -c:a copy "output_drop${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    // 渲染命令并高亮
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 截取中间部分（指定开始和结束时间）
   */
  const handleCapture = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -ss ${startTime.value} -to ${endTime.value} -i "${item.name}" -c copy "output_capture${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 删除视频元数据
   */
  const handleMetadata = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -map_metadata -1 -c:v copy -c:a copy -y "output_noMeta${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 英伟达GPU重新编码（H.264）
   */
  const handleNvidia = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -c:v h264_nvenc -crf 23 -profile:v high -level 4.1 -preset slow -c:a copy "output_nvenc${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * AMD GPU重新编码（H.264）
   */
  const handleAmd = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -c:v h264_amf -crf 23 -profile:v high -level 4.1 -c:a copy "output_amf${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 旋转90度
   */
  const handleTranspose = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -vf "transpose=1" -c:v libx264 -crf 18 -preset medium -c:a copy "output_transpose${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 保留视频左侧指定比例部分
   */
  const handleLeft = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    if (rate2.value === 0) {
      message.error('分母不能为0');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -vf "crop=iw*${rate1.value}/${rate2.value}:ih:0:0" -c:v libx264 -crf 18 -preset slow -c:a copy "output_left${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 保留视频右侧指定比例部分
   */
  const handleRight = () => {
    copyText('', null);
    if (fileList.value.length === 0) {
      message.warning('请先选择视频文件');
      return;
    }
    if (rate2.value === 0 || rate1.value >= rate2.value) {
      message.error('请确保分母大于分子（如1/3、2/5）');
      return;
    }
    const timestamp = dayjs().format('_HHmm');
    const result = fileList.value.map(
      (item) =>
        `ffmpeg -i "${item.name}" -vf "crop=iw*${rate1.value}/${rate2.value}:ih:iw*${rate2.value - rate1.value}/${rate2.value}:0" -c:v libx264 -crf 18 -preset slow -c:a copy "output_right${timestamp}_${totalIndex.value++}.${getSuffix(item.name)}"`,
    );
    if (ffmpegCode.value) {
      ffmpegCode.value.textContent = result.join('\n');
      scriptList.value = [...result];
      hljs.highlightElement(ffmpegCode.value);
    }
  };

  /**
   * 下载BAT脚本
   */
  const handleDownloadBat = () => {
    // 1. 校验是否有生成的命令
    if (!ffmpegCode.value || !ffmpegCode.value.textContent?.trim()) {
      message.warning('暂无FFmpeg命令，请先执行裁剪/编码等操作生成命令');
      return;
    }

    // 2. 拼接BAT脚本内容（解决中文乱码+执行暂停）
    const commandContent = ffmpegCode.value.textContent.trim();
    const batContent = `@echo off
:: FFmpeg批量处理脚本（生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}）
:: 切换命令行编码为UTF-8（解决中文乱码）
chcp 65001 > nul
cls

:: 批量执行FFmpeg命令
${commandContent}

:: 执行完成后暂停（避免窗口一闪而过）
echo.
echo ==============================================
echo 所有任务执行完成！
echo ==============================================
pause > nul`;

    // 3. 创建Blob文件并触发下载
    const blob = new Blob([batContent], { type: 'text/plain; charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const aLink = document.createElement('a');

    aLink.href = downloadUrl;
    // 文件名含时间戳（避免重复）
    aLink.download = `ffmpeg_batch_${dayjs().format('YYYYMMDD_HHmmss')}.bat`;
    aLink.click(); // 模拟点击下载

    // 4. 释放资源（避免内存泄漏）
    URL.revokeObjectURL(downloadUrl);
    message.success('BAT脚本已开始下载');
  };

  /**
   * 复制
   */
  const handleCopy = () => {
    copyText(scriptList.value.join(' && '));
  };

  const handleWheelEvent = (
    arg: 'dropBeforeTime' | 'startTime' | 'endTime',
    event: WheelEvent,
    index: number,
  ) => {
    event.preventDefault();
    // 获取滚动量
    const deltaY = event.deltaY;

    if (deltaY > 0) {
      handleUpDown(arg, 'down', index);
    } else {
      handleUpDown(arg, 'up', index);
    }
  };

  /**
   * 调整时间
   */
  const handleUpDown = (
    arg: 'dropBeforeTime' | 'startTime' | 'endTime',
    mode: 'up' | 'down',
    index: number,
  ) => {
    let time;
    switch (arg) {
      case 'dropBeforeTime':
        time = dropBeforeTime.value;
        break;
      case 'startTime':
        time = startTime.value;
        break;
      case 'endTime':
        time = endTime.value;
        break;
    }
    const array = time.split(':');
    const timeList = [parseInt(array[0]) || 0, parseInt(array[1]) || 0, parseInt(array[2]) || 0];
    if (mode === 'up') {
      timeList[index] = (timeList[index] + 1) % 60;
    }
    if (mode === 'down') {
      timeList[index] = timeList[index] > 1 ? timeList[index] - 1 : 59;
    }
    time =
      timeList[0].toString().padStart(2, '0') +
      ':' +
      timeList[1].toString().padStart(2, '0') +
      ':' +
      timeList[2].toString().padStart(2, '0');

    switch (arg) {
      case 'dropBeforeTime':
        dropBeforeTime.value = time;
        break;
      case 'startTime':
        startTime.value = time;
        break;
      case 'endTime':
        endTime.value = time;
        break;
    }
  };
</script>
<script lang="ts">
  export default {
    name: 'Ffmpeg',
  };
</script>
<style lang="less" scoped>
  .operation-bar {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    padding: 12px;

    .ant-upload-wrapper {
      flex: 1;
      overflow: hidden;
    }

    .clear-btn {
      position: absolute;
      right: 7px;
      bottom: 12px;
      left: 7px;
    }

    :deep(.ant-upload-select) {
      width: 100%;
      margin-bottom: 8px;
    }

    :deep(.ant-upload-list) {
      height: 100%;
      overflow: auto;
    }

    :deep(.ant-upload) {
      display: block;
      width: 100%;

      .ant-btn {
        width: 100%;
      }
    }
  }

  .content {
    width: 100%;
    max-width: 1000px;
    height: 100%;
    margin: 0 auto;
    overflow: auto;
  }

  .btn-row {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    gap: 8px;

    :deep(.ant-input),
    :deep(.ant-input-number) {
      max-width: 140px !important;
    }
  }

  .up-down-row {
    display: flex;
    position: relative;
    z-index: 1;
    top: -26px;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .up-down-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;

    .up-down-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  }

  .up-down-inner {
    display: flex;
    position: relative;
    align-items: center;
    width: 60px;
    gap: 5px;
  }

  .inner1 {
    right: 91px;
  }

  .inner2 {
    right: 171px;
  }

  .inner3 {
    right: 24px;
  }
</style>
