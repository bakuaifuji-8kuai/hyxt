"""Debug: get full text content of the C端-首页配置 page."""
import asyncio
from playwright.async_api import async_playwright

CHROMIUM = "/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN")
        page = await ctx.new_page()

        # Capture all console and errors
        page.on("console", lambda msg: print(f"  [console.{msg.type}] {msg.text[:200]}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: print(f"  [pageerror] {err}"))

        # Login first
        await page.goto("http://localhost:8000/login", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(800)
        await page.fill('input[id="username"]', "admin")
        await page.fill('input[id="password"]', "admin")
        await page.click('button.ant-btn-primary')
        await page.wait_for_timeout(2000)

        # Go to C端-首页配置
        await page.goto("http://localhost:8000/#/m/c-app-home", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2500)

        # Get full body text
        body = await page.evaluate("document.body.innerText")
        print("=== BODY TEXT (first 2000 chars) ===")
        print(body[:2000])
        print("\n=== BODY TEXT (last 1000 chars) ===")
        print(body[-1000:])
        print(f"\n=== Total length: {len(body)} ===")

        # Check specific terms
        for term in ["金币", "积分", "珑珠", "龙珠", "服务导航", "组件库", "拖拽", "预览", "停车缴费", "快速金币"]:
            print(f"  '{term}': {'YES' if term in body else 'NO'}")

        # Get all component type names visible in the left panel
        comp_names = await page.evaluate("""
            () => {
                const items = document.querySelectorAll('.ant-card, .comp-item, [class*="comp"]');
                return Array.from(items).map(el => el.innerText).filter(t => t && t.length < 50).slice(0, 30);
            }
        """)
        print("\n=== Component items found ===")
        for n in comp_names:
            print(f"  - {n[:80]}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
