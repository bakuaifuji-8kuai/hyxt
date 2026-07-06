import { useState } from 'react';
import { Button, Modal, Tag, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ModuleConfig } from '../services/modules';

const { Paragraph, Title } = Typography;

export default function FeatureDescription({ module }: { module: ModuleConfig }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<QuestionCircleOutlined />} onClick={() => setOpen(true)}>功能说明</Button>
      <Modal
        title={`${module.name} - 功能说明`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={640}
      >
        <Typography>
          <Title level={5}>模块概述</Title>
          <Paragraph>{module.doc.overview}</Paragraph>
          <Title level={5}>功能详情</Title>
          <ul style={{ paddingLeft: 20 }}>
            {module.doc.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          {module.doc.tips && module.doc.tips.length > 0 && (
            <>
              <Title level={5}>使用提示</Title>
              <div>
                {module.doc.tips.map((t, i) => (
                  <Tag key={i} color="blue" style={{ marginBottom: 6 }}>{t}</Tag>
                ))}
              </div>
            </>
          )}
        </Typography>
      </Modal>
    </>
  );
}
