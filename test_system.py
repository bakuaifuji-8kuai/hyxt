"""
系统功能测试脚本 - 使用 Playwright 测试恒伟智慧商业会员营销平台
覆盖：登录、各模块新增/编辑/删除、数据流转、业务流程页面
"""
import json
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8000"
results = []  # (name, ok, detail)

def log(name, ok, detail=""):
    results.append((name, ok, detail))
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] {name}" + (f" - {detail}" if detail else ""))


def login(page):
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    # default values admin/admin are pre-filled; just click login
    page.get_by_role("button", name="登录").click()
    page.wait_for_url("**/dashboard", timeout=10000)
    page.wait_for_load_state("networkidle")
    log("登录", "dashboard" in page.url, page.url)


def goto_module(page, key):
    page.goto(f"{BASE}/m/{key}")
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("text=新增", timeout=10000)


def test_crud(page, module_key, form_values, expect_text):
    """Test full CRUD: list -> create -> verify -> edit -> verify -> delete -> verify gone."""
    goto_module(page, module_key)

    # ---- Create ----
    page.get_by_role("button", name="新增").click()
    page.wait_for_selector(".ant-modal-content", timeout=5000)
    # fill form
    for label, value in form_values.items():
        # antd form item label
        item = page.locator(f".ant-form-item-label:has-text('{label}')").locator("xpath=..")
        # detect control type
        if item.locator(".ant-select").count() > 0:
            item.locator(".ant-select-selector").click()
            page.get_by_title(str(value), exact=False).first.click(timeout=3000)
            page.wait_for_timeout(200)
        elif item.locator("textarea").count() > 0:
            item.locator("textarea").fill(str(value))
        else:
            item.locator("input").fill(str(value))
    page.get_by_role("button", name="确 定").click()
    # success message
    page.wait_for_selector("text=新增成功", timeout=5000)
    page.wait_for_timeout(500)

    # ---- Verify created (search by a keyword) ----
    # the new row should contain expect_text
    rows = page.locator("tr.ant-table-row")
    row_count = rows.count()
    found = False
    for i in range(row_count):
        if expect_text in rows.nth(i).inner_text():
            found = True
            break
    # if not found on page 1, search
    if not found:
        page.get_by_placeholder("搜索名称/编码").fill(expect_text)
        page.keyboard.press("Enter")
        page.wait_for_timeout(800)
        for i in range(rows.count()):
            if expect_text in rows.nth(i).inner_text():
                found = True
                break
        # clear search
        page.get_by_placeholder("搜索名称/编码").fill("")
        page.keyboard.press("Enter")
        page.wait_for_timeout(500)
    log(f"{module_key} 新增", found, f"找到文本 '{expect_text}'" if found else "未找到新增数据")
    return found


def test_edit_delete(page, module_key, search_text):
    """After create test: edit, then delete."""
    goto_module(page, module_key)
    # find the row with search_text
    rows = page.locator("tr.ant-table-row")
    target_idx = -1
    for i in range(rows.count()):
        if search_text in rows.nth(i).inner_text():
            target_idx = i
            break
    if target_idx < 0:
        # try search
        page.get_by_placeholder("搜索名称/编码").fill(search_text)
        page.keyboard.press("Enter")
        page.wait_for_timeout(800)
        for i in range(rows.count()):
            if search_text in rows.nth(i).inner_text():
                target_idx = i
                break

    if target_idx < 0:
        log(f"{module_key} 编辑/删除 找到行", False, f"未找到 '{search_text}'")
        return

    row = rows.nth(target_idx)

    # ---- Edit ----
    row.get_by_role("button", name="编辑").click()
    page.wait_for_selector(".ant-modal-content", timeout=5000)
    # modify first text input
    first_input = page.locator(".ant-modal-content input").first
    first_input.fill(search_text + "_改")
    page.get_by_role("button", name="确 定").click()
    page.wait_for_selector("text=编辑成功", timeout=5000)
    page.wait_for_timeout(500)
    # verify
    goto_module(page, module_key)
    rows = page.locator("tr.ant-table-row")
    edited = False
    for i in range(rows.count()):
        if (search_text + "_改") in rows.nth(i).inner_text():
            edited = True
            break
    log(f"{module_key} 编辑", edited)

    # ---- Delete ----
    # find row again (with edited name)
    target_idx = -1
    for i in range(rows.count()):
        if (search_text + "_改") in rows.nth(i).inner_text():
            target_idx = i
            break
    if target_idx < 0:
        log(f"{module_key} 删除", False, "删除前未找到行")
        return
    rows.nth(target_idx).get_by_role("button", name="删除").click()
    page.get_by_role("button", name="确 认").click()
    page.wait_for_selector("text=删除成功", timeout=5000)
    page.wait_for_timeout(500)
    # verify gone
    goto_module(page, module_key)
    rows = page.locator("tr.ant-table-row")
    gone = True
    for i in range(rows.count()):
        if (search_text + "_改") in rows.nth(i).inner_text():
            gone = False
            break
    log(f"{module_key} 删除", gone)


