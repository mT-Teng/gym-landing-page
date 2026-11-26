/* ==========================================================
   حديد | سلوك الصفحة
   1) حصص اليوم في القسم الرئيسي (تُحسب من وقت الجهاز)
   2) جدول الأسبوع بأزرار الأيام
   3) نموذج الحجز مع التحقق من البيانات
   ========================================================== */

(() => {
  "use strict";

  // ---------- البيانات ----------

  const CLASSES = {
    weights: { name: "تدريب بالأوزان", minutes: 60 },
    crossfit: { name: "كروس فيت", minutes: 45 },
    boxing: { name: "ملاكمة لياقة", minutes: 50 },
    yoga: { name: "يوغا ومرونة", minutes: 60 },
  };

  // المفتاح = رقم اليوم في جافاسكربت (0 الأحد ... 6 السبت)
  // كل حصة: [الوقت بنظام 24 ساعة، نوع التدريب، المدرب]
  const SCHEDULE = {
    6: [
      ["07:00", "weights", "كابتن خالد"],
      ["10:00", "yoga", "كابتنة ريم"],
      ["17:00", "crossfit", "كابتن ماجد"],
      ["19:30", "boxing", "كابتن سلطان"],
    ],
    0: [
      ["07:00", "crossfit", "كابتن ماجد"],
      ["16:00", "weights", "كابتن خالد"],
      ["18:00", "boxing", "كابتن سلطان"],
      ["20:00", "yoga", "كابتنة ريم"],
    ],
    1: [
      ["07:00", "weights", "كابتن خالد"],
      ["10:00", "yoga", "كابتنة ريم"],
      ["17:00", "boxing", "كابتن سلطان"],
      ["19:00", "crossfit", "كابتن ماجد"],
    ],
    2: [
      ["07:00", "boxing", "كابتن سلطان"],
      ["16:00", "yoga", "كابتنة ريم"],
      ["18:00", "weights", "كابتن خالد"],
      ["20:00", "crossfit", "كابتن ماجد"],
    ],
    3: [
      ["07:00", "weights", "كابتن خالد"],
      ["10:00", "crossfit", "كابتن ماجد"],
      ["17:30", "yoga", "كابتنة ريم"],
      ["19:30", "boxing", "كابتن سلطان"],
    ],
    4: [
      ["07:00", "crossfit", "كابتن ماجد"],
      ["10:00", "yoga", "كابتنة ريم"],
      ["17:00", "weights", "كابتن خالد"],
      ["19:00", "boxing", "كابتن سلطان"],
    ],
    5: [
      ["10:00", "yoga", "كابتنة ريم"],
      ["16:00", "crossfit", "كابتن ماجد"],
      ["18:00", "boxing", "كابتن سلطان"],
    ],
  };

  // ترتيب عرض الأيام: يبدأ الأسبوع بالسبت
  const DAYS = [
    { d: 6, name: "السبت" },
    { d: 0, name: "الأحد" },
    { d: 1, name: "الاثنين" },
    { d: 2, name: "الثلاثاء" },
    { d: 3, name: "الأربعاء" },
    { d: 4, name: "الخميس" },
    { d: 5, name: "الجمعة" },
  ];

  // ---------- دوال مساعدة ----------

  const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

  const toArabicDigits = (value) =>
    String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[digit]);

  const toLatinDigits = (value) =>
    String(value).replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS.indexOf(digit));

  const minutesOf = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const formatTime = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 ? "م" : "ص";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const clock = `${hour12}:${String(m).padStart(2, "0")}`;
    return `${toArabicDigits(clock)} ${suffix}`;
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // ---------- 1) حصص اليوم ----------

  function renderToday() {
    const list = document.getElementById("today-list");
    const dayLabel = document.getElementById("today-day");
    if (!list || !dayLabel) return;

    const now = new Date();
    const today = DAYS.find((day) => day.d === now.getDay());
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let nextMarked = false;

    dayLabel.textContent = today.name;

    const items = SCHEDULE[today.d].map(([time, key, coach]) => {
      const start = minutesOf(time);
      const end = start + CLASSES[key].minutes;
      let state = "upcoming";
      let label = "";

      if (nowMinutes >= end) {
        state = "done";
        label = "انتهت";
      } else if (nowMinutes >= start) {
        state = "live";
        label = "جارية الآن";
      } else if (!nextMarked) {
        state = "next";
        label = "التالية";
        nextMarked = true;
      }

      const what = el("span", "what");
      what.append(el("strong", "", CLASSES[key].name), el("small", "", coach));

      const item = el("li", `today-item is-${state}`);
      item.append(el("span", "time", formatTime(time)), what, el("span", "state", label));
      return item;
    });

    list.replaceChildren(...items);
  }

  // ---------- 2) جدول الأسبوع ----------

  function initSchedule() {
    const tabs = document.getElementById("day-tabs");
    const list = document.getElementById("schedule-list");
    if (!tabs || !list) return;

    function showDay(d) {
      tabs.querySelectorAll("button").forEach((button) => {
        button.setAttribute("aria-pressed", String(Number(button.dataset.day) === d));
      });

      const rows = SCHEDULE[d].map(([time, key, coach]) => {
        const row = el("li", "schedule-item");
        row.append(
          el("span", "time", formatTime(time)),
          el("strong", "class-name", CLASSES[key].name),
          el("span", "coach", coach),
          el("span", "minutes", `${toArabicDigits(CLASSES[key].minutes)} دقيقة`)
        );
        return row;
      });

      list.replaceChildren(...rows);
    }

    DAYS.forEach(({ d, name }) => {
      const button = el("button", "day-btn", name);
      button.type = "button";
      button.dataset.day = String(d);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => showDay(d));
      tabs.append(button);
    });

    showDay(new Date().getDay());
  }

  // ---------- 3) نموذج الحجز ----------

  function initForm() {
    const form = document.getElementById("join-form");
    const status = document.getElementById("form-status");
    const nameInput = document.getElementById("field-name");
    const phoneInput = document.getElementById("field-phone");
    const classSelect = document.getElementById("field-class");
    if (!form || !status || !nameInput || !phoneInput || !classSelect) return;

    function setStatus(message, type) {
      status.textContent = message;
      status.classList.remove("is-error", "is-ok");
      if (type) status.classList.add(`is-${type}`);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = nameInput.value.trim();
      const phone = toLatinDigits(phoneInput.value).replace(/[\s-]/g, "");

      if (name.length < 2) {
        setStatus("اكتب اسمك (حرفان على الأقل).", "error");
        nameInput.focus();
        return;
      }

      if (!/^\+?\d{9,15}$/.test(phone)) {
        setStatus("رقم الجوال غير صحيح. اكتبه بالأرقام فقط، مثل 0501234567.", "error");
        phoneInput.focus();
        return;
      }

      const chosen = CLASSES[classSelect.value].name;
      setStatus(
        `شكرًا ${name}، سجّلنا رغبتك في حصة ${chosen}. هذا موقع تجريبي ولا تُرسل بياناتك إلى أي جهة.`,
        "ok"
      );
      form.reset();
    });
  }

  // ---------- التشغيل ----------

  renderToday();
  initSchedule();
  initForm();

  // تحديث حالة حصص اليوم كل دقيقة
  setInterval(renderToday, 60 * 1000);
})();
