from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1200, 'height': 900})
    page = context.new_page()

    errors = []
    page.on('console', lambda msg: errors.append(f'[{msg.type}] {msg.text}') if msg.type in ['error', 'warning'] else None)
    page.on('pageerror', lambda err: errors.append(f'[pageerror] {err}'))

    print('=== 1. 访问 mobile 首页 ===')
    page.goto('http://localhost:8001/', wait_until='networkidle', timeout=15000)
    time.sleep(1)
    page.screenshot(path='/workspace/test_shots/01_login.png', full_page=True)
    print('URL:', page.url)

    print('\n=== 2. demo 登录 ===')
    page.evaluate('''async () => {
        const r = await fetch('/v1/c/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({phone: '13800000001', code: '1234'})
        });
        const d = await r.json();
        if (d.code === 200) {
            localStorage.setItem('capp_token', d.data.token);
            localStorage.setItem('capp_member', JSON.stringify(d.data.member));
        }
        return d.code;
    }''')
    page.goto('http://localhost:8001/home', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/02_home.png', full_page=True)
    print('Home URL:', page.url)

    for tab in ['商城', '活动', '积分', '我的']:
        print(f'\n=== Tab: {tab} ===')
        page.locator(f'text={tab}').first.click()
        time.sleep(2)
        page.screenshot(path=f'/workspace/test_shots/tab_{tab}.png', full_page=True)
        print(f'{tab} URL:', page.url)

    print('\n=== 详情: 停车 ===')
    page.goto('http://localhost:8001/parking', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/parking.png', full_page=True)

    print('\n=== 详情: 领券中心 ===')
    page.goto('http://localhost:8001/coupon', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/coupon.png', full_page=True)

    print('\n=== 详情: 会员卡 ===')
    page.goto('http://localhost:8001/member/card', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/membercard.png', full_page=True)

    print('\n=== 详情: 商品详情 ===')
    page.goto('http://localhost:8001/mall/goods/1', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/goods.png', full_page=True)

    print('\n=== 详情: 签到 ===')
    page.goto('http://localhost:8001/checkin', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/checkin.png', full_page=True)

    print('\n=== 详情: 客服 ===')
    page.goto('http://localhost:8001/service', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/service.png', full_page=True)

    print('\n=== 详情: 商户列表 ===')
    page.goto('http://localhost:8001/merchants', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/merchants.png', full_page=True)

    print('\n=== 详情: 拍照积分 ===')
    page.goto('http://localhost:8001/photo-points', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/photo_points.png', full_page=True)

    print('\n=== 详情: 业主服务 ===')
    page.goto('http://localhost:8001/property', wait_until='networkidle')
    time.sleep(2)
    page.screenshot(path='/workspace/test_shots/property.png', full_page=True)

    print('\n=== Console 错误（最多 30 条）===')
    for e in errors[:30]:
        print(e)
    print(f'\n总错误/警告数: {len(errors)}')

    browser.close()
    print('\n=== 测试完成 ===')
