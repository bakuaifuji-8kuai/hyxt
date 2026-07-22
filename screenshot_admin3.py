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

    # Goto login page - form has initialValues admin/admin
    page.goto('http://localhost:8000/login')
    page.wait_for_load_state('networkidle')
    time.sleep(2)

    # Just click the login button (form already has admin/admin)
    page.locator('button:has-text("登")').click()
    page.wait_for_timeout(5000)
    print("After login URL:", page.url)

    # Navigate to ShopHomeConfig
    page.goto('http://localhost:8000/m/c-app-home')
    page.wait_for_load_state('networkidle')
    time.sleep(3)
    print("Config page URL:", page.url)

    page.screenshot(path='/workspace/screenshots/final_admin_home_config.png', full_page=True)
    body = page.locator('body').inner_text()
    print("Body (first 500):", body[:500])
    print("Has '金币':", '金币' in body)
    print("Has '组件库':", '组件库' in body)
    print("Has '页面预览':", '页面预览' in body)
    print("Has '服务导航':", '服务导航' in body)

    browser.close()
