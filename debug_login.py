#!/usr/bin/env python3
"""调试登录流程 - 查看按钮结构"""
import os
import asyncio

os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/root/.cache/ms-playwright'

from playwright.async_api import async_playwright


async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
        )
        page = await context.new_page()

        await page.goto('http://localhost:8000/#/login', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(2000)

        # 查看所有 button
        info = await page.evaluate("""
            () => {
                const buttons = document.querySelectorAll('button');
                return Array.from(buttons).map((el, i) => ({
                    index: i,
                    className: el.className,
                    text: el.textContent,
                    type: el.type,
                    visible: el.offsetParent !== null
                }));
            }
        """)
        print(f"找到 {len(info)} 个按钮:")
        for b in info:
            print(f"  {b}")

        # 通过 form 提交
        print("=== 尝试通过 form submit 提交 ===")
        result = await page.evaluate("""
            () => {
                // 找登录按钮
                const buttons = document.querySelectorAll('button');
                for (const btn of buttons) {
                    if (btn.textContent.includes('登') && btn.textContent.includes('录')) {
                        btn.click();
                        return {clicked: true, text: btn.textContent};
                    }
                }
                return {clicked: false};
            }
        """)
        print(f"点击结果: {result}")
        await page.wait_for_timeout(3000)

        info3 = await page.evaluate("""
            () => ({
                url: window.location.href,
                hash: window.location.hash,
                token: localStorage.getItem('token') ? 'exists' : 'none',
                bodyTextSnippet: document.body.innerText.substring(0, 200)
            })
        """)
        for k, v in info3.items():
            print(f"  {k}: {v}")

        await browser.close()


if __name__ == '__main__':
    asyncio.run(debug())
