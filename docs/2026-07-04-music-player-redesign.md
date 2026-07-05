# 自然风格音乐播放器 UI 复刻设计

## 目标
将现有 3D 频谱可视化项目重构为视频风格音乐播放器，精确复刻参考视频中的 UI 样式：自然背景视频 + 毛玻璃控制栏 + 歌词同步显示。

## 技术栈
- Vite + 原生 JavaScript（无框架）
- CSS Glassmorphism（毛玻璃效果）
- Web Audio API（音频播放）
- jsmediatags（读取本地文件 ID3 元数据）
- lyrics.ovh API（免费歌词获取）

## 页面布局

```
+--------------------------------------------------+
|                                                    |
|         [背景视频 全屏覆盖]                        |
|         叠加 rgba(0,0,0,0.2) 暗色遮罩              |
|                                                    |
|                                                    |
|       "We don't talk anymore"                      |
|       Charlie Puth / Selena Gomez                  |
|       (歌词区域, 居中, 白色发光)                    |
|                                                    |
|                                                    |
|  ▬▬▬▬▬▬▬▬●━━━━━━━  0:28 / 4:14                  | ← 进度条
|  ┌──────────────────────────────────────────────┐  |
|  | [封面] 歌名...  ♡ ⊕ 🔁 ⏮ ▶ ⏭ ⋮ 词 🔊 ⛶ |  | ← 控制栏
|  |        歌手...                               |  |
|  └──────────────────────────────────────────────┘  |
+--------------------------------------------------+
```

## 模块设计

### 1. 背景引擎 (VideoBackground)
- 全屏 `<video>` 标签，`object-fit: cover`
- 静音循环播放
- 叠加半透明黑色遮罩层（降低亮度，突出文字）

### 2. 控制栏 UI (ControlsBar)
- 从左到右 12 个元素：封面缩略图 → 歌曲信息 → ♡ → ⊕ → 🔁 → ⏮ → ▶⏸ → ⏭ → ⋮ → 词 → 🔊 → ⛶
- 毛玻璃背景：`rgba(30,30,35,0.75)` + `backdrop-filter: blur(20px)`
- 圆角 16px，高度 72px
- 按钮尺寸：播放/暂停 48px，其余 24px

### 3. 进度条 (ProgressBar)
- 位于控制栏上方 8px，宽度与控制栏对齐
- 高度 4px，圆角 2px
- 已播放白色，未播放 `rgba(255,255,255,0.2)`
- 可拖动，支持点击跳转

### 4. 音频引擎 (AudioPlayer)
- 基于 Web Audio API + `<audio>` 元素
- 支持本地文件上传播放
- 内置 synth demo 演示音轨

### 5. 歌词系统 (LyricsDisplay)
- **三级策略：**
  - 内置演示曲 → 预写 LRC 歌词
  - 本地文件 → jsmediatags 提取 ID3 → lyrics.ovh API 获取 → 时间轴估算分段
  - 兜底 → 居中显示歌曲名 + 艺术家
- 歌词文字：白色，粗体，`text-shadow` 发光
- 当前行高亮，其余行半透明

### 6. 曲目管理 (TrackManager)
- 来自现有 tracklist.js，适配新 UI
- 支持上传本地文件 + 内置演示音轨

## CSS 全局规范
- 背景色：`#0a0a0f`（视频加载前/遮罩层下方）
- 字体：`'Segoe UI', system-ui, sans-serif`
- 无 3D，纯 2D UI

## 响应式断点
- 640px 以下隐藏次要按钮（♡ ⊕ 🔁 ⋮），缩小内边距

## 文件结构（新增/修改）
```
music-visualizer/
├── index.html          # 简化，只保留必要 DOM 结构
├── main.js             # 重写，组装新模块
├── style.css           # 重写，毛玻璃风格
├── video-bg.js         # [新] 背景视频模块
├── controls-bar.js      # [新] 控制栏 UI
├── progress-bar.js      # [新] 进度条模块
├── lyrics-display.js    # [新] 歌词显示模块
├── audio/
│   ├── player.js       # 保留，适配调整
│   └── analyzer.js     # 保留或精简
├── ui/
│   ├── controls.js     # 废弃，由 controls-bar.js 替代
│   └── tracklist.js    # 保留，简化
└── public/
    └── demo-video.mp4  # 测试用背景视频
```
