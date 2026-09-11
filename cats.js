/* ============================================================
   同创汇猫咪故事馆 · 猫咪数据（外置 JS，符合离线规范）
   ------------------------------------------------------------
   数据来源：腾讯文档《猫咪档案》
     · HALL    = 表一「拆迁待安排猫咪」16 位 → 首页「摸一摸小猫」的抽卡池
     · ARCHIVE = 表二「猫咪手册【2025】」去重后的个体档案
     · window.CATS = HALL + ARCHIVE，即「猫猫手册」列表的全部内容
     · 列表里 HALL 的 16 位固定排在最前，其余按家族分组

   【如何补全】直接编辑下面的 HALL / ARCHIVE 数组。
   · 照片：58 只已经放进了 assets/cats/（文件名 = 猫的 id + .jpg，
     从云文档里按行取出来压过的）。要换图就用同名文件覆盖；
     没有照片的 43 只沿用剪影，拿到照片后把 photo 填文件名、
     has_photo 改成 true 即可。
   · 档案猫的 id 用 a01~aNN 编号，不是拼音，改名字时 id 不用动。

   【字段说明】
   id         唯一 id（手册/摸猫/爪印都靠它定位，别改）
   name       名字
   alias      别名，原表括号里的叫法（如「话唠（喵桑）」→ 别名 喵桑）
   pool       true = 进首页摸猫池（只有 HALL 的 16 位是 true）
   mood       性格档位，用于标签与共鸣卡：'close' 亲人｜'shy' 中等需培养｜'gone' 不亲人
              （摸到瞬间的插画/动效按 color 花色分组，与 mood 无关）
              非摸猫池的猫为 null
   color      品种 / 花色
   gender     '母猫'｜'公猫'｜'都有'
   sterilized 是否已绝育（null = 档案里没写）
   status     现状，决定列表角标与卡片配色：
              'wait' 还在等家｜'home' 已被领养｜'star' 已回喵星
              'lost' 失踪｜'shop' 司猫｜'foster' 寄养中
   note       原表「猫咪情况」原文，档案卡里会附在状态后面
   family     家族名（列表按此分组，空字符串表示未归入家族）
   area       归属地
   silhouette 无照片时的剪影造型：'sit' 蹲坐｜'peek' 探头｜'trio' 三只｜'family' 大猫带小猫
   relations  关系网，[{ label: "妈妈", names: ["粽妈"] }]；
              label 为空表示原表那句没有冒号（如「独来独往」），原话放 text
   photo      照片文件名（放进 assets/cats/），无照片填 null
   has_photo  是否有照片
   story      故事正文，一个元素一段；段落里出现别的猫名时用 [[名字]]
              包起来会自动变成可点的「串门」热词。档案猫没有故事，为 []
   quote      金句（故事页深色块 + 共鸣卡上那句）
   cardNote   无照片时显示在照片位下方的话
   ============================================================ */
