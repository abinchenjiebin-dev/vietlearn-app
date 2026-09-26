"""越南语学堂 - 网页版本地运行 / 自测脚本（只需要 Python 3，不用装任何东西）

用法（在本文件所在的文件夹里打开终端）：
    python run.py          启动并自动打开浏览器
    python run.py --test   自测：检查页面和程序文件都正常
"""
import http.server
import os
import re
import socketserver
import sys
import threading
import urllib.request
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))
ROUTES = ["/", "/phrases", "/vocab", "/compounds", "/sentences"]
# 程序包里应该包含的学习内容（抽查）
EXPECT_IN_BUNDLE = ["Xin chào.", "Cái này bao nhiêu tiền?", "máy bay", "Tôi không hiểu.", "vi-VN"]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        full = super().translate_path(path)
        # 单页应用：/phrases 这类地址都返回 index.html，由 App 自己处理路由
        if not os.path.exists(full):
            return os.path.join(ROOT, "index.html")
        return full

    def log_message(self, *args):
        pass


def serve(port):
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def get(port, path):
    return urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=5).read().decode("utf-8")


def check(name, passed):
    print(f"{'✅' if passed else '❌'} {name}")
    return passed


def self_test():
    port = PORT + 1  # 测试用另一个端口，不影响正在运行的 App
    httpd = serve(port)
    ok = True
    for r in ROUTES:
        try:
            ok &= check(f"页面 {r} 可以打开", 'id="root"' in get(port, r))
        except Exception:  # noqa: BLE001
            ok &= check(f"页面 {r} 可以打开", False)
    html = get(port, "/")
    m = re.search(r'src="(/_expo/static/js/web/[^"]+\.js)"', html)
    ok &= check("找到程序文件", bool(m))
    if m:
        bundle = get(port, m.group(1))
        # 程序文件里的越南语字母是转义写法（如 \\u00e0），先还原
        bundle = re.sub(r"\\u([0-9a-fA-F]{4})", lambda x: chr(int(x.group(1), 16)), bundle)
        bundle = re.sub(r"\\x([0-9a-fA-F]{2})", lambda x: chr(int(x.group(1), 16)), bundle)
        for text in EXPECT_IN_BUNDLE:
            ok &= check(f"内容包含「{text}」", text in bundle)
    httpd.shutdown()
    print("\n全部通过 🎉" if ok else "\n有检查没通过 ⚠️")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    if "--test" in sys.argv:
        self_test()
    serve(PORT)
    url = f"http://127.0.0.1:{PORT}/"
    print(f"越南语学堂已启动：{url}\n（建议用 Edge 或 Chrome 打开，发音效果更好）\n按 Ctrl+C 退出")
    webbrowser.open(url)
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        print("已退出")
