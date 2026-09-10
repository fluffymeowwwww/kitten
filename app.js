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
  var views = ["v-cover", "v-welcome", "v-pet", "v-story", "v-card", "v-wall"];
  function showView(id) {
    for (var i = 0; i < views.length; i++) {
      var el = document.getElementById(views[i]);
      if (el) el.classList.toggle("active", views[i] === id);
    }
    window.scrollTo(0, 0);
    updateBackBtn(id);
  }
  function updateBackBtn(id) {
    var back = document.querySelector('[data-action="back"]');
    if (back) back.hidden = (id === "v-cover");
  }
  var navStack = ["v-cover"];
  function push(id) {
    if (navStack[navStack.length - 1] !== id) navStack.push(id);
    showView(id);
  }
  function back() { navStack.pop(); var to = navStack.length ? navStack[navStack.length - 1] : "v-pet"; showView(to); }

  /* ---------- 登记 ---------- */
  var chosenAvatar = PRESET_AVATARS[0];
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

  /* ---------- 摸猫：反应动效（单次） ---------- */
  function draw() {
    var cat = nextCat();
    state.current = cat;
    markPetted(cat.id);
    renderReaction(cat);
    push("v-story");
  }

  function renderReaction(cat) {
    var stage = document.getElementById("reactStage");
    var img = document.getElementById("reactImg");
    var mood = document.getElementById("reactMood");
    var narr = document.getElementById("reactNarr");
    var storyArea = document.getElementById("storyArea");

    stage.className = "react-stage stage-" + cat.mood;
    img.src = MOOD_IMG[cat.mood];
    img.alt = cat.name + "的反应";
    mood.innerHTML = "<b>" + MOOD_LABEL[cat.mood] + "</b>" + cat.name;
    narr.innerHTML = MOOD_TXT[cat.mood].map(function (t) { return '<span class="line">' + t + "</span>"; }).join("");

    // 重新触发动画
    stage.classList.remove("stage-" + cat.mood);
    void stage.offsetWidth;
    stage.classList.add("stage-" + cat.mood);
    storyArea.classList.remove("show");

    // 反应演出结束后，展示故事
    setTimeout(function () {
      renderStory(cat);
      storyArea.classList.add("show");
    }, cycleDuration(cat.mood));
  }

  function cycleDuration(mood) { return mood === "close" ? 2100 : 2400; }

  /* ---------- 故事渲染（含热词串门） ---------- */
  function renderStory(cat) {
    document.getElementById("storyName").textContent = cat.name;

    // 标签
    var tags = [cat.color + " · " + cat.gender];
    tags.push(MOOD_LABEL[cat.mood]);
    if (cat.sterilized) tags.push("已绝育");
    tags.push(cat.adopted ? "TA 有家了" : "还在等家");
    var tagWrap = document.getElementById("storyTags");
    tagWrap.innerHTML = "";
    tags.forEach(function (t) {
      var s = document.createElement("span");
      s.className = "tag" + (t === "还在等家" ? " tag-wait" : (t === "TA 有家了" ? " tag-home" : ""));
      s.textContent = t; tagWrap.appendChild(s);
    });

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
    var c = null;
    for (var i = 0; i < CATS.length; i++) if (CATS[i].name.indexOf(name) !== -1) { c = CATS[i]; break; }
    // 直接命中原名
    if (!c) for (var j = 0; j < CATS.length; j++) if (CATS[j].name === name) { c = CATS[j]; break; }
    if (c) { renderReaction(c); push("v-story"); }
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
      var qy = 560;
      txt("—— TA 的故事 ——", W / 2, qy, 15, ochre, "Songti SC", "center");
      var qLines = wrap(cat.quote, W / 2, qy + 44, W - 140, 44, 30, ink, "center");
      qy += 44 + qLines * 44 + 6;

      // 留言
      wrap("「" + state.say + "」" + " —— " + me.nick, W / 2, qy + 36, W - 240, 0, 20, "#6b5a44", "center");
      var saveY = qy + 54 + 34;

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
      // 邮戳（右上角圆章）
      drawPostmark(ctx, W - 200, H - 320, 120, ochre, "已遇见", "TC·STORY");
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
  function drawPostmark(ctx, cx, cy, r, color, main, sub) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 14);
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.globalAlpha = .55;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.stroke();
    ctx.font = "13px Georgia, serif"; ctx.fillStyle = color; ctx.globalAlpha = .55; ctx.textAlign = "center";
    ctx.fillText("TONGCHUANGHUI·CAT", 0, -r * 0.5 + 5);
    ctx.fillText("· STORY ·", 0, -r * 0.5 + 20);
    ctx.font = "700 18px 'Songti SC', serif"; ctx.fillText(main, 0, 12);
    ctx.font = "10px Georgia, serif"; ctx.fillText(sub, 0, 30);
    ctx.restore();
    ctx.globalAlpha = 1;
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
      card.addEventListener("click", function () { renderReaction(cat); markPetted(cat.id); push("v-story"); });
      grid.appendChild(card);
    });
  }

  /* ---------- 顶栏我的身份条 ---------- */
  function updateMeStrip() {
    var strip = document.getElementById("meStrip");
    if (!state.me) return;
    strip.hidden = false;
    var petted = state.petted.length;
    strip.innerHTML = '<span><svg viewBox="0 0 24 24"><use href="#i-paw"/></svg></span>' +
      "你好，" + state.me.nick + " · 已遇见 <b>" + petted + "</b>/" + CATS.length + " 位住客";
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
        case "toCard": goCard(); break;
        case "saveCard": saveCard(); break;
        case "saveAgain": document.getElementById("cardPrev").style.display = ""; document.getElementById("savedWrap").hidden = true; break;
        case "gotoWall": renderWall(); push("v-wall"); break;
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
    // 登记是一次性事务：登记后直接落在摸猫页，返回即回封面
    navStack = ["v-cover"];
    push("v-pet");
  }
  function fromCover() {
    if (state.me) push("v-pet"); else push("v-welcome");
  }
  function goCard() {
    syncCard();
    document.getElementById("savedWrap").hidden = true;
    var cp = document.getElementById("cardPrev"); cp.style.display = "";
    push("v-card");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();