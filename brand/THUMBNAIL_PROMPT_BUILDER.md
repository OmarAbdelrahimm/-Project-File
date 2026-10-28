# THUMBNAIL_PROMPT_BUILDER.md — قالب برومبت الأغلفة

حفظ معيار دائم: THUMBNAIL_PROMPT_BUILDER.md
احفظ هذا الملف في brand/THUMBNAIL_PROMPT_BUILDER.md. من الآن فصاعدًا، في كل مرة تُنتج فيها غلافًا (Thumbnail) لأي حلقة، لا تصمم من الصفر ولا تعتمد على الذاكرة: ابنِ برومبت التوليد بتعبئة القالب أدناه حرفيًا بمتغيرات الحلقة، ثم مرره لأداة توليد الصور.

===================================================
القالب الثابت (Image Generation Prompt Template)
===================================================
يتكون برومبت كل غلاف من 4 كتل بالترتيب: [ثوابت الأسلوب] + [ثوابت الهوية] + [متغيرات الحلقة] + [قيود سلبية].

--- الكتلة 1: ثوابت الأسلوب (لا تتغير أبدًا) ---
"Professional, photorealistic YouTube thumbnail for a civil engineering channel. Cinematic lighting with strong rim light / spotlight effect on the main subject. Single dominant visual subject, rule-of-thirds composition (subject offset left or right, not centered). High contrast, moody dark navy-blue background with golden accent highlights. Documentary / investigative tone, like a forensic case file reveal. Sharp focus on primary subject, soft bokeh on background elements. Gritty realistic construction-site photography style, not illustration, not flat vector, not cartoon, not clipart, not 3D render toy-style."

--- الكتلة 2: ثوابت الهوية (لا تتغير أبدًا) ---
"Color grading: deep navy blue (#0B1C2C approximate) duotone with warm gold (#C9A227 approximate) accent tones only. Thin gold border frame along edges. Brand wordmark 'ملف المشروع' reserved in [fixed corner position — top-left] small and unobtrusive, do not make it the focal point. Leave 10% safe margin on all edges clear of critical detail."

--- الكتلة 3: متغيرات الحلقة (تُملأ تلقائيًا من pack الحلقة) ---
"Subject: {العنصر البصري المركزي للحلقة — مثال: a close-up of overlapping rebar mesh with one section circled in gold, blurred concrete pump truck approaching in the background}
Annotation detail: {تفصيلة التوثيق المطلوب إبرازها بدائرة/سهم ذهبي — مثال: a gold circle highlighting a visible gap in rebar spacing}
Large text overlay (Arabic, Amiri font, 2-4 words max): '{النص الكبير المطلوب — مثال: نصبّ ولا نوقف؟}'
Mood: {المزاج البصري المطلوب — مثال: tense, urgent, decision-point atmosphere}"

--- الكتلة 4: القيود السلبية (Negative Prompt — لا تتغير) ---
"No cartoon style, no flat vector illustration, no emoji, no clipart icons, no toy-like 3D render, no children's-book aesthetic, no cluttered composition, no more than one dominant subject, no real company logos, no real project names, no visible faces of real identifiable people, no low-contrast muddy colors."

===================================================
آلية التعبئة الإلزامية
===================================================
لكل حلقة جديدة:
1. اقرأ من ملف PACK الخاص بالحلقة (primary_keyword, title, thumbnail concept) لتحديد محتوى الكتلة 3.
2. ادمج الكتل الأربعة بالترتيب في نص واحد متصل، بدون حذف أي كتلة.
3. أرسل البرومبت المجمّع كاملاً لأداة توليد الصور.
4. بعد توليد الصورة الأولية، افصل الخلفية عن كل الكلمات/الشعارات التي رسمتها الأداة: أزل النصوص المدمجة من لوحة الخلفية دون تغيير تكوينها أو حدود الإطار، ثم أضف العنوان والشعار الرسمي كطبقات تحرير مستقلة قابلة للتعديل. لا تضف أو تحرك أو تغيّر الإطار أو حدود الصورة دون طلب صريح.
5. صدّر النتيجة النهائية بمقاس 1280×720 + معاينة 168px حسب THUMBNAIL_SEO_STANDARDS.md.
6. أرفق نص البرومبت الكامل المستخدم (الكتل الأربعة بعد التعبئة) مع كل تسليم غلاف، حتى يمكن مراجعته أو إعادة توليد نسخة بديلة بنفس الأساس مع تعديل بسيط.

===================================================
ملاحظة حاسمة لثبات الهوية عبر الحلقات
===================================================
الكتلتان 1 و2 يجب أن تُستخدما حرفيًا دون أي تغيير في كل غلاف مستقبلي لأي حلقة، بغض النظر عن الموضوع. هذا هو الضمان الوحيد لبناء تعرف بصري متراكم على القناة (Brand Recognition) عبر عشرات الحلقات القادمة. أي انحراف عن الكتلتين الثابتتين يُعتبر خطأ معياري، ليس خيارًا إبداعيًا.

===================================================
المطلوب الآن تطبيقه على CASE_001
===================================================
املأ الكتلة 3 لكل من Concept A وConcept B بناءً على بيانات الحلقة الحالية (عنوان، كلمة مفتاحية pre pour inspection، لحظة القرار الحرجة)، ادمج البرومبت الكامل، ولّد الغلافين من جديد، وأرفق نص البرومبت المستخدم لكل منهما مع الصورتين الناتجتين (1280×720 + معاينة 168px).

===================================================
اختيار أسلوب الصورة لكل حلقة
===================================================
قبل بدء أي غلاف جديد، اسأل المستخدم عن أسلوب الصورة لهذه الحلقة تحديدًا، ولا تفترض اختياره من حلقات سابقة:
- صورة فوتوغرافية حقيقية مرخّصة: استخدم أصلًا محددًا من Pexels أو Pixabay أو Unsplash، وتحقق من صفحة الأصل والترخيص وسجّل البيانات والتحويلات في `ASSET_RIGHTS_MANIFEST.csv`، مع تطبيق `THUMBNAIL_SEO_STANDARDS.md`.
- توليد صورة فوتوغرافية واقعية بالذكاء الاصطناعي: مرّر البرومبت المكوّن من الكتل الأربع حرفيًا إلى أداة توليد الصور، وسجّل الأداة/النموذج والتاريخ والبرومبت والتحويلات. لا تصف الناتج بأنه صورة فوتوغرافية حقيقية مرخّصة ولا تنسبه إلى مواقع الصور.

يظل اختيار المستخدم لهذه الحلقة هو المرجع؛ احتفظ بالمسارين كمعيارين، واسأل مجددًا عند كل حلقة.
