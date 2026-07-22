from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = ctx.new_page()
    page.goto('http://localhost:8000/login')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    page.locator('input').first.fill('admin')
    page.locator('input').nth(1).fill('admin')
    page.locator('button:has-text("登")').click()
    page.wait_for_timeout(3000)
    page.goto('http://localhost:8000/m/c-app-home')
    page.wait_for_load_state('networkidle')
    time.sleep(3)
    page.screenshot(path='/workspace/screenshots/final_admin_home_config.png', full_page=True)
    body = page.locator('body').inner_text()
    print("Admin body (first 500):", body[:500])
    print("Has '金币':", '金币' in body)
    print("Has '积分':", '积分' in body)
    print("Has '珑珠':", '珑珠' in body)
    print("Has '组件库':", '组件库' in body)
    print("Has '拖拽':", '拖拽' in body or '页面预览' in body)
    browser.close()
