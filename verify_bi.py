#!/usr/bin/env python3
"""验证 BI 模块数据是否正确加载"""
import os
import asyncio

os.environ['PLAYWRIGHT_BROWSERS_PATH'] = '/root/.cache/ms-playwright'

from playwright.async_api import async_playwright


async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        page.on('pageerror', lambda err: print(f"  [pageerror] {err}"))

        # 登录
        await page.goto('http://localhost:8000/#/login', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(2000)
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
        await page.wait_for_timeout(3000)

        # 访问 BI 模块
        await page.goto('http://localhost:8000/#/m/analytics-bi', wait_until='networkidle', timeout=15000)
        await page.wait_for_timeout(3000)

        # 提取表格内容
        table_data = await page.evaluate("""
            () => {
                const rows = document.querySelectorAll('.ant-table-tbody tr');
                return Array.from(rows).map(row => {
                    const cells = row.querySelectorAll('td');
                    return Array.from(cells).map(cell => cell.innerText.trim());
                });
            }
        """)
        print("=== 表格数据 ===")
        for i, row in enumerate(table_data):
            print(f"  Row {i+1}: {row}")

        # 提取表头
        headers = await page.evaluate("""
            () => {
                const ths = document.querySelectorAll('.ant-table-thead th');
                return Array.from(ths).map(th => th.innerText.trim());
            }
        """)
        print(f"=== 表头 ===")
        print(f"  {headers}")

        await browser.close()


if __name__ == '__main__':
    asyncio.run(verify())
