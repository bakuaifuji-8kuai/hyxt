#!/usr/bin/env python3
"""
上下游联动测试数据生成
串联一条完整业务主线:
  会员张三(金卡) → 钱包充值(财务收入) → 消费送积分 → 领取满减券(营销活动)
  → 商城下单付款(销量+1,积分+1) → 到店核销券(核销记录) → 停车送积分 → 申请开票
另起一条副线: 业主王先生(地产积分) → 租借雨伞(物品租借记录)
"""
import json, urllib.request, urllib.error

BASE = "http://localhost:8080/v1"
created = []

def req(method, path, token, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    r.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(r, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

def get_token():
    res = req("POST", "/auth/login", None, {"username": "admin", "password": "admin"})
    return res["data"]["token"]

def create(token, path, body, label):
    res = req("POST", f"/{path}", token, body)
    data = res.get("data", res)
    rid = data.get("id") if isinstance(data, dict) else None
    created.append((label, path, rid))
    print(f"[+] {label} -> {path}#{rid}: {res.get('message')}")
    return rid

def main():
    token = get_token()
    print("=== 生成上下游联动测试数据 ===\n")

    # ---------- 主线: 会员张三全链路 ----------
    # 1. 会员档案 (确保存在)
    zhang_id = create(token, "member/list", {
        "name": "张三", "phone": "13800138001", "level": "GOLD",
        "points": 6200, "status": "enabled"
    }, "会员-张三(金卡)")

    # 2. 钱包账户
    wallet_id = create(token, "wallet/accounts", {
        "member": "张三", "balance": 1500.00, "points": 6200, "status": "enabled"
    }, "钱包账户-张三")

    # 3. 钱包充值流水 (联动: 财务凭证收入)
    tx1 = create(token, "wallet/transactions", {
        "member": "张三", "type": "recharge", "amount": 1500, "balance": 1500,
        "remark": "金卡会员充值", "time": "2024-06-01 10:00"
    }, "钱包流水-充值")

    # 4. 财务凭证-收入 (联动钱包充值)
    create(token, "finance/vouchers", {
        "voucherNo": "FV20240601001", "subject": "会员充值",
        "income": 1500, "expense": 0, "summary": "张三充值1500元", "time": "2024-06-01 10:00"
    }, "财务凭证-充值收入")

    # 5. 积分规则
    rule_id = create(token, "points/rules", {
        "name": "金卡消费双倍积分", "type": "consume", "points": 2,
        "condition": "金卡会员每消费1元送2积分", "status": "enabled"
    }, "积分规则-金卡双倍")

    # 6. 积分流水-消费送积分 (联动会员积分余额)
    create(token, "points/logs", {
        "member": "张三", "type": "consume", "points": 200, "balance": 6400,
        "remark": "消费100元×金卡双倍"
    }, "积分流水-消费送分")

    # 7. 礼券模板
    coupon_tpl_id = create(token, "coupon/templates", {
        "name": "金卡专享满200减30", "type": "fullcut", "value": 30, "minSpend": 200,
        "quantity": 1000, "claimed": 0, "status": "enabled"
    }, "礼券模板-满200减30")

    # 8. 营销活动
    camp_id = create(token, "marketing/campaigns", {
        "name": "金卡会员专享月", "type": "promotion",
        "startTime": "2024-06-01", "endTime": "2024-06-30",
        "status": "enabled", "budget": 50000
    }, "营销活动-金卡专享月")

    # 9. 活动发券 (联动活动+券模板)
    create(token, "marketing/coupons", {
        "name": "金卡专享发券", "campaign": "金卡会员专享月",
        "template": "金卡专享满200减30", "count": 500, "claimed": 1
    }, "活动发券-金卡专享")

    # 10. 商城商品
    goods_id = create(token, "shop/goods", {
        "name": "恒伟定制保温杯", "category": "家居", "price": 199,
        "stock": 200, "sales": 1, "status": "enabled"
    }, "商城商品-保温杯")

    # 11. 商城订单 (联动: 商品销量+1, 钱包消费, 积分发放)
    order_id = create(token, "shop/orders", {
        "orderNo": "HW20240601001", "member": "张三", "goods": "恒伟定制保温杯",
        "amount": 199, "status": "done", "time": "2024-06-01 11:00"
    }, "商城订单-张三购买")

    # 12. 钱包消费流水 (联动订单)
    create(token, "wallet/transactions", {
        "member": "张三", "type": "consume", "amount": -199, "balance": 1301,
        "remark": "购买保温券", "time": "2024-06-01 11:00"
    }, "钱包流水-订单消费")

    # 13. 核销记录 (联动: 会员到店核销券)
    create(token, "verification/records", {
        "code": "HX-ZS-0001", "member": "张三", "target": "金卡专享满200减30",
        "shop": "总店", "status": "verified", "time": "2024-06-01 12:00"
    }, "核销记录-张三核销券")

    # 14. 停车记录送积分 (联动: 会员停车权益)
    create(token, "parking/records", {
        "plate": "京A88888", "member": "张三", "inTime": "2024-06-01 10:00",
        "outTime": "2024-06-01 13:00", "duration": 180, "fee": 0, "points": 30
    }, "停车记录-张三(金卡免费2h+送积分)")

    # 15. 服务订单 (联动会员)
    create(token, "service/orders", {
        "orderNo": "SVC20240601001", "member": "张三", "service": "皮具保养",
        "amount": 80, "status": "finished", "time": "2024-06-01 14:00"
    }, "服务订单-皮具保养")

    # 16. 开票记录 (联动: 会员消费后开票)
    create(token, "invoice/records", {
        "title": "张三个人", "member": "张三", "amount": 279,
        "type": "electronic", "status": "issued"
    }, "开票记录-张三电子发票")

    # 17. 财务凭证-支出 (联动: 积分兑换成本)
    create(token, "finance/vouchers", {
        "voucherNo": "FV20240601002", "subject": "积分兑换成本",
        "income": 0, "expense": 50, "summary": "张三兑换星巴克券成本", "time": "2024-06-01 15:00"
    }, "财务凭证-兑换支出")

    # 18. 推送任务 (联动: 给张三发消息)
    create(token, "message/campaigns", {
        "name": "金卡会员关怀推送", "template": "生日祝福", "channel": "wechat",
        "audience": 200, "sent": 200, "read": 156, "status": "finished"
    }, "推送任务-金卡关怀")

    # ---------- 副线: 业主地产积分 + 物品租借 ----------
    create(token, "property/points", {
        "owner": "王先生", "property": "恒伟大厦A栋1001",
        "points": 80000, "status": "enabled"
    }, "地产积分-业主王先生")

    rental_item_id = create(token, "rental/items", {
        "name": "恒伟定制雨伞", "deposit": 30, "rent": 0, "stock": 49, "status": "enabled"
    }, "租借物品-定制雨伞")

    create(token, "rental/records", {
        "item": "恒伟定制雨伞", "member": "王先生",
        "outTime": "2024-06-01 16:00", "returnTime": "2024-06-01 18:00",
        "status": "returned"
    }, "租借记录-王先生借伞")

    # ---------- 公域引流副线 ----------
    create(token, "public-domain/ads", {
        "name": "618抖音引流", "channel": "douyin", "budget": 30000,
        "leads": 2500, "status": "enabled"
    }, "公域投放-抖音引流")

    # ---------- 内容素材 ----------
    create(token, "content/banners", {
        "title": "金卡会员专享月活动banner", "position": "home_top",
        "sort": 1, "status": "enabled"
    }, "Banner-金卡专享月")

    # ---------- 汇总 ----------
    ds = req("GET", "/dashboard/summary", token)["data"]
    print(f"\n=== 联动数据生成完成 ===")
    print(f"创建数据条数: {len(created)}")
    print(f"Dashboard汇总: 会员={ds['memberCount']}, 订单={ds['orderCount']}, 营收={ds['todayRevenue']}, 活动={ds['activeCampaigns']}")

    # 验证联动关系
    print(f"\n=== 联动关系验证 ===")
    # 张三的钱包账户
    wal = req("GET", f"/wallet/accounts?page=1&pageSize=50&member={urllib.parse.quote('张三')}", token)
    wl = wal.get("data", {}).get("list", [])
    print(f"张三钱包账户: {len(wl)} 条 (联动:会员→钱包)")
    # 张三的积分流水
    pl = req("GET", f"/points/logs?page=1&pageSize=50&member={urllib.parse.quote('张三')}", token)
    pll = pl.get("data", {}).get("list", [])
    print(f"张三积分流水: {len(pll)} 条 (联动:会员→积分)")
    # 张三的订单
    ol = req("GET", f"/shop/orders?page=1&pageSize=50&member={urllib.parse.quote('张三')}", token)
    oll = ol.get("data", {}).get("list", [])
    print(f"张三商城订单: {len(oll)} 条 (联动:会员→商城)")
    # 张三的核销
    vl = req("GET", f"/verification/records?page=1&pageSize=50&member={urllib.parse.quote('张三')}", token)
    vll = vl.get("data", {}).get("list", [])
    print(f"张三核销记录: {len(vll)} 条 (联动:会员→核销)")
    # 张三的开票
    il = req("GET", f"/invoice/records?page=1&pageSize=50&member={urllib.parse.quote('张三')}", token)
    ill = il.get("data", {}).get("list", [])
    print(f"张三开票记录: {len(ill)} 条 (联动:会员→开票)")
    # 财务凭证
    fl = req("GET", "/finance/vouchers?page=1&pageSize=50", token)
    fll = fl.get("data", {}).get("list", [])
    print(f"财务凭证: {len(fll)} 条 (联动:充值收入+兑换支出)")

    print(f"\n所有联动数据已就绪,可在各模块页面查看。")

if __name__ == "__main__":
    import urllib.parse
    main()
