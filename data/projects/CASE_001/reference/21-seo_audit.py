#!/usr/bin/env python3
"""Riwaq 21 SEO audit rule-compatible runner, based on the supplied handoff file."""
import json, re, sys, unicodedata
from pathlib import Path
RULES={"title_max":60,"title_a_kw_min_pos":16,"title_b_kw_by":40,"desc_kw_first":100,"desc_kw_count":3,"desc_min":900,"desc_min_short":250,"desc_max":5000,"tags_max":500,"tags_min":15,"tags_long":(30,34),"tags_short":(18,19),"tags_short_chars":280}
DATE_RE=re.compile(r"\d{4}-\d{2}-\d{2}")
HASHTAG_RE=re.compile(r"#\S+")
AR_DIACRITICS=re.compile(r"[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]")
STATUS_TOKENS=("مقيس","مفترض","قديم","measured","assumed","stale")
def norm_tag(s):
    s=unicodedata.normalize("NFKC",s).strip().lower();s=AR_DIACRITICS.sub("",s)
    for a,b in (("أ","ا"),("إ","ا"),("آ","ا"),("ة","ه"),("ى","ي"),("ؤ","و"),("ئ","ي")):s=s.replace(a,b)
    return re.sub(r"[\s_\-.,،]+","",s.lstrip("#"))
def check(profile,pack):
    rows=[];fails=0;warns=0
    def add(ok,rule,detail,warn=False):
        nonlocal fails,warns
        status="WARN" if ok is None else ("PASS" if ok else ("WARN" if warn else "FAIL"))
        if status=="WARN":warns+=1
        if status=="FAIL":fails+=1
        rows.append((status,rule,detail))
    kw=(pack.get("keyword") or profile.get("keyword") or "").strip();kind=(pack.get("kind") or "long").strip().lower();short=kind in {"short","shorts","vertical"}
    a=(pack.get("title_a") or "").strip();b=(pack.get("title_b") or "").strip();desc=(pack.get("description") or "").strip();tags=[str(x).strip() for x in (pack.get("tags") or []) if str(x).strip()];e=(pack.get("evidence") or "").strip()
    add(bool(kw),"0. keyword defined",kw or "missing")
    add(bool(a) and bool(b),"1. two titles (A/B)",f"A={len(a)}ch B={len(b)}ch")
    for n,t in (("A",a),("B",b)):add(bool(t) and len(t)<=60,f"1.{n} title <= 60",f"{len(t)}ch")
    if kw:
        pa=a.find(kw)+1 if kw in a else 0;pb=b.find(kw)+1 if kw in b else 0
        add(pa>=16,"2.A keyword after char 16",f"at char {pa}" if pa else "keyword absent")
        add(0<pb<=40,"2.B keyword inside first 40",f"at char {pb}" if pb else "keyword absent")
        add(kw in desc[:100],"3. keyword in first 100 chars","yes" if kw in desc[:100] else "absent")
        n=desc.count(kw);need=1 if short else 3
        add(n>=need,f"4. keyword x{need} in description",f"{n} occurrences")
        add(n<=(2 if short else 3),"4b. no keyword stuffing",f"{n} occurrences",warn=True)
    dmin=250 if short else 900
    add(dmin<=len(desc)<=5000,f"6. description length {dmin}-5000",f"{len(desc)}ch")
    has_source=bool(re.search(r"https?://\S*(?:&t=|&amp;t=|\?t=|\?v=)\S*",desc))
    add(has_source,"5a. source link with timestamp","found" if has_source else "missing")
    cu=(profile.get("channel_url") or "").strip();add(bool(cu) and cu in desc,"5b. channel link","found" if cu and cu in desc else "missing")
    add("الفصول" in desc,"5c. chapters block","found" if "الفصول" in desc else "missing")
    add(bool(HASHTAG_RE.search(desc)),"5d. at least one hashtag","found" if HASHTAG_RE.search(desc) else "missing")
    add("00:00" in desc,"5e. chapters start at 00:00","found" if "00:00" in desc else "missing")
    joined=",".join(tags);add(len(joined)<=500,"7. tags <= 500 chars",f"{len(joined)}ch");add(len(joined)>=485,"7b. tag budget used (485-500)",f"{len(joined)}ch",warn=True)
    if tags:add(norm_tag(tags[0])==norm_tag(kw),"8. first tag == keyword",tags[0])
    lo,hi=(18,19) if short else (30,34);add(lo<=len(tags)<=hi,f"9. tag count {lo}-{hi}",f"{len(tags)} tags");add(len(tags)>=15,"9b. tags >= 15",f"{len(tags)}")
    keys=[norm_tag(t) for t in tags];dups=sorted({x for x in keys if keys.count(x)>1});add(not dups,"10. no duplicate tags",", ".join(dups) if dups else "clean")
    add(bool(e) and bool(DATE_RE.search(e)) and any(t in e for t in STATUS_TOKENS),"11. evidence line date/status",e or "missing")
    return rows,fails,warns
def main():
    if len(sys.argv)!=3:print("usage: 21-seo_audit.py channel_profile.json pack.json");return 2
    profile=json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"));pack=json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"));rows,fails,warns=check(profile,pack)
    print(f"=== SEO audit — pack {pack.get('id','?')} ({pack.get('kind','long')}) ===")
    for s,r,d in rows:print(f"{s:4} {r} | {d}")
    print(f"\n{len(rows)} checks · {fails} FAIL · {warns} WARN\nVERDICT: {'NO DELIVERY' if fails else 'OK'+(' (with warnings)' if warns else '')}")
    return 1 if fails else 0
if __name__=="__main__":raise SystemExit(main())
