# Cap Windows 中文分支

这是基于 [CapSoftware/Cap](https://github.com/CapSoftware/Cap) 的非官方中文分支，供个人使用和继续开发。项目保留原仓库的 AGPLv3、MIT 及第三方许可证，不修改许可证验证，也不冒充 Cap 官方付费账户。

> [!IMPORTANT]
> 本仓库及其构建产物不是 Cap Software 官方中文版，也未获得其认可或背书。Cap 名称、标志及相关商标归各自权利人所有。本仓库只提供开源代码的中文本地化与非官方构建，不提供官方代码签名、官方订阅权益或官方技术支持。

## 已完成

- Windows 桌面界面简体中文覆盖
- 主窗口、录制、编辑器、时间轴、截图编辑器、设置、引导、更新和错误提示统一汉化
- 动态文本、占位符、工具提示和无障碍标签汉化
- 当前桌面源码 628 条可见文案全部进入中文词典
- 保留工作室录制、即时录制、截图、摄像头、系统音频、鼠标点击自动缩放、时间轴、字幕、导出、自定义 S3 和 Cap Web 自托管功能
- 使用独立应用标识，关闭官方自动更新，避免中文分支被官方英文版本覆盖

中文词典位于 `apps/desktop/src/i18n/zh-CN.ts`。同步上游代码后运行：

```bash
pnpm desktop:i18n:check
```

如果上游新增了尚未收录的界面文案，命令会失败并列出缺失项。

## 构建 Windows 安装包

最省事的方式是在你自己的 GitHub 分支中运行 **Build Cap Chinese Windows** 工作流：

1. 将本分支推送到你的 GitHub 仓库。
2. 打开 `Actions`，选择 `Build Cap Chinese Windows`。
3. 点击 `Run workflow`。使用官方服务时保留默认 `https://cap.so`；使用自托管服务时填写自己的 Cap Web 地址。
4. 构建完成后下载 `cap-cn-windows-x64`，其中包含未签名的 NSIS 安装程序。

未签名的个人构建可能触发 Windows SmartScreen 提示。代码签名证书只能由证书持有人配置，不应复用 Cap 官方签名。

## 本地开发

依赖：Node.js 20、pnpm 10.5.2、Rust 1.88、Visual Studio 2022 C++ 构建工具及 Windows SDK。

```powershell
pnpm install
pnpm env-setup
pnpm cap-setup
pnpm dev:windows
```

生成中文 NSIS 安装包：

```powershell
cd apps/desktop
pnpm build:tauri --target x86_64-pc-windows-msvc --config src-tauri/tauri.prod.conf.json --config src-tauri/tauri.cn.conf.json --bundles nsis
```

## 完整功能与服务边界

本地录制、编辑和导出由桌面程序完成。分享链接、在线转写、AI 标题与摘要、评论、分析、团队空间等功能依赖 Cap Web 和相应服务：

- 连接 `https://cap.so` 时，功能范围由你的官方账户和许可证决定。
- 连接自己的 Cap Web 时，可使用仓库中的 Docker Compose 部署 Web、MySQL、MinIO 和媒体服务，并自行提供对象存储及 AI 服务密钥。
- 本分支不会伪造官方订阅状态，也不会使用 Cap 官方付费资源而绕过其授权。

自托管快速启动：

```bash
docker compose up -d
```

默认地址为 `http://localhost:3000`。随后在桌面端打开“设置”，将“Cap 服务器地址”改为该地址。公开部署前必须按照 `apps/web/content/docs/self-hosting.mdx` 更换数据库密码、会话密钥、加密密钥和 Webhook 密钥，并配置 HTTPS。

AI 功能需要在自托管环境配置相应服务密钥，例如 `ASSEMBLY_API_KEY`、`GROQ_API_KEY` 或 `OPENAI_API_KEY`。这些第三方服务可能产生费用。

## 许可证

版权归原作者及贡献者所有。`cap-camera*`、`scap-*` 使用 MIT 许可证；其他主要代码依照仓库根目录 `LICENSE` 中的 AGPLv3 发布。若向他人分发安装包或通过网络提供修改后的服务，需要同时履行相应的源码提供与法律声明义务。

公开分发时必须保留本仓库的许可证文件、原作者版权声明和上述非官方说明。不得使用本仓库或其安装包暗示与 Cap Software 存在官方合作、授权、认证或售后关系。
