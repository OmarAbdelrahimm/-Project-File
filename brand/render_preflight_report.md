# Render Preflight — Brand Kit v3

**الحالة: PASS** — تم تشغيل Smoke Test فعلي عبر Remotion، وإنشاء الفيديوين الأفقي والعمودي وفحصهما بعد التصدير.

## النتائج

| Composition | الدقة | FPS | الإطارات | المدة الدقيقة | شفافية ProRes 4444 | بديل H.264 |
|---|---:|---:|---:|---:|---|---|
| BrandIntroHorizontal | 1920×1080 (16:9) | 30 | 45 | 1.500 ثانية | `animated-logo-intro-16x9-alpha.mov` — ProRes 4444، `yuva444p12le`، قناة alpha مؤكدة | `animated-logo-intro-16x9-navy.mp4` — H.264، خلفية كحلية، بلا alpha |
| BrandIntroVertical | 1080×1920 (9:16) | 30 | 45 | 1.500 ثانية | `animated-logo-intro-9x16-alpha.mov` — ProRes 4444، `yuva444p12le`، قناة alpha مؤكدة | `animated-logo-intro-9x16-navy.mp4` — H.264، خلفية كحلية، بلا alpha |

## ما تم اختباره

- تجميع Remotion Bundle ثم تحديد Composition وعرض جميع الإطارات، لا مجرد معاينة متصفح.
- استخراج لقطة PNG من Chromium للتحقق من رندر المشهد وقناة الشفافية؛ نطاق alpha للصورة الناتجة من 0 إلى 255.
- فحص ترميز وقياسات ومدة ملفات MOV وMP4 باستخدام FFmpeg.
- التحقق من قناة alpha في ProRes عبر `alphaextract`؛ فك الفيديو أعاد صيغة `yuva444p12le` ونجح استخراج القناة.
- إزالة مسار الصوت الصامت وإعادة remux للنسخ النهائية حتى تبقى المدة 1.500 ثانية بالضبط.
- أُنتج كل Intro من 45 إطارًا عند 30fps. الحركة هادئة: فتح مشهد ملف هندسي، ظهور ورقة المخطط ثم رمز OA وخط الذهب.

## قابلية إعادة التشغيل

من مجلد `src/`:

```bash
npm ci
npm run render:smoke
```

يستخرج السكريبت مكتبات Chromium المرفقة مع `@sparticuz/chromium` تلقائيًا، ويضبط مسارها قبل تشغيل Remotion. عولج نقص `libnspr4.so` و`libnss3.so` بتحميل مكتبات Linux المرفقة في الحزمة إلى `/tmp/al2023/lib`؛ لا يعتمد الاختبار على تنزيل Chrome من Google.

**حدود النتيجة:** النجاح يخص اختبار Brand Intro ذي 1.5 ثانية والنسختين المحددتين أعلاه. لا يُعد اختبارًا لقالب فيديو كامل أو سلسلة إنتاج الحلقات.
