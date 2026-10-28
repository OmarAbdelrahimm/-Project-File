#!/usr/bin/env python3
"""Build a rough-cut Karaoke map from the approved script and the supplied Whisper word-time CSV.

Whisper word text is deliberately not used as caption copy. The approved script supplies copy;
CSV start/end values supply the timing scaffold. Merged/split recognizer tokens are distributed
monotonically for review, and the generated QA summary records that those spans need human audit.
"""
import csv, json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / 'data/projects/CASE_001/DRAFT_SCRIPT_CASE_001.md'
CSV_IN = ROOT / 'audio/CASE_001_word_timestamps.csv'
JSON_OUT = ROOT / 'brand/src/case001-captions.json'
QA_OUT = ROOT / 'data/projects/CASE_001/WORD_ALIGNMENT_QA.md'


def normalize(s):
    s = unicodedata.normalize('NFKC', s).lower()
    s = re.sub(r'[\u064B-\u065F\u0670\u0640]', '', s)
    s = s.translate(str.maketrans({'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي'}))
    return re.sub(r'[^\w\u0600-\u06FF]', '', s)


def ratio(a, b):
    if not a or not b:
        return 0.0
    previous = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        current = [i]
        for j, cb in enumerate(b, 1):
            current.append(min(current[-1] + 1, previous[j] + 1,
                               previous[j-1] + (ca != cb)))
        previous = current
    return 1 - previous[-1] / max(len(a), len(b))


def parse_script():
    text = SCRIPT.read_text(encoding='utf-8')
    blocks = re.findall(r'\*\*الصوت[^:]*:\*\*\s*«(.*?)»', text, re.S)
    blocks = [re.sub(r'\[[^\]]*\]', '', block).strip() for block in blocks]
    sentences = []
    for block in blocks:
        # Dots in revision identifiers and section numbers are not sentence boundaries:
        # they are not followed by whitespace; Arabic full-stop/question marks are.
        parts = re.split(r'(?<=[!?؟])\s+|(?<=\.)\s+(?=[\u0600-\u06FF])', block)
        for part in parts:
            tokens = part.split()
            tokens = [x.strip('«»“”\"') for x in tokens if normalize(x)]
            if tokens:
                sentences.append(tokens)
    words = [w for sentence in sentences for w in sentence]
    return sentences, words


def read_csv():
    with CSV_IN.open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        r['start'] = float(r['start'])
        r['end'] = float(r['end'])
    return rows


def align(script_words, rows):
    a = [normalize(x) for x in script_words]
    b = [normalize(x['word']) for x in rows]
    n, m = len(a), len(b)
    inf = 1e9
    dp = [[inf] * (m + 1) for _ in range(n + 1)]
    parent = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0.0
    for i in range(n + 1):
        for j in range(m + 1):
            base = dp[i][j]
            if base == inf:
                continue
            def put(ni, nj, cost, op):
                val = base + cost
                if val < dp[ni][nj]:
                    dp[ni][nj] = val
                    parent[ni][nj] = (i, j, op)
            if i < n and j < m:
                put(i+1, j+1, .8 * (1-ratio(a[i], b[j])), '11')
            if i < n:
                put(i+1, j, .88, '10')
            if j < m:
                put(i, j+1, .88, '01')
            if i < n and j+1 < m:
                sim = ratio(a[i], b[j] + b[j+1])
                if sim >= .42:
                    put(i+1, j+2, .12 + .8*(1-sim), '12')
            if i+1 < n and j < m:
                sim = ratio(a[i] + a[i+1], b[j])
                if sim >= .42:
                    put(i+2, j+1, .12 + .8*(1-sim), '21')
    ops = []
    i, j = n, m
    while i or j:
        pi, pj, op = parent[i][j]
        ops.append((op, pi, i, pj, j))
        i, j = pi, pj
    ops.reverse()
    timing = [None] * n
    counts = {'one_to_one':0, 'one_script_to_two_asr':0,
              'two_script_to_one_asr':0, 'script_word_without_asr_row':0,
              'asr_rows_ignored':0}
    for op, i1, i2, j1, j2 in ops:
        if op == '11':
            timing[i1] = (rows[j1]['start'], rows[j1]['end'])
            counts['one_to_one'] += 1
        elif op == '12':
            timing[i1] = (rows[j1]['start'], rows[j2-1]['end'])
            counts['one_script_to_two_asr'] += 1
        elif op == '21':
            weights = [max(1, len(normalize(script_words[k]))) for k in range(i1, i2)]
            total = sum(weights)
            start, end = rows[j1]['start'], rows[j1]['end']
            cursor = start
            for k, weight in zip(range(i1, i2), weights):
                nxt = end if k == i2-1 else cursor + (end-start) * weight / total
                timing[k] = (cursor, nxt)
                cursor = nxt
            counts['two_script_to_one_asr'] += 1
        elif op == '10':
            counts['script_word_without_asr_row'] += 1
        elif op == '01':
            counts['asr_rows_ignored'] += 1
    # Fill any truly absent script word from adjacent reliable times for rough-cut continuity.
    missing = [i for i, v in enumerate(timing) if v is None]
    for i in missing:
        prev = next((timing[k] for k in range(i-1, -1, -1) if timing[k] is not None), None)
        nxt = next((timing[k] for k in range(i+1, n) if timing[k] is not None), None)
        if prev and nxt and nxt[0] > prev[1]:
            span = nxt[0] - prev[1]
            timing[i] = (prev[1], prev[1] + min(.18, span*.35))
        elif prev:
            timing[i] = (prev[1], prev[1] + .16)
        elif nxt:
            timing[i] = (max(0, nxt[0]-.16), nxt[0])
        else:
            timing[i] = (0, .16)
    # Keep cues monotonic and non-negative; never extend past the last supplied word.
    for i, (start, end) in enumerate(timing):
        start = max(0.0, start)
        end = max(start + .04, end)
        if i and start < timing[i-1][0]:
            start = timing[i-1][0]
        timing[i] = (start, end)
    return timing, counts, dp[n][m]


