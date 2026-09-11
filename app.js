/* ============================================================
   同创汇猫咪故事馆 · 主逻辑（外置 JS，全 addEventListener，无 fetch）
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 常量与状态 ---------- */
  var PREFIX = "tc-cat-story:";
  var DEADLINE = new Date("2026-11-30T23:59:59+08:00");
  /* v1.5：摸到瞬间的反应插画按「花色」分组，统一温馨动作，不再按性格分三档
     v1.5.1：增至 8 组（新增简州猫）；池内花色已全部订正为标准名，直接按 color 归组 */
  var COAT_IMG = {
    orange: "assets/react-orange.webp",       // 橘白
    golden: "assets/react-golden.webp",       // 金渐层
    silver: "assets/react-silver.webp",       // 银渐层
    cow: "assets/react-cow.webp",             // 奶牛
    jianzhou: "assets/react-jianzhou.webp",   // 简州猫
    tabby: "assets/react-tabby.webp",         // 狸花（含雀猫）
    calico: "assets/react-calico.webp",       // 三花
    white: "assets/react-white.webp"          // 纯白
  };
  // 每组动作：pet 被摸蹭手心｜stretch 伸懒腰，决定旁白文案
  var COAT_SCENE = {
    orange: "pet", golden: "stretch", silver: "pet", cow: "pet",
    jianzhou: "pet", tabby: "stretch", calico: "pet", white: "stretch"
  };
  var REACT_TXT = {
    pet: ["TA 把脑袋轻轻凑了过来。", "咕噜咕噜——这是猫给你的见面礼。"],
    stretch: ["TA 当着你的面，伸了个大大的懒腰。", "猫只有在觉得安全的地方，才会这样放松。"]
  };
  function coatGroup(cat) {
    var c = cat.color || "";
    if (/金渐层/.test(c)) return "golden";
    if (/银渐层/.test(c)) return "silver";
    if (/奶牛/.test(c)) return "cow";
    if (/简州/.test(c)) return "jianzhou";
    if (/三花|玳瑁|彩狸/.test(c)) return "calico";
    if (/狸花|雀猫|虎斑/.test(c)) return "tabby";
    if (/白猫/.test(c)) return "white";
    return "orange";  // 橘白/全橘等橘系及兜底
  }
  var REACT_CYCLE = 3200;
  var MOOD_LABEL = { close: "亲人", shy: "中等 · 需培养", gone: "不亲人" };
  var SILSIL = { sit: "i-cat-sit", peek: "i-cat-peek", trio: "i-cat-trio", family: "i-cat-family" };
  /* v1.4：留言主题从「想对 TA 说」改为「说说和 TA 的故事」
     chip 是故事开头（带省略号展示），点击填入输入框由用户续写 */
  var STORY_STARTERS = [
    "第一次知道 TA，是……",
    "如果真的遇见 TA，我想……",
    "我希望 TA 的故事，后来……"
  ];
  // 什么都没写时印在卡片上的兜底微故事（也作为初始预览文案）
  var DEFAULT_SAY = "第一次知道 TA，是在这里。今天，我记住了 TA。";
  function starterText(chip) { return chip.replace(/……$/, ""); }
  // 保存卡片前规范化：空内容、或只点了开头没续写，都用兜底故事
  function normalizeSay(s) {
    var v = String(s || "").trim();
    if (!v) return DEFAULT_SAY;
    for (var i = 0; i < STORY_STARTERS.length; i++) {
      if (v === starterText(STORY_STARTERS[i])) return DEFAULT_SAY;
    }
    return v;
  }

  // 现状标签：用于「猫猫手册」列表角标与档案卡
  var STATUS_TAG = {
    wait: { t: "还在等家", cls: "tag-wait" },
    home: { t: "TA 有家了", cls: "tag-home" },
    star: { t: "已回喵星", cls: "tag-star" },
    lost: { t: "失踪", cls: "tag-lost" },
    shop: { t: "司猫", cls: "tag-shop" },
    foster: { t: "寄养中", cls: "tag-foster" }
  };
  var STATUS_LINE = {
    wait: "还在等一个家。",
    home: "TA 已经有人带回家了。",
    star: "TA 已经回喵星了。",
    lost: "TA 失踪了，没有再出现。",
    shop: "TA 是店里的常驻小猫。",
    foster: "TA 现在在寄养家庭里。"
  };
  var ARCHIVE_CAP = { star: "记着 TA 就好", lost: "给 TA 留一张空位" };

  // 摸猫池：只有 HALL 的 15 位会出现在首页抽卡里
  var POOL = CATS.filter(function (c) { return c.pool; });
  // 名字 → 猫（含别名与原表错别字），用于故事里 [[热词]] 的跳转
  var NAME_MAP = (function () {
    var m = {};
    CATS.forEach(function (c) {
      m[c.name] = c;
      (c.alias || []).forEach(function (a) { m[a] = c; });
    });
    return m;
  })();
  function resolveCat(name) {
    if (NAME_MAP[name]) return NAME_MAP[name];
    for (var i = 0; i < CATS.length; i++) {
      var n = CATS[i].name;
      if (n.indexOf(name) !== -1 || name.indexOf(n) !== -1) return CATS[i];
    }
    return null;
  }

  function getKey(k) { return PREFIX + k; }
  function loadJSON(k, fb) { try { var v = localStorage.getItem(getKey(k)); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function saveJSON(k, v) { try { localStorage.setItem(getKey(k), JSON.stringify(v)); } catch (e) {} }

  // 署名：头像固定第 3 个猫猫头像，无简介；默认昵称 momo，用户改过才写入 localStorage
  var ME_AVATAR = "assets/avatar-3.webp";
  var DEFAULT_NICK = "momo";
  var LEGACY_DEFAULT_NICK = "今天也想摸猫";   // 旧版占位昵称，存量迁移时不沿用
  function initialNick() {
    var old = loadJSON("me", null);
    // 仅迁移用户自己填过的昵称；旧默认占位名、空值都回退 momo
    return (old && old.nick && old.nick !== LEGACY_DEFAULT_NICK) ? old.nick : DEFAULT_NICK;
  }

  var state = {
    me: { nick: initialNick() },
    petted: loadJSON("petted", []),        // 已摸(不重复) id 数组
    deck: loadJSON("deck", null),          // 洗牌结果
    ptr: loadJSON("ptr", 0),
    current: null,                          // 当前展示的猫数据
    say: DEFAULT_SAY
  };

  var $ = function (s) { return document.querySelector(s); };
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  /* ---------- 倒计时 ---------- */
  function daysLeft() {
    return Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000));
  }

  /* ---------- 洗牌 ---------- */
  function freshDeck() { return shuffle(POOL.map(function (c) { return c.id; })); }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function nextCat() {
    if (!state.deck || state.ptr >= state.deck.length) { state.deck = freshDeck(); state.ptr = 0; }
    var id = state.deck[state.ptr++];
    saveJSON("deck", state.deck); saveJSON("ptr", state.ptr);
    return getCat(id);
  }
  function getCat(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return CATS[0]; }
  function markPetted(id) {
    if (state.petted.indexOf(id) === -1) { state.petted.push(id); saveJSON("petted", state.petted); }
  }

  /* ---------- 视图切换（无 hash，纯状态） ---------- */
  var views = ["v-cover", "v-pet", "v-react", "v-story", "v-card", "v-wall", "v-contact"];
  var TAB_OF = { "v-cover": 1, "v-pet": 1, "v-wall": 1, "v-contact": 1 };   // 底部导航页
  var TAB_MAP = {
    "v-cover": "v-cover",
    "v-pet": "v-pet", "v-react": "v-pet", "v-story": "v-pet", "v-card": "v-pet",
    "v-wall": "v-wall", "v-contact": "v-contact"
  };
  var STORY_CHAIN = ["v-react", "v-story"];                          // 故事链：连续摸猫不堆叠返回层

  function showView(id) {
    for (var i = 0; i < views.length; i++) {
      var el = document.getElementById(views[i]);
      if (el) el.classList.toggle("active", views[i] === id);
    }
    window.scrollTo(0, 0);
    updateBackBtn(id);
    updateTabs(id);
  }
  function updateBackBtn(id) {
    var back = document.querySelector('[data-action="back"]');
    if (back) back.hidden = (id === "v-cover");
  }
  function updateTabs(id) {
    var active = TAB_MAP[id] || "v-cover";
    var tabs = document.querySelectorAll("#tabbar .tab");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("active", tabs[i].dataset.tab === active);
  }
  var navStack = ["v-cover"];
  function push(id) {
    var top = navStack[navStack.length - 1];
    if (TAB_OF[id]) navStack = [id];                                 // 落到导航页＝回到根，清空返回链
    else if (STORY_CHAIN.indexOf(id) !== -1 && STORY_CHAIN.indexOf(top) !== -1) navStack[navStack.length - 1] = id;
    else if (top !== id) navStack.push(id);
    showView(id);
  }
  function back() {
    if (navStack.length > 1) navStack.pop();
    var to = navStack[navStack.length - 1] || "v-pet";
    showView(to);
    if (to === "v-pet") updateMeStrip();
  }

  /* ---------- 署名（无登记页，卡片页就地改名；头像固定、无简介） ---------- */
  // 署名条昵称 + 卡片页脚同步
  function syncMeCard() {
    document.getElementById("meEditNick").textContent = state.me.nick || DEFAULT_NICK;
    if (state.current) syncCard();
  }
  function toggleMePanel() {
    var panel = document.getElementById("meEditPanel");
    var bar = document.getElementById("meEditBar");
    var opening = panel.hidden;
    if (opening) {
      var input = document.getElementById("meNickInput");
      input.value = state.me.nick || DEFAULT_NICK;
      input.focus();
      try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
    }
    panel.hidden = !opening;
    bar.setAttribute("aria-expanded", opening ? "true" : "false");
    document.getElementById("meEditAct").textContent = opening ? "收起" : "改一下";
  }

  /* ---------- 摸猫：摸到瞬间（名字与简介立即可见，动效照播一遍） ---------- */
  var reactTimer = null;

  // 摸猫：抽取摸猫（首页 draw）只从待安排池里抽；主动摸猫（手册 petCat）任意猫都能摸
  function petCat(cat) {
    state.current = cat;
    markPetted(cat.id);
    updateMeStrip();
    playReaction(cat);
    navStack = ["v-pet"];                   // 新的一次摸猫：返回链从摸猫页重新开始
    push("v-react");
  }
  function draw() { petCat(nextCat()); }

  function playReaction(cat) {
    if (reactTimer) { clearTimeout(reactTimer); reactTimer = null; }
    var stage = document.getElementById("reactStage");
    var img = document.getElementById("reactImg");
    var narr = document.getElementById("reactNarr");
    var revealName = document.getElementById("revealName");
    var goBtn = document.querySelector("#v-react .react-actions .btn");

    var group = coatGroup(cat);              // 按花色选插画与旁白，动效全猫统一
    stage.className = "react-stage";        // 清掉旧类，重排后再加，动画才会重播
    if (goBtn) goBtn.classList.remove("ready");
    img.src = COAT_IMG[group];
    img.alt = cat.name + "的反应";
    if (revealName) revealName.textContent = cat.name;
    renderTags(document.getElementById("reactTags"), cat);   // 简介标签行，进入即见
    narr.innerHTML = REACT_TXT[COAT_SCENE[group]].map(function (t) {
      return '<span class="line">' + t + "</span>";
    }).join("");

    void stage.offsetWidth;
    stage.className = "react-stage stage-warm";

    // 动效演完后不再自动翻页：只把按钮点亮并轻轻提示，等用户自己点「看看 TA 的故事」
    reactTimer = setTimeout(function () {
      reactTimer = null;
      if (goBtn) goBtn.classList.add("ready");
    }, REACT_CYCLE);
  }

  function gotoStory(cat) {
    if (!cat) return;
    if (reactTimer) { clearTimeout(reactTimer); reactTimer = null; }
    renderStory(cat);
    push("v-story");
  }

  /* 预加载花色反应图，避免切页时白屏 */
  function preload() {
    Object.keys(COAT_IMG).forEach(function (k) { var i = new Image(); i.src = COAT_IMG[k]; });
  }

  /* ---------- 标签行（摸到瞬间的简介 / 故事页 / 档案卡共用） ---------- */
  function tagData(cat) {
    var tags = [{ t: cat.color + " · " + cat.gender }];
    if (cat.mood) tags.push({ t: MOOD_LABEL[cat.mood], cls: "tag-mood" });
    if (cat.sterilized) tags.push({ t: "已绝育" });
    var s = STATUS_TAG[cat.status];
    if (s) tags.push({ t: s.t, cls: s.cls });
    return tags;
  }
  function renderTags(wrap, cat) {
    if (!wrap) return;
    wrap.innerHTML = "";
    tagData(cat).forEach(function (d) {
      var s = document.createElement("span");
      s.className = "tag" + (d.cls ? " " + d.cls : "");
      s.textContent = d.t; wrap.appendChild(s);
    });
  }

  /* ---------- 故事渲染（含热词串门）；档案猫没有故事，改渲染档案卡 ---------- */
  function renderStory(cat) {
    document.getElementById("storyName").textContent = cat.name;

    // 标签
    renderTags(document.getElementById("storyTags"), cat);

    // 照片位
    renderPhotoSlot(document.getElementById("storyPhoto"), cat);
    document.getElementById("storyCap").textContent = cat.has_photo
      ? "照片由群护志愿者提供"
      : (ARCHIVE_CAP[cat.status] || cat.cardNote || "TA 的照片还在路上");

    var body = document.getElementById("storyBody");
    body.innerHTML = "";
    var hasStory = cat.story && cat.story.length;
    if (hasStory) {
      cat.story.forEach(function (txt) { body.appendChild(buildPara(txt)); });
      var quote = document.createElement("p"); quote.className = "quote"; quote.textContent = cat.quote; body.appendChild(quote);
      if (cat.family) body.appendChild(familyRow(cat.family));
    } else {
      body.appendChild(buildArchive(cat));
    }
    // v1.5.2：手册里所有猫都能写「我和 TA 的故事」、生成共鸣卡（无金句时卡片自动收起该位）
    document.getElementById("toCardWrap").hidden = false;
  }

  function familyRow(name) {
    var fam = document.createElement("p"); fam.className = "family-row";
    fam.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>';
    fam.appendChild(document.createTextNode(name));
    return fam;
  }

  /* ---------- 档案卡（表二里只有档案、没有故事的猫） ---------- */
  function buildArchive(cat) {
    var wrap = document.createElement("div");
    wrap.className = "archive";

    var line = document.createElement("p");
    line.className = "archive-state";
    line.textContent = STATUS_LINE[cat.status] || "";
    wrap.appendChild(line);

    var facts = [
      ["品种", cat.color],
      ["性别", cat.gender],
      ["绝育", cat.sterilized === true ? "已绝育" : (cat.sterilized === false ? "未绝育" : "未记录")],
      ["家族", cat.family || "未归入家族"]
    ];
    var dl = document.createElement("dl");
    dl.className = "archive-facts";
    facts.forEach(function (f) {
      var d = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = f[0];
      var dd = document.createElement("dd"); dd.textContent = f[1];
      d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    });
    wrap.appendChild(dl);

    if (cat.note) {
      var note = document.createElement("p");
      note.className = "archive-note";
      note.textContent = "原表记录：" + cat.note;
      wrap.appendChild(note);
    }

    if (cat.relations && cat.relations.length) {
      var h = document.createElement("h5");
      h.className = "archive-rel-title";
      h.textContent = "TA 的关系网";
      wrap.appendChild(h);
      var ul = document.createElement("ul");
      ul.className = "archive-rel";
      cat.relations.forEach(function (r) {
        var li = document.createElement("li");
        if (r.label) {
          var lb = document.createElement("span"); lb.className = "rel-label"; lb.textContent = r.label;
          li.appendChild(lb);
        }
        var names = r.names || [];
        if (!names.length) {
          li.appendChild(document.createTextNode(r.text || ""));
        } else {
          names.forEach(function (n, i) {
            if (i) li.appendChild(document.createTextNode("、"));
            li.appendChild(hotWord(n));
          });
        }
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }
    return wrap;
  }

  // 名字能在名单里找到 → 做成可点的串门热词；找不到就只当普通文字
  function hotWord(name) {
    var target = resolveCat(name);
    var el = document.createElement("span");
    el.textContent = name;
    if (target) {
      el.className = "hot";
      el.addEventListener("click", function () { jumpTo(target.name); });
    }
    return el;
  }

  function buildPara(txt) {
    var p = document.createElement("p");
    var re = /\[\[([^\]]+)\]\]/g; var last = 0; var m;
    while ((m = re.exec(txt)) !== null) {
      if (m.index > last) p.appendChild(document.createTextNode(txt.slice(last, m.index)));
      p.appendChild(hotWord(m[1]));
      last = m.index + m[0].length;
    }
    if (last < txt.length) p.appendChild(document.createTextNode(txt.slice(last)));
    return p;
  }
  function jumpTo(name) {
    var c = resolveCat(name);
    // 串门是「去读 TA 的故事」，不再重放反应动效
    if (c) { state.current = c; markPetted(c.id); gotoStory(c); }
  }

  function renderPhotoSlot(el, cat) {
    el.innerHTML = "";
    if (cat.has_photo && cat.photo) {
      var img = document.createElement("img"); img.src = "assets/cats/" + cat.photo; img.alt = cat.name;
      el.appendChild(img);
    } else {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#" + (SILSIL[cat.silhouette] || "i-cat-sit"));
      svg.appendChild(use);
      el.appendChild(svg);
      el.dataset.placeholder = "1";
    }
  }

  /* ---------- 故事（原留言） ---------- */
  function renderSays() {
    var wrap = document.getElementById("sayChips");
    var input = document.getElementById("sayInput");
    wrap.innerHTML = "";
    STORY_STARTERS.forEach(function (chip) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = chip;
      if (state.say.indexOf(starterText(chip)) === 0) b.classList.add("on");
      b.addEventListener("click", function () {
        // 点开头：填入输入框、光标停到末尾直接续写
        input.value = starterText(chip);
        state.say = input.value;
        applySay(); syncChips(); updateSayCount();
        input.focus();
        var len = input.value.length;
        try { input.setSelectionRange(len, len); } catch (e) {}
      });
      wrap.appendChild(b);
    });
    // 初始兜底故事只显示在卡片上，输入框留空给 placeholder
    input.value = (state.say === DEFAULT_SAY) ? "" : state.say;
    updateSayCount();
  }
  function syncChips() {
    var chips = document.querySelectorAll("#sayChips .chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle("on", state.say.indexOf(starterText(chips[i].textContent)) === 0);
    }
  }
  function updateSayCount() {
    var el = document.getElementById("sayCount");
    var input = document.getElementById("sayInput");
    if (el && input) el.textContent = input.value.length;
  }
  function applySay() {
    state.current = state.current || getCat("tiebai");
    document.getElementById("cardSay").textContent = state.say;
  }

  /* ---------- 共鸣卡预览（DOM 同步） ---------- */
  function syncCard() {
    var cat = state.current;
    if (!cat) return;
    document.getElementById("cardName").textContent = cat.name;
    // 档案猫 mood 为 null：标签行过滤空位，避免出现 undefined
    var tags = [cat.color, cat.gender, MOOD_LABEL[cat.mood]].filter(Boolean);
    document.getElementById("cardTags").innerHTML = tags.map(function (t) { return "<em>" + t + "</em>"; }).join("");
    document.getElementById("cardWait").textContent = (STATUS_TAG[cat.status] || {}).t || "还在等家";
    document.getElementById("cardWait").classList.toggle("home", cat.status === "home");
    // 没有金句的档案猫：整行收起，故事框自然上移
    var qEl = document.getElementById("cardQuote");
    if (cat.quote) { qEl.hidden = false; qEl.innerHTML = "「" + cat.quote + "」"; }
    else { qEl.hidden = true; qEl.innerHTML = ""; }
    renderPhotoSlot(document.getElementById("cardPhoto"), cat);
    document.getElementById("cardNick").textContent = state.me.nick || DEFAULT_NICK;
    document.getElementById("cardDays").textContent = daysLeft();
  }

  /* ---------- Canvas 共鸣卡导出 ---------- */
  var SILSVG = {
    sit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="{C}"><path d="M32 88 C19 86 13 76 16 66 C18 59 26 56 30 61 C33 65 29 70 25 68" fill="none" stroke="{C}" stroke-width="10" stroke-linecap="round"/><path d="M28 94 Q24 62 41 50 Q51 43 61 45 Q79 49 83 68 L83 94 Z"/><circle cx="61" cy="39" r="19"/><path d="M77 34 C83 34 88 37 88 41 C88 45 83 47 78 46 Z"/><path d="M46 27 L43 6 L59 22 Z"/><path d="M66 23 L75 4 L82 24 Z"/></g></svg>',
    peek: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="{C}" fill="none" stroke-width="3.4" stroke-linejoin="round"><path d="M15 62 h31 l-7 -13 H9 Z"/><path d="M54 62 h31 l7 -13 H62 Z"/><rect x="13" y="62" width="74" height="30"/></g><g fill="{C}"><path d="M36 64 C36 49 44 41 53 41 C63 41 70 49 70 62 L70 65 L36 65 Z"/><path d="M41 47 L38 32 L51 40 Z"/><path d="M63 44 L70 31 L72 46 Z"/></g></svg>',
    trio: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="{C}"><path d="M13 92 Q10 76 22 71 Q34 76 33 92 Z"/><circle cx="22" cy="66" r="13"/><path d="M12 58 L10 47 L21 54 Z"/><path d="M25 55 L31 46 L33 57 Z"/><path d="M37 94 Q33 66 51 55 Q68 62 67 94 Z"/><circle cx="51" cy="53" r="17"/><path d="M38 43 L35 28 L50 38 Z"/><path d="M55 40 L63 26 L68 42 Z"/><path d="M69 92 Q66 78 77 73 Q89 78 88 92 Z"/><circle cx="78" cy="68" r="12"/><path d="M69 61 L68 51 L77 57 Z"/><path d="M81 59 L87 50 L90 61 Z"/></g></svg>',
    family: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="{C}" stroke="{C}" stroke-linecap="round"><path d="M15 88 C7 85 3 77 6 70 C8 65 14 63 17 67" fill="none" stroke-width="7.5"/><path d="M10 94 Q7 70 21 60 Q30 54 38 56 Q50 60 52 75 L52 94 Z"/><circle cx="35" cy="49" r="14"/><path d="M47 46 C51 46 54 48 54 50 C54 53 51 54 48 53 Z"/><path d="M24 40 L22 26 L34 35 Z"/><path d="M39 38 L47 26 L51 40 Z"/><path d="M58 94 Q56 82 65 78 Q75 82 74 94 Z"/><circle cx="65" cy="74" r="10"/><path d="M58 68 L57 60 L64 65 Z"/><path d="M68 67 L73 60 L75 68 Z"/><path d="M78 94 Q76 84 84 80 Q93 84 92 94 Z"/><circle cx="84" cy="76" r="9"/><path d="M78 71 L77 64 L83 68 Z"/><path d="M87 70 L91 64 L93 71 Z"/></g></svg>'
  };
  function loadImg(src) {
    return new Promise(function (res, rej) {
      var i = new Image();
      i.onload = function () { res(i); };
      i.onerror = function () { rej(new Error("load fail " + src)); };
      i.src = src;
    });
  }
  /* 导出卡片状态色：与 DOM 预览卡的角标配色一致 */
  var CARD_STATUS_COLOR = { wait: "#aa4d31", home: "#5c7a4f", star: "#7c806d", lost: "#7c806d", shop: "#b98534", foster: "#b98534" };
  function saveCard() {
    var cat = state.current; if (!cat) return;
    // 3:4 明信片，与页面里的 DOM 预览卡同一套版式（DOM 卡 330 宽，导出缩放 2.27 倍）
    var W = 750, H = 1000;
    var L = 50, R = 700;                       // 内容左右界
    var cv = document.getElementById("cardCanvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    var pine = "#263f36", rust = "#aa4d31", ochre = "#b98534", ink = "#3a3326", muted = "#8a8268";
    var SERIF = "'Songti SC','STSong',serif";

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function setFont(size, weight, ls) {
      ctx.font = (weight || 400) + " " + size + "px " + SERIF;
      try { ctx.letterSpacing = ls || "0px"; } catch (e) {}   // 老浏览器忽略
    }
    function txt(s, x, y, size, color, align, weight, ls) {
      setFont(size, weight, ls);
      ctx.fillStyle = color; ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(s, x, y);
    }
    // 先设字体再量字分行（旧版踩过字号错位导致溢出的坑）；含中文避头尾，与浏览器换行一致
    function wrapLines(s, maxW, size, weight, ls) {
      setFont(size, weight || 700, ls);
      var CL = "」』，。！？、；：）)】…—";  // 不可出现在行首
      var OP = "「『（(【";                   // 不可出现在行尾
      var chars = String(s).split(""), line = "", lines = [];
      chars.forEach(function (ch) {
        if (line && ctx.measureText(line + ch).width > maxW) {
          if (CL.indexOf(ch) >= 0) {
            // 闭合标点挂回上一行；把上一行末尾第一个非标点字挪到新行
            var k = line.length - 1;
            while (k > 0 && CL.indexOf(line[k]) >= 0) k--;
            lines.push(line.slice(0, k));
            line = line.slice(k) + ch;
          } else {
            lines.push(line);
            line = ch;
          }
        } else {
          line += ch;
        }
      });
      if (line) lines.push(line);
      // 行尾的开始标点挪到下一行行首
      for (var i = 0; i < lines.length - 1; i++) {
        while (lines[i] && OP.indexOf(lines[i].slice(-1)) >= 0) {
          lines[i + 1] = lines[i].slice(-1) + lines[i + 1];
          lines[i] = lines[i].slice(0, -1);
        }
      }
      return lines.filter(Boolean);
    }
    // 沿圆弧写字（邮戳环排）。角度以 canvas 顺时针计，270° 为正上方
    function arcText(s, cx, cy, r, startDeg, endDeg, size, color) {
      var chars = String(s).split(""), n = chars.length;
      ctx.save();
      setFont(size, 700, "1px");
      ctx.fillStyle = color; ctx.textAlign = "center";
      for (var i = 0; i < n; i++) {
        var a = (startDeg + (endDeg - startDeg) * (n === 1 ? .5 : i / (n - 1))) * Math.PI / 180;
        ctx.save();
        ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
        ctx.rotate(a + Math.PI / 2);
        ctx.fillText(chars[i], 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
    // 大圆邮戳（对应 DOM 的 #i-postmark，压在留言框左下）
    function drawPostmark(cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(-Math.PI / 13);
      ctx.globalAlpha = .5;
      ctx.strokeStyle = ochre; ctx.fillStyle = ochre;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r - 13, 0, Math.PI * 2); ctx.stroke();
      arcText("同创汇猫咪故事馆 · 秋日来信 · VOL.01", 0, 0, r - 8, 152, 388, 12.5, ochre);
      txt("已遇见", 0, 4, 22, ochre, "center", 700, "3px");
      txt("2026 · AUTUMN", 0, 27, 12, ochre, "center", 400);
      ctx.restore();
    }

    // 外框双线
    ctx.fillStyle = "#fbf4e4"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = pine; ctx.lineWidth = 6; ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.globalAlpha = .55; ctx.lineWidth = 2; ctx.strokeRect(26, 26, W - 52, H - 52); ctx.globalAlpha = 1;

    // 图片素材：猫照片 / 矢量剪影 / 头像 / 邮票
    var catImgTask = cat.has_photo && cat.photo
      ? loadImg("assets/cats/" + cat.photo)
      : loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(SILSVG[cat.silhouette || "sit"].replace(/\{C\}/g, pine)));
    return Promise.all([catImgTask, loadImg(ME_AVATAR), loadImg("assets/stamp.webp")])
    .then(function (rs) {
      var im = rs[0], avatar = rs[1], stamp = rs[2];

      /* —— 页眉：馆名 + 期号 + 邮票 —— */
      txt("同创汇猫咪故事馆", L, 84, 27, pine, "left", 700, "2px");
      txt("VOL.01 · 秋日来信 · 遇见纪念", L, 116, 17, "#7c806d", "left");
      ctx.save();
      ctx.translate(W - 50, 40); ctx.rotate(Math.PI / 26);
      ctx.shadowColor = "rgba(38,63,54,.25)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
      ctx.drawImage(stamp, -132, 0, 132, 132);
      ctx.restore();
      // 分割线 + 末端小圆点
      ctx.strokeStyle = pine; ctx.globalAlpha = .5; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(L, 142); ctx.lineTo(R, 142); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = pine;
      ctx.beginPath(); ctx.arc(R, 140, 3.5, 0, Math.PI * 2); ctx.fill();

      /* —— 猫区：小拍立得 + 右侧大名/标签（对应 .card-cat） —— */
      // 拍立得：微旋转、白边、落影；底部留白条但不写名字（名字在右侧）
      var pcx = 150, pcy = 273, pw = 200, pTop = 14, pSide = 14, pPhoto = 172, pBottom = 36;
      ctx.save();
      ctx.translate(pcx, pcy); ctx.rotate(-2 * Math.PI / 180);
      ctx.shadowColor = "rgba(38,63,54,.25)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#fffaf0"; ctx.fillRect(-pw / 2, -111, pw, pTop + pPhoto + pBottom);
      ctx.shadowColor = "transparent";
      ctx.beginPath(); ctx.rect(-pw / 2 + pSide, -111 + pTop, pPhoto, pPhoto); ctx.clip();
      if (cat.has_photo) {
        var s = Math.max(pPhoto / im.width, pPhoto / im.height);
        ctx.drawImage(im, -im.width * s / 2, -111 + pTop + (pPhoto - im.height * s) / 2, im.width * s, im.height * s);
      } else {
        var ds = pPhoto * .64;
        ctx.drawImage(im, -ds / 2, -111 + pTop + (pPhoto - ds) / 2, ds, ds);
      }
      ctx.restore();

      // 大名（超长自动缩档）
      var nameX = 282, nameSize = 50;
      setFont(nameSize, 900, "4px");
      while (ctx.measureText(cat.name).width > R - nameX && nameSize > 36) {
        nameSize -= 3; setFont(nameSize, 900, "4px");
      }
      txt(cat.name, nameX, 240, nameSize, pine, "left", 900, "4px");

      // 标签行：花色 / 性别 / 亲人度（与 DOM #cardTags 一致，3 枚，自动换行）
      var tagList = [cat.color, cat.gender, MOOD_LABEL[cat.mood]].filter(Boolean);
      var tx = nameX, ty = 268, th = 38, gapX = 10;
      tagList.forEach(function (t) {
        setFont(18, 400);
        var tw = ctx.measureText(t).width + 40;
        if (tx + tw > R) { tx = nameX; ty += th + 10; }
        ctx.fillStyle = "rgba(248,239,218,.6)";
        roundRect(tx, ty, tw, th, 19); ctx.fill();
        ctx.strokeStyle = "rgba(38,63,54,.27)"; ctx.lineWidth = 1.5; ctx.stroke();
        txt(t, tx + tw / 2, ty + 25, 18, "#52614e", "center");
        tx += tw + gapX;
      });

      // 状态：旋转小印章签（对应 .wait，颜色随状态）
      var stLabel = (STATUS_TAG[cat.status] || STATUS_TAG.wait).t;
      var stColor = CARD_STATUS_COLOR[cat.status] || rust;
      var stY = ty + th + 20;
      setFont(18, 700, "2px");
      var sw = ctx.measureText(stLabel).width + 32;
      ctx.save();
      ctx.translate(nameX + sw / 2, stY + 19); ctx.rotate(-3 * Math.PI / 180);
      ctx.strokeStyle = stColor; ctx.lineWidth = 2;
      roundRect(-sw / 2, -19, sw, 38, 7); ctx.stroke();
      txt(stLabel, 0, 6, 18, stColor, "center", 700, "2px");
      ctx.restore();

      /* —— 金句：居中粗体，自带「」（v1.4 压缩字号，给故事让版面）
              v1.5.2：档案猫无金句时整段省略，故事框上移接住版面 —— */
      var sayText = normalizeSay(state.say);
      var boxX = L, boxW = R - L, boxBottom = 788, boxY;
      if (cat.quote) {
        var qSize = 28, qLH = 42, qTop = 408;
        var qLines = wrapLines("「" + cat.quote + "」", R - L, qSize, 700, "1px");
        qLines.forEach(function (l, i) {
          txt(l, W / 2, qTop + i * qLH, qSize, ink, "center", 700, "1px");
        });
        boxY = qTop + qLines.length * qLH + 22;
      } else {
        // 状态小印章底部 stY+38，留 26px 间隔
        boxY = stY + 64;
      }

      /* —— 故事框：灰虚线、奶白底；高度弹性吃掉剩余空间（对应 .card-saybox） —— */
      var boxH = boxBottom - boxY;
      ctx.fillStyle = "#fffaf0";
      roundRect(boxX, boxY, boxW, boxH, 8); ctx.fill();
      ctx.save();
      ctx.strokeStyle = "rgba(38,63,54,.28)"; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      roundRect(boxX, boxY, boxW, boxH, 8); ctx.stroke();
      ctx.restore();

      // 大圆邮戳先画，文字压在它上面；整体落在标签以下，避免与标签打架
      drawPostmark(110, boxBottom - 74, 72);

      // 故事文字：标签固定框内左上，正文在标签以下区域垂直居中；长文自动缩档防溢出
      var saySize = 30, sayLH = 46;
      var sayLines = wrapLines(sayText, boxW - 64, saySize, 700, "1px");
      var sayTop = boxY + 66, sayBottom = boxBottom - 24, sayAvail = sayBottom - sayTop;
      while (sayLines.length * sayLH > sayAvail && saySize > 22) {
        saySize -= 2; sayLH -= 3;
        sayLines = wrapLines(sayText, boxW - 64, saySize, 700, "1px");
      }
      txt("我和 TA 的故事", boxX + 28, boxY + 40, 18, ochre, "left", 400, "2px");
      var firstBase = sayTop + Math.max(0, (sayAvail - sayLines.length * sayLH) / 2) + saySize * .82;
      sayLines.forEach(function (l, i) {
        txt(l, W / 2, firstBase + i * sayLH, saySize, ink, "center", 700, "1px");
      });
      // 金色引号：开在首行前、收在末行后
      setFont(saySize, 700);
      var wFirst = ctx.measureText(sayLines[0]).width;
      var wLast = ctx.measureText(sayLines[sayLines.length - 1]).width;
      var wBr = ctx.measureText("「").width;
      txt("「", W / 2 - wFirst / 2 - wBr / 2 - 1, firstBase, saySize, ochre, "center", 700);
      txt("」", W / 2 + wLast / 2 + wBr / 2 + 1, firstBase + (sayLines.length - 1) * sayLH, saySize, ochre, "center", 700);

      /* —— 虚线分隔 —— */
      ctx.save();
      ctx.strokeStyle = "rgba(38,63,54,.28)"; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(L, 806); ctx.lineTo(R, 806); ctx.stroke();
      ctx.restore();

      /* —— 页脚：头像 + 署名 + 倒计时（对应 .card-foot） —— */
      var acx = 96, acy = 874, ar = 46;
      ctx.save();
      ctx.beginPath(); ctx.arc(acx, acy, ar, 0, Math.PI * 2); ctx.clip();
      var as = Math.max(ar * 2 / avatar.width, ar * 2 / avatar.height);
      ctx.drawImage(avatar, acx - avatar.width * as / 2, acy - avatar.height * as / 2, avatar.width * as, avatar.height * as);
      ctx.restore();
      ctx.strokeStyle = ochre; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(acx, acy, ar, 0, Math.PI * 2); ctx.stroke();
      // 昵称单行，垂直居中于头像
      txt(state.me.nick || DEFAULT_NICK, 160, 883, 27, ink, "left", 700, "1px");
      txt(String(daysLeft()), R, 876, 52, rust, "right", 700);
      txt("天后拆迁", R, 902, 16, muted, "right");

      /* —— 底边小字 —— */
      txt("距离同创汇拆迁还有 " + daysLeft() + " 天，在 TA 找到家之前，请记得 TA", W / 2, 956, 15, muted, "center");

      // 导出
      var dataUrl = cv.toDataURL("image/png");
      var img = document.getElementById("savedImg");
      img.src = dataUrl;
      document.getElementById("savedWrap").hidden = false;
      document.getElementById("cardPrev").style.display = "none";
      var link = document.getElementById("downloadLink");
      link.href = dataUrl; link.download = "共鸣卡-" + cat.name + ".png"; link.click();
    });
  }
  /* ---------- 猫猫手册（列表） ---------- */
  var WALL_FILTERS = [
    { id: "all", label: "全部", test: function () { return true; } },
    { id: "wait", label: "还在等家", test: function (c) { return c.status === "wait"; } },
    { id: "care", label: "寄养 · 司猫", test: function (c) { return c.status === "foster" || c.status === "shop"; } },
    { id: "home", label: "已领养", test: function (c) { return c.status === "home"; } },
    { id: "gone", label: "失踪 · 回喵星", test: function (c) { return c.status === "lost" || c.status === "star"; } }
  ];
  var wallFilter = "all";

  function renderWallFilter() {
    var wrap = document.getElementById("wallFilter");
    wrap.innerHTML = "";
    WALL_FILTERS.forEach(function (f) {
      var n = CATS.filter(f.test).length;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "wchip" + (f.id === wallFilter ? " on" : "");
      b.textContent = f.label + " " + n;
      b.addEventListener("click", function () { wallFilter = f.id; renderWallFilter(); renderWallBody(); });
      wrap.appendChild(b);
    });
  }

  function renderWall() {
    renderWallFilter();
    renderWallBody();
  }

  function renderWallBody() {
    var box = document.getElementById("wallSections");
    box.innerHTML = "";
    var cur = WALL_FILTERS.filter(function (f) { return f.id === wallFilter; })[0];
    var list = CATS.filter(cur.test);

    // 一、拆迁待安排（首页能摸到的 15 位）排最前
    var pool = list.filter(function (c) { return c.pool; });
    if (pool.length) {
      box.appendChild(wallSection("拆迁待安排", "首页能摸到的 " + pool.length + " 位，优先安置", pool));
    }
    // 二、其余按家族分组
    var rest = list.filter(function (c) { return !c.pool; });
    var families = [];
    rest.forEach(function (c) { if (c.family && families.indexOf(c.family) === -1) families.push(c.family); });
    families.forEach(function (f) {
      box.appendChild(wallSection(f, "", rest.filter(function (c) { return c.family === f; })));
    });
    var none = rest.filter(function (c) { return !c.family; });
    if (none.length) box.appendChild(wallSection("其他住客", "档案里没写家族的", none));

    if (!list.length) {
      var empty = document.createElement("p");
      empty.className = "wall-foot";
      empty.textContent = "这一类暂时没有记录。";
      box.appendChild(empty);
    }
  }

  function wallSection(title, sub, cats) {
    var sec = document.createElement("section");
    sec.className = "wall-sec";
    var h = document.createElement("h4");
    h.className = "wall-sec-title";
    h.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>';
    h.appendChild(document.createTextNode(title));
    var em = document.createElement("em");
    em.textContent = cats.length + " 位";
    h.appendChild(em);
    sec.appendChild(h);
    if (sub) {
      var p = document.createElement("p");
      p.className = "wall-sec-sub";
      p.textContent = sub;
      sec.appendChild(p);
    }
    var grid = document.createElement("div");
    grid.className = "wall-grid";
    cats.forEach(function (cat) { grid.appendChild(wallCard(cat)); });
    sec.appendChild(grid);
    return sec;
  }

  function wallCard(cat) {
    var card = document.createElement("div");
    card.className = "wall-card st-" + cat.status + (cat.silhouette === "family" ? " wide" : "");
    if (state.petted.indexOf(cat.id) !== -1) {
      var pm = document.createElement("span");
      pm.className = "pawmark";
      pm.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>';
      card.appendChild(pm);
    }
    var tag = STATUS_TAG[cat.status];
    if (tag) {
      var bd = document.createElement("span");
      bd.className = "badge";
      bd.textContent = tag.t;
      card.appendChild(bd);
    }
    var ph = document.createElement("div");
    ph.className = "ph";
    renderPhotoSlot(ph, cat);
    card.appendChild(ph);

    // 主动摸猫：点右下角小圆按钮直接播反应动效（任意猫都能摸，不限待安排池）
    var pet = document.createElement("button");
    pet.type = "button";
    pet.className = "pet-btn";
    pet.setAttribute("aria-label", "摸摸" + cat.name);
    pet.innerHTML = '摸摸TA';
    pet.addEventListener("click", function (e) {
      e.stopPropagation();
      petCat(cat);
    });
    ph.appendChild(pet);

    var h5 = document.createElement("h5"); h5.textContent = cat.name; card.appendChild(h5);
    var sm = document.createElement("small");
    sm.textContent = cat.color + " · " + cat.gender;
    card.appendChild(sm);
    card.addEventListener("click", function () {
      state.current = cat; markPetted(cat.id); updateMeStrip(); gotoStory(cat);
    });
    return card;
  }

  /* ---------- 摸猫页身份条 + 遇见进度 ---------- */
  function updateMeStrip() {
    var strip = document.getElementById("meStrip");
    if (!strip) return;
    var petted = state.petted.filter(function (id) { return POOL.some(function (c) { return c.id === id; }); }).length;
    var pct = Math.round(petted / POOL.length * 100);
    strip.hidden = false;
    strip.innerHTML =
      '<span class="me-line"><svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>' +
      "你好，" + (state.me.nick || DEFAULT_NICK) + " · " +
      "已遇见 <b>" + petted + "</b>/" + POOL.length + " 位待安置小猫</span>" +
      '<span class="me-progress"><i style="width:' + pct + '%"></i></span>';
  }

  /* ---------- 复制微信号（兼容微信内置浏览器） ---------- */
  function copyWechat(text, btn) {
    var old = btn.textContent;
    var done = function () {
      btn.textContent = "已复制 ✓";
      setTimeout(function () { btn.textContent = old; }, 1800);
    };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.top = "-9999px"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ---------- 事件委托 ---------- */
  function init() {
    renderSays();
    syncMeCard();        // 署名条初始昵称（头像在 HTML 中固定）

    document.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.hasAttribute && t.hasAttribute("data-action")) break;
        t = t.parentNode;
      }
      if (!t || !t.dataset) return;
      switch (t.dataset.action) {
        case "fromCover": fromCover(); break;
        case "draw": draw(); break;
        case "skipReact": gotoStory(state.current); break;
        case "toCard": goCard(); break;
        case "saveCard": saveCard(); break;
        case "saveAgain": document.getElementById("cardPrev").style.display = ""; document.getElementById("savedWrap").hidden = true; break;
        case "tab": onTab(t.dataset.tab, t.dataset); break;
        case "back": back(); break;
        case "copyWechat": copyWechat(t.dataset.wechat, t); break;
      }
    });

    // 故事输入：实时同步卡片预览、chip 高亮与字数
    document.getElementById("sayInput").addEventListener("input", function (ev) {
      var v = ev.target.value.trim();
      state.say = v || DEFAULT_SAY;
      applySay(); syncChips(); updateSayCount();
    });

    // 署名条：展开/收起就地改名
    document.getElementById("meEditBar").addEventListener("click", toggleMePanel);
    document.getElementById("meNickInput").addEventListener("input", function (ev) {
      var v = ev.target.value.trim();
      // 清空只在展示层回退 momo，不把空值/占位名写回本地
      state.me.nick = v || DEFAULT_NICK;
      if (v) saveJSON("me", state.me);
      document.getElementById("meEditNick").textContent = state.me.nick;
      if (state.current) syncCard();
      updateMeStrip();
    });

    // 启动：停在封面；倒计时
    preload();
    setText("poolCount", POOL.length);
    setText("petAllCount", CATS.length);
    setText("wallCount", CATS.length);
    var dl = document.getElementById("days-left");
    if (dl) dl.textContent = daysLeft();
    updateMeStrip();
    showView("v-cover");
  }

  // 封面到摸猫只隔一步（v1.4 起无登记页，署名在卡片页就地改）
  function fromCover() { push("v-pet"); }
  function goCard() { openCard(); }
  function openCard() {
    syncCard();
    document.getElementById("savedWrap").hidden = true;
    document.getElementById("cardPrev").style.display = "";
    push("v-card");
  }
  function onTab(id, ds) {
    if (id === "v-wall") {
      if (ds && ds.wallFilter && WALL_FILTERS.some(function (f) { return f.id === ds.wallFilter; })) wallFilter = ds.wallFilter;
      renderWall();
    }
    if (id === "v-pet") updateMeStrip();
    push(id);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();