/* 封面试样：沿用 v1 的截止日期；入口通向已有可运行原型。 */
(function () {
  "use strict";
  var deadline = new Date("2026-11-30T23:59:59+08:00");
  var days = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000));
  document.getElementById("days-left").textContent = String(days);
})();
