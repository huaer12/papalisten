# 🐾 趴趴听 — Liquid Glass Music Player

> 一个基于 Web 的本地音乐播放器，采用 Apple Liquid Glass 设计语言。支持智能歌词匹配、歌手识别和沉浸式播放体验。

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## ✨ 功能

- 🎵 **本地音乐播放** — 上传 MP3/WAV，自动读取 ID3 标签（标题、歌手、封面）
- 🎤 **智能歌词匹配** — 按歌名搜索 → 按音频时长自动匹配歌手版本 → LRC 时间轴解析 → 节奏缩放
- 📜 **三行滚动歌词** — 当前行高亮居中，点击任意歌词行跳转到对应时间
- 🪟 **Liquid Glass 界面** — Apple 风格毛玻璃效果（`backdrop-filter` 色彩增强 + 边缘高光）
- 📋 **歌单管理** — 侧栏抽屉查看歌曲列表，支持删除、点击切换
- 🔁 **循环模式** — 顺序播放 / 列表循环 / 单曲循环
- 🔊 **音量控制** — 滑块精确调节 + 一键静音
- ⌨️ **键盘快捷键** — 空格（播放/暂停）、← →（切歌）
- 📂 **拖拽上传** — 直接拖入 MP3 文件即可播放
- 🖼️ **封面显示** — 自动提取 ID3 封面图
- 📖 **文艺语录** — 无音乐时展示经典文学短句，自动轮换
- 🌙 **全屏模式** — 沉浸式播放体验

---

## 🛠 技术栈

| 层 | 选型 |
|---|---|
| 构建工具 | [Vite 6](https://vitejs.dev) |
| 前端 | Vanilla JS（无框架依赖） |
| 音频引擎 | Web Audio API + `<audio>` |
| 歌词数据 | [LRCLIB](https://lrclib.net) 公开 API |
| 元数据解析 | [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) |
| 视觉风格 | CSS Liquid Glass（backdrop-filter / saturate / 边缘高光） |
| 部署 | GitHub Actions → GitHub Pages |

---

## ⚡ 快速开始

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/papapalisten.git
cd papapalisten

# 安装依赖
npm install

# 启动开发服务器
npx vite
```

浏览器打开 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

---

## 🖼️ 截图

<details>
<summary>点击查看截图</summary>

![播放器界面](./image/screenshot.png)

</details>

---

## 🎮 使用方式

### 上传音乐

- 点击控制栏左侧封面图标选择文件
- 或将 MP3 文件直接拖拽到页面任意位置
- 支持同时上传多首歌曲

### 歌词匹配

上传后系统会自动：
1. 读取 ID3 标签获取歌手和歌名
2. 如标签缺失，尝试从文件名 `"歌手 - 歌名.mp3"` 提取
3. 搜索 LRCLIB 获取同步歌词（LRC 格式）
4. 按音频实际时长匹配最接近的歌手版本
5. 如果时长不匹配，自动缩放时间轴

> 📌 **提示**：文件名格式建议为 `"歌手 - 歌名.mp3"`，这样可以更准确地匹配歌手信息。

### 快捷键

| 按键 | 功能 |
|---|---|
| `Space` | 播放 / 暂停 |
| `←` | 上一首 |
| `→` | 下一首 |

---

## 📁 项目结构

```
src/
├── main.js                 # 应用主逻辑
├── style.css               # 全局样式（Liquid Glass）
├── progress-bar.js         # 进度条交互
├── lyrics-display.js       # 歌词搜索/解析/滚动
├── video-bg.js             # 背景视频控制
├── audio/
│   ├── player.js           # 音频引擎 + 元数据读取
│   └── analyzer.js         # Web Audio API 分析器
├── ui/
│   ├── tracklist.js        # 曲目列表数据结构
│   └── playlist-drawer.js  # 歌单抽屉 UI
└── public/
    ├── favicon.png         # 网站图标
    └── favicon.svg         # SVG 备用图标
```

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交修改 (`git commit -m 'feat: add something'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 提交 Pull Request

---

## 📄 License

本项目采用 MIT 许可证。详情请参见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [LRCLIB](https://lrclib.net) — 免费歌词 API
- [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) — 音频元数据解析库
- 项目中引用的文学语录版权归原作者所有
- 本项目由 [Claude Code](https://claude.ai) 辅助开发（Vibe Coding）

---

<p align="center">Made with 🐾 and good vibes</p>
