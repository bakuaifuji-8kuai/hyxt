import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message } from 'antd';
import { fetchDashboardSummary } from '../services/request';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetchDashboardSummary().then((res: any) => setStats(res || {})).catch((e) => message.error(e.message));
  }, []);

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card title="数据总览">
        <Row gutter={[16, 16]}>
          <Col span={6}><Card><Statistic title="会员总数" value={stats.memberCount ?? '-'} /></Card></Col>
          <Col span={6}><Card><Statistic title="累计发放积分" value={stats.pointsIssued ?? '-'} /></Card></Col>
          <Col span={6}><Card><Statistic title="券已领取数" value={stats.couponClaimed ?? '-'} /></Card></Col>
          <Col span={6}><Card><Statistic title="商城订单数" value={stats.orderCount ?? '-'} /></Card></Col>
          <Col span={6}><Card><Statistic title="今日营收(元)" value={stats.todayRevenue ?? '-'} precision={2} /></Card></Col>
          <Col span={6}><Card><Statistic title="进行中活动" value={stats.activeCampaigns ?? '-'} /></Card></Col>
        </Row>
      </Card>
    </div>
  );
}