def get_heading_indexes():
    text = SCRIPT.read_text(encoding='utf-8')
    headings = list(re.finditer(r'^###\s+(\d{2}):(\d{2})', text, re.M))
    indexes = {}
    cursor = 0
    for pos, heading in enumerate(headings):
        stop = headings[pos+1].start() if pos+1 < len(headings) else len(text)
        section = text[heading.end():stop]
        blocks = re.findall(r'\*\*الصوت[^:]*:\*\*\s*«(.*?)»', section, re.S)
        words = []
        for block in blocks:
            block = re.sub(r'\[[^\]]*\]', '', block).strip()
            words.extend(x.strip('«»“”\"') for x in block.split() if normalize(x))
        if words:
            seconds = int(heading.group(1))*60 + int(heading.group(2))
            indexes[seconds] = cursor
            cursor += len(words)
    return indexes


def main():
    sentences, script_words = parse_script()
    rows = read_csv()
    timing, counts, cost = align(script_words, rows)
    out = []
    cursor = 0
    for sid, words in enumerate(sentences):
        pairs = timing[cursor:cursor+len(words)]
        cursor += len(words)
        out.append({'id':sid, 's':round(min(x[0] for x in pairs), 3),
                    'e':round(max(x[1] for x in pairs), 3),
                    'w':words,
                    't':[[round(a,3), round(b,3)] for a,b in pairs]})
    JSON_OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    heading_indexes = get_heading_indexes()
    scene_times = {}
    nominal = [0,40,130,195,260,283,310,353,375,397,419,463,485,530,574,595,630]
    section_times = {str(value): round(timing[idx][0], 3)
                     for value, idx in heading_indexes.items() if idx < len(timing)}
    (ROOT / 'brand/src/case001-section-starts.json').write_text(
        json.dumps(section_times, ensure_ascii=False, indent=2), encoding='utf-8')
    for value in nominal:
        idx = heading_indexes.get(value)
        if idx is not None and idx < len(timing):
            scene_times[str(value)] = round(timing[idx][0], 3)
        else:
            scene_times[str(value)] = round(value * 612.86 / 645, 3)
    (ROOT / 'brand/src/case001-scene-starts.json').write_text(
        json.dumps(scene_times, ensure_ascii=False, indent=2), encoding='utf-8')
    csv_last = max(r['end'] for r in rows)
    qa = [
        '# CASE_001 — ملاحظة محاذاة الكلمات للـRough Cut', '',
        f'- نص الكابشن: حوار السكريبت المعتمد (`DRAFT_SCRIPT_CASE_001.md`) بعد حذف ملاحظات الأداء غير المنطوقة.',
        f'- مصدر التوقيت: `audio/CASE_001_word_timestamps.csv` (Whisper tiny)؛ {len(rows)} صفًا، من {min(r["start"] for r in rows):.3f}s إلى {csv_last:.3f}s.',
        f'- كلمات السكريبت المنطوقة: {len(script_words)}؛ مجموعات الكابشن: {len(out)}.',
        f'- المطابقة الرتيبة: 1:1={counts["one_to_one"]}، كلمة سكريبت إلى صفين ASR={counts["one_script_to_two_asr"]}، كلمتان سكريبت إلى صف ASR واحد={counts["two_script_to_one_asr"]}، كلمات بلا صف ASR مباشر={counts["script_word_without_asr_row"]}، صفوف ASR مستبعدة={counts["asr_rows_ignored"]}.',
        '- في الصفوف المدمجة/المقسومة، قُسم مجال التوقيت المتاح بين كلمات السكريبت حسب طول الكلمة لإنتاج خريطة Rough Cut؛ هذا لا يثبت حدًا صوتيًا دقيقًا لكل كلمة. يُراجع السطر/الكلمة مقابل التسجيل قبل اعتماد النسخة النهائية.',
        '- خريطة JSON الناتجة هي `brand/src/case001-captions.json`؛ كل مجموعة تعرض الجملة كاملة، وتستخدم أزمنة `t` للتظليل الذهبي كلمةً كلمةً.',
        ''
    ]
    QA_OUT.write_text('\n'.join(qa), encoding='utf-8')
    print(f'captions={len(out)} words={len(script_words)} rows={len(rows)} counts={counts} total_cost={cost:.2f}')

if __name__ == '__main__':
    main()
