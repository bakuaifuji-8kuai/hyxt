from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )
    ctx = browser.new_context(
        viewport={'width': 375, 'height': 812},
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
    )
    page = ctx.new_page()

    # Login
    page.goto('http://localhost:5174/login')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    page.locator('input[type="text"]').first.fill('haidilao')
    page.locator('input[type="password"]').first.fill('123456')
    page.locator('button:has-text("登")').click()
    page.wait_for_timeout(3000)

    # Dashboard
    page.goto('http://localhost:5174/dashboard')
    page.wait_for_load_state('networkidle')
    time.sleep(3)
    page.screenshot(path='/workspace/screenshots/final_m_dashboard.png', full_page=True)
    body = page.locator('body').inner_text()
    print("Dashboard body:", body[:300])
    print("Has 28:", '28' in body)
    print("Has 368:", '368' in body)

    # Records
    page.goto('http://localhost:5174/records')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/screenshots/final_m_records.png', full_page=True)

    # Verify
    page.goto('http://localhost:5174/coupon-verify')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/screenshots/final_m_verify.png', full_page=True)

    # Profile
    page.goto('http://localhost:5174/profile')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/screenshots/final_m_profile.png', full_page=True)

    ctx.close()
    browser.close()
    print("Done!")
