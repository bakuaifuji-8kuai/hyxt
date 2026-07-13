#!/usr/bin/env python3
"""使用 Playwright 打开浏览器访问 http://localhost:8000 并截图"""
import os
import asyncio
from pathlib import Path

# 设置 Playwright 浏览器路径
os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/root/.cache/ms-playwright'

from playwright.async_api import async_playwright

OUTPUT_DIR = Path('/workspace/screenshots')
OUTPUT_DIR.mkdir(exist_ok=True)


async def capture_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            locale='zh-CN',
        )
        page = await context.new_page()

        # 收集控制台错误
        console_errors = []
        page.on('console', lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on('pageerror', lambda err: console_errors.append(f"[pageerror] {err}"))

        # Step 1: 打开登录页
        print("=== 1. 打开登录页 ===")
        await page.goto('http://localhost:8000/#/login', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=str(OUTPUT_DIR / '01_login.png'), full_page=True)
        print(f"  登录页截图: 01_login.png")
        print(f"  标题: {await page.title()}")

        # Step 2: 点击登录按钮（点击后通过 evaluate 调用 btn.click()）
        print("=== 2. 点击登录按钮 ===")
        await page.evaluate("""
            () => {
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.includes('登') && btn.textContent.includes('录')) {
                        btn.click();
                        return;
                    }
                }
            }
        """)
        print("  已点击登录")
        # 等待导航/重定向完成
        await page.wait_for_timeout(4000)
        current_url = page.url
        print(f"  登录后URL: {current_url}")
        await page.screenshot(path=str(OUTPUT_DIR / '02_dashboard.png'), full_page=True)
        print(f"  首页截图: 02_dashboard.png")

        # Step 3: 强制跳转到 dashboard
        print("=== 3. 跳转 dashboard ===")
        await page.goto('http://localhost:8000/#/dashboard', wait_until='networkidle', timeout=15000)
        await page.wait_for_timeout(3000)
        await page.screenshot(path=str(OUTPUT_DIR / '02_dashboard.png'), full_page=True)
        print(f"  dashboard 截图: 02_dashboard.png")
        print(f"  当前URL: {page.url}")

        # 截图各个新增的模块页面
        modules_to_capture = [
            ('coupon-code-pool', '03_coupon_code_pool', '券码池管理'),
            ('channel-order-sync', '04_channel_order_sync', '订单同步记录'),
            ('member-oneid', '05_member_oneid', 'OneID会员映射'),
            ('member-join-scenes', '06_member_join_scenes', '入会场景配置'),
            ('verification-terminals', '07_verification_terminals', '核销终端管理'),
            ('route-short-url', '08_route_short_url', '自研路由短链'),
            ('analytics-bi', '09_analytics_bi', 'BI报表分析'),
            ('channel-configs', '10_channel_configs', '渠道配置(已增强小红书)'),
            ('merchant-authorizations', '11_merchant_auth', '商户线上授权'),
            ('channel-templates', '12_channel_templates', '券模板管理'),
        ]

        for module_key, filename, desc in modules_to_capture:
            url = f'http://localhost:8000/#/m/{module_key}'
            print(f"=== {desc} ({url}) ===")
            try:
                await page.goto(url, wait_until='networkidle', timeout=15000)
                await page.wait_for_timeout(2500)
                await page.screenshot(path=str(OUTPUT_DIR / f'{filename}.png'), full_page=True)
                page_text = await page.inner_text('body', timeout=3000)
                if '用户账号' in page_text and '数据总览' not in page_text:
                    print(f"  ⚠️ 仍显示登录页")
                else:
                    size = (OUTPUT_DIR / f'{filename}.png').stat().st_size // 1024
                    print(f"  ✓ 截图: {filename}.png ({size}KB)")
            except Exception as e:
                print(f"  访问失败: {e}")

        # 输出控制台错误
        if console_errors:
            print("\n=== 控制台错误（前10条）===")
            for err in console_errors[:10]:
                print(f"  {err}")
        else:
            print("\n无控制台错误")

        await browser.close()
        print(f"\n=== 全部截图已保存到 {OUTPUT_DIR} ===")


if __name__ == '__main__':
    asyncio.run(capture_screenshots())
