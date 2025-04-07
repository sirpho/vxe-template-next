# vxe-template-next

信息管理中心--前端

### 依赖安装

```bash
pnpm install
```

### 测试环境打包命令

```bash
pnpm run build
```

### 正式环境打包命令

```bash
pnpm build:production
```

## 1. 打包dist目录并上传到服务器，上传完毕后删除dist目录

```bash

tar -a -c -f D:\document\sirpho\vxe-template-next\dist\dist.zip --exclude=dist.zip -C D:\document\sirpho\vxe-template-next\dist .

scp "D:\document\sirpho\vxe-template-next\dist\dist.zip" root@www.sirpho.top:/var/www/html/home

Remove-Item -Path "D:\document\sirpho\vxe-template-next\dist" -Recurse -Force

```

## 3. 登录服务器解压

```bash

ssh root@www.sirpho.top

cd /var/www/html/home
rm -rf _app.config.js assets index.html logo-primary.svg logo-white.svg resource scripts
unzip dist.zip
rm -rf dist.zip
```