(function () {
  "use strict";

  /* ===== 一、拆迁待安排 · 首页摸猫池（16 位） ===== */
  var HALL = [
    {
      id: "guagua", name: "瓜瓜", pool: true,
      mood: "close", color: "橘白-古典纹", gender: "母猫", sterilized: true,
      status: "wait", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "guagua.jpg", has_photo: true,
      relations: [
        { label: "儿子", names: ["南瓜", "黄瓜"] },
        { label: "女儿", names: ["彩瓜"] },
        { label: "朋友", names: ["小银"] },
        { label: "前男友", names: ["头盔"] },
        { label: "姐妹", names: ["断瓜", "瓜妹"] },
        { label: "哥哥", names: ["瓜哥"] },
      ],
      story: [
        "曾用名「小小只」——刚被发现的时候，她还没有一个饭盒大。",
        "生过一次娃，如今是[[小银]]的大姐头。亲人、活泼，只是流浪久了，家养需要一点适应期。",
      ],
      quote: "从饭盒大的小小只，长成了罩着小弟的大姐头。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaoyin", name: "小银", pool: true,
      mood: "shy", color: "银渐层", gender: "公猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "sit",
      photo: "xiaoyin.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["瓜瓜", "小橘"] },
      ],
      story: [
        "一只银渐层，在街上流浪了五六年，却把自己照顾得干干净净。",
        "他喜欢橘猫，所有的好朋友都是橘猫；最大的靠山是那位橘白的大姐头[[瓜瓜]]。",
      ],
      quote: "胆小的跟班小弟，不伤人——他只是需要一点耐心。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "zhuzai", name: "猪仔", pool: true,
      mood: "close", color: "简州猫", gender: "公猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "sit",
      photo: "zhuzai.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["绅士", "阿孤", "叫叫", "大吉", "鸭表弟"] },
        { label: "绝交", names: ["瓜瓜"] },
      ],
      story: [
        "他曾经是果园 F4 的一员——[[阿孤]]、[[瓜瓜]]、[[叫叫]]，四个一起混日子。",
        "[[叫叫]]回喵星以后，F4 散了伙。从那以后，猪仔一个人吃饭，一个人走。",
        "他还是亲近人的，只是亲近得有点小心。",
      ],
      quote: "F4 散了以后，他学会了一个人。亲人，只是需要一个适应期。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "sanyanmei", name: "三眼妹", pool: true,
      mood: "close", color: "狸花猫", gender: "母猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "peek",
      photo: "sanyanmei.jpg", has_photo: true,
      relations: [
        { label: "女儿", names: ["紫霞", "老白"] },
      ],
      story: [
        "一只狸花猫。据说当年给她做绝育花了一千五——这一片身价最高的 TNR 选手。",
        "她生过一胎，女儿是[[紫霞]]和[[老白]]。孩子散在各处，她自己留了下来。",
        "依然亲人。好像不管经历过什么，她都愿意再信人一次。",
      ],
      quote: "身价最高的 TNR 选手。经历过那么多，还是愿意再信人一次。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "dahua", name: "大华", pool: true,
      mood: "gone", color: "金渐层", gender: "母猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "peek",
      photo: "dahua.jpg", has_photo: true,
      relations: [
        { label: "同事", names: ["脏脏包1.0"] },
      ],
      story: [
        "一只很漂亮、很漂亮的流浪金渐层。",
        "胆子小，不靠近人。每次远远见到她，都特别心疼——漂亮从来不是流浪的护身符。",
      ],
      quote: "漂亮不是护身符。她不需要你立刻喜欢她，只需要你别追她。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaoxiaomao", name: "小小猫", pool: true,
      mood: "close", color: "狸花猫", gender: "母猫", sterilized: true,
      status: "wait", family: "狸花猫之家", area: "同创", silhouette: "sit",
      photo: "xiaoxiaomao.jpg", has_photo: true,
      relations: [
        { label: "姐妹", names: ["小猫", "中猫"] },
      ],
      story: [
        "「狸花猫之家」的成员——一屋子全女生，每一只都亲人。",
        "三姐妹里她叫小小猫，约一岁。名字起得随意，等待却很认真。",
      ],
      quote: "全女生宿舍，每一只都亲人。她们在等一个愿意一次带两只的人。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaomao", name: "小猫", pool: true,
      mood: "close", color: "狸花猫", gender: "母猫", sterilized: true,
      status: "wait", family: "狸花猫之家", area: "同创", silhouette: "sit",
      photo: "xiaomao.jpg", has_photo: true,
      relations: [
        { label: "姐妹", names: ["小小猫", "中猫"] },
      ],
      story: [
        "「狸花猫之家」三姐妹之一，约一岁，亲人。",
        "名字是群护随口叫出来的——叫得多了，也就成了她的名字。",
      ],
      quote: "名字随意，等待却是认真的。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "zhongmao", name: "中猫", pool: true,
      mood: "close", color: "狸花猫", gender: "母猫", sterilized: true,
      status: "wait", family: "狸花猫之家", area: "同创", silhouette: "sit",
      photo: "zhongmao.jpg", has_photo: true,
      relations: [
        { label: "姐妹", names: ["小小猫", "小猫"] },
      ],
      story: [
        "「狸花猫之家」三姐妹之一，约一岁，亲人。",
        "姐妹里排行中间的那位，安静地在原地等着。",
      ],
      quote: "三姐妹里中间的那位，也在等一个自己的名字。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "tiebai", name: "铁白", pool: true,
      mood: "close", color: "白猫", gender: "母猫", sterilized: true,
      status: "wait", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "tiebai.jpg", has_photo: true,
      relations: [
        { label: "伙伴", names: ["milo"] },
      ],
      story: [
        "铁白是两个女儿的妈妈。女儿们先后被人带回了家，只剩她还留在原地。",
        "她大概不懂发生了什么，照旧天天守在地铁站，见人就蹭，见人就贴。",
        "前几天，她身上又添了新伤——疑似被狗咬的。可她依然没学会躲人。",
      ],
      quote: "两个女儿都有了家，只有妈妈还站在原地，等一个愿意收留她的人。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "milo", name: "milo", pool: true,
      mood: "close", color: "狸花猫-古典纹", gender: "公猫", sterilized: false,
      status: "wait", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "milo.jpg", has_photo: true,
      relations: [
        { label: "伴侣", names: ["小队"] },
        { label: "伙伴", names: ["铁白"] },
      ],
      story: [
        "大脸盘、古典纹的狸花猫，颜值很高，性格很乖，见人就凑上来蹭。",
        "曾经眼巴巴看着伙伴被抓进航空箱，他也想跟着进去——好像进了那个箱子，就能有家了。",
      ],
      quote: "他想要一个航空箱的终点。亲人的猫，值得一个愿意开门的人。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaomei", name: "小梅", pool: true,
      mood: "gone", color: "三花猫", gender: "母猫", sterilized: true,
      status: "wait", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: "xiaomei.jpg", has_photo: true,
      relations: [
        { label: "女儿", names: ["眼罩"] },
        { label: "前夫", names: ["凶凶"] },
      ],
      story: [
        "太奶级别的大家长。以前生过很多胎，生命力顽强得惊人。",
        "孙女是[[点白]]。她守着这片地方很多年了——这一回，该有人守她。",
      ],
      quote: "当了太奶很多年。这一回，该有人守护她了。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "dianbai", name: "点白", pool: true,
      mood: "gone", color: "白猫", gender: "母猫", sterilized: true,
      status: "wait", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: "dianbai.jpg", has_photo: true,
      relations: [
        { label: "奶奶", names: ["小梅"] },
      ],
      story: [
        "小梅的孙女，约一岁。",
        "以前总跟太奶[[小梅]]挤在同一条水管上睡。奶奶还守在原地，希望孙女这一辈，先走进一个家。",
      ],
      quote: "和太奶睡一条水管长大的孩子。让她先有个家吧。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaodui", name: "小队 & 队娃", pool: true,
      mood: "shy", color: "雀猫", gender: "都有", sterilized: false,
      status: "wait", family: "小队家族", area: "同创", silhouette: "family",
      photo: "xiaodui.jpg", has_photo: true,
      relations: [
        { label: "成员", names: ["小队", "灵珠", "树莓", "飞天"] },
      ],
      story: [
        "一家五口：[[小队]]（母，2 岁半）、[[灵珠]]（公，1 岁半，小队第二胎，软萌可培养），外加三只队娃（2 狸花 + 1 雀猫，约 3 个月，胆小但可塑）。",
        "遇见即全家福。家，应该是整队的。",
      ],
      quote: "一共 5 只，2 大 3 小。家应该是整队的。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "caihong", name: "彩虹", pool: true,
      mood: "close", color: "三花", gender: "母猫", sterilized: true,
      status: "wait", family: "", area: "", silhouette: "sit",
      photo: "caihong.jpg", has_photo: true,
      relations: [
        { label: "男友", names: ["milo"] },
      ],
      story: [
        "非常亲人、非常活泼的三花猫。",
        "颜值高，见面就往人腿上蹭——遇见她，就是遇见彩虹本虹。",
      ],
      quote: "遇见她，就是遇见彩虹本虹。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "shenshi", name: "绅士", pool: true,
      mood: "close", color: "奶牛", gender: "公猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "sit",
      photo: "shenshi.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["猪仔", "阿孤"] },
      ],
      story: [
        "一只爱说话的奶牛猫。找家的方式很直接——一直对着你说「你好」。",
        "亲人，应该可以适应家养。",
      ],
      quote: "话痨的奶牛猫找家，方式很直接——一直对着你说「你好」。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "elisabeth", name: "伊丽莎白", pool: true,
      mood: "close", color: "白猫", gender: "公猫", sterilized: false,
      status: "foster", family: "", area: "同创", silhouette: "sit",
      photo: "elisabeth.jpg", has_photo: true,
      relations: [],
      story: [
        "被救助的时候浑身是伤——过敏太痒，他一直挠个不停。",
        "可他的眼睛像蓝宝石一样漂亮，我见犹怜。",
      ],
      quote: "浑身是伤，眼睛却像蓝宝石一样漂亮。",
      cardNote: "TA 的照片还在路上"
    }
  ];

  /* ===== 二、个体档案 · 猫猫手册（86 位） ===== */
  var ARCHIVE = [
    {
      id: "a01", name: "大黄", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "home", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a01.jpg", has_photo: true,
      relations: [
        { label: "女儿", names: ["黄雀", "安妹"] },
        { label: "义女", names: ["粽子"] },
        { label: "义子", names: ["花生"] },
        { label: "前女友", names: ["粽妈"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a02", name: "黄雀", pool: false,
      mood: null, color: "橘雀", gender: "母猫", sterilized: true,
      status: "wait", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a02.jpg", has_photo: true,
      relations: [
        { label: "爸爸", names: ["大黄"] },
        { label: "妈妈", names: ["粽妈"] },
        { label: "姐妹", names: ["安妹"] },
        { label: "同母异父兄弟", names: ["花生"] },
        { label: "前夫", names: ["雀公"] },
        { label: "被侵犯", names: ["黑警"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a03", name: "花生", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "home", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a03.jpg", has_photo: true,
      relations: [
        { label: "义父", names: ["大黄"] },
        { label: "妈妈", names: ["粽妈"] },
        { label: "同母异父姐姐", names: ["黄雀", "安妹"] },
        { label: "兄弟", names: ["恰恰"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a04", name: "恰恰", pool: false,
      mood: null, color: "虎斑", gender: "公猫", sterilized: false,
      status: "lost", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a04.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "义父", names: ["大黄"] },
        { label: "妈妈", names: ["粽妈"] },
        { label: "同母异父姐姐", names: ["黄雀", "安妹"] },
        { label: "兄弟", names: ["花生"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a05", name: "粽妈", pool: false,
      mood: null, color: "三花猫", gender: "母猫", sterilized: false,
      status: "wait", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a05.jpg", has_photo: true,
      relations: [
        { label: "女儿", names: ["黄雀", "安妹"] },
        { label: "儿子", names: ["花生"] },
        { label: "前男友", names: ["大黄"] },
        { label: "现男友", names: ["花臂"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a06", name: "粽子", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: true,
      status: "home", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a06.jpg", has_photo: true,
      relations: [
        { label: "妈妈", names: ["粽妈"] },
        { label: "爸爸", names: ["大黄"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a07", name: "老白", pool: false,
      mood: null, color: "白猫", gender: "母猫", sterilized: true,
      status: "star", family: "大黄家族", area: "创投", silhouette: "sit",
      photo: "a07.jpg", has_photo: true,
      note: "已绝育-被人为弹弓打死",
      relations: [
        { label: "义父", names: ["大黄"] },
        { label: "姐妹", names: ["紫霞"] },
        { label: "妈妈", names: ["三眼妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a08", name: "紫霞", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: true,
      status: "lost", family: "大黄家族", area: "创投", silhouette: "sit",
      photo: "a08.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "义父", names: ["大黄"] },
        { label: "姐妹", names: ["老白"] },
        { label: "妈妈", names: ["三眼妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a09", name: "雀公", pool: false,
      mood: null, color: "长毛橘猫", gender: "公猫", sterilized: false,
      status: "lost", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a09.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "前妻", names: ["黄雀"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a10", name: "安妹", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: true,
      status: "lost", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a10.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "爸爸", names: ["大黄"] },
        { label: "妈妈", names: ["粽妈"] },
        { label: "姐妹", names: ["黄雀"] },
        { label: "同母异父兄弟", names: ["花生"] },
        { label: "被侵犯", names: ["黑警"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a11", name: "小怪", pool: false,
      mood: null, color: "奶牛", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "兄弟", names: ["大怪"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a12", name: "大怪", pool: false,
      mood: null, color: "奶牛", gender: "公猫", sterilized: null,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "兄弟", names: ["小怪"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a13", name: "斜刘海", pool: false,
      mood: null, color: "简州猫", gender: "母猫", sterilized: true,
      status: "star", family: "", area: "同创", silhouette: "sit",
      photo: "a13.jpg", has_photo: true,
      note: "已绝育-狗咬死回喵星",
      relations: [
        { label: "义妹", names: ["咩咩"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a14", name: "咩咩", pool: false,
      mood: null, color: "黑猫", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "义姐", names: ["斜刘海"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a15", name: "黑警", pool: false,
      mood: null, color: "奶牛", gender: "公猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a15.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "侵犯", names: ["黄雀", "安妹"] },
        { label: "表妹", names: ["表弟"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a16", name: "馒", pool: false,
      mood: null, color: "白猫", gender: "公猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a16.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "cp", names: ["眼"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a17", name: "眼", pool: false,
      mood: null, color: "狸白？", gender: "母猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "cp", names: ["馒"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a18", name: "脏脏包1.0", pool: false,
      mood: null, color: "白猫", gender: "公猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a18.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "同事", names: ["大华"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a19", name: "大脸", pool: false,
      mood: null, color: "狸花猫", gender: "公猫", sterilized: false,
      status: "lost", family: "大脸家族", area: "同创", silhouette: "sit",
      photo: "a19.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "女友1", names: ["黑头发三花"] },
        { label: "女儿", names: ["牛仔", "未命名玳瑁"] },
        { label: "女友2", names: ["拘谨"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a20", name: "黑头发三花", pool: false,
      mood: null, color: "三花猫", gender: "母猫", sterilized: false,
      status: "lost", family: "大脸家族", area: "同创", silhouette: "sit",
      photo: "a20.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "男友", names: ["大脸"] },
        { label: "女儿", names: ["牛仔", "未命名玳瑁"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a21", name: "牛仔", pool: false,
      mood: null, color: "奶牛", gender: "母猫", sterilized: false,
      status: "lost", family: "大脸家族", area: "同创", silhouette: "sit",
      photo: "a21.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "爸爸", names: ["大脸"] },
        { label: "妈妈", names: ["黑头发三花"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a22", name: "未命名玳瑁", pool: false,
      mood: null, color: "玳瑁", gender: "母猫", sterilized: false,
      status: "lost", family: "大脸家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "爸爸", names: ["大脸"] },
        { label: "妈妈", names: ["黑头发三花"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a23", name: "叫叫", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: false,
      status: "star", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-突发回喵星",
      relations: [
        { label: "朋友", names: ["猪仔", "瓜瓜"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a24", name: "鸭表弟", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: false,
      status: "star", family: "", area: "同创", silhouette: "sit",
      photo: "a24.jpg", has_photo: true,
      note: "未绝育-突发回喵星",
      relations: [
        { label: "朋友", names: ["猪仔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a25", name: "阿孤", pool: false,
      mood: null, color: "简州猫", gender: "公猫", sterilized: true,
      status: "wait", family: "", area: "同创", silhouette: "sit",
      photo: "a25.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["猪仔", "hoyi2"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a26", name: "不理人三花悠米", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: null,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: "a26.jpg", has_photo: true,
      note: "司猫",
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a27", name: "断瓜", pool: false,
      mood: null, color: "橘白-古典纹", gender: "母猫", sterilized: false,
      status: "lost", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a27.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "儿子", names: ["陈铁牛", "牛弟"] },
        { label: "朋友", names: ["小银"] },
        { label: "前男友", names: ["头盔"] },
        { label: "姐妹", names: ["瓜瓜", "瓜妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a28", name: "南瓜", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "lost", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a28.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "妈妈", names: ["瓜瓜"] },
        { label: "兄弟", names: ["黄瓜"] },
        { label: "姐妹", names: ["彩瓜", "橘瓜"] },
        { label: "爸爸", names: ["头盔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a29", name: "彩瓜", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: false,
      status: "lost", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a29.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "妈妈", names: ["瓜瓜"] },
        { label: "兄弟", names: ["黄瓜", "南瓜"] },
        { label: "姐妹", names: ["橘瓜"] },
        { label: "爸爸", names: ["头盔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a30", name: "黄瓜", pool: false,
      mood: null, color: "全橘", gender: "公猫", sterilized: true,
      status: "lost", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a30.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "妈妈", names: ["瓜瓜"] },
        { label: "兄弟", names: ["南瓜"] },
        { label: "姐妹", names: ["彩瓜", "橘瓜"] },
        { label: "爸爸", names: ["头盔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a31", name: "橘瓜", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: true,
      status: "star", family: "瓜瓜家族", area: "", silhouette: "sit",
      photo: "a31.jpg", has_photo: true,
      note: "已绝育-猫瘟回喵星",
      relations: [
        { label: "妈妈", names: ["瓜瓜"] },
        { label: "兄弟", names: ["南瓜", "黄瓜"] },
        { label: "姐妹", names: ["彩瓜"] },
        { label: "爸爸", names: ["头盔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a32", name: "斯斯", pool: false,
      mood: null, color: "狸白猫", gender: "公猫", sterilized: null,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a32.jpg", has_photo: true,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a33", name: "小橘", pool: false,
      mood: null, color: "全橘-古典纹", gender: "母猫", sterilized: true,
      status: "foster", family: "", area: "同创", silhouette: "sit",
      photo: "a33.jpg", has_photo: true,
      note: "已绝育-寄养",
      relations: [
        { label: "朋友", names: ["小银", "安安", "老鸭"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a34", name: "安安", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "foster", family: "", area: "同创", silhouette: "sit",
      photo: "a34.jpg", has_photo: true,
      note: "已绝育-寄养",
      relations: [
        { label: "朋友", names: ["小橘"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a35", name: "哒哒", pool: false,
      mood: null, color: "简州猫", gender: "公猫", sterilized: true,
      status: "foster", family: "", area: "同创", silhouette: "sit",
      photo: "a35.jpg", has_photo: true,
      note: "已绝育-寄养",
      relations: [
        { label: "朋友", names: ["小橘", "安安"] },
        { label: "不和", names: ["话唠"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a36", name: "包妹", pool: false,
      mood: null, color: "白猫", gender: "母猫", sterilized: true,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a36.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "朋友", names: ["陶喆"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a37", name: "陶喆", pool: false,
      mood: null, color: "奶牛", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a37.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["包妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a38", name: "麦片", pool: false,
      mood: null, color: "乳白美短", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a38.jpg", has_photo: true,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a39", name: "话唠", pool: false,
      mood: null, color: "狸花猫", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a39.jpg", has_photo: true,
      alias: ["喵桑", "喵桑"],
      relations: [
        { label: "前女友", names: ["朱古力"] },
        { label: "朋友", names: ["小屎"] },
        { label: "不和", names: ["哒哒"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a40", name: "朱古力", pool: false,
      mood: null, color: "玳瑁", gender: "母猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "前男友", names: ["话唠"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a41", name: "脏脏包2.0", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: true,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a41.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a42", name: "哒妹", pool: false,
      mood: null, color: "简州猫", gender: "母猫", sterilized: true,
      status: "star", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "已绝育-狗咬死回喵星",
      relations: [
        { label: "朋友", names: ["卷姐"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a43", name: "卷姐", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a43.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["哒妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a44", name: "大吉（哆咪）", pool: false,
      mood: null, color: "狸花加白", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a44.jpg", has_photo: true,
      note: "",
      relations: [
        { label: "朋友", names: ["猪仔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a45", name: "小吉", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: null,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: "a45.jpg", has_photo: true,
      note: "司猫",
      relations: [
        { label: "前男友", names: ["头盔"] },
        { label: "现男友", names: ["嘴碎黄仔"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a46", name: "岁岁", pool: false,
      mood: null, color: "橘猫", gender: "公猫", sterilized: true,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a46.jpg", has_photo: true,
      alias: ["嘴碎黄仔", "嘴碎黄仔"],
      note: "已绝育-失踪",
      relations: [
        { label: "现女友", names: ["小吉"] },
        { label: "妹妹", names: ["瓜妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a47", name: "安静黄仔", pool: false,
      mood: null, color: "橘猫", gender: "公猫", sterilized: false,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a48", name: "亦菲", pool: false,
      mood: null, color: "奶牛", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: "a48.jpg", has_photo: true,
      story: [], quote: ""
    },
    {
      id: "a49", name: "陈铁牛", pool: false,
      mood: null, color: "橘白猫", gender: "公猫", sterilized: false,
      status: "home", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a49.jpg", has_photo: true,
      relations: [
        { label: "兄弟", names: ["牛弟"] },
        { label: "小姨", names: ["瓜瓜"] },
        { label: "妈妈", names: ["断瓜"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a50", name: "牛弟", pool: false,
      mood: null, color: "橘白猫", gender: "公猫", sterilized: true,
      status: "home", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a50.jpg", has_photo: true,
      relations: [
        { label: "兄弟", names: ["陈铁牛"] },
        { label: "小姨", names: ["瓜瓜"] },
        { label: "妈妈", names: ["断瓜"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a51", name: "老鸭", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a51.jpg", has_photo: true,
      relations: [
        { label: "朋友", names: ["小橘"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a52", name: "顺顺", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "home", family: "小队家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "妻", names: ["利利"] },
        { label: "（非亲生）子女", names: ["小队", "卡姿兰", "大队", "红头发", "扎染"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a53", name: "利利", pool: false,
      mood: null, color: "简州猫", gender: "母猫", sterilized: true,
      status: "home", family: "小队家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "夫", names: ["顺顺"] },
        { label: "子女", names: ["小队", "卡姿兰", "大队", "红头发", "扎染"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a54", name: "肥波", pool: false,
      mood: null, color: "简州猫", gender: "公猫", sterilized: null,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: "a54.jpg", has_photo: true,
      note: "司猫",
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a55", name: "努努", pool: false,
      mood: null, color: "银渐层", gender: "母猫", sterilized: null,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "司猫",
      relations: [
        { label: "朋友", names: ["李橘"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a56", name: "李橘", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: null,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "司猫",
      relations: [
        { label: "朋友", names: ["努努"] },
        { label: "妈妈", names: ["小吉"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a57", name: "唠妹", pool: false,
      mood: null, color: "狸花猫", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: "a57.jpg", has_photo: true,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a58", name: "黑小宝", pool: false,
      mood: null, color: "黑猫", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a59", name: "柔柔", pool: false,
      mood: null, color: "玳瑁", gender: "母猫", sterilized: true,
      status: "home", family: "小队家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "养母", names: ["小队"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a60", name: "眼罩", pool: false,
      mood: null, color: "三花猫", gender: "母猫", sterilized: true,
      status: "lost", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: "a60.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "妈妈", names: ["小梅"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a61", name: "小队", pool: false,
      mood: null, color: "雀猫", gender: "母猫", sterilized: false,
      status: "wait", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "a61.jpg", has_photo: true,
      note: "未绝育-抓捕不到",
      relations: [
        { label: "妈妈", names: ["利利"] },
        { label: "爸爸", names: ["顺顺"] },
        { label: "女儿", names: ["树梅"] },
        { label: "儿子", names: ["飞天", "灵珠"] },
        { label: "姐妹", names: ["卡姿兰"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a62", name: "卡姿兰", pool: false,
      mood: null, color: "三花猫", gender: "母猫", sterilized: false,
      status: "lost", family: "小队家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "妈妈", names: ["利利"] },
        { label: "爸爸", names: ["顺顺"] },
        { label: "姐妹", names: ["小队"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a63", name: "小屎", pool: false,
      mood: null, color: "美短", gender: "公猫", sterilized: true,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a63.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "朋友", names: ["话唠"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a64", name: "顺爹", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: false,
      status: "lost", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "", names: [], text: "未知" },
      ],
      story: [], quote: ""
    },
    {
      id: "a65", name: "表弟", pool: false,
      mood: null, color: "奶牛", gender: "母猫", sterilized: false,
      status: "lost", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "表哥", names: ["黑警"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a66", name: "凶凶", pool: false,
      mood: null, color: "雀猫", gender: "公猫", sterilized: false,
      status: "lost", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-失踪",
      relations: [
        { label: "前妻", names: ["小梅"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a67", name: "奶糖", pool: false,
      mood: null, color: "白猫", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a68", name: "树莓", pool: false,
      mood: null, color: "狸花猫", gender: "母猫", sterilized: true,
      status: "lost", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "a68.jpg", has_photo: true,
      alias: ["树梅"],
      note: "已绝育-失踪",
      relations: [
        { label: "妈妈", names: ["小队"] },
        { label: "兄妹", names: ["飞天", "灵珠"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a69", name: "飞天", pool: false,
      mood: null, color: "雀猫", gender: "公猫", sterilized: true,
      status: "lost", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "a69.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "妈妈", names: ["小队"] },
        { label: "兄妹", names: ["树莓", "灵珠"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a70", name: "灵珠", pool: false,
      mood: null, color: "雀猫", gender: "公猫", sterilized: true,
      status: "wait", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "a70.jpg", has_photo: true,
      relations: [
        { label: "妈妈", names: ["小队"] },
        { label: "姐妹", names: ["树梅", "飞天"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a71", name: "虎皮", pool: false,
      mood: null, color: "橘猫", gender: "公猫", sterilized: true,
      status: "wait", family: "小队家族", area: "同创", silhouette: "sit",
      photo: "a71.jpg", has_photo: true,
      relations: [
        { label: "", names: [], text: "未知" },
      ],
      story: [], quote: ""
    },
    {
      id: "a72", name: "拘谨", pool: false,
      mood: null, color: "长毛橘白", gender: "母猫", sterilized: true,
      status: "home", family: "大脸家族", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "前男友", names: ["大脸"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a73", name: "鱿鱼丝", pool: false,
      mood: null, color: "全橘", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a73.jpg", has_photo: true,
      note: "已绝育-司猫弃养-已领养",
      relations: [
        { label: "", names: [], text: "独来独往" },
      ],
      story: [], quote: ""
    },
    {
      id: "a74", name: "花臂", pool: false,
      mood: null, color: "雀猫", gender: "公猫", sterilized: true,
      status: "wait", family: "", area: "创投", silhouette: "sit",
      photo: "a74.jpg", has_photo: true,
      relations: [
        { label: "现女友", names: ["粽妈"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a75", name: "头盔", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: false,
      status: "lost", family: "", area: "同创", silhouette: "sit",
      photo: "a75.jpg", has_photo: true,
      note: "未绝育-失踪",
      relations: [
        { label: "前女友", names: ["瓜瓜", "小吉"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a76", name: "平安", pool: false,
      mood: null, color: "长毛金渐层", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a76.jpg", has_photo: true,
      relations: [
        { label: "", names: [], text: "未知" },
      ],
      story: [], quote: ""
    },
    {
      id: "a78", name: "瓜妹", pool: false,
      mood: null, color: "橘白", gender: "母猫", sterilized: true,
      status: "lost", family: "", area: "", silhouette: "sit",
      photo: "a78.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "哥哥", names: ["岁岁", "瓜哥"] },
        { label: "姐姐", names: ["瓜瓜"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a79", name: "多比", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "home", family: "", area: "", silhouette: "sit",
      photo: "a79.jpg", has_photo: true,
      story: [], quote: ""
    },
    {
      id: "a80", name: "小花", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "", silhouette: "sit",
      photo: null, has_photo: false,
      relations: [
        { label: "", names: [], text: "未知" },
      ],
      story: [], quote: ""
    },
    {
      id: "a81", name: "美食家", pool: false,
      mood: null, color: "奶牛英短", gender: "公猫", sterilized: true,
      status: "foster", family: "", area: "", silhouette: "sit",
      photo: "a81.jpg", has_photo: true,
      note: "已绝育寄养中-猫艾滋",
      relations: [
        { label: "朋友", names: ["milo"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a82", name: "瓜哥", pool: false,
      mood: null, color: "橘白", gender: "公猫", sterilized: true,
      status: "star", family: "瓜瓜家族", area: "同创", silhouette: "sit",
      photo: "a82.jpg", has_photo: true,
      note: "已绝育-车祸回喵星",
      relations: [
        { label: "妹妹", names: ["瓜瓜", "瓜妹"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a83", name: "小黑背", pool: false,
      mood: null, color: "简州猫", gender: "公猫", sterilized: true,
      status: "home", family: "小梅家族", area: "同创", silhouette: "sit",
      photo: "a83.jpg", has_photo: true,
      relations: [
        { label: "外婆", names: ["小梅"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a84", name: "富太", pool: false,
      mood: null, color: "简州猫", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: null, has_photo: false,
      story: [], quote: ""
    },
    {
      id: "a85", name: "东东", pool: false,
      mood: null, color: "狸白猫", gender: "公猫", sterilized: false,
      status: "lost", family: "", area: "创投", silhouette: "sit",
      photo: null, has_photo: false,
      note: "未绝育-受伤救助-失踪",
      story: [], quote: ""
    },
    {
      id: "a86", name: "瓜弟", pool: false,
      mood: null, color: "橘白猫", gender: "公猫", sterilized: true,
      status: "home", family: "瓜瓜家族", area: "创投", silhouette: "sit",
      photo: "a86.jpg", has_photo: true,
      note: "已绝育-受伤救助-领养",
      story: [], quote: ""
    },
    {
      id: "a87", name: "屁橘", pool: false,
      mood: null, color: "橘雀", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: "a87.jpg", has_photo: true,
      relations: [
        { label: "好朋友", names: ["花臂"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a88", name: "小胡", pool: false,
      mood: null, color: "狸花加白", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "同创", silhouette: "sit",
      photo: "a88.jpg", has_photo: true,
      relations: [],
      story: [], quote: ""
    },
    {
      id: "a89", name: "小橘", pool: false,
      mood: null, color: "橘猫", gender: "母猫", sterilized: true,
      status: "lost", family: "大黄家族", area: "创投", silhouette: "sit",
      photo: "a89.jpg", has_photo: true,
      note: "已绝育-失踪",
      relations: [
        { label: "爸爸", names: ["大黄"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a90", name: "多乐", pool: false,
      mood: null, color: "狸花猫", gender: "母猫", sterilized: true,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: "a90.jpg", has_photo: true,
      note: "司猫",
      relations: [],
      story: [], quote: ""
    },
    {
      id: "a91", name: "小菲", pool: false,
      mood: null, color: "彩狸", gender: "母猫", sterilized: true,
      status: "shop", family: "", area: "同创", silhouette: "sit",
      photo: "a91.jpg", has_photo: true,
      note: "司猫",
      relations: [
        { label: "认识", names: ["黑警"] },
      ],
      story: [], quote: ""
    },
    {
      id: "a92", name: "尖尖", pool: false,
      mood: null, color: "黑毛", gender: "公猫", sterilized: false,
      status: "home", family: "粽妈家族", area: "创投", silhouette: "sit",
      photo: "a92.jpg", has_photo: true,
      note: "已领养",
      relations: [],
      story: [], quote: ""
    },
    {
      id: "a93", name: "豹姐", pool: false,
      mood: null, color: "三花", gender: "母猫", sterilized: true,
      status: "home", family: "", area: "创投", silhouette: "sit",
      photo: "a93.jpg", has_photo: true,
      note: "已领养",
      relations: [],
      story: [], quote: ""
    }
  ];

  window.CATS = HALL.concat(ARCHIVE);
})();
