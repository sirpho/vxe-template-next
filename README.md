# vxe-template-next

信息管理中心--前端

### 依赖安装

```
pnpm install
```

### 测试环境打包命令

```
pnpm run build
```

### 正式环境打包命令

```
pnpm build:production
```

## 1. 打包上传到服务器

```bash
D:

scp "D:\document\sirpho\vxe-template-next\dist\dist.zip" root@home.perflogs.top:/var/www/html/home


```

## 2. 登录服务器解压

```bash

ssh root@home.perflogs.top

cd /var/www/html/home
rm -rf _app.config.js assets index.html logo-primary.svg logo-white.svg resource scripts
unzip dist.zip
rm -rf dist.zip
```
