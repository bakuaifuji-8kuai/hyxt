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

    # Login first
    page.goto('http://localhost:8000/login')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    print("Login page URL:", page.url)

    # Find and fill inputs
    inputs = page.locator('input')
    print(f"Found {inputs.count()} inputs")
    for i in range(inputs.count()):
        inp = inputs.nth(i)
        tp = inp.get_attribute('type') or 'text'
        ph = inp.get_attribute('placeholder') or ''
        print(f"  Input {i}: type={tp} placeholder={ph}")

    # Fill username and password
    inputs.nth(0).fill('admin')
    inputs.nth(1).fill('admin')

    # Find login button
    buttons = page.locator('button')
    print(f"Found {buttons.count()} buttons")
    for i in range(buttons.count()):
        print(f"  Button {i}: '{buttons.nth(i).inner_text()}'")

    # Click the login button
    page.locator('button[type="submit"], button:has-text("登录"), button:has-text("登 录")').first.click()

    # Wait for navigation
    page.wait_for_timeout(5000)
    print("After login URL:", page.url)

    # If still on login, try direct API login
    if '/login' in page.url:
        print("Login failed, trying API approach...")
        # Get token via API
        import json
        response = page.evaluate('''async () => {
            const res = await fetch('/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'admin' })
            });
            return await res.json();
        }''')
        print("API response:", json.dumps(response, indent=2, ensure_ascii=False)[:200])
        if response.get('data', {}).get('token'):
            token = response['data']['token']
            page.evaluate(f'localStorage.setItem("hengwei-token", "{token}")')
            page.evaluate(f'localStorage.setItem("hengwei-user", JSON.stringify({{name:"admin",role:"admin"}}))')
            page.goto('http://localhost:8000/m/c-app-home')
            page.wait_for_load_state('networkidle')
            time.sleep(3)

    print("Current URL:", page.url)
    page.screenshot(path='/workspace/screenshots/final_admin_home_config.png', full_page=True)
    body = page.locator('body').inner_text()
    print("Body (first 500):", body[:500])
    print("Has '金币':", '金币' in body)
    print("Has '组件库':", '组件库' in body)
    print("Has '页面预览':", '页面预览' in body)

    browser.close()
