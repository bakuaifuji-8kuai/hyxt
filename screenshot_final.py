"""Screenshot verification for all three apps.

1. Admin (port 8000): login, navigate to C端-首页配置 (visualization drag-drop), dashboard
2. C-end miniapp (port 5173): login, home page
3. Merchant miniapp (port 5174): login, dashboard
"""
import asyncio
import os
from playwright.async_api import async_playwright

OUT_DIR = "/workspace/screenshots_final"
os.makedirs(OUT_DIR, exist_ok=True)

CHROMIUM = "/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome"

async def click_login_admin(page):
    """Admin login: fill form & click the antd primary button."""
    await page.fill('input[id="username"]', "admin")
    await page.fill('input[id="password"]', "admin")
    await page.wait_for_timeout(300)
    await page.click('button.ant-btn-primary')
    await page.wait_for_timeout(2500)


async def shot_admin(p):
    """Admin: login + C端首页配置 (visualization) + dashboard."""
    browser = await p.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
    ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN")
    page = await ctx.new_page()
    results = []

    try:
        # 1. Login page
        await page.goto("http://localhost:8000/login", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT_DIR}/01_admin_login.png", full_page=False)
        results.append("login page captured")

        # Fill & submit
        await click_login_admin(page)
        after_url = page.url
        results.append(f"after login url: {after_url}")

        # 2. Dashboard
        await page.goto("http://localhost:8000/#/dashboard", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT_DIR}/02_admin_dashboard.png", full_page=False)
        results.append("dashboard captured")

        # 3. C端-首页配置 (visualization drag-drop)
        await page.goto("http://localhost:8000/#/m/c-app-home", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/03_admin_capp_home_config.png", full_page=False)
        results.append(f"c-app-home captured, url: {page.url}")

        # Check content
        body = await page.evaluate("document.body.innerText")
        has_jinbi = "金币" in body
        has_component_lib = "组件库" in body or "组件" in body
        has_preview = "预览" in body
        has_service_nav = "服务导航" in body
        results.append(f"has '金币': {has_jinbi}, has 组件: {has_component_lib}, has 预览: {has_preview}, has 服务导航: {has_service_nav}")

        # 4. Try interacting: drag a component (just capture the panel state)
        await page.wait_for_timeout(500)
        await page.screenshot(path=f"{OUT_DIR}/04_admin_capp_home_config_full.png", full_page=True)
        results.append("full page config captured")

    except Exception as e:
        results.append(f"ERROR: {e}")
    finally:
        await browser.close()
    return results


async def shot_capp(p):
    """C-end miniapp: login + home."""
    browser = await p.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, locale="zh-CN", is_mobile=True)
    page = await ctx.new_page()
    results = []

    try:
        await page.goto("http://localhost:5173/login", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT_DIR}/05_capp_login.png")
        results.append("capp login captured")

        # Login: phone 13800138001, code 123456
        await page.fill('input[type="tel"], input[placeholder*="手机"], input[placeholder*="号"]', "13800138001")
        await page.fill('input[placeholder*="验证码"], input[type="text"]:nth-of-type(2)', "123456")
        await page.wait_for_timeout(300)
        # Click login button
        buttons = await page.query_selector_all('button')
        for b in buttons:
            txt = (await b.inner_text()) if await b.is_visible() else ""
            if "登录" in txt or "登 录" in txt:
                await b.click()
                break
        await page.wait_for_timeout(2500)
        results.append(f"after login url: {page.url}")

        # Home
        await page.goto("http://localhost:5173/home", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT_DIR}/06_capp_home.png", full_page=True)
        body = await page.evaluate("document.body.innerText")
        results.append(f"capp home has '金币': {'金币' in body}, has '积分': {'积分' in body}")

        # Points page
        await page.goto("http://localhost:5173/points", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/07_capp_points.png", full_page=True)

        # Mall page
        await page.goto("http://localhost:5173/mall", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/08_capp_mall.png", full_page=True)

        # Member page
        await page.goto("http://localhost:5173/member", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/09_capp_member.png", full_page=True)

    except Exception as e:
        results.append(f"ERROR: {e}")
    finally:
        await browser.close()
    return results


async def shot_bapp(p):
    """Merchant miniapp: login + dashboard."""
    browser = await p.chromium.launch(executable_path=CHROMIUM, headless=True, args=["--no-sandbox"])
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, locale="zh-CN", is_mobile=True)
    page = await ctx.new_page()
    results = []

    try:
        await page.goto("http://localhost:5174/login", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(800)
        await page.screenshot(path=f"{OUT_DIR}/10_bapp_login.png")
        results.append("bapp login captured")

        # Login: username haidilao, password 123456
        await page.fill('input[placeholder*="账号"], input[placeholder*="用户"], input[type="text"]', "haidilao")
        await page.fill('input[type="password"], input[placeholder*="密码"]', "123456")
        await page.wait_for_timeout(300)
        buttons = await page.query_selector_all('button')
        for b in buttons:
            txt = (await b.inner_text()) if await b.is_visible() else ""
            if "登录" in txt or "登 录" in txt:
                await b.click()
                break
        await page.wait_for_timeout(2500)
        results.append(f"after login url: {page.url}")

        # Dashboard
        await page.goto("http://localhost:5174/dashboard", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"{OUT_DIR}/11_bapp_dashboard.png", full_page=True)
        body = await page.evaluate("document.body.innerText")
        results.append(f"bapp dashboard has '金币': {'金币' in body}, has '核销': {'核销' in body}")

        # Records
        await page.goto("http://localhost:5174/records", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/12_bapp_records.png", full_page=True)

        # Coupon verify
        await page.goto("http://localhost:5174/coupon-verify", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/13_bapp_coupon_verify.png", full_page=True)

        # Parking issue
        await page.goto("http://localhost:5174/parking-issue", wait_until="networkidle", timeout=15000)
        await page.wait_for_timeout(1200)
        await page.screenshot(path=f"{OUT_DIR}/14_bapp_parking_issue.png", full_page=True)

    except Exception as e:
        results.append(f"ERROR: {e}")
    finally:
        await browser.close()
    return results


async def main():
    async with async_playwright() as p:
        print("=== Admin ===")
        for r in await shot_admin(p):
            print(f"  {r}")
        print("=== C-end miniapp ===")
        for r in await shot_capp(p):
            print(f"  {r}")
        print("=== Merchant miniapp ===")
        for r in await shot_bapp(p):
            print(f"  {r}")
        print(f"\nScreenshots saved to {OUT_DIR}/")


if __name__ == "__main__":
    asyncio.run(main())
