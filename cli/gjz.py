#!/usr/bin/env python3
"""gjz — 工具站大全 命令行（免费，单文件，只需 Python 3.8+，无第三方依赖）
用法：
  python3 gjz.py list                      列出所有免费工具
  python3 gjz.py search 关键词             搜索工具
  python3 gjz.py video <分享链接或文字>     解析视频（抖音无水印 / X / B站 …）
  python3 gjz.py download <分享链接> [-o 目录]  解析并下载最高清晰度视频
  python3 gjz.py text <链接或本地文件>      视频/音频转文字（同时保存 .txt 和 .srt）
  python3 gjz.py script <链接或本地文件>    视频拆解脚本（保存 .zip：分镜表 + 关键帧 + 字幕）
  python3 gjz.py mp3 <链接或本地文件>       提取 MP3
  python3 gjz.py cover <链接或本地文件>     截取封面和关键画面
  python3 gjz.py open <工具名>             在浏览器打开某个工具"""
import json, os, re, sys, urllib.parse, urllib.request, webbrowser
SITE = "https://wan.is-my.app"
UA = {"User-Agent": "gjz-cli/1.0"}
def get(u, t=30): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t)
def base():
    c = ["https://aiym.dpdns.org"]
    try: c = json.load(get(SITE + "/live.json", 15)).get("urls", []) + c
    except Exception: pass
    for u in c:
        if "lhr.life" in u: continue
        try:
            if get(u.rstrip("/") + "/dl/healthz", 10).status == 200: return u.rstrip("/")
        except Exception: pass
    sys.exit("解析服务器暂时不可用，请稍后再试")
def tools(): return json.load(get(SITE + "/api/tools.json"))["tools"]
def save(u, fn):
    with get(u, 600) as r, open(fn, "wb") as f:
        while True:
            c = r.read(1 << 16)
            if not c: break
            f.write(c)
    print("已保存", fn, os.path.getsize(fn), "字节")
def media(task, src, out="."):
    import time, uuid
    b = base()
    if os.path.isfile(src):
        bd = uuid.uuid4().hex; data = open(src, "rb").read()
        body = (f"--{bd}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{os.path.basename(src)}\"\r\nContent-Type: application/octet-stream\r\n\r\n").encode() + data + f"\r\n--{bd}--\r\n".encode()
        req = urllib.request.Request(b + "/dl/api/media?task=" + task, data=body, headers=dict(UA, **{"Content-Type": "multipart/form-data; boundary=" + bd}))
        d = json.load(urllib.request.urlopen(req, timeout=600))
    else:
        d = json.load(get(b + "/dl/api/media?task=" + task + "&url=" + urllib.parse.quote(src), 60))
    if not d.get("ok"): sys.exit(d.get("error") or "提交失败")
    j = d["id"]; last = ""
    while True:
        s = json.load(get(b + "/dl/api/media/" + j, 30))
        if s.get("state") == "error": sys.exit(s.get("msg"))
        if s.get("state") == "done": break
        m = f"{s.get('progress', 0)}% {s.get('msg', '')}"
        if m != last: print(m, file=sys.stderr); last = m
        time.sleep(2)
    print(s.get("msg"), file=sys.stderr)
    stem = os.path.join(out, re.sub(r'[\\/:*?"<>|\s#]+', " ", os.path.splitext(os.path.basename(src))[0] if os.path.isfile(src) else (s.get("title") or j)).strip()[:40] or j)
    if task == "asr":
        print(s.get("text", ""))
        for ext in ("txt", "srt"): save(f"{b}/dl/api/media/{j}/transcript.{ext}", f"{stem}.{ext}")
    elif task == "script": save(f"{b}/dl/api/media/{j}/script.zip", f"{stem}-拆解脚本.zip")
    elif task == "mp3": save(f"{b}/dl/api/media/{j}/audio.mp3", f"{stem}.mp3")
    else:
        os.makedirs(stem + "-封面", exist_ok=True)
        for f in s.get("files", []): save(f"{b}/dl/api/media/{j}/{f}", os.path.join(stem + "-封面", f))
def main(a):
    if not a or a[0] in ("-h", "--help", "help"): print(__doc__); return
    cmd, rest = a[0], a[1:]
    if cmd == "list":
        for t in tools(): print(f"{t['category']:<8} {t['name']:<16} {t['url']}")
    elif cmd == "search":
        k = " ".join(rest).lower()
        for t in tools():
            if k in (t["name"] + t["description"] + t["keywords"]).lower(): print(f"{t['name']:<16} {t['url']}")
    elif cmd in ("video", "download"):
        if not rest: sys.exit("请提供分享链接")
        out = "."
        if "-o" in rest: i = rest.index("-o"); out = rest[i + 1]; rest = rest[:i] + rest[i + 2:]
        b = base(); d = json.load(get(b + "/dl/api/parse?url=" + urllib.parse.quote(" ".join(rest)), 90))
        if not d.get("ok"): sys.exit(d.get("error") or "解析失败")
        if cmd == "video": print(json.dumps(d, ensure_ascii=False, indent=2)); return
        items = [(v["url"], v.get("ext", "mp4")) for v in d.get("videos", [])[:1]] or [(x, "jpg") for x in d.get("images", [])]
        name = re.sub(r'[\\/:*?"<>|\s#]+', " ", d.get("title") or "video").strip()[:40] or "video"
        for i, (u, ext) in enumerate(items):
            fn = os.path.join(out, f"{name}{'-' + str(i + 1) if len(items) > 1 else ''}.{ext}")
            with get(b + "/dl/api/file?u=" + urllib.parse.quote(u) + "&name=" + urllib.parse.quote(os.path.basename(fn)), 600) as r, open(fn, "wb") as f:
                while True:
                    c = r.read(1 << 16)
                    if not c: break
                    f.write(c)
            print("已保存", fn, os.path.getsize(fn), "字节")
    elif cmd in ("text", "script", "mp3", "cover"):
        if not rest: sys.exit("请提供视频链接或本地文件路径")
        out = "."
        if "-o" in rest: i = rest.index("-o"); out = rest[i + 1]; rest = rest[:i] + rest[i + 2:]
        media({"text": "asr"}.get(cmd, cmd), " ".join(rest), out)
    elif cmd == "open":
        k = " ".join(rest)
        t = next((t for t in tools() if k and (k in t["name"] or k == t["slug"])), None)
        if not t: sys.exit("没找到这个工具")
        webbrowser.open(t["url"]); print(t["url"])
    else: print(__doc__)
if __name__ == "__main__": main(sys.argv[1:])
