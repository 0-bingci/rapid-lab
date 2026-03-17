# RapidLab

一个基于 Next.js 构建的实用工具集合平台，提供开箱即用的小工具。

## 工具列表

| 工具 | 路由 | 说明 |
|------|------|------|
| JSON 格式化 | `/tools/json-formatter` | 一键美化或压缩 JSON，支持语法校验 |
| 万能比价引擎 | `/tools/price-compare` | 自定义变量与公式，多方案并排计算，自动标出最划算选项，数据持久化 |
| 图片无损压缩 | `/tools/image-compress` | 基于 `browser-image-compression`，保留原格式与 EXIF，支持批量处理 |

## 技术栈

- **框架**：Next.js 16 + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **图标**：Font Awesome 6
- **依赖**：
  - `mathjs` — 万能比价引擎的公式解析
  - `browser-image-compression` — 图片压缩

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 项目结构

```
app/
├── layout.tsx          # 全局布局（字体、Font Awesome）
├── page.tsx            # 首页（工具卡片列表、搜索、分类筛选）
├── globals.css         # 全局样式
└── tools/
    ├── json-formatter/ # JSON 格式化
    ├── price-compare/  # 万能比价引擎
    └── image-compress/ # 图片无损压缩
```

## 新增工具

在 `app/tools/` 下新建文件夹和 `page.tsx`，然后在 `app/page.tsx` 的 `tools` 数组中追加一条记录即可。
