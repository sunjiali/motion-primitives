// Prompt Gallery data — one entry per published video.
// The prompt in each entry is the exact production instruction that
// shipped the video (a brief for an AI + the motion skill — NOT a
// text-to-video model prompt). New entries land with each release;
// see the "Prompt Gallery duty" in the daily iteration instructions.
window.PROMPT_GALLERY = [
  {
    id: 'prompt-sting',
    title: 'Prompt Sting — One Prompt In, One Video Out',
    blurb: 'The gallery’s own opener, made by iterating a prompt twice: letters assemble, three verbs pop, and the wordmark locks up over a typed line of code.',
    video: 'videos/prompt-sting.mp4',
    tags: ['kinetic type', 'assembleText · pop · typewriter', '16:9', '8s'],
    rounds: 'prompt 迭代 · 2 轮',
    prompt:
`用 motion-primitives 做一条 8 秒的 kinetic-type 品牌 sting，composition 名 prompt-sting，主题是「一条 prompt 进去，一条视频出来」，给 Prompt Gallery 当开场片。

规格：1280×720，30fps，240 帧，无声，三场硬切。配色只用 Morry 体系：暖米底 #F5F1E8、墨黑 #16171A、抹茶绿 #A6CF5F、酸性绿 #D9F24F，次要文字用柔棕 #8A8272。全片不许出现这五种之外的颜色——粒子也不行。

第 1 场（0–74 帧）拼词：顶部小标签「ONE PROMPT IN」（600 22px，字距 6px，柔棕）fadeUp 入场；中央大字「PROMPT」用 M.assembleText 从散落状态逐字飞入拼合（118px，800 字重，墨黑）；拼完后词尾跟一个 34×96px 的酸性绿方块光标，以 26 帧为周期闪烁；下方小字「typed by a human, rendered by code」（24px，柔棕）淡入。
第 2 场（75–164 帧）三动词：WRITE.（墨黑）→ RENDER.（抹茶绿）→ SHIP.（墨黑），每个 30 帧，全屏居中 138px、800 字重，用 M.pop 弹簧弹出；弹出瞬间在词中心放一圈 M.burst 粒子——只许用当前动词的颜色（colors 只传单色数组），10 颗，半径 220；词下方一条酸性绿 6px 短线（宽 340px，居中），随 pop 同步 scaleX 展开；画面底部等宽小字「step n / 3」跟着换。
第 3 场（165–239 帧）收尾 lockup：大字「motion」（墨黑）+「-primitives」（抹茶绿）同行居中（88px，800 字重）fadeUp 入场；下方一颗墨黑胶囊（圆角 999px），里面用 M.typewriter 打出代码句「M.compose(frame) // no math, just intent」（24px 等宽，米白字，cpf = 1 即每帧 1 字，带闪烁光标，入场后约 1.3 秒内打完）；胶囊必须整行居中——用全宽居中容器包一颗 inline-block 胶囊实现，别让入场位移动画把居中顶偏；最下方一行小字「87 primitives · copy the prompt, ship the video」（26px，柔棕）淡入，定格到结束。

禁用：不要 BGM 和音效；不要渐变背景、不要投影；装饰元素不许越过五色盘。`,
    notes: '迭代小记（2 轮）：v1 静帧审查抓出三处——① 第 2 场 burst 用了库默认四色纸屑，打破五色纪律；② 第 3 场胶囊被入场动画的 transform 顶偏、没居中；③ 打字机速度参数写错，片尾只剩半句。v2 把三条修正直接写进 prompt 本身（单色粒子 / 全宽居中容器 / cpf=1），重渲后静帧复核过线，此版即发布版。',
  },
  {
    id: 'liquid-showcase',
    title: 'Liquid Metal Showcase',
    blurb: 'One WebGL primitive, four scenes: a logo sting, a three-finish trio, a living loader, and a hero card — raymarched chrome, no video assets.',
    video: 'videos/liquid-showcase.mp4',
    tags: ['WebGL', 'liquidMetal', '16:9', '10s'],
    rounds: '复现 prompt · shipped in v0.50',
    prompt:
`用 motion-primitives 做一条 10 秒的 WebGL 液态金属展示片，composition 名 liquid-showcase。

规格：1280×720，30fps，300 帧，无声。四场硬切（不许渐变/叠化转场），深空底：径向渐变 #1A2230（上方）→ #07090D（下方）。核心只用一个原语 M.liquidMetal（原生 WebGL1 SDF 光线步进实现，不用 three.js），四场这样排：

第 1 场 STING（0–89 帧）：画面中央放 800×450 的液态金属簇（palette: chrome，seed 2，speed 0.9）；第 36 帧起，下方用 M.assembleText 拼出字标「MOTION」（64px，#E8E4DA，字母从散落状态飞入拼合）；第 58 帧起，字标下方一条 300×2px 的 #46506A 细线从中心 scaleX 展开。
第 2 场 TRIO（90–164 帧）：顶部居中标题「ONE FIELD, THREE FINISHES」（700 30px，字距 8px，#E8E4DA）；下方三块 400×225 金属簇并排（chrome / gold / oil，seed 分别 2 / 7 / 5），每块下方是 600 21px、字距 4px 的灰蓝标签 #8E99AD：CHROME / GOLD / OIL SLICK。
第 3 场 LOADER（165–224 帧）：中央小金属簇 380×214（chrome，seed 9，speed 1.6，blobs 4）当 living loading 标记；下方 400×8px 进度条（底 #232B3A，填充 #C7CEDA），用本场 60 帧从 0% 走到 100%；再下方等宽字「LOADING n%」，百分比实时跟随。
第 4 场 HERO（225–299 帧）：左侧大标题两行 800 92px——「LIQUID」米白 #E8E4DA、「METAL」金色 #C9A86A，fadeUp 错峰入场；副标题 25px 灰蓝「Raymarched SDF chrome, in one call.」；右侧 540×304 的 gold 金属球（seed 3，speed 0.8）；底部一颗描边胶囊（2px #46506A 边框），里面写代码签名 M.liquidMetal(frame, o)。

禁用：不许用图片/视频素材冒充金属（必须实时 WebGL 渲染）；不配乐、不加音效；不要圆角卡片和投影——这片子只有金属和字。`,
    notes: '回填条目：成片随 v0.49/v0.50 发布，本 prompt 按已上线 composition 源码逐场转写，标注「复现 prompt」。',
  },
  {
    id: 'swiss-relay',
    title: 'Swiss Relay',
    blurb: 'A Swiss International Style study: one red block relays across every cut — square, bar, slab, column — and every keyframe lands on a 120 BPM beat.',
    video: 'videos/swiss-relay.mp4',
    tags: ['Swiss Style', 'relay', '16:9', '8s'],
    rounds: '复现 prompt · shipped in v0.54',
    prompt:
`用 motion-primitives 做一条 8 秒的瑞士国际主义风格短片，composition 名 swiss-relay，主角是一个跨场接力的红色方块（用原语 M.relay 实现）。

规格：1280×720，30fps，240 帧，无声，硬切。配色只有四色：纸白底 #F5F4F0、黑 #111111、灰 #7A7A78、瑞士红 #E30613（全片唯一的彩色）。全程铺 12 列 × 6 行网格辅助线（rgba(17,17,17,.09)，1px）。排版：齐左不齐右、全部直角无圆角、层级只靠字号和字重（标题 800 字重 system-ui，大字字距 -2px；小标签 600 19px、灰色、字距 3px）；每场配一条 3px 黑色粗线 rule。

节拍：120 BPM，30fps 下每拍 15 帧，每场 4 拍 = 60 帧，所有切换和关键帧必须落在拍点上（场景边界 0 / 60 / 120 / 180 / 240）。画面底部一排 16 个 10px 节拍小方格，随播放逐个填黑；右下角等宽小字脚注「M.relay(frame, { keys })」。

红色主角（M.relay 的 keys，at 均为拍点）：0 帧右上 190×190 方块（x970, y80）→ 60 帧左下 760×95 宽条（x90, y470）→ 120 帧左侧 340×340 大方块（x90, y130）→ 180 帧右侧 160×460 竖条（x1030, y110）→ 240 帧回到起点。它不消失、不淡出，直接滑动变形穿过每次硬切——它本身就是转场。

四场文案：第 1 场标签「01 · GRID FIRST — RASTER」，大字「Swiss / Style」（150px 两行），正文「International Typographic Style, 1957 — one grid, one typeface, one red.」；第 2 场文字停在右上、避开接力路线，标签「02 · ONE HERO PER SCENE」，大字「The red / never leaves.」，正文「No wipes, no fades — the hero itself carries the cut.」；第 3 场标签「03 · SQUARE — SACHLICHKEIT」，大字「No rounded / corners.」，正文「Flush left, ragged right. Hierarchy by size and weight only.」；第 4 场标签「04 · EVERY CUT ON A BEAT」，大字「120 BPM. / 15 frames / per beat.」，正文小字注明出处「swiss-relay · a design-style study after @guanmo_ai」。

禁用：不许出现第二个彩色；不许圆角、渐变、阴影；不许叠化/擦除转场。`,
    notes: '回填条目：成片随 v0.54.0 发布（新原语 relay 的演示片），本 prompt 按已上线 composition 源码逐项转写，标注「复现 prompt」。风格出处见片尾署名。',
  },
  {
    id: 'math-make-ten-kids',
    title: '凑十法 · Make-Ten for Kids (9 + 4)',
    blurb: 'A 40-second vertical explainer for first-graders: nine candy dots, one flying dot, and the make-ten trick — the math series’ kids skin.',
    video: 'videos/math-make-ten-kids.mp4',
    vertical: true,
    tags: ['kids skin', 'teaching', '9:16', '40s'],
    rounds: '复现 prompt · math series',
    prompt:
`做一条给一年级小朋友看的数学动画《9+4 凑十法》，竖屏，composition 名 math-coushi-kids（数学系列儿童皮肤）。

规格：720×1280，30fps，1200 帧（40 秒），无声（配音另录，画面底部预留字幕条）。儿童皮肤规范：一切圆角、柔和投影、糖果色；禁用深色背景、锐角和小字。

配色：背景奶油渐变 #FFF8EC → #FFEFD9，右上角一颗带旋转光芒的太阳（#FFD93D），几朵白云缓慢漂移；橙 #FF8A4C（9 的圆点）、天蓝 #3FB6FF（4 的圆点）、绿 #4ED06A（答案与表扬）、墨 #4A3728（正文）、柔棕 #A08B76（次要文字）。圆点是糖果风：实心圆 + 左上白色高光点。

分场（硬切，每场整体入场带轻微缩放呼吸感）：
第 1 场（0–119 帧）标题：小字「一年级 · 20 以内进位加法」（字距 8px）淡入；大字「凑十法」116px 橙色弹簧弹出（白色描边光晕）；「9 + 4 = ?」88px 墨色弹出，问号蓝色；小字「看动画，变个魔术 ✨」。
第 2 场（120–419 帧）摆点：上方十格阵——2 行 × 5 列白色圆角格子（104px，圆角 26px，边框 #FFE3C2）逐个 stagger 弹入；9 个橙点依次弹进前 9 格，第 10 格留空，画成蓝色虚线圆环并轻轻呼吸（暗示「还差 1 个」）；下方横排 4 个蓝点；左上标注「9 个」；下方算式「9 + 4 = ?」，配小字「9 再来 1 个就变成 10 啦」。
第 3 场（420–719 帧）变魔术：蓝色胶囊标签「把 1 个送过去 🚀」出现；1 个蓝点沿抛物线弧线飞进空格（身后带 5 个渐淡拖尾）；落点瞬间橙点 squash 压扁回弹 + 一圈橙色涟漪扩散 + 绿色胶囊徽章「⭐ 凑成 10！」弹出；其余 3 个蓝点开心地小跳一下；标注改「剩 3 个」，算式变「10 + 3」。
第 4 场（720–959 帧）揭晓：14 颗五彩纸屑向外爆开；上方「10 + 3 =」58px，答案「13」210px 绿色大字弹簧弹出；绿色胶囊「你真棒！🎉」。
第 5 场（960–1199 帧）口诀卡：白色圆角大卡片（边框 #FFE3C2）弹入，标题「🌟 凑十法口诀 🌟」，两行橙色大字逐行淡入——「看大数，分小数」「凑成十，加剩数」，一道黄色高光斜扫过卡片；下方绿色大字「9 + 4 = 13 ✓」收尾。

字幕条（全程）：底部上方 56px 处奶油白圆角条（rgba(255,255,255,.92)，边框 #FFE3C2），32px 粗字居中，文案随场切换：①「9 加 4 等于几？我们用凑十法，变个魔术给你看」②「先摆出来：上面 9 个小圆点，下面 4 个，9 再来 1 个就变成 10 啦」③「把下面 1 个送上去，上面变成 10，下面还剩 3 个」④「10 加 3 等于 13，你真棒」⑤「记住口诀：看大数，分小数，凑成十，加剩数」。

数字红线：9 + 4 = 13，凑十拆分 4 = 1 + 3，全片不得出现其他算式或结果。`,
    notes: '回填条目：数学系列已交付成片（儿童皮肤版），本 prompt 按 mini-remotion 的 math-coushi-kids composition 逐场转写，标注「复现 prompt」。本站版本为无声版，配音版在数学系列发布渠道。',
  },
  {
    id: 'flap-board',
    title: 'Flap Board — Departures, Clacking Into Place',
    blurb: 'An airport departures board where every cell cycles through an ordered charset and clacks home — then, mid-film, two statuses re-flap to their new values.',
    video: 'videos/flap-board.mp4',
    tags: ['splitFlap', 'kinetic type', '16:9', '12s'],
    rounds: '复现 prompt · shipped in v0.56',
    prompt:
`用 motion-primitives 做一条 12 秒的机场出发信息牌短片，composition 名 flap-board，全片只用一个新原语 M.splitFlap 驱动文字（每个字符从空白开始、沿有序字符集逐格翻页、从左到右依次咔哒到位；字符集外的字整字出现）。

规格：1280×720，30fps，360 帧，无声，硬切。深色大厅：底 #0E0F12、行面板 #15171B、描边 #26292F、正文 #E8E4D8、次要 #8A8F98；状态色：琥珀 #FFD94D（登机中）、红 #FF7A6B（延误/最后呼叫）、绿 #9BD97A（准点/已出发）。全部等宽字体（ui-monospace），字距 2px。

版式：顶部左「DEPARTURES」800 40px 字距 6px，中间灰色「出 发」（字距 10px，中文标题字直接排版不用 splitFlap），右上琥珀色「SHANGHAI · OCT 22」其中日期也用 splitFlap 翻入。表头一行 19px 灰字：TIME / FLIGHT / DESTINATION / STATUS，与列对齐。

四行航班（行高 84px，圆角 10px 面板；每行四段各自独立 splitFlap，段间 at 依次错开 6 帧：时间灰、航班号正文、目的地正文、状态用状态色）：
1. 0840 · MU5137 · BEIJING · ON TIME（绿，at 28）
2. 0915 · CA1832 · SHENZHEN · BOARDING（琥珀，at 58）
3. 0950 · HO1253 · CHENGDU · DELAYED（红，at 88）
4. 1020 · FM9105 · XIAMEN · ON TIME（绿，at 118）
各行整体 at 再错开 30 帧（10 / 40 / 70 / 100），让整块牌子像真实 Solari 牌一样逐行翻完。

中段更新（这片子的戏眼）：第 215 帧，第 2 行状态从空白重新翻成「LAST CALL」（红）；第 255 帧，第 1 行状态重新翻成「DEPARTED」（绿）。做法：状态段按帧切换 text 与 at——更新帧之前用旧文案+旧 at（已定格），之后用新文案+at=更新帧（从空白重翻）。其余段落不许跟着重翻。

片尾：底部居中一行 17px 灰字「splitFlap · motion-primitives」。禁用：不要音效（翻牌声不许合成冒充）、不要渐变和投影、不要状态以外的第二种字体。`,
    notes: '回填条目：成片随 v0.56.0 发布（splitFlap 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。',
  },
  {
    id: 'portal-demo',
    title: 'Portal Demo — The Disc That Eats the Scene',
    blurb: 'A circular portal transition study: a white disc blooms from the left, swallows the navy title scene, holds one beat, then contracts to the right revealing the red scene — echo rings trail the rim.',
    video: 'videos/portal-demo.mp4',
    tags: ['transitions', 'portalWipe', '16:9', '6s'],
    rounds: '复现 prompt · shipped in v0.57',
    prompt:
`用 motion-primitives 做一条 6 秒的圆形 portal 转场展示片，composition 名 portal-demo，核心只用一个新原语 M.portalWipe。

规格：1280×720，30fps，180 帧，无声，硬切。两场：A 场深海军蓝 #101828（标题「PORTAL WIPE」800 96px 米白 + 等宽代码行 M.portalWipe(frame, { at, dur, x, y, x2, y2, echo })），B 场瑞士红 #E30613（标题「SCENE TWO」+ 小字「the portal is the transition」）。转场在第 60 帧、40 帧时长：白色圆盘从左侧 (220,360) 以 easeOutCubic 爆开吞掉 A 场，满覆盖停 6 帧，再以 cubicInOut 向右侧 (1060,360) 收缩，露出 B 场；盘后拖两圈 echo 回声环。关键：portal 颜色必须同时与 A、B 两场形成对比（白色），否则收缩阶段会隐形；把 A 场作为 html 传给原语——原语在展开期用 SVG mask 把 A 场裁到盘外、满覆盖后直接吞掉，B 场先画在底层。禁用：不许渐变转场、不许音效。
`,
    notes: '回填条目：成片随 v0.57.0 发布（portalWipe 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查抓出一处构图 bug：第一版转场盘用了红色——与 B 场同色导致收缩阶段隐形，改为白色后两阶段都可读。',
  },
  {
    id: 'rings-demo',
    title: 'Rings Demo — One Geometry, Three Tempers',
    blurb: 'A concentric-rings study: the same thin-ring geometry around one round-faced ball in three modes — an expanding pulse train on cream, a slow breathing set on blue, counter-rotating dashed arcs on ink.',
    video: 'videos/rings-demo.mp4',
    tags: ['ambience', 'rings', '16:9', '6s'],
    rounds: '复现 prompt · shipped in v0.58',
    prompt:
`用 motion-primitives 做一条 6 秒的同心圆环展示片，composition 名 rings-demo，核心只用一个新原语 M.rings。

规格：1280×720，30fps，180 帧，无声，三场硬切（不许渐变/叠化），按 STYLE.md 章节公式：一场一个概念，顶部居中大标题（英文 800 64px + 句号）+ 中文小字副题，底部居中深色胶囊代码条写本场确切调用。主角是同一颗圆脸球（半径 54，圆身 + 两眼 + 微笑弧，眼睛每 90 帧眨 4 帧），居中在 (640, 384)；圆环都从 r0=76 起（在球身外）、4 圈、gap=38、线宽 2。

第 1 场 Pulse.（0–59 帧，奶油底 #FBF6EC）：蓝球 #2F6DB3，圆环用同蓝、opacity 0.55、mode pulse、dur 84——一圈圈从球边往外推、边扩边淡，无限循环；副题「脉冲 · 一圈圈往外推」；代码条 M.rings(frame, { mode: 'pulse', dur: 84 })。
第 2 场 Breathe.（60–119 帧，蓝底 #2F6DB3）：奶油球，圆环奶油色、opacity 0.6、mode breathe——定住的四圈在原地慢胀慢缩，相位逐圈滞后，胀缩波从里往外走；副题「呼吸 · 原地慢慢胀缩」；代码条 M.rings(frame, { mode: 'breathe' })。
第 3 场 Spin.（120–179 帧，墨底 #26221F）：黄球 #FFD93D，圆环同黄、opacity 0.75、mode spin、dash 0.7——四圈断弧原地旋转，相邻圈反向、转速逐圈微增；副题「旋转 · 断弧反向转」；代码条 M.rings(frame, { mode: 'spin', dash: 0.7 })。

纪律：细线、低饱和、透明度做纵深，壳面保持素净（motionin.design 的安静框法）；每场只许一种环色，不许给环加发光/投影。禁用：音效、渐变背景、相机运动。
`,
    notes: '回填条目：成片随 v0.58.0 发布（rings 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（30 帧 pulse / 150 帧 spin）确认：环的透明度由内向外递减、spin 断弧缺口可读、三场构图与 STYLE.md 一致，一次过线。',
  },
  {
    id: 'mosaic-demo',
    title: 'Mosaic Demo — The Orderly Flip',
    blurb: 'A pixel-grid transition study: two flat scenes joined by a tile-by-tile flip — every tile shows scene A, turns at its hash-staggered moment, and lands on scene B, swelling briefly as it turns.',
    video: 'videos/mosaic-demo.mp4',
    tags: ['transition', 'mosaic', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.59',
    prompt:
`用 motion-primitives 做一条 5 秒的像素网格转场展示片，composition 名 mosaic-demo，核心只用一个新原语 M.mosaic。

规格：1280×720，30fps，150 帧，无声，两场硬切。A 场：墨底 #26221F，中央大字「MOSAIC」（96px，800 字重，奶油字 #FBF6EC，fadeUp 入场 10–28 帧），下方等宽代码条「M.mosaic(frame, { htmlA, htmlB, at, dur, cols, rows })」（26px，奶油字 0.7 透明度，fadeUp 22–40 帧）。B 场：蓝→青渐变底（120deg，#2F6DB3 → #57C7D4），中央大字「SCENE TWO」（96px，800，奶油），下方小字「every tile turned, the whole scene crossed over」（26px 等宽，奶油 0.8 透明度）。

转场在第 50 帧起、55 帧内完成：M.mosaic(frame, { htmlA: A场, htmlB: B场, at: 50, dur: 55, cols: 16, rows: 9, gap: 3, seed: 7 })，B 场先画在底层。16×9=144 块瓷砖，每块在自己的哈希时刻从 A 翻到 B、翻转瞬间膨胀 1.28 倍再回落——转场要读成「一格格翻过去」，不是整面糊过去。

纪律：瓷砖边距 gap=3 让网格可读，但不许加描边；两场文字排版完全同构（大字+小字居中），转场前后构图可比。禁用：音效、相机运动、渐变/叠化转场。
`,
    notes: '回填条目：成片随 v0.59.0 发布（mosaic 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（20 帧整场 A / 70 帧翻转中网格 / 110 帧整场 B）+ 成片 mp4 抽帧（55 / 70 / 85 / 100 帧）双保险确认：网格在翻转窗内逐格翻转、膨胀只出现在翻转瞬间、无残留 A 瓷砖，一次过线。',
  },
  {
    id: 'chapter-formula',
    title: 'Chapter Formula — The Explainer Skeleton, Codified',
    blurb: 'The house chapter formula as a film that labels itself while it runs: a 2-second hook, three 1.5-second chapters (one hero, one action, one label), a one-glance recap, and an outro card with a source line.',
    video: 'videos/chapter-formula.mp4',
    tags: ['formula', 'composition', '16:9', '9.5s'],
    rounds: '复现 prompt · shipped in v0.60',
    prompt:
`用 motion-primitives 做一条 9.5 秒的「章节公式」示范片，composition 名 chapter-formula。片子本身就是公式，边放边标注：钩子 0–2 秒只说一件事；随后三章、每章恰好 1.5 秒且只含一个主角 + 一个动作 + 一个标签；然后一屏回顾三章；最后片尾卡带出处行。

规格：1280×720，30fps，285 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F、蓝 #2F6DB3、黄 #FFD93D；主角是同一颗圆脸球（半径 54，圆身 + 两眼 + 微笑弧，每 90 帧眨眼 4 帧）。每章左上角 44px 章题（英文 + 中文小字），底部居中深色胶囊条写本章的公式角色。

分段：第 0–59 帧钩子——大标题「One idea per chapter.」+ 蓝球居中 pop 入场并 ripple 一圈，胶囊「hook 0–2s → chapters 1.5s → recap → outro」。第 60–104 帧第一章「01 · One hero」：黄球沿弧线从 (330,430) 飞到 (950,430)（arc 170，36 帧），同色黄色拖影跟随。第 105–149 帧第二章「02 · One action」：四根蓝柱（35/62/48/90）依次升起后定住。第 150–194 帧第三章「03 · One label」：大数字 countUp 到 90，下方一行小字「days in a row · 连续天数」。第 195–239 帧回顾：三张白卡片并排，分别装小黄球、静态小柱状图、大数字 90，卡下各标 01 hero / 02 action / 03 label。第 240–284 帧片尾：墨底卡，「Chapter Formula.」大字 + 公式一行 + 等宽出处行「codified from @guanmo_ai's Swiss-style chapter study · sweep 2026-10-22」。

纪律：一章只许一件事，多一个元素就是违规；拖影必须与主角同色；不许渐变/叠化、相机运动、音效。`,
    notes: '回填条目：成片随 v0.60.0 发布（Chapter formula 定式化，源自 2026-10-22 瑞士风 sweep 的 backlog 条目），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查 6 张（30/90/135/172/215/262）抓出一处穿帮——第一章拖影初版用蓝色、与黄球主角不同色，改为同色黄后复验通过；成片 mp4 抽帧（30/172/262）与静帧一致，ffprobe 285 帧 = durationInFrames。',
  },
  {
    id: 'spring-sheet',
    title: 'Spring Sheet — The Dock That Springs Open',
    blurb: 'A bottom-sheet UI study: a dock bar springs open with a damped bounce, four coloured icons pop in one by one as it opens, then the sheet collapses back to its dock — the whole film is one primitive call.',
    video: 'videos/spring-sheet.mp4',
    tags: ['interface', 'springSheet', '16:9', '6s'],
    rounds: '复现 prompt · shipped in v0.62',
    prompt:
`用 motion-primitives 做一条 6 秒的底部弹层展示片，composition 名 spring-sheet，核心只用一个新原语 M.springSheet。

规格：1280×720，30fps，180 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；顶部大标题「Spring Sheet.」（64px，800 字重）+ 副标题「dock → spring open → icons pop in → back to dock」（24px，灰字），标题下方居中深色胶囊代码条「M.springSheet(frame, { at, closeAt, icons, stagger })」（22px 等宽）——胶囊必须放在副标题下方、与片顶留出空隙，不许压住副标题。

片子只讲一件事：第 30 帧起底部 dock 条（高 72px，米色 #EDE8DC，居中字母间隔 6px 的「SHEET」字）以弹簧弹开成高 460px 的白片（宽 600px 居中，顶角圆角 28px，顶部一条拖拽把手），弹簧参数 stiffness 300 / damping 18——弹开要带一次可见的超调回落，不是匀速长高；4 颗彩色图标（★ 黄 #FFD93D、♪ 青 #57C7D4、♥ 粉 #FF6B81、● 绿 #4ED06A，64px 圆角方块）在片子弹开过程中每 5 帧逐个 pop 入场；第 140 帧起片子回落，收尾回到只有 dock 条的状态（回落不许跌破 dock 高）。

纪律：片子除标题、胶囊、片、dock 标签外不许加别的元素；图标入场必须错峰，不许齐刷刷出现；dock 标签全程钉在 dock 条内，不随片子伸缩移动。禁用：音效、相机运动、渐变背景。
`,
    notes: '回填条目：成片随 v0.62.0 发布（springSheet 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧仅 dock / 45 帧弹开中 3 图标 / 90 帧全开 4 图标）抓出一处穿帮——代码胶囊初版压住副标题，下移至 190px 后复验通过；成片 mp4 抽帧（90 帧）与静帧一致，ffprobe 180 帧 = durationInFrames。',
  },
  {
    id: 'slice-wave',
    title: 'Slice Wave — One Wave Passes Through',
    blurb: 'A whole scene cut into horizontal strips, crossed by a single travelling wave packet: strips near the front slide sideways on a sine field, the rest sit still, and once the wave has passed the scene is exactly as it was.',
    video: 'videos/slice-wave.mp4',
    tags: ['transition', 'sliceWave', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.63',
    prompt:
`用 motion-primitives 做一条 5 秒的切片波展示片，composition 名 slice-wave，核心只用一个新原语 M.sliceWave。

规格：1280×720，30fps，150 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；画面三条横贯色带（黄 #FFD93D 在 150px、青 #57C7D4 在 246px、粉 #FF6B81 在 420px，各高 54px）；中央大字「SLICE WAVE」（110px，800 字重，墨黑）+ 下方副标题「one wave passes through — the scene comes back whole」（26px 等宽，墨黑 65% 透明）；左下角一行等宽小字「M.sliceWave(frame, { at: 30, dur: 80, slices: 16 })」（22px，墨黑 55% 透明）全程静止、不参与波浪。

波浪只走一次：第 30 帧起、80 帧内，一个波前自上而下穿过整幅画面（slices 16、amp 42、waves 2、width 0.28）；波前附近的条带按正弦场横向滑动，离波前远的条带保持不动；波浪通过后画面恢复原样——第 10 帧与第 149 帧必须逐字节一致。

纪律：除色带、标题、副标题、左下角代码行外不许加别的元素；不许渐变背景、相机运动、音效；波浪参数不许改成常驻抖动——slitScan 的常驻正弦场是另一个原语。
`,
    notes: '回填条目：成片随 v0.63.0 发布（sliceWave 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧未扰动 / 70 帧波包穿过标题区、上下色带不动 / 149 帧与 10 帧逐字节一致）通过；成片 mp4 抽帧（70 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。实现中抓到一处真 bug：初版 transform 缺右括号、浏览器会丢弃位移，单测正则先拦住，修后重验通过。',
  },
  {
    id: 'speed-lines',
    title: 'Speed Lines — Fast, Then Impact',
    blurb: 'A dot dashes across the stage trailing a narrow cone of streaks behind it, then lands with a full radial burst — the anime speed-line panel, as one frame-pure primitive with two aiming modes.',
    video: 'videos/speed-lines.mp4',
    tags: ['motion', 'speedLines', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.65',
    prompt:
`用 motion-primitives 做一条 5 秒的速度线展示片，composition 名 speed-lines，核心只用一个新原语 M.speedLines。

规格：1280×720，30fps，150 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；画面上方一行大字「SPEED LINES」（64px，800 字重）全程静止；一颗粉色圆点（#FF6B81，半径 26）第 20 帧起、80 帧内从 (180,360) 直线飞到 (1060,360)；左下角一行等宽小字「M.speedLines(frame, { angle: 180, spread: 80 })」（22px，墨黑 55% 透明）全程静止；右上角一颗粉色圆点（#FF6B81，18px）点缀。

速度线分两段：第 20 帧起、90 帧内，圆点身后拖一条窄锥速度线（每帧以圆点当前位置为原点，angle 180、spread 80、gap 34、n 10、长度 30–110）；第 105 帧起、30 帧内，落点 (1060,360) 爆一圈全向速度线（spread 360、gap 44、n 20、长度 40–150）。两段窗口外速度线必须为空——第 10 帧与第 149 帧画面除圆点位置外干净无残线。

纪律：速度线必须是直条纹，不许用元素残影（那是 smear/trail 的活）或粒子点（那是 burst 的活）；除标题、圆点、两段速度线、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.65.0 发布（speedLines 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧无速度线 / 60 帧拖尾锥在圆点身后 / 120 帧落点放射 / 149 帧干净落定）通过；成片 mp4 抽帧（120 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。',
  },
  {
    id: 'letter-track',
    title: 'Letter Track — Spacing, Animated',
    blurb: 'A word arrives with its letters spread wide and settles into its resting spacing, then a second line squeezes out from tight spacing to prove the reverse direction — tracking animated as one unit, not letter by letter.',
    video: 'videos/letter-track.mp4',
    tags: ['text', 'letterTrack', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.64',
    prompt:
`用 motion-primitives 做一条 5 秒的字距动画展示片，composition 名 letter-track，核心只用一个新原语 M.letterTrack。

规格：1280×720，30fps，150 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；画面中央一行大字「TRACKING」（110px，800 字重），第 20 帧起、60 帧内字距从 32px 收束到 0；下方一行等宽小字「letter-spacing, animated」（28px，500 字重）第 90 帧起、40 帧内字距从 -4px 舒展到 2px，证明反方向；左下角一行等宽小字「M.letterTrack(frame, { at: 20, dur: 60, from: 32, to: 0 })」（22px，墨黑 55% 透明）全程静止；右上角一颗粉色圆点（#FF6B81，18px）点缀。

纪律：字距动画必须整词一体收束，不许逐字错峰——逐字入场是 splitText 的活；透明度与字距走同一条 easeOutCubic 曲线；除标题、副标题、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.64.0 发布（letterTrack 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧标题未出现 / 50 帧大字字距舒展中、副标题未出现 / 149 帧两行均落定）通过；成片 mp4 抽帧（50 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。',
  },
];
