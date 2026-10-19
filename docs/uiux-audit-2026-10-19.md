# Skills Hub UI/UX audit — 2026-10-19

## Scope and method

审查对象：线上 https://205055.xyz/ 的首页、探索目录、末页分页、390×844 手机布局、技能详情及浅色搜索建议；结合当前 React/Vite 源码。此次只评审并保存证据，没有修改产品或部署。没有验证登录后的收藏写入、管理后台及全部分类页面。

参考 awesome-design-md 的主题、语义色彩、字体层级、组件状态、布局、层次、响应式与设计约束。它是第三方设计语言分析集，不是品牌官方规范或自动质量评分工具。

- 项目：https://github.com/VoltAgent/awesome-design-md
- Vercel： https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/vercel/DESIGN.md （借鉴语义颜色与技术信息层级）
- Linear： https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/linear.app/DESIGN.md （借鉴工具型界面的一致间距、状态与密度）
- Mintlify： https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/mintlify/DESIGN.md （借鉴内容阅读和导航层级）

建议保留现有品牌标志、双主题、卡片/表格视图和 CDN 静态目录架构，围绕「发现 → 判断是否适用 → 查看可信安装说明」组织体验。不要套用其他品牌的大型营销首页或引入高成本视觉依赖。

## P1 — 优先修复

### 1. 末页不可访问：URL 与实际页码不一致

线上 10021 条，每页20条，显示502页。点击502后 URL 为 `?tab=explore&page=502`，页面却显示9981–10000，当前页500。源码 `frontend/src/hooks/useUrlParams.ts:21` 和 `frontend/src/api/staticCatalog.ts:37` 将页码限制500，后者仍返回502的 total_pages。

影响：正常分页无法访问最后21条，Next会看起来失效。该限制来自之前的性能优化，需要调整静态目录和网关分页策略，使可显示总页数与可访问页数一致。

验收：501页10001–10020，502页10021–10021；末页Next禁用；URL、页码、结果一致；返回/前进、刷新和筛选重置正常。若网关继续限制深分页，UI必须明确限制并提供替代筛选路径。

### 2. 浅色搜索建议难以阅读，列表被 Hero 边界裁切

证据：[search-light.png](uiux-audit-2026-10-19/search-light.png)。浅色主题输入browser后，深色建议浮层中的项目名、描述呈深色；列表下方被Hero底边裁切。

源码：`HeroSection.tsx:99` 的 overflow-hidden；`:166` 固定深色背景，`:203` 附近文字使用主题token。`SearchBar.tsx:197` 有相同背景混用风险，后者尚未独立截图复测。

修改：搜索浮层使用语义 surface/text/border/shadow；背景装饰另设裁切层，使交互浮层不受裁切；两套搜索共用可访问的建议组件。

验收：明暗主题下6条建议和键盘高亮可读，底部结果能滚动选择；不超出手机视口；Escape关闭、上下键选择、Enter与鼠标选择一致；补齐combobox/listbox/option语义。

### 3. 安装命令依据仓库名推测，缺少可信来源

源码：`InstallCommand.tsx:24` 将GitHub仓库页面地址直接传入MCP命令；`:33`、`:41`、`:49` 根据repo_name/language猜测npm、pip、容器镜像。线上AIHawk详情可看到该MCP命令。

风险：仓库名不保证是已发布包名，GitHub页面不是已验证的MCP服务端点。此次未执行这些命令，不能声称某个包已验证可安装。

修改：只有存在来源可追溯的官方安装元数据才显示可复制安装；其他显示「查看官方安装说明」，Git clone单独标为下载源码。

验收：未知包名不生成pip/npx/docker命令；安装方法标注平台、前提、来源；复制后有成功或失败反馈；git clone不宣称完成安装。

### 4. 手机筛选功能不完整

390px探索页只有Category、Size、Platform，桌面还有Quality Grade与Stars。源码 `Home.tsx:248` 手机分支和`:291`隐藏桌面侧栏；质量与星数在`FilterSidebar.tsx:42`起。

修改：共用筛选数据与状态，手机使用Filter抽屉，显示已选数量、条件chip、Clear all。避免两套实现漂移。

验收：手机能设置/查看/移除所有桌面筛选；桌面选中后缩小仍可识别和清除；应用筛选回第1页，返回可恢复。

### 5. 卡片和关联项对键盘不友好，触控目标偏小