def test_dashboard(page):
    page.goto(f"{BASE}/dashboard")
    page.wait_for_load_state("networkidle")
    ok = page.locator("text=数据总览").count() > 0
    # check stats rendered (not '-')
    stats = page.locator(".ant-statistic-content-value").count()
    log("数据总览加载", ok and stats > 0, f"统计卡片数={stats}")


def test_business_flow(page):
    page.goto(f"{BASE}/business-flow")
    page.wait_for_load_state("networkidle")
    title_ok = page.locator("text=业务流程图").count() > 0
    svg_ok = page.locator("svg").count() > 0
    log("业务流程页加载", title_ok and svg_ok)

    # switch dropdown to each flow and verify SVG present
    flows = ["会员注册流程", "积分发放流程", "礼券发放流程", "商城订单流程", "停车积分流程"]
    for f in flows:
        page.locator(".ant-select-selector").first.click()
        page.get_by_title(f, exact=False).click()
        page.wait_for_timeout(300)
        svg_ok = page.locator("svg").count() > 0
        log(f"业务流程切换-{f}", svg_ok)


def test_feature_desc_modal(page):
    goto_module(page, "member-level")
    page.get_by_role("button", name="功能说明").click()
    page.wait_for_selector(".ant-modal-content", timeout=5000)
    ok = page.locator("text=模块概述").count() > 0
    # close
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)
    log("功能说明弹窗", ok)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        # capture console errors
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        try:
            login(page)
            test_dashboard(page)
            test_feature_desc_modal(page)

            # CRUD on representative modules across categories
            test_crud(page, "member-level", {"等级名称": "测试等级E2E", "等级编码": "E2E_TEST", "升级所需积分": "8888", "折扣率": "0.8"}, "测试等级E2E")
            test_edit_delete(page, "member-level", "测试等级E2E")

            test_crud(page, "points-rules", {"规则名称": "E2E积分规则", "积分值": "10", "条件说明": "测试场景"}, "E2E积分规则")
            test_edit_delete(page, "points-rules", "E2E积分规则")

            test_crud(page, "coupon-templates", {"券名称": "E2E满减券", "面值/折扣": "50", "使用门槛": "300", "发行总量": "500"}, "E2E满减券")
            test_edit_delete(page, "coupon-templates", "E2E满减券")

            test_crud(page, "marketing-campaigns", {"活动名称": "E2E大促", "预算": "50000"}, "E2E大促")
            test_edit_delete(page, "marketing-campaigns", "E2E大促")

            test_crud(page, "shop-goods", {"商品名称": "E2E测试商品", "价格": "199", "库存": "100"}, "E2E测试商品")
            test_edit_delete(page, "shop-goods", "E2E测试商品")

            test_crud(page, "wallet-accounts", {"会员": "E2E钱包测试", "余额": "1000", "积分": "500"}, "E2E钱包测试")
            test_edit_delete(page, "wallet-accounts", "E2E钱包测试")

            test_crud(page, "merchant-list", {"商户名称": "E2E商户", "联系人": "测试人"}, "E2E商户")
            test_edit_delete(page, "merchant-list", "E2E商户")

            test_crud(page, "config-shops", {"门店名称": "E2E门店", "地址": "测试地址", "电话": "13800000000"}, "E2E门店")
            test_edit_delete(page, "config-shops", "E2E门店")

            test_crud(page, "system-users", {"姓名": "E2E用户", "用户名": "e2e_user"}, "E2E用户")
            test_edit_delete(page, "system-users", "E2E用户")

            # business flow page
            test_business_flow(page)

            # capture a screenshot
            page.goto(f"{BASE}/business-flow")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="/tmp/business-flow.png", full_page=True)

            log("浏览器JS错误", len(errors) == 0, "; ".join(errors[:3]) if errors else "")

        except Exception as e:
            log("执行异常", False, str(e))
            page.screenshot(path="/tmp/error.png", full_page=True)
        finally:
            browser.close()

    # Summary
    total = len(results)
    passed = sum(1 for _, ok, _ in results if ok)
    failed = total - passed
    print("\n" + "=" * 60)
    print(f"测试结果汇总: {passed}/{total} 通过, {failed} 失败")
    print("=" * 60)
    for name, ok, detail in results:
        if not ok:
            print(f"  ✗ {name}: {detail}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
