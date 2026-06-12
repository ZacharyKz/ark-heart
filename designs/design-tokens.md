# Design Tokens — 方舟之心 The Ark Heart

> 设计规范，12 模块参数。基于 prototype-thearkheart.html 提取。
> 风格：温暖治愈 · 柔和绿调 · 明亮干净

---

## 1. 色彩系统 (Colors)

### 主色调 — Sage Green
| Token | 色值 | 用途 |
|-------|------|------|
| `--green` | `#6B9E7D` | 主强调色、激活态图标、链接 |
| `--green-light` | `#E8F0EA` | 按钮/标签浅色背景 |
| `--green-dark` | `#5A8A6C` | 深色变体、文字标签 |
| `--green-muted` | `#8FB89E` | 弱化强调、流程线填充 |

### 中性色
| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#F7F6F2` | 页面全局背景 |
| `--card-bg` | `#FFFFFF` | 卡片/列表项背景 |
| `--text-primary` | `#2D2D2D` | 主文字色 |
| `--text-secondary` | `#6B6B6B` | 辅助文字色 |
| `--text-tertiary` | `#999999` | 弱化文字/占位符 |
| `--border` | `#EDEDEB` | 分割线/边框 |
| `--shadow` | `rgba(0,0,0,0.04)` | 卡片阴影 |
| `--tab-bar-border` | `#F0EFEB` | 底部导航栏边框 |

### 功能色（状态标签）
| Token | 色值 | 用途 |
|-------|------|------|
| `--badge-done-bg` | `#F1F5F9` | 已完成背景 |
| `--badge-done-text` | `#64748B` | 已完成文字 |
| `--badge-confirmed-bg` | `--green-light` | 已确认背景 |
| `--badge-confirmed-text` | `--green-dark` | 已确认文字 |
| `--badge-pending-bg` | `#FEF3C7` | 待确认背景 |
| `--badge-pending-text` | `#A16207` | 待确认文字 |
| `--badge-cancelled-bg` | `#FEF2F2` | 已取消背景 |
| `--badge-cancelled-text` | `#991B1B` | 已取消文字 |

---

## 2. 字体系统 (Typography)

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| 页面大标题 | 22px | 700 | 页面品牌标题 |
| 标题 | 17-18px | 600-700 | 区块标题、用户名 |
| 副标题 | 15px | 500-600 | 区块副标题 |
| 正文 | 13px | 400 | 卡片标题、介绍文字 |
| 辅助文字 | 12-12.5px | 400-500 | 描述、协议、菜单项 |
| 小字 | 10-11.5px | 400-500 | 标签、元信息、tab 文字 |
| 极小字 | 10px | 400 | 底部 tab 标签 |

**字体栈**: `'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**行高**: 正文 `1.5-1.8`, 卡片标题 `1.4`

---

## 3. 间距系统 (Spacing)

| 层级 | 值 | 用途 |
|------|----|------|
| xs | 4-6px | 标签内边距、图标间距 |
| sm | 8px | 元素间紧凑间距 |
| md | 12-14px | 卡片内边距、列表项间距 |
| lg | 16px | 页面水平边距、区块间距 |
| xl | 20px | 卡片 padding、区块上下间距 |
| xxl | 24px | 区块底部间距、header 内边距 |

---

## 4. 圆角 (Border Radius)

| 层级 | 值 | 用途 |
|------|----|------|
| 小 | 6-8px | 小标签、按钮 |
| 中 | 10-12px | 卡片、列表项、菜单卡片 |
| 大 | 14px | 主卡片（毛玻璃服务卡） |
| 药丸 | 18px | 筛选 pill |
| 圆 | 50% | 头像、流程圆圈 |

---

## 5. 阴影 (Shadows)

| 层级 | 值 | 用途 |
|------|----|------|
| 轻 | `0 1px 4px rgba(0,0,0,0.04)` | 薄卡片 |
| 中 | `0 2px 8-12px rgba(0,0,0,0.04)` | 服务卡片、预约卡片 |
| 重 | `0 3px 12px rgba(107,158,125,0.35)` | 流程最后一步圆圈 |

---

## 6. 毛玻璃效果 (Glass Effect)

```
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-radius: 14px;
```

应用于首页服务卡片。

---

## 7. 动画 (Animation)

| 属性 | 值 | 用途 |
|------|----|------|
| 缓入缓出 | `200ms ease` | 所有过渡 (hover, active, tab) |
| 淡入上滑 | `fadeInUp 0.5s ease` | 区块入场 |
| Tab 切换 | `tabFadeIn 280ms ease` | 页面切换 (opacity + translateY 8px) |
| 按压反馈 | `scale(0.95)` 200ms | tab 点击 |

---

## 8. 触控规范 (Touch)

| 规则 | 值 |
|------|-----|
| 最小触控区 | ≥44px 高度 |
| 菜单项高度 | 48px |
| 列表项内边距 | 14px 16px |
| 按压反馈 | `background` 变化 + `touch-action: manipulation` |
| 禁选 | `user-select: none` |
| 高亮 | `-webkit-tap-highlight-color: transparent` |

---

## 9. 页面布局 (Layout)

| 页面 | 结构 |
|------|------|
| **首页** | 状态栏 → Header(logo+标题+菜单) → Banner图 → 毛玻璃服务卡 → 协议提示+介绍 → 关于我们 → 预约流程(4步) |
| **预约记录** | 状态栏 → Header → 品牌标题 → 筛选Pills → 卡片列表(缩略图+信息+状态+详情按钮) |
| **我的报告** | 状态栏 → Header → Banner(带叠加标题) → 概览统计(4列) → 报告列表(缩略图+标题+标签+日期) |
| **我的** | 状态栏 → Header → 头像+用户信息 → 我的服务(4宫格) → 菜单列表 → 励志横幅 |

### 底部 Tab Bar
4 个标签：首页 / 预约记录 / 我的报告 / 我的 (56px 高, 白色背景, `#F0EFEB` 上边框)

---

## 10. 图标风格

- 类型：SVG 线条图标
- 描边宽度：1.2-1.6px
- 描边端点：round
- 连接：round
- 颜色：`#6B9E7D` (激活), `#999` (默认), `#2D2D2D` (深色图标), `#C8C8C8` (chevron)
- 尺寸：16-36px

---

## 11. 图片资源

| 图片 | 用途 | 尺寸建议 |
|------|------|---------|
| logo.png | 品牌 Banner | 375×195px |
| QQ20260611-180258.png ~ 180418.png | 服务图标、流程图标 | 36×36px / 30×30px |
| GY.png | 关于我们配图 | 比例 3:4 |
| records-thumb-*.png | 预约卡片缩略图 | 105×120px |
| reports-header.png | 报告页 Banner | 375×150px |
| reports-thumb-*.png | 报告列表缩略图 | 80×80px |
| profile-avatar.png | 用户头像 | 56×56px |
| profile-banner.png | 励志横幅配图 | 80×80px |

---

## 12. 品牌元素

- **Logo**: 树叶/羽毛 SVG 图形（`#6B9E7D` 填充）
- **品牌名**: "The Ark Heart" + 中文 "方舟之心"
- **Slogan**: "愿你心安，找到内心的方舟"
- **品牌色**: 鼠尾草绿 — 象征成长、治愈、自然
