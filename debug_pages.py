from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path='/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
        args=['--no-sandbox', '--disable-setuid-sandbox']
    )

    # C端小程序 - Check login + home
    ctx = browser.new_context(viewport={'width': 375, 'height': 812})
    page = ctx.new_page()
    page.goto('http://localhost:5173/login')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    print("=== C端 Login page ===")
    print("URL:", page.url)
    print("Title:", page.title())
    print("Inputs:", page.locator('input').count())
    print("Buttons:", page.locator('button').count())
    for i in range(page.locator('button').count()):
        print(f"  Button {i}: {page.locator('button').nth(i).inner_text()}")
    for i in range(page.locator('input').count()):
        ph = page.locator('input').nth(i).get_attribute('placeholder')
        tp = page.locator('input').nth(i).get_attribute('type')
        print(f"  Input {i}: type={tp} placeholder={ph}")

    # Try to login
    page.fill('input[type="tel"], input[placeholder*="手机"]', '13800138001')
    time.sleep(0.5)
    btns = page.locator('button')
    for i in range(btns.count()):
        txt = btns.nth(i).inner_text()
        if '验证码' in txt or '获取' in txt:
            btns.nth(i).click()
            break
    time.sleep(1)
    code_input = page.locator('input[placeholder*="验证码"], input[placeholder*="码"]')
    if code_input.count() > 0:
        code_input.first.fill('123456')
    for i in range(btns.count()):
        txt = btns.nth(i).inner_text()
        if '登' in txt:
            btns.nth(i).click()
            break
    time.sleep(3)
    print("\n=== After login ===")
    print("URL:", page.url)
    print("Body text (first 200 chars):", page.locator('body').inner_text()[:200])

    # Check home
    page.goto('http://localhost:5173/home')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    print("\n=== C端 Home ===")
    print("URL:", page.url)
    body = page.locator('body').inner_text()
    print("Body (first 500 chars):", body[:500])
    print("Has '金币':", '金币' in body)
    print("Has '积分':", '积分' in body)
    print("Has '珑珠':", '珑珠' in body)

    ctx.close()

    # 商户小程序
    ctx = browser.new_context(viewport={'width': 375, 'height': 812})
    page = ctx.new_page()
    page.goto('http://localhost:5174/login')
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    print("\n=== 商户 Login page ===")
    print("URL:", page.url)
    print("Inputs:", page.locator('input').count())
    for i in range(page.locator('input').count()):
        ph = page.locator('input').nth(i).get_attribute('placeholder')
        tp = page.locator('input').nth(i).get_attribute('type')
        print(f"  Input {i}: type={tp} placeholder={ph}")
    print("Buttons:", page.locator('button').count())
    for i in range(page.locator('button').count()):
        print(f"  Button {i}: {page.locator('button').nth(i).inner_text()}")

    # Try login
    u_input = page.locator('input[type="text"], input[placeholder*="账号"]')
    if u_input.count() > 0:
        u_input.first.fill('haidilao')
    p_input = page.locator('input[type="password"]')
    if p_input.count() > 0:
        p_input.first.fill('123456')
    btns = page.locator('button')
    for i in range(btns.count()):
        txt = btns.nth(i).inner_text()
        if '登' in txt:
            btns.nth(i).click()
            break
    time.sleep(3)
    print("\n=== After login ===")
    print("URL:", page.url)

    page.goto('http://localhost:5174/dashboard')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    print("\n=== 商户 Dashboard ===")
    print("URL:", page.url)
    body = page.locator('body').inner_text()
    print("Body (first 500 chars):", body[:500])
    print("Has '金币':", '金币' in body)
    print("Has '积分':", '积分' in body)

    ctx.close()
    browser.close()
