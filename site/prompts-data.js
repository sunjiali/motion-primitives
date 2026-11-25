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
  {
    id: 'wave-text',
    title: 'Wave Text — The Sentence Itself Ripples',
    blurb: 'A sentence rides a travelling sine wave — each letter drifts on its own phase so the line itself ripples — while a second line bobs vertically, proving both axes of one primitive.',
    video: 'videos/wave-text.mp4',
    tags: ['text', 'waveText', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.66',
    prompt:
`用 motion-primitives 做一条 5 秒的波浪文字展示片，composition 名 wave-text，核心只用一个新原语 M.waveText。

规格：1280×720，30fps，150 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；画面上方一行大字「WAVE TEXT」（64px，800 字重）全程静止；中央一行大字「letters ride the wave」（84px，800 字重，居中于 640,360），每个字母在横向正弦场上漂移（amp 18、wl 6、speed 0.15）；下方一行小字「and bob up and down」（36px，500 字重，居中于 640,500），每个字母在纵向正弦场上起伏（amp 12、wl 5、speed 0.2、axis 'y'）；左下角一行等宽小字「M.waveText(frame, { amp: 18, wl: 6, speed: 0.15 })」（22px，墨黑 55% 透明）全程静止；右上角一颗粉色圆点（#FF6B81，18px）点缀。

纪律：波浪是常驻的行波、不是入场——字母没有进场窗口，整句从第 0 帧就在波上；两行分别证明横轴与纵轴；除标题、两行波浪字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.66.0 发布（waveText 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 / 60 / 120 / 149 帧波形相位各不相同、标题与代码行静止）通过；成片 mp4 抽帧（60 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮改用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 64 卡、waveText 卡在动、0 控制台报错。',
  },
  {
    id: 'shine',
    title: 'Shine — One Band of Light',
    blurb: 'A big word takes two shine sweeps — first horizontal, then diagonal — while a second line wears its own top-to-bottom sweep, proving one primitive across three angles.',
    video: 'videos/shine.mp4',
    tags: ['fx', 'shine', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.68',
    prompt:
`用 motion-primitives 做一条 5 秒的光带展示片，composition 名 shine，核心只用一个新原语 M.shine。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「SHINE」（64px，800 字重）全程静止；中央一行大字「SHINE」（120px，800 字重，珊瑚色，居中于 640,330），先在 20–50 帧吃一次横向光带扫过（amount 0.9、angle 0），再在 90–120 帧吃一次对角光带（amount 0.9、angle 45），两次扫过嵌套调用、窗口外原样返回；下方一行小字「one band of light, two directions」（36px，500 字重，奶油色，居中于 640,500），在 60–90 帧吃一次自上而下的光带（amount 0.7、angle 90）；左下角一行等宽小字「M.shine(frame, { angle: 0, width: 0.3 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：光带是单条移动的高光、不是闪光——不许全屏闪白、不许颗粒噪点；光带在窗口首尾帧完全出画、画面干净；干净内容始终居中、只有一条亮带沿 angle 方向扫过；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.68.0 发布（shine 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧画面干净 / 35 帧竖直亮带居中、珊瑚字被扫过处变淡 / 75 帧横向亮带居中、扫过处字变淡 / 105 帧对角亮带清晰 / 149 帧落定）通过；成片 mp4 抽帧（35 / 105 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 66 卡、shine 卡在动（6 秒采样 5 个不同画面状态、亮带实际渲染）、0 控制台报错。',
  },
  {
    id: 'frost',
    title: 'Frost — Out of the Glass',
    blurb: 'A big word clears out of frosted glass, sinks back behind it, and clears again, while a second line clears on its own knobs — proving both directions of one primitive.',
    video: 'videos/frost.mp4',
    tags: ['fx', 'frost', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.69',
    prompt:
`用 motion-primitives 做一条 5 秒的磨砂玻璃展示片，composition 名 frost，核心只用一个新原语 M.frost。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「FROST」（64px，800 字重）全程静止；中央一行大字「FROST」（120px，800 字重，珊瑚色，居中于 640,330），开场即在磨砂玻璃后（from 16），0–40 帧化开变清晰，80–110 帧再沉回玻璃后（from 0、to 16、fn linear），110–140 帧第二次化开，三段嵌套调用、沉与化在 110 帧以同一模糊半径衔接、不许跳帧；下方一行小字「from frosted glass, into focus」（36px，500 字重，奶油色，居中于 640,500），0–30 帧从更深的磨砂（from 24、fn linear）化开；左下角一行等宽小字「M.frost(frame, { from: 16, to: 0 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：模糊是内容本身的磨砂、不是镜头虚化——不许相机运动、不许颗粒噪点；窗口外内容原样返回；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、音效。
`,
    notes: '回填条目：成片随 v0.69.0 发布（frost 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧双行皆磨砂 / 95 帧主词沉回约 8px、小字清晰 / 125 帧主词二次化开微糊 / 149 帧全片落定清晰）通过；成片 mp4 抽帧（0 / 95 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 67 卡、frost 卡在动（6 秒采样模糊半径 10.42 → 6.66 → 0.67，窗口外无滤镜）、0 控制台报错。',
  },
  {
    id: 'domino',
    title: 'Domino — One Falls, the Next Follows',
    blurb: 'A row of cream tiles stands across the hero word and topples left to right, uncovering DOMINO as the wave passes, while a second reversed wave in coral reveals the sub-line — proving the chain timing and the band geometry of one primitive.',
    video: 'videos/domino.mp4',
    tags: ['reveal', 'domino', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.70',
    prompt:
`用 motion-primitives 做一条 5 秒的多米诺揭示展示片，composition 名 domino，核心只用一个新原语 M.dominoReveal。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「DOMINO」（64px，800 字重）全程静止；中央一行大字「DOMINO」（120px，800 字重，珊瑚色，居中于 640,330），10–70 帧被一排 12 块奶油色骨牌揭示（count 12、fall 12、fade 10，骨牌带 x 0、y 240、w 1280、h 180，只盖住这一行字）；下方一行小字「one falls, the next follows」（36px，500 字重，奶油色，居中于 640,500），85–130 帧被一排 10 块珊瑚色骨牌从右向左揭示（dir left、count 10、fall 10、fade 8，骨牌带 x 0、y 460、w 1280、h 80）；左下角一行等宽小字「M.dominoReveal(frame, { count: 12, fall: 12 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：骨牌是站立的色块、不是描边框——倒下时绕底边旋转约 90°、落定后淡出，不许残留色块盖住文字；两排骨牌只盖各自的字行，标题与代码行全程干净；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.70.0 发布（dominoReveal 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧两排骨牌站立、标题干净 / 30 帧主词波前斜切、已倒骨牌叠成淡灰色堆 / 70 帧主词全露、小字行珊瑚带站立 / 110 帧小字行自右向左揭示中 / 149 帧全片落定）通过；成片 mp4 抽帧（30 / 110 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 68 卡、dominoReveal 卡在动、0 控制台报错。',
  },
  {
    id: 'iris',
    title: 'Iris — A Circle Opens, the Scene Arrives',
    blurb: 'The hero word arrives through a camera iris opening from the stage centre, the sub-line through a second iris opening from the bottom-left corner, and the whole stage irises out to a dot — proving the aperture, origin and feather knobs of one primitive.',
    video: 'videos/iris.mp4',
    tags: ['reveal', 'iris', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.71',
    prompt:
`用 motion-primitives 做一条 5 秒的圆形光圈揭示展示片，composition 名 iris，核心只用一个新原语 M.iris。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「IRIS」（64px，800 字重）全程静止；中央一行大字「IRIS」（120px，800 字重，珊瑚色，居中于 640,330），10–60 帧被一个从画面中心张开的光圈揭示（feather 24，边缘柔化）；下方一行小字「a circle opens, the scene arrives」（36px，500 字重，奶油色，居中于 640,500），75–120 帧被第二个光圈从左下角揭示（圆心 x 140、y 640，feather 16）；左下角一行等宽小字「M.iris(frame, { mode: 'open', feather: 24 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀；110–150 帧整个画面以 mode close 向中心收成一个点（feather 12），经典电影 iris-out 收尾。

纪律：光圈是内容本身的圆形裁剪、不是不透明圆盘盖住画面——揭示时画面从圆心向外出现、收尾时向圆心收拢；两个揭示窗口的圆心不同，要读出是两次独立开合；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.71.0 发布（iris 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧只有标题、主词未出 / 35 帧主词已开 / 60 帧主词全露、小字未出 / 95 帧小字自左下角揭示中 / 130 帧收尾光圈已裁掉四角、代码行左端被裁 / 149 帧只剩中心一点带柔边的主词残影）通过；成片 mp4 抽帧（35 / 130 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 69 卡、iris 卡在动（实测遮罩半径 283.5px、羽化带 271.5–283.5px；无头 shell 下 rAF 只在 BeginFrame 前进，连续截图可能重复，改以截图哈希变化确认卡片在动）、0 控制台报错。',
  },
  {
    id: 'dotText',
    title: 'Dot Text — The Poster Prints Itself, One Dot at a Time',
    blurb: 'The hero word prints itself dot by dot in coral, the second line follows in cream, and a small third line breathes for the whole film — three rows of halftone letterforms proving the in and pulse modes of one primitive.',
    video: 'videos/dot-text.mp4',
    tags: ['text', 'halftone', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.72',
    prompt:
`用 motion-primitives 做一条 5 秒的半调圆点字展示片，composition 名 dot-text，核心只用一个新原语 M.dotText。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81、天蓝字 #3FB6FF；画面上方一行大字「DOT TEXT」（64px，800 字重）全程静止；中央第一行大字「DOT」（150px，800 字重，珊瑚色，居中于 640,285），10–55 帧以 mode in、gap 16 从圆点逐个长出；第二行大字「TEXT」（150px，800 字重，奶油色，居中于 640,440），60–105 帧同样以 mode in、gap 16 长出；第三行小字「printed, one dot at a time」（34px，500 字重，天蓝色，居中于 640,580），全程以 mode pulse、gap 10、dot 0.45、speed 40 呼吸；左下角一行等宽小字「M.dotText(frame, { mode: 'in', gap: 16 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：字形必须是圆点场、不是实心字——圆点网格被文字形状裁剪，字外无点；in 模式的圆点按哈希错峰长出，要读出「印刷显影」的先后而不是整字淡入；pulse 行从第 0 帧就一直在呼吸；除标题、三行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.72.0 发布（dotText 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧只有标题与呼吸小字、两行大字未出 / 30 帧 DOT 长出一半、圆点大小不一 / 55 帧 DOT 全露、TEXT 未出 / 85 帧 TEXT 长出一半 / 105 帧两行全露、小字呼吸中 / 149 帧全片落定）通过；成片 mp4 抽帧（30 / 85 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 70 卡、dotText 卡在动、0 控制台报错。',
  },
  {
    id: 'clockWipe',
    title: 'Clock Wipe — A Hand Sweeps, the Scene Arrives',
    blurb: 'The hero word is swept in clockwise from 12 o\'clock, the sub-line counter-clockwise from the bottom-left corner, and the whole stage winds away at the end — proving the sector, direction and origin knobs of one primitive.',
    video: 'videos/clock-wipe.mp4',
    tags: ['reveal', 'clock', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.73',
    prompt:
`用 motion-primitives 做一条 5 秒的时钟扇形揭示展示片，composition 名 clock-wipe，核心只用一个新原语 M.clockWipe。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「CLOCK WIPE」（64px，800 字重）全程静止；中央一行大字「CLOCK」（120px，800 字重，珊瑚色，居中于 640,330），10–60 帧被一个从 12 点方向顺时针扫过的扇形揭示（默认 start 0、dir cw）；下方一行小字「a hand sweeps, the scene arrives」（36px，500 字重，奶油色，居中于 640,500），75–120 帧被第二个扇形从左下角逆时针揭示（圆心 x 140、y 640，dir ccw）；左下角一行等宽小字「M.clockWipe(frame, { dir: 'cw' })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀；110–150 帧整个画面以 mode close 顺时针收成一条细缝（收尾时只剩顶部一条窄扇形残影），经典时钟收尾。

纪律：揭示是内容本身的扇形裁剪、不是不透明扇形盖住画面——扇形边缘是一条从圆心出发的直线，扫过之处内容出现、收尾时内容沿同一条线收走；两次揭示的圆心与方向不同，要读出是两次独立扫动；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.73.0 发布（clockWipe 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧只有标题、主词未出 / 25 帧主词顺时针扫出一半、左半缺失、右半在 / 60 帧主词全露、小字未出 / 95 帧小字自左下角逆时针揭示中、左端沿斜线裁切 / 130 帧收尾扇形已裁掉左上象限、主词 O 字带斜切口 / 149 帧只剩顶部一条窄扇形残影）通过；成片 mp4 抽帧（25 / 130 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 71 卡、clockWipe 卡在动、0 控制台报错。',
  },
  {
    id: 'textWarp',
    title: 'Text Warp — Letters Flow Like Water',
    blurb: 'The hero word rides a breathing arch while the sub-line flows on mirrored ripples outward from its centre — two live deformation fields, one primitive.',
    video: 'videos/text-warp.mp4',
    tags: ['text', 'warp', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.74',
    prompt:
`用 motion-primitives 做一条 5 秒的场变形动态文字展示片，composition 名 text-warp，核心只用一个新原语 M.textWarp。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「TEXT WARP」（64px，800 字重）全程静止；中央一行大字「WARP」（150px，800 字重，珊瑚色，居中于 640,330），骑在一条缓慢呼吸的拱形场上（field arch、amp 55、speed 0.08）；下方一行小字「letters flow like water」（36px，500 字重，奶油色，居中于 640,500），踩在镜像涟漪场上向两侧流动（field ripple、amp 10、wl 10、speed 0.12）；左下角一行等宽小字「M.textWarp(frame, { field: 'arch' })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：字是沿着变形场逐字排布、按场切线旋转的——不是整行平移也不是逐字淡入；拱形要读出中央高、两端低的抛物线，两侧字母向外倾斜；涟漪要读出以行中为界向两侧镜像流动、波峰处字母放平；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.74.0 发布（textWarp 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧 WARP 拱形完整、涟漪行清晰可读 / 75 帧拱形呼吸、涟漪反向倾斜）通过；首版涟漪参数 amp 16 / wl 6 在静帧上被抓到字母互叠，改 amp 10 / wl 10 后重验通过；成片 mp4 抽帧（30 / 120 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 72 卡、textWarp 卡在动、0 控制台报错。',
  },
  {
    id: 'varFont',
    title: 'Var Font — The Weight-and-Width Wave',
    blurb: 'The hero word breathes weight and width on one travelling sine — no keyframes, no transforms — while the sub-line rides a gentler wave on the same field, proving the letterforms themselves are the animation.',
    video: 'videos/var-font.mp4',
    tags: ['text', 'variable-font', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.76',
    prompt:
`用 motion-primitives 做一条 5 秒的可变字体动效展示片，composition 名 var-font，核心只用一个新原语 M.varFont。\n\n规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「VAR FONT」（64px，800 字重，系统字体）全程静止；中央一行大字「FLEX」（150px，珊瑚色，居中于 640,330），用 Roboto Flex 可变字体、字重在 150–1000、字宽在 60–145 之间随正弦波逐字流动（wl 4、speed 0.12），粗配窄、细配宽；下方一行小字「weight & width ride one wave」（36px，奶油色，居中于 640,500），同一原语、更温和的波幅（字重 300–800、字宽 80–125、wl 6、speed 0.1）；左下角一行等宽小字「M.varFont(frame, { wght: [100, 900] })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。\n\n纪律：动效只能来自 font-variation-settings 的 wght/wdth 轴——不许位移、不许缩放、不许旋转字母；同一帧里四个字母的字重必须各不相同、波峰处的字母最粗最窄、波谷处最细最宽；标题始终是静态系统字体、与可变字形成对照，证明变化来自字体轴不是字重切换；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。\n`,
    notes: '回填条目：成片随 v0.76.0 发布（varFont 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧 F/L 粗、X 极细 / 37 帧波形移位、E 极细 / 75 帧 F/L 细、E/X 粗 / 149 帧波形再移）通过；成片 mp4 抽帧（30 / 120 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 74 卡、varFont 卡在动、0 控制台报错。',
  },
  {
    id: 'edgeBoil',
    title: 'Edge Boil — The Hand-Drawn Wobble',
    blurb: 'The hero word shivers on a sustained turbulence boil while the sub-line boils only inside a window, against a title that stays perfectly still — the contrast proves the wobble is the filter, not a camera move.',
    video: 'videos/edge-boil.mp4',
    tags: ['fx', 'boil', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.75',
    prompt:
`用 motion-primitives 做一条 5 秒的手绘沸腾线展示片，composition 名 edge-boil，核心只用一个新原语 M.edgeBoil。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「EDGE BOIL」（64px，800 字重）全程静止、始终干净；中央一行大字「BOIL」（150px，800 字重，珊瑚色，居中于 640,330），全程挂持续沸腾（amp 5、freq 0.025、step 4）；下方一行小字「outlines redrawn 8× a second」（36px，500 字重，奶油色，居中于 640,500），只在 45–105 帧吃窗口沸腾（amp 6、freq 0.03，窗口边缘 4 帧平滑淡入淡出）；左下角一行等宽小字「M.edgeBoil(frame, { amp: 5, step: 4 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀。

纪律：沸腾是 SVG 湍流位移滤镜——字形边缘要有手绘抖动、不是整字平移也不是缩放呼吸；湍流种子每 4 帧重 roll 一次（30fps 下约每秒换 8 次形），相邻静帧的字形抖动形状必须不同；标题始终干净、与沸腾的字形成对照，证明抖动是滤镜不是相机运动；窗口外的小字原样返回、干净无抖动；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.75.0 发布（edgeBoil 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧 hero 沸腾、小字干净 / 75 帧 hero 与小字双沸腾、种子形状与 0 帧不同 / 105 帧窗口关闭小字干净、hero 仍沸腾 / 149 帧 hero 沸腾、小字干净）通过；成片 mp4 抽帧（30 / 120 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 73 卡、edgeBoil 卡在动、0 控制台报错。',
  },
  {
    id: 'chroma',
    title: 'Chroma — The Cheap-Lens Grade',
    blurb: 'A big word takes two RGB-fringe spikes — first horizontal, then vertical — while a second line wears the sustain grade for the whole film, proving both modes of one primitive.',
    video: 'videos/chroma.mp4',
    tags: ['fx', 'chroma', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.67',
    prompt:
`用 motion-primitives 做一条 5 秒的色差展示片，composition 名 chroma，核心只用一个新原语 M.chroma。

规格：1280×720，30fps，150 帧，无声，全程硬切。奶油底 #FBF6EC、墨字 #26221F；画面上方一行大字「CHROMA」（64px，800 字重）全程静止；中央一行大字「PRISM」（120px，800 字重，居中于 640,330），先在 20–50 帧吃一次横向色差脉冲（amount 12、angle 0），再在 90–120 帧吃一次纵向色差脉冲（amount 12、angle 90），两次脉冲嵌套调用、窗口外原样返回；下方一行小字「sustain grade, always on」（36px，500 字重，居中于 640,500），全程挂 sustain 模式色差（amount 4），带缓慢呼吸起伏；左下角一行等宽小字「M.chroma(frame, { amount: 12, mode: 'pulse' })」（22px，墨黑 55% 透明）全程静止；右上角一颗粉色圆点（#FF6B81，18px）点缀。

纪律：色差是平滑连续的 RGB 边缘、不是 glitch——不许切片、不许抖动重 roll；干净内容始终居中、只有红青两个通道鬼影沿 angle 方向分开；脉冲窗口外内容原样返回；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、音效。
`,
    notes: '回填条目：成片随 v0.67.0 发布（chroma 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（10 帧大字干净 / 35 帧横向红青边缘清晰 / 75 帧大字干净、小字带常驻边缘 / 105 帧纵向边缘清晰 / 149 帧落定）通过；成片 mp4 抽帧（35 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 65 卡、chroma 卡在动、0 控制台报错。',
  },
  {
    id: 'tvOff',
    title: 'TV Off — The CRT Sign-Off',
    blurb: 'The hero word squashes into a glowing line and pinches to a phosphor dot, the sub-line powers back on dot → line → full, and the whole stage dies to black — the tube-TV sign-off in one primitive.',
    video: 'videos/tv-off.mp4',
    tags: ['reveal', 'tvOff', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.77',
    prompt:
`用 motion-primitives 做一条 5 秒的 CRT 关机展示片，composition 名 tv-off，核心只用一个新原语 M.tvOff。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「TV OFF」（64px，800 字重，奶油色）全程静止；中央一行大字「TV OFF」（120px，800 字重，珊瑚色，居中于 640,330），在 10–40 帧关机（mode 'off'、glow 珊瑚色）——先纵向压扁成一条发光横线、再横向收成一个荧光点、然后消失；下方一行小字「the tube dies to a dot」（36px，500 字重，奶油色，居中于 640,500），在 55–90 帧开机（mode 'on'）——从一个点张开成线、再长满全字；左下角一行等宽小字「M.tvOff(frame, { mode: 'off' })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀；110–150 帧整屏再关一次机（mode 'off'），片尾落黑。

纪律：关机是真压扁——字形纵向 scaleY 收缩、不是淡出也不是遮罩裁切；压到线时必须有一条横贯全屏的发光线（box-shadow 辉光），收点时光线随字形一起横向收缩、最后四分之一帧内熄灭成点；开机是关机的严格镜像（点→线→满字）；窗口外内容原样返回；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.77.0 发布（tvOff 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧 hero 完整 / 20 帧 hero 纵向压扁约 17% / 25 帧 hero 压成珊瑚辉光线 / 40 帧 hero 已消失、标题干净 / 70 帧小字开机中、一条白色辉光线横贯 500 像素线 / 90 帧小字完整 / 125 帧整屏压扁约 24% / 149 帧整屏收成中心荧光短线、下一帧落黑）通过；成片 mp4 抽帧（25 / 70 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 75 卡、tvOff 卡在动、0 控制台报错。',
  },
  {
    id: 'venetianBlinds',
    title: 'Venetian Blinds — Eight Slats, One Wipe',
    blurb: 'The hero word arrives in eight simultaneous slats, the sub-line wipes in top-down on twelve, and the whole stage closes behind blinds at the end — one primitive, both directions.',
    video: 'videos/venetian-blinds.mp4',
    tags: ['reveal', 'venetianBlinds', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.78',
    prompt:
`用 motion-primitives 做一条 5 秒的百叶窗转场展示片，composition 名 venetian-blinds，核心只用一个新原语 M.venetianBlinds。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「VENETIAN BLINDS」（64px，800 字重，奶油色）全程静止；中央一行大字「BLINDS」（120px，800 字重，珊瑚色，居中于 640,330），在 10–40 帧以百叶窗方式入场（slats 8、默认 centre 方向）——画面被切成 8 条等高横条，每条同时从中线向上下张开、字从条缝里长出来；下方一行小字「eight slats, one wipe」（36px，500 字重，奶油色，居中于 640,500），在 55–85 帧入场（slats 12、dir 'down'）——每条从顶边向下展开；左下角一行等宽小字「M.venetianBlinds(frame, { slats: 8 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀；110–150 帧整屏再以百叶窗关一次（mode 'out'、slats 8），片尾只剩条缝、落黑。

纪律：百叶窗是真分条——每条是内容的裁切窗口、不是遮罩色块；8 条同时开合、不许逐条错峰（错峰是 dominoReveal 的活）；centre 方向每条从中线向两边张开、down 方向从顶边向下长；窗口外内容原样返回；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.78.0 发布（venetianBlinds 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧只有标题、hero 未入场 / 25 帧 hero 开合中、8 条缝清晰可见 / 40 帧 hero 完整 / 70 帧小字已完整（cubicOut 快、12 条缝内已长满）/ 100 帧全部落定 / 125 帧整屏关合中、标题与 hero 都带条缝 / 149 帧只剩 hero、小字、代码行与圆点的细缝、下一帧落黑）通过；成片 mp4 抽帧（25 / 70 帧）与静帧一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 76 卡、venetianBlinds 卡在动、0 控制台报错。',
  },
  {
    id: 'shatter',
    title: 'Shatter — Tiles Fly, Gravity Wins',
    blurb: 'The hero word bursts apart on square tiles, the sub-line shatters on brickwork, and the rest of the stage closes on triangles — one primitive, three patterns, gravity doing the cleanup.',
    video: 'videos/shatter.mp4',
    tags: ['transition', 'shatter', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.79',
    prompt:
`用 motion-primitives 做一条 5 秒的碎裂转场展示片，composition 名 shatter，核心只用一个新原语 M.shatter。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「SHATTER」（64px，800 字重，奶油色）全程静止；中央一行大字「SHATTER」（120px，800 字重，珊瑚色，居中于 640,330），在 10–50 帧碎裂消失（square、strength 300、gravity 300、力心在字中心 640,330）——字被切成 12×8 的瓦片、每片带旋转向外飞、下落加速、最后淡去；下方一行小字「tiles fly, gravity wins」（36px，500 字重，奶油色，居中于 640,500），在 60–100 帧碎裂（pattern 'bricks'、strength 260、gravity 260、力心 640,500）——奇数行错开半格、砖缝里飞出字块；左下角一行等宽小字「M.shatter(frame, { strength: 300 })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）点缀；110–150 帧整屏再碎一次（pattern 'triangle'、strength 380、gravity 320）——只碎当时还留在屏上的标题、代码行与圆点（hero 与小字已消失、不许复活），片尾只剩淡去的三角残片、落黑。

纪律：碎裂是真分瓦——每片是内容的裁切窗口、不是色块；每片在窗口前 35% 内哈希错峰起飞、飞满整个窗口才淡去，读起来是一次冲击、不是波浪；飞行动画带旋转、重力是 t² 下落（直线下坠不算）；窗口外内容原样返回、窗口结束内容彻底消失；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.79.0 发布（shatter 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧标题、hero、小字、代码行、圆点齐全 / 30 帧 hero 碎裂中、瓦片带旋转向外飞散、中间已空、小字完好 / 50 帧 hero 已消失、小字完整 / 80 帧小字砖缝碎裂中、字块旋转飞散 / 130 帧整屏三角碎片已飞散、只剩标题字母的细小残片 / 149 帧三角残片淡去中、下一帧落黑）通过；成片 mp4 抽帧（30 / 80 帧）与静帧逐像素一致，ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 77 卡、shatter 卡在动（砖缝窗口内 100 片瓦片、两次采样 HTML 长度 42849→43383 在变）、0 控制台报错。',
  },
  {
    id: 'flicker',
    title: 'Flicker — Broken, Then Burning',
    blurb: 'The hero word stutters on like a neon sign finding its current, the sub-line is a broken tube that never settles, and the corner dot blinks on a square wave — one primitive, three ways to misbehave.',
    video: 'videos/flicker.mp4',
    tags: ['fx', 'flicker', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.80',
    prompt:
`用 motion-primitives 做一条 5 秒的霓虹灯闪烁展示片，composition 名 flicker，核心只用一个新原语 M.flicker。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「FLICKER」（64px，800 字重，奶油色）全程静止；中央一行大字「NEON」（120px，800 字重，珊瑚色，居中于 640,330），在 10–55 帧以霓虹灯点亮方式入场（mode 'on'、dur 45、glow #FF2E88）——字先是短促闪烁、亮灭间隔逐渐拉长、最后稳定亮起并带粉色光晕；下方一行小字「broken, then burning」（36px，500 字重，奶油色，居中于 640,500），在 60 帧起以坏掉的霓虹灯方式闪烁（mode 'sustain'、glow #FFD166）——全程随机亮灭、永不稳定；左下角一行等宽小字「M.flicker(frame, { mode: 'on' })」（22px，奶油 55% 透明）全程静止；右上角一颗奶油圆点（#FBF6EC，18px）以方波闪烁（mode 'blink'、rate 12）全程点缀。

纪律：闪烁是真亮灭——亮帧带双层光晕（紧贴的亮核 + 宽幅柔光）、灭帧只剩暗管或彻底消失，不许用透明度渐变冒充闪烁；'on' 模式的灭帧概率随窗口推进二次方衰减、窗口结束必须稳稳亮着；'sustain' 模式永不稳定、灭帧概率恒定；'blink' 模式是干净方波、6 帧亮 6 帧灭；除标题、两行字、左下角代码行、右上角圆点外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.80.0 发布（flicker 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧标题、代码行、圆点亮、hero 与小字未亮 / 14 帧 hero 早闪亮起、圆点亮 / 20 帧 hero 灭帧、圆点灭 / 24 帧 hero 亮帧带粉色光晕、圆点亮 / 55 帧 hero 稳定亮起、小字未到、圆点灭 / 70 帧 hero 稳定、小字琥珀色亮起、圆点灭 / 80 与 149 帧小字恰逢灭帧、与 55 帧画面一致——节点核对 sub 在 60–149 帧亮 52 帧、hero 亮帧由稀疏短闪 10/11/14/15 渐变为 38 帧后全亮，确认为采样巧合非渲染故障）通过；成片 mp4 抽帧（24 / 70 帧）与静帧像素比对均值通道差 1.65/1.66（H.264 压缩噪声级），ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 78 卡、flicker 卡滚动入视后在动（两次采样 HTML 长度 227→509）、hover 重播复位（NEON 回到灭帧）、0 控制台报错。',
  },
  {
    id: 'echo',
    title: 'Echo — One Voice, Many Ghosts',
    blurb: 'The hero word stretches a train of fading ghosts out to the right, the sub-line trails its copies downward, and the title collapses its own echoes back into itself at the end — one primitive, three modes.',
    video: 'videos/echo.mp4',
    tags: ['fx', 'echo', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.81',
    prompt:
`用 motion-primitives 做一条 5 秒的回声残影展示片，composition 名 echo，核心只用一个新原语 M.echo。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「ECHO」（64px，800 字重，奶油色）全程在位，110–150 帧以 'out' 模式把自己的残影收回（echoes 6、step 10、angle 0、decay 0.8）——开场标题带一串向右的残影、结尾收回成干净的字；中央一行大字「ECHO」（120px，800 字重，珊瑚色，居中于 640,330），在 10–55 帧以 'in' 模式向右伸出残影列（echoes 10、step 16、angle 0、decay 0.82）——残影从字身里滑出、越远越淡、最远一枚只剩约 14% 透明度；下方一行小字「one voice, many ghosts」（36px，500 字重，奶油色，居中于 640,500），在 60–100 帧以 'in' 模式向下拖出残影（echoes 8、step 10、angle 90、decay 0.78）——字向下叠出 8 枚渐淡的影子；左下角一行等宽小字「M.echo(frame, { echoes: 10 })」（22px，奶油 55% 透明）全程静止。

纪律：残影是真复制——每枚残影是原内容的完整拷贝、沿同一角度等距排布、透明度按 decay 的幂次衰减，原字永远在最上层满透明度；'in' 模式窗口前内容原样返回、窗口结束残影列完整站立；'out' 模式窗口前残影列完整站立、窗口结束内容干净；除标题、两行字、左下角代码行外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.81.0 发布（echo 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧标题带完整残影列、hero 与小字干净、代码行在位 / 20 帧 hero 残影列伸出一半、向右渐淡 / 55 帧 hero 残影列完整、10 枚向右、最远一枚约 14% / 80 帧小字向下拖出 8 枚渐淡残影 / 130 帧标题残影收回过半、只剩淡淡重影 / 149 帧标题干净、hero 与小字残影列完整站立）通过；成片 mp4 抽帧（20 / 80 帧）与静帧像素比对均值通道差 1.77/1.83（H.264 压缩噪声级），ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 79 卡、echo 卡滚动入视后在动（两次采样 HTML 长度 549→4306、字符串变化）、hover 重播复位（回到干净开场、无残影、长度 549）、0 控制台报错。',
  },
  {
    id: 'fisheye',
    title: 'Fisheye — Bent Light, Flat Edges',
    blurb: 'The hero word bends into the lens, the sub-line shows the pincushion mirror, and the title unbends back to flat at the end — one primitive, three modes.',
    video: 'videos/fisheye.mp4',
    tags: ['fx', 'fisheye', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.82',
    prompt:
`用 motion-primitives 做一条 5 秒的鱼眼镜头畸变展示片，composition 名 fisheye，核心只用一个新原语 M.fisheye。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「FISHEYE」（64px，800 字重，奶油色）全程在位，110–150 帧以 'out' 模式从弯曲中回正（strength 0.6）——开场标题是拱起的鱼眼字、结尾收回成干净平直的字；中央一行大字「LENS」（120px，800 字重，珊瑚色，居中于 640,330），在 10–55 帧以 'in' 模式弯进镜头（strength 0.6）——字从平直渐变为中央凸起、边缘收拢的鱼眼弯曲；下方一行小字「bent light, flat edges」（36px，500 字重，奶油色，居中于 640,500），在 60–100 帧以 'in' 模式展示反向的枕形畸变（strength -0.6）——字向中心收缩、呈枕形；左下角一行等宽小字「M.fisheye(frame, { strength: 0.6 })」（22px，奶油 55% 透明）全程静止。

纪律：畸变是真径向位移——输出像素按半径采样源像素、中心凸起边缘收拢，不是缩放或斜切冒充；'in' 模式窗口前内容原样返回、窗口结束完整弯曲站立；'out' 模式窗口前完整弯曲、窗口结束内容平直；负 strength 是枕形收缩、不是反向模糊；除标题、两行字、左下角代码行外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.82.0 发布（fisheye 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧标题全弯、hero 与小字平直、代码行在位 / 30 帧 hero 弯曲约 0.83 倍、标题仍弯 / 55 帧 hero 完整弯曲 / 80 帧小字枕形收缩过半 / 100 帧小字完整枕形 / 130 帧标题基本回正、只剩轻微拱起 / 149 帧标题平直、hero 弯曲、小字收缩）通过；成片 mp4 抽帧（30 / 80 帧）与静帧像素比对均值通道差 1.26/2.07 与 1.24/1.98（H.264 压缩噪声级），ffprobe 150 帧 = durationInFrames。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡也在同一浏览器里验证为 80 卡、fisheye 卡滚动入视后在动（两次采样 HTML 长度 547→117653）、hover 重播复位（回到干净开场、长度 547）、0 控制台报错。研发手记：验证静帧曾抓到 filter id 碰撞——同几何不同弯曲量的两个 fisheye 共用一个 filter id，浏览器按首个定义解析，导致 30 帧按 55 帧的满弯曲渲染；已修为 id 内含当前 scale 并补回归单测。',
  },
  {
    id: 'wavewarp',
    title: 'WaveWarp — Sine in the Picture',
    blurb: 'The hero word ripples into a travelling sine wave, the sub-line shows the horizontal mirror, and the title unwraps back to flat at the end — one primitive, three modes.',
    video: 'videos/wavewarp.mp4',
    tags: ['fx', 'wavewarp', '16:9', '5s'],
    rounds: '复现 prompt · shipped in v0.83',
    prompt:
`用 motion-primitives 做一条 5 秒的正弦波浪畸变展示片，composition 名 wavewarp，核心只用一个新原语 M.waveWarp。

规格：1280×720，30fps，150 帧，无声，全程硬切。深墨底 #26221F、奶油字 #FBF6EC、珊瑚字 #FF6B81；画面上方一行大字「WAVEWARP」（64px，800 字重，奶油色）全程在位，110–150 帧以 'out' 模式从波浪中回正（angle 0, wl 160, amp 24）——开场标题是起伏的波浪字、结尾收回成干净平直的字；中央一行大字「WAVE」（120px，800 字重，珊瑚色，居中于 640,330），在 10–55 帧以 'in' 模式弯进波浪（angle 0, wl 160, amp 24, speed 0.12）——字从平直渐变为上下起伏的正弦波浪；下方一行小字「sine in the picture, not slices」（36px，500 字重，奶油色，居中于 640,500），在 60–100 帧以 'in' 模式展示横向波浪（angle 90, wl 160, amp 24）——字左右起伏；左下角一行等宽小字「M.waveWarp(frame, { angle: 0, wl: 160, amp: 24 })」（22px，奶油 55% 透明）全程静止。

纪律：波浪是真连续位移——输出像素沿正弦场采样源像素、不是切片平移冒充；'in' 模式窗口前内容原样返回、窗口结束完整波浪站立且相位继续滚动；'out' 模式窗口前完整波浪、窗口结束内容平直；angle 90 是横向波浪、不是纵向波浪旋转 90 度冒充；除标题、两行字、左下角代码行外不许加别的元素；不许渐变背景、相机运动、颗粒噪点、音效。
`,
    notes: '回填条目：成片随 v0.83.0 发布（waveWarp 原语首发配套 composition），本 prompt 按已上线源码逐段转写，标注「复现 prompt」。静帧审查（0 帧标题全波、hero 与小字平直、代码行在位 / 30 帧 hero 波浪约 0.83 倍、标题仍波 / 55 帧 hero 完整波浪 / 80 帧小字横向波浪过半、呈斜切状 / 100 帧小字完整横向波浪 / 130 帧标题基本回正、只剩轻微起伏 / 149 帧标题平直、hero 与小字波浪站立）通过；成片 mp4 抽帧（30 / 80 帧）与静帧像素比对均值通道差 1.79 与 1.74（H.264 压缩噪声级），ffprobe 150 帧 = durationInFrames，整片渲染 27.4 秒。渲染门说明：本地 /opt/meta-chromium 因 Hatch WebGL 策略无法启动，本轮沿用仓库 CI 同款 npx @puppeteer/browsers 装的 chrome-headless-shell（linux-157.0.8103.38）渲染通过，站点演示卡待同一浏览器验证（见报告）。研发手记：单测曾抓到 cos(π/2) 的浮点残差（6.1e-17）把 127.5 的舍入边界翻到 127，导致 angle 90 的 G 通道半数像素偏 1 LSB——未改编码器，断言放宽到 ±1 LSB 并留注释；另注意 waveWarp 的 map 随相位逐帧重建，sustain 模式下同帧不同相位的字符串必然不同，断言只验 filter 在位。',
  },
];
