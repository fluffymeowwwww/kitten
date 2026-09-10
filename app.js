/* ============================================================
   同创汇猫咪故事馆 · 主逻辑（外置 JS，全 addEventListener，无 fetch）
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 常量与状态 ---------- */
  var PREFIX = "tc-cat-story:";
  var DEADLINE = new Date("2026-11-30T23:59:59+08:00");
  var MOOD_IMG = {
    close: "assets/react-close.webp",
    shy: "assets/react-shy.webp",
    gone: "assets/react-gone.webp"
  };
  var MOOD_TXT = {
    close: ["TA 一翻身，把肚皮递到了你手心。", "咕噜咕噜——这是猫能给的最高礼遇。"],
    shy: ["她先退了半步……", "又忍不住凑过来，闻了闻你的手指。"],
    gone: ["嗖——TA 还没准备好。", "不是每只猫都要被摸到，你愿意看见 TA，就很好了。"]
  };
  var MOOD_LABEL = { close: "亲人", shy: "中等 · 需培养", gone: "不亲人" };
  var PRESET_AVATARS = ["avatar-1.webp", "avatar-2.webp", "avatar-3.webp", "avatar-4.webp",
    "avatar-5.webp", "avatar-6.webp", "avatar-7.webp", "avatar-8.webp", "avatar-9.webp"];
  var SILSIL = { sit: "i-cat-sit", peek: "i-cat-peek", trio: "i-cat-trio", family: "i-cat-family" };
  var SAYS = ["TA，我记住你了", "要平安等到家", "谢谢你愿意靠近我", "下辈子，别再流浪了"];
  var RESULT_HOLD = 2000;   // 动效演完后，结果页再停留这么久才自动进故事页

  function getKey(k) { return PREFIX + k; }
  function loadJSON(k, fb) { try { var v = localStorage.getItem(getKey(k)); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function saveJSON(k, v) { try { localStorage.setItem(getKey(k), JSON.stringify(v)); } catch (e) {} }

  var state = {
    me: loadJSON("me", null),
    petted: loadJSON("petted", []),        // 已摸(不重复) id 数组
    deck: loadJSON("deck", null),          // 洗牌结果
    ptr: loadJSON("ptr", 0),
    current: null,                          // 当前展示的猫数据
    say: SAYS[0]
  };

  var $ = function (s) { return document.querySelector(s); };

  /* ---------- 倒计时 ---------- */
  function daysLeft() {
    return Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000));
  }

  /* ---------- 洗牌 ---------- */
  function freshDeck() { return shuffle(CATS.map(function (c) { return c.id; })); }
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
  var views = ["v-cover", "v-welcome", "v-pet", "v-react", "v-story", "v-card", "v-wall"];
  var TAB_OF = { "v-cover": 1, "v-pet": 1, "v-wall": 1 };          // 底部导航页
  var TAB_MAP = {
    "v-cover": "v-cover", "v-welcome": "v-cover",
    "v-pet": "v-pet", "v-react": "v-pet", "v-story": "v-pet", "v-card": "v-pet",
    "v-wall": "v-wall"
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
  function replaceTop(id) { navStack[navStack.length - 1] = id; showView(id); }
  function back() {
    if (navStack.length > 1) navStack.pop();
    var to = navStack[navStack.length - 1] || "v-pet";
    showView(to);
    if (to === "v-pet") updateMeStrip();
  }

  /* ---------- 登记 ---------- */
  var chosenAvatar = PRESET_AVATARS[0];
  var welcomeNext = "v-pet";        // 登记完成后要去哪：默认摸猫页，署名流程则为留言页
  function renderAvatars() {
    var wrap = document.getElementById("avatarPick");
    wrap.innerHTML = "";
    PRESET_AVATARS.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "avatar-opt"; if (f === chosenAvatar) b.classList.add("selected");
      b.id = "av-" + f;
      var img = document.createElement("img"); img.src = "assets/" + f; img.alt = "复古头像";
      b.appendChild(img);
      if (b.classList.contains("selected")) { var t = document.createElement("span"); t.className = "tick"; t.textContent = "✓"; b.appendChild(t); }
      b.addEventListener("click", function () { chosenAvatar = f; markSelected(b); });
      wrap.appendChild(b);
    });
    // 相册按钮
    var album = document.createElement("button");
    album.type = "button"; album.className = "avatar-opt album avatar-album"; album.id = "albumBtn";
    album.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M8 5l1.5-2h5L16 5"/></svg>相册';
    album.addEventListener("click", function () { document.getElementById("filePick").click(); });
    wrap.appendChild(album);
  }
  function markSelected(btn) {
    var all = document.querySelectorAll("#avatarPick .avatar-opt");
    for (var i = 0; i < all.length; i++) { var b = all[i]; b.classList.remove("selected"); var t = b.querySelector(".tick"); if (t) t.remove(); }
    btn.classList.add("selected");
    var tk = document.createElement("span"); tk.className = "tick"; tk.textContent = "✓"; btn.appendChild(tk);
  }

  /* ---------- 摸猫：摸到瞬间（名字与简介立即可见，动效照播一遍） ---------- */
  var reactTimer = null;

  function draw() {
    var cat = nextCat();
    state.current = cat;
    markPetted(cat.id);
    updateMeStrip();
    playReaction(cat);
    navStack = ["v-pet"];                   // 新的一次摸猫：返回链从摸猫页重新开始
    push("v-react");
  }

  function playReaction(cat) {
    if (reactTimer) { clearTimeout(reactTimer); reactTimer = null; }
    var stage = document.getElementById("reactStage");
    var img = document.getElementById("reactImg");
    var narr = document.getElementById("reactNarr");
    var revealName = document.getElementById("revealName");

    stage.className = "react-stage";        // 清掉旧性格类，重排后再加，动画才会重播
    img.src = MOOD_IMG[cat.mood];
    img.alt = cat.name + "的反应";
    if (revealName) revealName.textContent = cat.name;
    renderTags(document.getElementById("reactTags"), cat);   // 简介标签行，进入即见
    narr.innerHTML = MOOD_TXT[cat.mood].map(function (t) {
      return '<span class="line">' + t + "</span>";
    }).join("");

    void stage.offsetWidth;
    stage.className = "react-stage stage-" + cat.mood;

    // 动效演完 + 停留 RESULT_HOLD 让结果看够，再自动进故事页；中途切走就不打扰
    reactTimer = setTimeout(function () {
      reactTimer = null;
      var view = document.getElementById("v-react");
      if (state.current === cat && view && view.classList.contains("active")) gotoStory(cat);
    }, cycleDuration(cat.mood) + RESULT_HOLD);
  }

  function cycleDuration(mood) { return mood === "shy" ? 3400 : 3200; }

  function gotoStory(cat) {
    if (!cat) return;
    if (reactTimer) { clearTimeout(reactTimer); reactTimer = null; }
    renderStory(cat);
    push("v-story");
  }

  /* 预加载反应图，避免切页时白屏 */
  function preload() {
    Object.keys(MOOD_IMG).forEach(function (k) { var i = new Image(); i.src = MOOD_IMG[k]; });
  }

  /* ---------- 标签行（摸到瞬间的简介 / 故事页共用） ---------- */
  function tagData(cat) {
    var tags = [{ t: cat.color + " · " + cat.gender }, { t: MOOD_LABEL[cat.mood], cls: "tag-mood" }];
    if (cat.sterilized) tags.push({ t: "已绝育" });
    tags.push(cat.adopted ? { t: "TA 有家了", cls: "tag-home" } : { t: "还在等家", cls: "tag-wait" });
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

  /* ---------- 故事渲染（含热词串门） ---------- */
  function renderStory(cat) {
    document.getElementById("storyName").textContent = cat.name;

    // 标签
    renderTags(document.getElementById("storyTags"), cat);

    // 照片位
    renderPhotoSlot(document.getElementById("storyPhoto"), cat);
    document.getElementById("storyCap").textContent = cat.has_photo ? "照片由群护志愿者提供" : cat.cardNote || "TA 的照片还在路上";

    // 故事正文 + 热词
    var body = document.getElementById("storyBody");
    body.innerHTML = "";
    cat.story.forEach(function (txt) { body.appendChild(buildPara(txt)); });
    // 金句
    var quote = document.createElement("p"); quote.className = "quote"; quote.textContent = cat.quote; body.appendChild(quote);
    // 家族
    var fam = document.createElement("p"); fam.className = "family-row";
    fam.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>' + cat.family;
    body.appendChild(fam);
  }

  function buildPara(txt) {
    var p = document.createElement("p");
    var re = /\[\[([^\]]+)\]\]/g; var last = 0; var m;
    while ((m = re.exec(txt)) !== null) {
      if (m.index > last) p.appendChild(document.createTextNode(txt.slice(last, m.index)));
      var hot = document.createElement("span"); hot.className = "hot"; hot.textContent = m[1];
      hot.addEventListener("click", function () { jumpTo(m[1]); });
      p.appendChild(hot);
      last = m.index + m[0].length;
    }
    if (last < txt.length) p.appendChild(document.createTextNode(txt.slice(last)));
    return p;
  }
  function jumpTo(name) {
    var c = null, i;
    for (i = 0; i < CATS.length; i++) if (CATS[i].name === name) { c = CATS[i]; break; }
    if (!c) for (i = 0; i < CATS.length; i++) if (CATS[i].name.indexOf(name) !== -1) { c = CATS[i]; break; }
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

  /* ---------- 留言 ---------- */
  function renderSays() {
    var wrap = document.getElementById("sayChips");
    wrap.innerHTML = "";
    SAYS.forEach(function (txt) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = txt;
      if (txt === state.say) b.classList.add("on");
      b.addEventListener("click", function () { state.say = txt; applySay(); syncChips(); });
      wrap.appendChild(b);
    });
    document.getElementById("sayInput").value = (SAYS.indexOf(state.say) === -1) ? state.say : "";
  }
  function syncChips() {
    var chips = document.querySelectorAll("#sayChips .chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle("on", chips[i].textContent === state.say);
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
    document.getElementById("cardTags").innerHTML = "<em>" + cat.color + "</em><em>" + cat.gender + "</em><em>" + MOOD_LABEL[cat.mood] + "</em>";
    document.getElementById("cardWait").textContent = cat.adopted ? "TA 有家了" : "还在等家";
    document.getElementById("cardWait").classList.toggle("home", !!cat.adopted);
    document.getElementById("cardQuote").innerHTML = "「" + cat.quote + "」";
    renderPhotoSlot(document.getElementById("cardPhoto"), cat);
    var me = state.me || { avatar: "avatar-1.webp", nick: "今天也想摸猫", intro: "" };
    document.getElementById("cardAvatar").innerHTML = '<img src="assets/' + me.avatar + '" alt="我的头像">';
    document.getElementById("cardNick").textContent = me.nick;
    document.getElementById("cardIntro").textContent = me.intro || "来摸猫的";
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
  function saveCard() {
    var cat = state.current; if (!cat) return;
    var me = state.me || { avatar: "avatar-1.webp", nick: "今天也想摸猫", intro: "" };
    var W = 750, H = 1100;
    var cv = document.getElementById("cardCanvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    var pine = "#263f36", rust = "#aa4d31", ochre = "#b98534", cream = "#f8efda", ink = "#3a3326";

    ctx.fillStyle = "#fbf4e4"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = pine; ctx.lineWidth = 6; ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.strokeStyle = pine; ctx.lineWidth = 2; ctx.globalAlpha = .6; ctx.strokeRect(26, 26, W - 52, H - 52); ctx.globalAlpha = 1;

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function txt(s, x, y, size, color, font, align, weight) {
      ctx.font = (weight || 400) + " " + size + "px " + font + ", 'Songti SC', serif";
      ctx.fillStyle = color; ctx.textAlign = align || "left"; ctx.fillText(s, x, y);
    }
    function wrap(s, x, y, maxW, lh, size, color, align) {
      var chars = String(s).split("");
      var line = "", lines = [];
      for (var i = 0; i < chars.length; i++) { line += chars[i]; if (ctx.measureText(line).width > maxW) { lines.push(line.slice(0, -1)); line = chars[i]; } }
      lines.push(line);
      var ax = x;
      lines.forEach(function (l, idx) {
        if (align === "center") ax = W / 2;
        txt(l, ax, y + idx * lh, size, color, "Songti SC", align === "center" ? "center" : "left", 700);
      });
      return lines.length;
    }
    // 只测量分行，不绘制（用于先算高度再画框）
    function wrapLines(s, maxW, size, weight) {
      ctx.font = (weight || 700) + " " + size + "px 'Songti SC', serif";
      var chars = String(s).split("");
      var line = "", lines = [];
      for (var i = 0; i < chars.length; i++) {
        line += chars[i];
        if (ctx.measureText(line).width > maxW) { lines.push(line.slice(0, -1)); line = chars[i]; }
      }
      lines.push(line);
      return lines;
    }

    // 顶部栏
    txt("同创汇猫咪故事馆", 54, 84, 22, pine, "Songti SC", "left", 700);
    txt("VOL.01 · 秋日来信 · 遇见纪念", 54, 112, 14, "#7c806d", "Songti SC", "left");
    // 分割线
    ctx.strokeStyle = pine; ctx.globalAlpha = .5; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(54, 146); ctx.lineTo(W - 54, 146); ctx.stroke(); ctx.globalAlpha = 1;

    // 猫照片 / 剪影 + 名字
    var imgTask = cat.has_photo && cat.photo
      ? loadImg("assets/cats/" + cat.photo)
      : loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(SILSVG[cat.silhouette || "sit"].replace(/\{C\}/g, pine)));
    return imgTask.then(function (im) {
      // 左侧拍立得
      ctx.fillStyle = "#fffaf0"; ctx.fillRect(54, 176, 250, 330); ctx.strokeStyle = "#26281c22"; ctx.strokeRect(54, 176, 250, 330);
      ctx.save(); ctx.beginPath(); ctx.rect(54, 176, 250, 260); ctx.clip();
      if (cat.has_photo) { var s = Math.max(250 / im.width, 260 / im.height); ctx.drawImage(im, 54 + (250 - im.width * s) / 2, 176 + (260 - im.height * s) / 2, im.width * s, im.height * s); }
      else { var ds = 250; ctx.drawImage(im, 54 + (250 - ds) / 2, 176 + (260 - ds) / 2 + 14, ds, ds); }
      ctx.restore();
      txt("·" + cat.name + "·", 179, 496, 24, ink, "Songti SC", "center", 700);

      // 右侧：标签 + 状态
      var tagY = 210, tagX = 336, tagMax = W - 336 - 50;
      var tags = [cat.color, cat.gender, MOOD_LABEL[cat.mood], cat.sterilized ? "已绝育" : ""].filter(Boolean);
      tags.forEach(function (t) {
        ctx.strokeStyle = "#263f3644"; ctx.lineWidth = 1.5;
        var tw = ctx.measureText(t).width + 24;
        roundRect(tagX, tagY, tw, 34, 17); ctx.stroke();
        txt(t, tagX + tw / 2, tagY + 23, 16, "#52614e", "Songti SC", "center");
        tagY += 46;
      });
      txt(cat.adopted ? "TA 有家了" : "还在等家", tagX, tagY + 12, 18, rust, "Songti SC", "left", 700);

      // 金句
      var qy = 540;
      txt("—— TA 的故事 ——", W / 2, qy, 15, ochre, "Songti SC", "center");
      var qLines = wrap(cat.quote, W / 2, qy + 42, W - 140, 42, 30, ink, "center");
      qy += 42 + qLines * 42 + 12;

      // 留言区：卡片上留足位置，是这张卡片的主角之一
      var saySize = 30, sayLH = 46;
      var sayLines = wrapLines("「" + state.say + "」", W - 280, saySize, 700);
      var boxX = 70, boxW = W - 140;
      var boxY = qy;
      var boxH = 58 + sayLines.length * sayLH + 20;
      ctx.save();
      ctx.strokeStyle = "#b98534cc"; ctx.lineWidth = 2; ctx.setLineDash([7, 7]);
      roundRect(boxX, boxY, boxW, boxH, 10); ctx.stroke();
      ctx.restore();
      txt("我想对 TA 说", boxX + 26, boxY + 36, 15, ochre, "Songti SC", "left");
      sayLines.forEach(function (l, i) {
        txt(l, W / 2, boxY + 76 + i * sayLH, saySize, ink, "Songti SC", "center", 700);
      });
      txt("—— " + me.nick, boxX + boxW - 30, boxY + boxH - 18, 17, "#8a8268", "Songti SC", "right");
      // 留言框右上角压一枚小章，像盖过印
      ctx.save();
      ctx.translate(boxX + boxW - 12, boxY + 12); ctx.rotate(-Math.PI / 12);
      ctx.strokeStyle = "#b98534aa"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 33, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#b98534"; ctx.textAlign = "center";
      ctx.font = "700 15px 'Songti SC', serif";
      ctx.fillText("已遇见", 0, 6);
      ctx.restore();
      var saveY = boxY + boxH + 34;

      // 底部：头像 + 简介 + 倒计时 + 右上角邮票
      return Promise.all([loadImg("assets/" + me.avatar), loadImg("assets/stamp.webp")]).then(function (rs) {
        var av = rs[0], st = rs[1];
        // 右上角邮票
        ctx.save(); ctx.translate(W - 122, 62); ctx.rotate(Math.PI / 40); ctx.drawImage(st, 0, 0, 84, 84); ctx.restore();
        var ax = 54, ay = saveY;
        ctx.save(); ctx.beginPath(); ctx.arc(ax + 34, ay + 34, 34, 0, Math.PI * 2); ctx.clip();
        var avs = Math.max(68 / av.width, 68 / av.height); ctx.drawImage(av, ax + 34 - av.width * avs / 2, ay + 34 - av.height * avs / 2, av.width * avs, av.height * avs);
        ctx.restore();
        ctx.strokeStyle = ochre; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ax + 34, ay + 34, 34, 0, Math.PI * 2); ctx.stroke();
        txt(me.nick, ax + 88, ay + 32, 24, ink, "Songti SC", "left", 700);
        txt(me.intro || "来摸猫的", ax + 88, ay + 58, 16, "#8a8268", "Songti SC", "left");
        txt(String(daysLeft()), W - 90, ay + 40, 48, rust, "Georgia", "right", 700);
        txt("天后拆迁", W - 42, ay + 48, 16, "#8a8268", "Songti SC", "right");
        return true;
      });
    }).then(function () {
      // 底部小字
      txt("距离同创汇拆迁还有 " + daysLeft() + " 天，在 TA 找到家之前，请记得 TA", W / 2, H - 34, 15, "#8a8268", "Songti SC", "center");
    }).then(function () {
      // 导出
      var dataUrl = cv.toDataURL("image/png");
      var img = document.getElementById("savedImg");
      img.src = dataUrl;
      document.getElementById("savedWrap").hidden = false;
      var cardPrev = document.getElementById("cardPrev");
      cardPrev.style.display = "none";
      // 下载
      var link = document.getElementById("downloadLink");
      link.href = dataUrl; link.download = "共鸣卡-" + cat.name + ".png"; link.click();
    });
  }
  /* ---------- 图鉴 ---------- */
  function renderWall() {
    var grid = document.getElementById("wallGrid");
    grid.innerHTML = "";
    CATS.forEach(function (cat, idx) {
      var card = document.createElement("div");
      card.className = "wall-card" + (cat.family === "小队家族" ? " wide" : "");
      var pm = document.createElement("span"); pm.className = "pawmark";
      if (state.petted.indexOf(cat.id) !== -1) { pm.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>'; card.appendChild(pm); }
      var ph = document.createElement("div"); ph.className = "ph";
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#" + (SILSIL[cat.silhouette] || "i-cat-sit"));
      svg.appendChild(use); ph.appendChild(svg);
      card.appendChild(ph);
      var h5 = document.createElement("h5"); h5.textContent = cat.name; card.appendChild(h5);
      var sm = document.createElement("small");
      sm.textContent = cat.color + " · " + cat.gender + (cat.family === "小队家族" ? " · 遇见即全家福" : "");
      card.appendChild(sm);
      card.addEventListener("click", function () {
        state.current = cat; markPetted(cat.id); updateMeStrip(); gotoStory(cat);
      });
      grid.appendChild(card);
    });
  }

  /* ---------- 摸猫页身份条 + 遇见进度 ---------- */
  function updateMeStrip() {
    var strip = document.getElementById("meStrip");
    if (!strip) return;
    var petted = state.petted.length;
    var pct = Math.round(petted / CATS.length * 100);
    strip.hidden = false;
    strip.innerHTML =
      '<span class="me-line"><svg viewBox="0 0 24 24"><use href="#i-paw"/></svg>' +
      (state.me ? "你好，" + state.me.nick + " · " : "") +
      "已遇见 <b>" + petted + "</b>/" + CATS.length + " 位住客</span>" +
      '<span class="me-progress"><i style="width:' + pct + '%"></i></span>';
  }

  /* ---------- 事件委托 ---------- */
  function init() {
    renderAvatars();
    renderSays();

    document.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== document) {
        if (t.hasAttribute && t.hasAttribute("data-action")) break;
        t = t.parentNode;
      }
      if (!t || !t.dataset) return;
      switch (t.dataset.action) {
        case "fromCover": fromCover(); break;
        case "enter": doEnter(); break;
        case "draw": draw(); break;
        case "skipReact": gotoStory(state.current); break;
        case "toCard": goCard(); break;
        case "saveCard": saveCard(); break;
        case "saveAgain": document.getElementById("cardPrev").style.display = ""; document.getElementById("savedWrap").hidden = true; break;
        case "tab": onTab(t.dataset.tab); break;
        case "back": back(); break;
      }
    });

    // 登录输入即时改名卡预览
    document.getElementById("sayInput").addEventListener("input", function (ev) {
      var v = ev.target.value.trim();
      if (v) { state.say = v; applySay(); var cs = document.querySelectorAll("#sayChips .chip"); for (var i = 0; i < cs.length; i++) cs[i].classList.remove("on"); }
      else { state.say = SAYS[0]; applySay(); syncChips(); }
    });

    document.getElementById("filePick").addEventListener("change", function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        chosenAvatar = "";
        var wrap = document.getElementById("avatarPick");
        var all = wrap.querySelectorAll(".avatar-opt");
        for (var i = 0; i < all.length; i++) { var b = all[i]; b.classList.remove("selected"); var tk = b.querySelector(".tick"); if (tk) tk.remove(); }
        // 相册按钮显示所选图
        var album = document.getElementById("albumBtn");
        album.classList.add("album-has", "selected");
        album.innerHTML = '<img src="' + reader.result + '" alt="我的照片">';
      };
      reader.readAsDataURL(file);
    });

    // 启动：停在封面；倒计时
    preload();
    var dl = document.getElementById("days-left");
    if (dl) dl.textContent = daysLeft();
    updateMeStrip();
    showView("v-cover");
  }

  function doEnter() {
    var nick = (document.getElementById("nickName").value || "今天也想摸猫").trim();
    var intro = document.getElementById("intro").value.trim();
    state.me = { avatar: chosenAvatar || "avatar-1.webp", nick: nick, intro: intro };
    saveJSON("me", state.me);
    updateMeStrip();
    var next = welcomeNext;
    welcomeNext = "v-pet";
    if (next === "v-card") {                // 从「给 TA 留句话」过来的：登记完接着写留言
      syncCard();
      document.getElementById("savedWrap").hidden = true;
      document.getElementById("cardPrev").style.display = "";
    }
    if (navStack[navStack.length - 1] === "v-welcome") replaceTop(next); else push(next);
  }
  // 封面到摸猫只隔一步；登记推迟到真要署名的时候
  function fromCover() { push("v-pet"); }
  function goCard() {
    if (!state.me) { welcomeNext = "v-card"; push("v-welcome"); return; }
    openCard();
  }
  function openCard() {
    syncCard();
    document.getElementById("savedWrap").hidden = true;
    document.getElementById("cardPrev").style.display = "";
    push("v-card");
  }
  function onTab(id) {
    if (id === "v-wall") renderWall();
    if (id === "v-pet") updateMeStrip();
    push(id);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();