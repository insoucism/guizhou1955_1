/* ============================================================
   《归舟 · 1955》· 单页交互脚本
   1) 数据层：时间线 / 角色图鉴 / 结局分支
   2) 交互层：平滑滚动、滚动进度、滚动渐显、时间轴气泡、
              角色卡片展开、结局 Tab、Hero 台灯跟随
   3) 降级层：无 JS 时正文完整可读；触屏以点击代替悬停
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ══════════════════════════════════════════════════════════
     数据 1 · 时间线（1936 — 1955）
     kind: 'fact' = 史实（金色）；'art' = 剧本艺术演绎（灰色）
     ══════════════════════════════════════════════════════════ */
  var TIMELINE = [
    {
      year: '1936 — 1949',
      kind: 'fact',
      title: '竺可桢执掌浙江大学十三年，率校西迁办学',
      story: '抗战起，浙大自杭州辗转建德、吉安、泰和、宜山、遵义、湄潭，两千里路，祠堂作课堂，桐油灯下讲课照旧，人称「文军长征」。1938 年校歌定稿，马一浮作词：「大不自多，海纳江河。」'
    },
    {
      year: '1939.2',
      kind: 'fact',
      title: '竺可桢对学生讲《求是精神与牺牲精神》',
      story: '还在西迁路上，他对学生说：「求是精神，就是排万难、冒百死，以求真知。」这九个字，后来成了全剧的开场白与终局的落点。'
    },
    {
      year: '1945',
      kind: 'fact',
      title: '范绪箕在浙大筹建航空工程系，师生自建中国第一座低速风洞',
      story: '自己画图纸，自己出资买材料，师生动手，在求是园建起中国第一座 3 英尺低速风洞。八年后，钱学森摸着这座风洞说：条件这么差还能做事，难得。'
    },
    {
      year: '1947.7',
      kind: 'fact',
      title: '钱学森回国省亲：借车接机、欢迎晚宴、浙大讲演',
      story: '7 月 1 日，范绪箕向竺可桢借车，赴上海龙华机场接机。13—15 日钱学森抵杭，竺可桢设晚宴，他参观了浙大航空实验室。7 月 28 日清早，工学院 61 号教室，讲题《工程与工程科学》——竺可桢在台下记了满满一页，当夜日记写下四个要点，第一句是「述工程科学之进展必赖基本科学」。'
    },
    {
      year: '1947.9.17',
      kind: 'fact',
      title: '钱学森与蒋英在上海成婚，范绪箕任伴郎',
      story: '那一年七月，他还在莫干山的山道上对人说，想回来。'
    },
    {
      year: '1955.6.15',
      kind: 'fact',
      title: '钱学森在香烟纸上写就求援信；蒋英以左手仿儿童笔迹写信封',
      story: '他从送菜小贩的篮底看见一份画报——五一节天安门城楼，他在人群里认出了陈叔通，父亲的老师。三百字，改了三遍，最后落笔：「无一日、一时、一刻不思归国，参加伟大的建设高潮。」随信附上豆腐干大小的《纽约时报》剪报，并写明：「从学森所知者，即有郭永怀一家。」'
    },
    {
      year: '1955.6 下旬',
      kind: 'fact',
      title: '信自商场邮筒寄出，抵比利时，由蒋华转寄',
      story: '他们在离家很远的一家商场停下。他在门口望风，装作看橱窗里的一套茶具；她走进去，看四下无人，指尖一松。信夹在寄给四妹蒋华的家信里，飞越大洋。'
    },
    {
      year: '1955.7 初',
      kind: 'fact',
      title: '信到上海钱均夫处，随即转寄北京',
      story: '一封家信，一页香烟纸，一块剪报。老人把信交出去的时候，屋里那扇窗还漏着雨。'
    },
    {
      year: '1955.7.11',
      kind: 'fact',
      title: '陈叔通收信，当夜冒雨送请竺可桢鉴定',
      story: '拆开信，看见开头「叔通太老师先生」六个字，心头一震。他没有直接上报，先写了一支便条送老友家。理由只有一条：八年前，那位科学家在浙大讲过一场《工程与工程科学》，而那一天的日记，那位老校长一直留着。'
    },
    {
      year: '1955.7 中',
      kind: 'fact',
      title: '竺可桢为这封信鉴定笔迹，逐级打通上报关口',
      story: '外交部解密档案记载：陈叔通转交时任中科院副院长竺可桢鉴定笔迹。老校长的次序是——先对日期，再对笔势，最后对事理。'
    },
    {
      year: '1955.7.21',
      kind: 'fact',
      title: '张稼夫代表中科院致函陈毅副总理，批示：「想办法。」',
      story: '三个字，落在一张纸上。办公厅外，一封加急电报正发往日内瓦。'
    },
    {
      year: '1955.7 — 8',
      kind: 'art',
      title: '【剧本】美方线人「顾维诚」循邮路潜入，栽赃与伪件登场',
      story: '剧本虚构：一名自称「留美归国航空工程师、钱家远亲」的年轻人，任务代号「回声」，摸清传递路径并制造混乱。他熟悉「档案里的钱学森」，却答不出一碗豆腐卤配稀饭——这构成全剧「真假嫌疑」的推理核心。'
    },
    {
      year: '1955.7 — 8',
      kind: 'art',
      title: '【剧本】三份誊本上桌，竺可桢主持笔迹鉴定：先对日期，再对笔势，最后对事理',
      story: '玩法设计，不载于史料：陈叔通、范绪箕与自称「钱家远亲」的顾维诚同聚竺宅书房。日期、笔势、事理三道关口层层收紧，最终由竺可桢玩家裁决——这一晚的题眼是「只问是非，不计利害」。'
    },
    {
      year: '1955.8.1 — 4',
      kind: 'fact',
      title: '日内瓦中美大使级会谈，王炳南出示原件；8 月 4 日美方放行',
      story: '王炳南当着美国代表的面读出那封信，美方哑口无言。三天后，移民局通知准予离境。'
    },
    {
      year: '1955.9.17',
      kind: 'fact',
      title: '克利夫兰总统号离港',
      story: '记者问他要说什么，他说：「我将尽我所能，帮助中国人民建设一个幸福而有尊严的国度。」'
    },
    {
      year: '1955.10.8',
      kind: 'fact',
      title: '罗湖桥',
      story: '过桥，入境。五年软禁到此为止。'
    },
    {
      year: '1955.10.15',
      kind: 'fact',
      title: '钱学森重访浙江大学，被学生热情地包围起来',
      story: '归国第七天，他偕妻儿从上海到杭州为母亲扫墓，随后走进浙江大学。《人民日报》记载，他在浙大参观时「被学生们热情地包围起来」，看到新中国青年学生的求知热情与崭新的学习环境，「这一切都使他非常感动」。'
    }
  ];

  /* ══════════════════════════════════════════════════════════
     数据 2 · 角色图鉴
     ══════════════════════════════════════════════════════════ */
  var ICONS = {
    old: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z"/><path d="M4.4 20.6c0-3.7 3.4-6.2 7.6-6.2s7.6 2.5 7.6 6.2"/><path d="M9.6 3.4 12 6.6l2.4-3.2"/></svg>',
    wing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2.6 13.4 21.4 4l-8.2 16.4-2.4-6z"/><path d="m10.8 14.4 10.6-10.4"/></svg>',
    scientist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="3.1"/><ellipse cx="12" cy="12" rx="9.4" ry="4.2"/><ellipse cx="12" cy="12" rx="9.4" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.4" ry="4.2" transform="rotate(120 12 12)"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M9.4 18.2V6.4l9-2v10.4"/><circle cx="6.8" cy="18.4" r="2.6"/><circle cx="15.8" cy="15" r="2.6"/></svg>',
    envelope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="5.4" width="18" height="13.2" rx="1.4"/><path d="m3.6 6.6 8.4 6.4 8.4-6.4"/></svg>',
    seal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8.4 9.4h7.2M8.4 12.6h7.2M8.4 15.8h4.4"/></svg>',
    mask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3.4 6.6c2.6-1.4 5.4-1.4 8.6 0 3.2-1.4 6-1.4 8.6 0 .6 5.6-2.2 12-8.6 14.4C5.6 18.6 2.8 12.2 3.4 6.6z"/><path d="M8.6 10.6h.02M15.4 10.6h.02"/><path d="M9 15.2c1.8 1.2 4.2 1.2 6 0"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6.4 17.6h11a3.6 3.6 0 0 0 .3-7.2 5.4 5.4 0 0 0-10.3-1.2A4 4 0 0 0 6.4 17.6z"/><path d="M8.4 20.4h7.2"/></svg>',
    lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M7.4 8.4 12 3l4.6 5.4z"/><path d="M12 8.4v9.2"/><path d="M8.4 20.6h7.2"/><path d="M9.4 17.6h5.2"/></svg>'
  };

  var ROLES_MAIN = [
    {
      no: '01 · 枢纽',
      name: '竺可桢',
      icon: 'old',
      fiction: false,
      tags: ['史实人物', '浙江大学校长 1936—1949', '本剧枢纽'],
      line: '哈佛博士，中国气象学奠基人。十几年写日记，一天不落。剧中的鉴定裁决权在他手上。',
      more: '1936 年起执掌浙江大学十三年，率校西迁办学两千里；1939 年对学生讲「排万难、冒百死，以求真知」。1955 年任中国科学院副院长。他之所以是这封信的关键节点，是因为 1947 年那一天的日记是他的——他记下了钱学森讲演的四要点，也记下了「学森」二字的收笔。',
      key: '题眼：「只问是非，不计利害。」'
    },
    {
      no: '02 · 情义轴',
      name: '范绪箕',
      icon: 'wing',
      fiction: false,
      tags: ['史实人物', '浙大航空系创办人', '本剧情义轴'],
      line: '冯·卡门门下同门，与钱学森同住四年。1945 年在浙大建起中国第一座低速风洞。',
      more: '1935 年冬成为冯·卡门迁美后第一个中国学生；1940 年回国时受钱学森所托去看望其父；1947 年向竺可桢借车赴龙华机场接机，秋天做婚礼伴郎；1955 年被评为航空院校中唯一的一级教授。他替远在异国的师弟守家、守邮路、守笔迹旁证。',
      key: '他的落点：「我们这些人，靠的都是前人一程一程递过来的灯。」'
    },
    {
      no: '03',
      name: '钱学森',
      icon: 'scientist',
      fiction: false,
      tags: ['史实人物', '第一幕主舞台'],
      line: '1911 年生于上海，长于杭州。1935 年赴美，师从冯·卡门。1950 年归国未成，反遭羁押，软禁五年。',
      more: '被软禁期间只能继续做研究，「以备他日归国之用」。他是全场唯一身处大洋彼岸的人——其余各幕，他以「跨洋声部」参与讨论，是最懂美方监视逻辑的那一个。',
      key: '「我将尽我所能，帮助中国人民建设一个幸福而有尊严的国度。」'
    },
    {
      no: '04',
      name: '蒋英',
      icon: 'music',
      fiction: false,
      tags: ['史实人物', '第一幕主舞台'],
      line: '军事学家蒋百里之三女，留德女高音。1947 年与钱学森成婚。在 FBI 眼里，「钱学森夫人」等于重点监视对象。',
      more: '信封上的字必须避开笔迹档案，于是她换左手，一笔一画模仿孩子的字。此后每一幕，她都用「平常心」压制过于激进的方案——谈话是最好的掩护，她把每一次监视者的搭话，都变成一场独唱会。',
      key: '手上这一笔，是全剧最轻也最险的一环。'
    },
    {
      no: '05',
      name: '蒋华',
      icon: 'envelope',
      fiction: false,
      tags: ['史实人物', '第二幕主舞台'],
      line: '蒋英四妹，侨居比利时。姐姐的信里夹着一张剪报的那一年，她二十多岁。',
      more: '拆开家信，看见那块剪报，心里全明白了。她立刻转寄上海——可就在此时，一封匿名检举信把海关的目光引向了她。她是全场最危险的人，手里却有两张牌：一套只有家里人才懂的暗语，以及一份对不上的行踪。',
      key: '剧本定位：被刻意栽赃的那一个。'
    },
    {
      no: '06',
      name: '陈叔通',
      icon: 'seal',
      fiction: false,
      tags: ['史实人物', '第三幕主舞台'],
      line: '全国人大常委会副委员长。钱均夫是他的学生——所以信的开头写着「叔通太老师先生」。',
      more: '他有一个本子，记着被阻在太平洋对岸的名字，第一页就是「学森等，欲归不得者」，写了八年。信到手时他心头一震：这不是一封信，是一件国之事。他可以选择直接上报，也可以先鉴定，他选了后者。',
      key: '「我认不得笔迹。我只认得人。」'
    },
    {
      no: '07 · 隐藏',
      name: '顾维诚',
      icon: 'mask',
      fiction: true,
      veil: true,
      tags: ['虚构人物', '隐藏角色', '美方线人', '反派'],
      line: '自称留美归国的航空工程师、钱家远亲。档案室里查无此人。',
      more: '任务代号「回声」：摸清求援信的传递路径与上报渠道，必要时制造混乱、栽赃嫁祸。他的优势是永远出现在正确的场合，话术完美；劣势是——他不是「家里的钱学森」。三处破绽：答不出钱伯父常年吃什么；把地址说成「愚园路 111 号」；伪件落款写错了日期。他的秘密胜利条件：在被指认前，听全完整的上报路径。',
      key: '你越「专业」，越像真货，破绽也越致命。'
    }
  ];

  var ROLES_EXTRA = [
    {
      no: '08 · 可选拓展',
      name: '叶笃正',
      icon: 'cloud',
      fiction: false,
      tags: ['史实人物', '浙大 1943 年硕士', '竺可桢门生'],
      line: '1943 年获浙江大学理学硕士，师从涂长望、王淦昌；当年由竺可桢校长推荐进中央研究院气象研究所。1950 年经罗湖回国。',
      more: '回国后任中科院地球物理研究所北京工作站主任，连一张像样的天气图都没有，十几个人，图得自己画。第一张 500 毫巴图挂上墙那天，全室庆贺了一场。剧中的他负责「程序之眼」——指出伪件日期、语境、附件三者对不上，并核出访客登记上少了一个弄堂号。',
      key: '「求是精神深深地教育了我。」'
    },
    {
      no: '09 · 可选拓展',
      name: '沈砚秋',
      icon: 'lamp',
      fiction: true,
      tags: ['虚构人物·综合形象', '浙大青年教师', '西迁子弟'],
      line: '浙大青年助教。父母当年随校西迁——父亲是挑着书箱走完那两千里的人之一。1947 年在航空实验室做助教，擦过那座风洞的洞壁。',
      more: '本角色为虚构人物，综合浙大西迁子弟与在校青年教师的形象。他手里有两页 1947 年的听讲笔记，一直留到今天。剧中他代表浙大在校师生，在终局番外完成「报到」——八年前想上前说话却没挤到跟前，这一次，他终于站在了那个人面前。',
      key: '元叙事彩蛋：终局可以大方承认「我是编出来的那一个」。'
    }
  ];

  /* ══════════════════════════════════════════════════════════
     数据 3 · 四种结局
     ══════════════════════════════════════════════════════════ */
  var ENDINGS = [
    {
      key: 'grand',
      name: '大捷',
      en: 'Complete Victory',
      cond: '信件成功上报中央 且 第四幕投票找出顾维诚',
      text: '材料齐备，中科院公函留痕，竺可桢签押；7 月 21 日批示「想办法」，加急电报发往日内瓦。与此同时，雨夜求见的那个「远亲」被当场指认——三处破绽摆在桌上，答不出一碗豆腐卤配稀饭。信到了，线人也断了。',
      quote: '读终局全篇，含《回到求是园》浙大番外升华段。归舟已至。下一程的灯，请各位接着递。',
      cite: 'DM 主持 · 终局全幕'
    },
    {
      key: 'small',
      name: '小胜',
      en: 'Pyrrhic Win',
      cond: '信件成功上报，但顾维诚逃过投票',
      text: '信送出去了，谈判桌上亮出了原件，8 月 4 日美方放行。可是那个雨夜来敲门的年轻人，在最后一轮投票里滑了出去——他记住了这条路径。',
      quote: '信到了，可线人也记下了路径。此后每一封海外的信，都要换一条更险的路。胜利不是终点，是下一段路的起点。',
      cite: '结局后加读'
    },
    {
      key: 'close',
      name: '惜败',
      en: 'Narrow Loss',
      cond: '上报失败（幕末抉择累计失误 ≥ 2 次）',
      text: '邮筒、比利时、上海、北京——链路在某一段断了。没有原件，没有剪报，没有鉴定意见。谈判桌上空手而归。',
      quote: '钱学森的名字，又一次沉回太平洋。今晚我们没送出去的信，历史上的他们送出去了。这份沉重，请带回现实。',
      cite: '失败结局 + 完整复盘与浙大升华'
    },
    {
      key: 'dark',
      name: '暗败',
      en: 'Silent Defeat',
      cond: '上报失败 且 顾维诚已摸清上报路径',
      text: '信没有到，路径却被记下了。此后每一封海外的信，都要绕更远的路、换更险的船。最危险的不是送不到，是有人知道你往哪送。',
      quote: '情报链的每一环都不可替代。这一局里，最安静的那个动作，决定了所有人的安全。',
      cite: '失败结局 · 暗败'
    }
  ];

  /* ══════════════════════════════════════════════════════════
     渲染 · 时间线
     ══════════════════════════════════════════════════════════ */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function renderTimeline() {
    var box = document.getElementById('timelineList');
    if (!box) return;
    box.innerHTML = TIMELINE.map(function (it, i) {
      var fact = it.kind === 'fact';
      return '' +
        '<li class="tl-item reveal ' + (fact ? 'is-fact' : 'is-art') + '" data-kind="' + it.kind + '">' +
          '<div class="tl-card">' +
            '<div class="tl-top">' +
              '<span class="tl-year">' + esc(it.year) + '</span>' +
              '<span class="tl-tag">' + (fact ? '史实' : '剧本艺术演绎') + '</span>' +
            '</div>' +
            '<p class="tl-title">' + esc(it.title) + '</p>' +
            '<span class="tl-more" aria-hidden="true">' + (hoverCapable ? '悬停展开' : '轻触展开') + ' ↓</span>' +
            '<div class="tl-bubble" role="note">' +
              '<div class="tl-bubble-inner">' +
                '<span class="tl-bubble-label">' + (fact ? '史实小故事' : '戏剧演绎') + '</span>' +
                '<p class="tl-bubble-text">' + esc(it.story) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</li>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     渲染 · 角色图鉴
     ══════════════════════════════════════════════════════════ */
  function roleCard(r) {
    var veil = r.veil ? ' role-card--veil' : '';
    var mark = r.veil ? '<span class="veil-mark">身份未明</span>' : '';
    var tags = r.tags.map(function (t) {
      var cls = /史实/.test(t) ? 'role-tag-fact' : (/虚构/.test(t) ? 'role-tag-fiction' : '');
      return '<span class="role-tag ' + cls + '">' + esc(t) + '</span>';
    }).join('');
    return '' +
      '<article class="role-card reveal' + veil + '" tabindex="0" aria-expanded="false">' +
        mark +
        '<div class="role-top">' +
          '<div>' +
            '<h4 class="role-name">' + esc(r.name) + '</h4>' +
            '<span class="role-no">' + esc(r.no) + '</span>' +
          '</div>' +
          '<span class="role-portrait" aria-hidden="true">' + (ICONS[r.icon] || ICONS.old) + '</span>' +
        '</div>' +
        '<div class="role-tags">' + tags + '</div>' +
        '<p class="role-line">' + esc(r.line) + '</p>' +
        '<div class="role-more">' +
          '<p>' + esc(r.more) +
            '<span class="role-more-key">' + esc(r.key) + '</span>' +
          '</p>' +
        '</div>' +
        '<button class="role-expand" type="button" aria-label="展开' + esc(r.name) + '的人物梗概">展开梗概</button>' +
      '</article>';
  }

  function renderRoles() {
    var main = document.getElementById('roleGridMain');
    var extra = document.getElementById('roleGridExtra');
    if (main) main.innerHTML = ROLES_MAIN.map(roleCard).join('');
    if (extra) extra.innerHTML = ROLES_EXTRA.map(roleCard).join('');
  }

  /* ══════════════════════════════════════════════════════════
     渲染 · 结局 Tab
     ══════════════════════════════════════════════════════════ */
  function renderEndings() {
    var box = document.getElementById('endingPanels');
    if (!box) return;
    box.innerHTML = ENDINGS.map(function (e, i) {
      return '' +
        '<section class="tabpane' + (i === 0 ? ' active' : '') + '" role="tabpanel" data-key="' + e.key + '"' +
          ' id="panel-' + e.key + '" aria-labelledby="tab-' + e.key + '"' + (i === 0 ? '' : ' hidden') + '>' +
          '<div class="pane-head">' +
            '<h3 class="pane-name">' + esc(e.name) + '</h3>' +
            '<span class="pane-en">' + esc(e.en) + '</span>' +
            '<span class="pane-cond">' + esc(e.cond) + '</span>' +
          '</div>' +
          '<p class="pane-text">' + esc(e.text) + '</p>' +
          '<blockquote class="pane-quote">' + esc(e.quote) + '<cite>' + esc(e.cite) + '</cite></blockquote>' +
        '</section>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     交互 · 结局 Tab 切换
     ══════════════════════════════════════════════════════════ */
  function initTabs() {
    var wrap = document.getElementById('endingTabs');
    if (!wrap) return;
    var tabs = Array.prototype.slice.call(wrap.querySelectorAll('.tab'));
    var panes = Array.prototype.slice.call(wrap.querySelectorAll('.tabpane'));

    function select(key, focus) {
      tabs.forEach(function (t) {
        var on = t.dataset.key === key;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) { t.removeAttribute('tabindex'); } else { t.setAttribute('tabindex', '-1'); }
        if (on && focus) t.focus();
      });
      panes.forEach(function (p) {
        var on = p.dataset.key === key;
        p.classList.toggle('active', on);
        if (on) { p.removeAttribute('hidden'); } else { p.setAttribute('hidden', ''); }
      });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.dataset.key, false); });
      t.addEventListener('keydown', function (ev) {
        var k = ev.key, next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') next = 0;
        else if (k === 'End') next = tabs.length - 1;
        if (next === null) return;
        ev.preventDefault();
        select(tabs[next].dataset.key, true);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     交互 · 触屏：点击展开时间轴 / 角色卡片
     ══════════════════════════════════════════════════════════ */
  function initTapToggles() {
    // 时间轴
    document.addEventListener('click', function (ev) {
      var item = ev.target.closest && ev.target.closest('.tl-item');
      if (item) {
        var wasOpen = item.classList.contains('open');
        document.querySelectorAll('.tl-item.open').forEach(function (n) { n.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
        return;
      }
      var btn = ev.target.closest && ev.target.closest('.role-expand');
      var card = ev.target.closest && ev.target.closest('.role-card');
      if (card) {
        var open = card.classList.toggle('open');
        card.setAttribute('aria-expanded', open ? 'true' : 'false');
        var b = card.querySelector('.role-expand');
        if (b) b.textContent = open ? '收起梗概' : '展开梗概';
        if (btn) ev.stopPropagation();
      }
    });

    // 键盘：角色卡片 Enter / Space 展开
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var card = ev.target.closest && ev.target.closest('.role-card');
      if (!card || ev.target.tagName === 'BUTTON') return;
      ev.preventDefault();
      var open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
      var b = card.querySelector('.role-expand');
      if (b) b.textContent = open ? '收起梗概' : '展开梗概';
    });
  }

  /* ══════════════════════════════════════════════════════════
     交互 · 滚动渐显（IntersectionObserver + 无 IO 兜底）
     ══════════════════════════════════════════════════════════ */
  function initReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!nodes.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }

    // 时间轴节点依次渐显：按序延迟，模拟"一页一页翻过去"
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var delay = 0;
        if (el.classList.contains('tl-item')) {
          var order = Array.prototype.indexOf.call(el.parentNode.children, el);
          delay = Math.min(order, 6) * 70;
        }
        window.setTimeout(function () { el.classList.add('in'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    function observeAll(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll('.reveal:not(.in)'), function (n) {
        io.observe(n);
      });
    }
    observeAll(document);

    // 兜底一：2.5 秒后仍在视口内的元素强制显示，绝不让文字被动画藏住
    window.setTimeout(function () {
      nodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('in');
      });
    }, 2500);

    // 兜底二：任何后插入的 .reveal（如动态渲染、切换分区）也要纳入观察
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { observeAll(document); });
      mo.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(function () { mo.disconnect(); }, 4000);
    }
  }

  /* ══════════════════════════════════════════════════════════
     交互 · 导航（吸顶 / 移动菜单 / 当前章节高亮）
     ══════════════════════════════════════════════════════════ */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var progress = document.getElementById('scrollProgress');

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.addEventListener('click', function (ev) {
        if (ev.target.tagName === 'A') {
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    var navAnchors = links ? Array.prototype.slice.call(links.querySelectorAll('a')) : [];
    var sections = navAnchors.map(function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;

        if (nav) nav.classList.toggle('solid', y > 40);

        if (progress) {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
        }

        var active = null;
        sections.forEach(function (s) {
          if (s.getBoundingClientRect().top <= window.innerHeight * 0.36) active = s;
        });
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', !!active && a.getAttribute('href') === '#' + active.id);
        });

        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════════════════════
     交互 · Hero 台灯光束跟随鼠标（轻微偏移）
     ══════════════════════════════════════════════════════════ */
  function initHeroLamp() {
    var stage = document.getElementById('heroStage');
    var hero = document.getElementById('hero');
    if (!stage || !hero || reduceMotion || !hoverCapable) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, idle = null;

    function frame() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      stage.style.setProperty('--lx', cx.toFixed(2) + 'px');
      stage.style.setProperty('--ly', cy.toFixed(2) + 'px');
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) {
        raf = window.requestAnimationFrame(frame);
      } else {
        raf = null;
      }
    }

    function kick() { if (raf === null) raf = window.requestAnimationFrame(frame); }

    function onMove(ev) {
      var r = hero.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      tx = Math.max(-1, Math.min(1, px)) * 16;
      ty = Math.max(-1, Math.min(1, py)) * 13;
      kick();
      if (idle) window.clearTimeout(idle);
      idle = window.setTimeout(function () { tx = 0; ty = 0; kick(); }, 3200);
    }

    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  }

  /* ══════════════════════════════════════════════════════════
     交互 · 锚点平滑滚动（补齐 CSS scroll-behavior）
     ══════════════════════════════════════════════════════════ */
  function initSmoothAnchors() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - 58;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  /* ══════════════════════════════════════════════════════════
     启动
     ══════════════════════════════════════════════════════════ */
  function boot() {
    renderTimeline();
    renderRoles();
    renderEndings();
    initTabs();
    initTapToggles();
    initReveal();   // 必须放在动态渲染之后：否则新生成的 .reveal 不会被观察
    initNav();
    initHeroLamp();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
