# Subly

Subly 是一个桌面端影视听写语言学习工具，专为英语 / 日语学习场景设计。无需注册、无需 API Key，打开即用。

## 功能

### 视频播放

- 导入本地视频文件（MP4、MOV、WebM、MKV 等）
- 播放 / 暂停、快退 / 快进 5 秒，进度条拖拽
- 播放速度切换（0.5x / 0.75x / 1x / 1.25x / 1.5x）
- 可拖拽字幕遮罩，用于遮住视频底部字幕区域，辅助听写练习

### 听写记录

- 随时输入听到的内容，按 Enter 记录
- 每条记录自动附带当前视频时间戳（MM:SS）
- **按视频时间戳自动排序**：回退视频补录的句子会自动插入正确位置
- 记录支持直接点击编辑，失焦后自动保存
- 删除单条记录
- 导出为 `.txt` 文件，每行格式为 `[MM:SS] 内容`

### 查词面板

- 在听写记录中选中任意文字，自动触发查词
- **英语模式**：调用 [Free Dictionary API](https://api.dictionaryapi.dev)，显示 IPA 音标、词性、释义、例句
- **日语模式**：调用 [Jisho API](https://jisho.org/api)，显示假名读音、词性、英文释义
- 无需 API Key

### 笔记本

- 查词结果可一键收藏到笔记本
- 每条笔记记录来源（视频名 + 时间戳）
- 笔记本与听写记录数据均保存在浏览器 `localStorage`，刷新不丢失

### 界面

- **界面语言**：支持 English / 中文切换（偏好持久化），默认英文
- **学习语言**：日本語 / English，独立于界面语言设置
- Light / Dark 主题切换
- 所有数据按视频文件自动分 session 存储

## 运行

纯静态前端，无构建步骤。推荐用本地 HTTP 服务器打开（直接用 `file://` 打开可能触发浏览器 CORS 限制，导致查词 API 无法调用）：

```bash
# Python
python3 -m http.server 5500

# 或 Node.js
npx serve .
```

然后访问 `http://localhost:5500`。

## 技术栈

- 原生 HTML / CSS / JavaScript（ES Modules），无框架，无构建工具
- 查词：Free Dictionary API（英语）、Jisho API（日语）
- 存储：`localStorage`

## 限制

- 仅支持桌面端（宽度 ≥ 1120px），窄屏会显示提示
- 查词 API 均为公开免费接口，不保证稳定性
- 日语查词返回英文释义（Jisho API 限制）
