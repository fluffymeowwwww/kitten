/* ============================================================
   同创汇猫咪故事馆 · 猫咪数据（外置 JS，符合离线规范）
   ------------------------------------------------------------
   【如何补全】后续补充真实资料时，只需编辑本文件第 116 行起的
   CATS 数组。每个字段含义见下方「字段说明」。新增照片时把图片
   放进 assets/cats/ 并把 has_photo 改为 true、photo 填文件名。

   【字段说明】
   id        唯一 id，用拼音，别改（图鉴/摸猫都靠它定位）
   name      名字
   mood      性格档位，决定摸到时的反应动效，三选一：
             'close' 亲人｜'shy' 中等需培养｜'gone' 不亲人
   color     花色（显示在标签与图鉴小字里）
   gender    '母猫' 或 '公猫'
   sterilized 是否已绝育
   adopted   是否已被领养（false=还在等家；将来领养了改 true）
   family    家族名（图鉴左上角小标签 + 故事页「家族」一行）
   silhouette 无照片时用的剪影造型，四选一：
             'sit' 蹲坐｜'peek' 探头｜'trio' 三只｜'family' 大猫带小猫
   photo     照片文件名（放进 assets/cats/），无照片填 null
   has_photo 是否有照片
   story     故事正文，一个元素一段话；故事里出现别的猫名时，
             用 [[名字]] 包起来会自动变成可点击的「串门」热词
   quote     金句（故事页深色块 + 共鸣卡上那句）
   cardNote  有照片时无需填；无照片时显示在照片位下方的话
   ============================================================ */
(function () {
  "use strict";

  window.CATS = [
    {
      id: "guagua", name: "瓜瓜", mood: "close",
      color: "橘白", gender: "母猫", sterilized: true, adopted: false,
      family: "瓜瓜家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "曾用名小小只，曾经是不足饭盒大的身形，生过一次娃，现在是小银的大姐头。",
        "她嘴边常挂着[[小银]]——那个害羞的跟班小弟，全靠她罩。"
      ],
      quote: "习惯流浪的人也会想家——给姐姐一点适应期，她会把家还给你。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaoyin", name: "小银", mood: "shy",
      color: "银渐层", gender: "公猫", sterilized: true, adopted: false,
      family: "瓜瓜家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "喜欢橘猫，所有的好朋友都是橘猫。流浪这么久，把自己照顾得好好的。",
        "唯一的大姐头是[[瓜瓜]]，跟着她才有安全感。"
      ],
      quote: "一只害羞的跟班小弟。给点耐心，不伤人，会慢慢靠近你。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "zhuzai", name: "猪仔", mood: "close",
      color: "简州猫", gender: "公猫", sterilized: true, adopted: false,
      family: "大脸家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "果园原住民，曾经有伙伴。伙伴离开后拆了伙，从此独来独往，亲人的外表下，其实有点想念从前。"
      ],
      quote: "曾经有伙伴。亲人，但习惯了流浪，需要一个适应期。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "sanyanmei", name: "三眼妹", mood: "close",
      color: "彩狸", gender: "母猫", sterilized: true, adopted: false,
      family: "大脸家族", silhouette: "peek", photo: null, has_photo: false,
      story: [
        "亲人。约四到五岁，彩狸。关于自己到底是哪一种花色的疑问，她表示不予置评。"
      ],
      quote: "她习惯了风餐露宿，但亲人的孩子，值得一个家。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "dahua", name: "大华", mood: "gone",
      color: "金渐层", gender: "母猫", sterilized: true, adopted: false,
      family: "大黄家族", silhouette: "peek", photo: null, has_photo: false,
      story: [
        "胆小怕人，但颜值高。金渐层流浪这么久，自己就是底气。"
      ],
      quote: "她不需要你马上喜欢她。等她准备好，颜值就是 Bonus。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaoxiaomao", name: "小小猫", mood: "close",
      color: "狸花", gender: "母猫", sterilized: true, adopted: false,
      family: "三姐妹", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "三姐妹之小小猫，约一岁，亲人。"
      ],
      quote: "一窝三姐妹，同进同退。带走一只，就是给三姐妹打了个样。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaomao", name: "小猫", mood: "close",
      color: "狸花", gender: "母猫", sterilized: true, adopted: false,
      family: "三姐妹", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "三姐妹之小猫，约一岁，亲人。"
      ],
      quote: "一窝三姐妹，同进同退。带走一只，就是给三姐妹打了个样。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "zhongmao", name: "中猫", mood: "close",
      color: "狸花", gender: "母猫", sterilized: true, adopted: false,
      family: "三姐妹", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "三姐妹之中猫，约一岁，亲人。"
      ],
      quote: "一窝三姐妹，同进同退。带走一只，就是给三姐妹打了个样。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "tiebai", name: "铁白", mood: "close",
      color: "白猫", gender: "母猫", sterilized: true, adopted: false,
      family: "瓜瓜家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "风雨无阻，每天都来同一个路口，贴贴每一个路过的人类。",
        "耳朵有点不灵光了，但心还在等。她和[[瓜瓜]]一样，是这片片区里最信任人类的猫。"
      ],
      quote: "贴贴了那么多年路人，始终没等到自己的妈妈。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "milo", name: "milo", mood: "shy",
      color: "狸花", gender: "公猫", sterilized: false, adopted: false,
      family: "小队家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "大脸盘古典纹。曾经眼巴巴看着伙伴被抓进航空箱，自己也想跟着进去——好像进了航空箱，就能有家了。"
      ],
      quote: "他想要一个航空箱的目的地。淡猫需培养感情，但很乖。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaomei", name: "小梅", mood: "gone",
      color: "三花", gender: "母猫", sterilized: true, adopted: false,
      family: "小梅家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "太奶级别的猫咪大家长。做了这么多年的家长，这一回，该有人守护她了。"
      ],
      quote: "做了这么多年的大家长，这一回，该有人守护她了。不亲人，但身体素质高。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "dianbai", name: "点白", mood: "gone",
      color: "三花", gender: "母猫", sterilized: true, adopted: false,
      family: "小梅家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "小梅的孙女，约一岁。奶奶还守在原地，希望孙女这一辈，先走进一个家。"
      ],
      quote: "奶奶还守在原地。希望孙女这一辈，先走进一个家。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "xiaodui", name: "小队 & 队娃", mood: "shy",
      color: "雀猫", gender: "2大3小", sterilized: false, adopted: false,
      family: "小队家族", silhouette: "family", photo: null, has_photo: false,
      story: [
        "小队（母）+ 灵珠（公）+ 队娃三只，一共 5 只：2 大 3 小。",
        "遇见即全家福。家应该是整队的。"
      ],
      quote: "一共 5 只，2 大 3 小。家应该是整队的——遇见即全家福。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "caihong", name: "彩虹", mood: "close",
      color: "三花", gender: "母猫", sterilized: true, adopted: false,
      family: "小梅家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "亲人，颜值高。三花里最明媚的一抹。"
      ],
      quote: "遇见她，就是遇见彩虹本虹。",
      cardNote: "TA 的照片还在路上"
    },
    {
      id: "shenshi", name: "绅士", mood: "close",
      color: "奶牛", gender: "公猫", sterilized: true, adopted: false,
      family: "大黄家族", silhouette: "sit", photo: null, has_photo: false,
      story: [
        "亲人、爱说话。话痨的奶牛猫找家，方式很直接——一直对着你说「你好」。"
      ],
      quote: "话痨的奶牛猫找家，方式很直接——一直对着你说「你好」。",
      cardNote: "TA 的照片还在路上"
    }
  ];
})();