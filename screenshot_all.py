from playwright.sync_api import sync_playwright
import time, json, os

os.makedirs('/workspace/screenshots', exist_ok=True)

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path='/root/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
            args=['--no-sandbox', '--disable-setuid-sandbox']
        )

        # ===== 1. 后台管理 - C端首页配置 =====
        print("1. Admin - ShopHomeConfig...")
        ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = ctx.new_page()
        page.goto('http://localhost:8000/login')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        # Login
        page.locator('input').first.fill('admin')
        page.locator('input').nth(1).fill('admin')
        page.locator('button:has-text("登")').click()
        page.wait_for_timeout(3000)
        page.goto('http://localhost:8000/m/c-app-home')
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        page.screenshot(path='/workspace/screenshots/final_admin_home_config.png', full_page=True)
        print("   Saved admin_home_config")
        ctx.close()

        # ===== 2. C端小程序 =====
        print("2. C端小程序...")
        ctx = browser.new_context(
            viewport={'width': 375, 'height': 812},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page = ctx.new_page()

        # Login
        page.goto('http://localhost:5173/login')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.fill('input[type="tel"], input[placeholder*="手机"], input[name="phone"]', '13800138001')
        time.sleep(0.5)
        # Click verify code button
        btns = page.locator('button')
        for i in range(btns.count()):
            txt = btns.nth(i).inner_text()
            if '验证码' in txt or '获取' in txt:
                btns.nth(i).click()
                break
        time.sleep(0.5)
        # Fill code
        code_input = page.locator('input[placeholder*="验证码"], input[placeholder*="码"], input[type="password"]')
        if code_input.count() > 0:
            code_input.first.fill('123456')
        # Click login
        for i in range(btns.count()):
            txt = btns.nth(i).inner_text()
            if '登' in txt or '登录' in txt:
                btns.nth(i).click()
                break
        page.wait_for_timeout(3000)
        page.screenshot(path='/workspace/screenshots/final_c_login.png', full_page=True)

        # Home
        page.goto('http://localhost:5173/home')
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        page.screenshot(path='/workspace/screenshots/final_c_home.png', full_page=True)
        print("   Saved c_home")

        # Points
        page.goto('http://localhost:5173/points')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_c_points.png', full_page=True)
        print("   Saved c_points")

        # Coupons
        page.goto('http://localhost:5173/coupons')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_c_coupons.png', full_page=True)
        print("   Saved c_coupons")

        # Mall
        page.goto('http://localhost:5173/mall')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_c_mall.png', full_page=True)
        print("   Saved c_mall")

        # Member
        page.goto('http://localhost:5173/member')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_c_member.png', full_page=True)
        print("   Saved c_member")

        ctx.close()

        # ===== 3. 商户小程序 =====
        print("3. 商户小程序...")
        ctx = browser.new_context(
            viewport={'width': 375, 'height': 812},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page = ctx.new_page()

        # Login
        page.goto('http://localhost:5174/login')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        # Fill username
        u_input = page.locator('input[type="text"], input[placeholder*="账号"], input[placeholder*="用户"]')
        if u_input.count() > 0:
            u_input.first.fill('haidilao')
        # Fill password
        p_input = page.locator('input[type="password"]')
        if p_input.count() > 0:
            p_input.first.fill('123456')
        # Click login
        btns = page.locator('button')
        for i in range(btns.count()):
            txt = btns.nth(i).inner_text()
            if '登' in txt:
                btns.nth(i).click()
                break
        page.wait_for_timeout(3000)
        page.screenshot(path='/workspace/screenshots/final_m_login.png', full_page=True)

        # Dashboard
        page.goto('http://localhost:5174/dashboard')
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        page.screenshot(path='/workspace/screenshots/final_m_dashboard.png', full_page=True)
        print("   Saved m_dashboard")

        # Records
        page.goto('http://localhost:5174/records')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_m_records.png', full_page=True)
        print("   Saved m_records")

        # Coupon Verify
        page.goto('http://localhost:5174/coupon-verify')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_m_verify.png', full_page=True)
        print("   Saved m_verify")

        # Profile
        page.goto('http://localhost:5174/profile')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='/workspace/screenshots/final_m_profile.png', full_page=True)
        print("   Saved m_profile")

        ctx.close()
        browser.close()
        print("All screenshots saved!")

take_screenshots()
