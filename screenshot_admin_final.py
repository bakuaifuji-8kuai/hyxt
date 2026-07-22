"""Quick test: admin login + C端首页配置."""
import asyncio
import os
from playwright.async_api import async_playwright

OUT_DIR = "/workspace/screenshots_final"
os.makedirs(OUT_DIR, exist_ok=True)
CHROMIUM = "/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN")
        page = await ctx.new_page()

        # Capture console errors
        page.on("console", lambda msg: print(f"  [console.{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: print(f"  [pageerror] {err}"))

        print("1. Loading login page...")
        await page.goto("http://localhost:8000/login", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1000)
        await page.screenshot(path=f"{OUT_DIR}/01_admin_login.png")

        print("2. Filling form & clicking login...")
        await page.fill('input[id="username"]', "admin")
        await page.fill('input[id="password"]', "admin")
        await page.wait_for_timeout(300)
        await page.click('button.ant-btn-primary')
        await page.wait_for_timeout(3000)
        print(f"   After login URL: {page.url}")

        # Check localStorage
        token_hengwei = await page.evaluate("localStorage.getItem('hengwei-token')")
        token_plain = await page.evaluate("localStorage.getItem('token')")
        print(f"   localStorage 'hengwei-token': {token_hengwei}")
        print(f"   localStorage 'token': {token_plain}")

        print("3. Navigating to dashboard...")
        await page.goto("http://localhost:8000/#/dashboard", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/02_admin_dashboard.png")
        print(f"   Dashboard URL: {page.url}")

        print("4. Navigating to C端-首页配置...")
        await page.goto("http://localhost:8000/#/m/c-app-home", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2500)
        await page.screenshot(path=f"{OUT_DIR}/03_admin_capp_home_config.png")
        print(f"   Config URL: {page.url}")

        body = await page.evaluate("document.body.innerText")
        print(f"   has '金币': {'金币' in body}")
        print(f"   has '组件': {'组件' in body}")
        print(f"   has '预览': {'预览' in body}")
        print(f"   has '服务导航': {'服务导航' in body}")
        print(f"   has '拖拽': {'拖拽' in body}")

        # Full page screenshot
        await page.screenshot(path=f"{OUT_DIR}/04_admin_capp_home_full.png", full_page=True)

        await browser.close()
        print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