`SkillCard.tsx:49`为带onClick的div，无链接语义或tabIndex；`SkillDetailPage.tsx:276`关联项同样使用div。线上AX树只把卡片标题读作heading。详情页实测安装tab高24px，主题34×34、收藏36×36、复制32×32。

修改：项目标题/主操作使用真实Link，收藏保持独立按钮；为紧凑图标扩充透明点击区域，目标44×44px；统一focus-visible与选中状态。

验收：仅用Tab/Enter可发现并进入项目及关联项，不会误触收藏；屏幕阅读器能读出名称与状态；手机主要动作达到目标尺寸。

### 6. 手机详情仍沿用桌面横排，描述被挤成窄列

证据：[detail-mobile.png](uiux-audit-2026-10-19/detail-mobile.png)。390px时，左侧Reuse Score占独立空间，右侧长描述形成窄列，左侧大面积留白；页头品牌与About文字挤压。底部桌宠还覆盖了安装区域的一部分，需提供收起与避让机制。

源码：`SkillDetailPage.tsx:132` 固定flex横排，内含评分和主信息；`:183`起安装区域。修改为手机纵向信息结构，评分/作者/收藏放紧凑元数据行，描述全宽；窄屏折叠次要导航。验收：390px及放大文字下品牌不相撞，标题/描述按阅读顺序全宽，桌宠可关闭且不遮挡复制操作。

## P2 — 信息可信度和视觉一致性

### 7. Verified 标签含义超出依据

`SkillCard.tsx:45`和`HeroSection.tsx:180`仅以quality_score>=70定义Verified。首页`NewThisWeek.tsx:296`又称全部crawled & verified；当前未提供人工验证或安装测试的证据。

建议改为「自动质量评分较高」，展示评分方法、维度与更新时间。若未来人工审核，使用独立状态与验证记录。

### 8. 数据新鲜度和推荐解释需要面向用户

`translations.ts:603`起的Live/real-time与每8小时快照混用。`SkillDetailPage.tsx:288`直接显示semantic(0.32)+complementary+shared_fw(...)等内部计算字符串。

建议展示「最近发布：日期时间 / 每8小时尝试更新」，取真实generated_at；关联推荐默认解释为「同为Python / 共用Playwright」，算法详情折叠。兼容百分比应标注算法估算，避免暗示已实测互操作。

### 9. 统一主题和排版规则

已有token体系值得保留，但组件仍混用硬编码颜色、渐变、10px辅助文字及不同按钮选中态。建议明确canvas/surface/popover/input、primary/secondary/muted、action/on-action、selected/on-selected、focus、error等语义token。正文14–16px、辅助12–13px作为整理目标，不以此宣称当前全部文字不达标。

产品主线优先级：搜索 > 条件筛选 > 仓库对比信息 > 官方使用入口。首页三步介绍可缩短，保留品牌桌宠但增加收起入口，确保不挡交互。手机详情截图已观察到桌宠覆盖安装区域，其他页面和滚动位置需补充测试。

## 实施顺序

1. 首批：分页、浅色搜索和裁切、停止推测安装命令。
2. 第二批：统一手机筛选、真实链接与键盘、触控目标、可信标签。
3. 第三批：写项目专用DESIGN.md，归一token/字体/间距/状态，整理新鲜度和推荐解释。

验收矩阵：390/768/桌面；明/暗；鼠标/键盘；加载/空结果/错误/成功；搜索、筛选、末页、详情返回、收藏入口。保持公开目录走静态CDN，不为视觉升级恢复客户端大表直读。

## 模型与证据边界

全部模型请求经本机Magpie网关；Argon负责初步方向和终审，免费DeepSeek返回空正文后替换Gemini3.8做代码检查；Gemini3.8另做证据质量监控；GPT-6.1-Sol复核浏览器操作员提供的现场事实和截图。浏览器由当前会话操作，未声称Sol直接控制浏览器。模型意见经过源码与线上证据筛选；未采用未触发的遗留SkillDetailPanel问题作为线上结论，也未声称测过Lighthouse或完整WCAG合规。

截图和Markdown可供后续修复对照；本报告不是全站功能通过报告。

实际网关模型返回：Argon `gemini-4-argon-trial`；监控/回退 `gemini-3.8-flash-n`；验收 `gpt-6.1-sol`（codex provider，经Magpie，不是先前无权限的WorkBuddy provider）。免费DeepSeek `deepseek-v4.1-flash-free`返回空正文，未计为有效评审。
