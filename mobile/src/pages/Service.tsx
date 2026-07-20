import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'antd-mobile';
import { Page, NavBar, Loading } from '../components/common';
import { csApi } from '../services/api';

interface Message {
  role: 'ai' | 'user';
  content: string;
  suggestTransfer?: boolean;
  quickReplies?: string[];
  showHot?: boolean;
}

const DEFAULT_QUICK = ['如何获得积分', '停车券怎么用', '如何退款', '营业时间', '会员权益'];

export default function ServicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 拉取热门问题
  useEffect(() => {
    csApi
      .knowledge('')
      .then((d: any) => setKnowledge(Array.isArray(d) ? d : []))
      .catch(() => setKnowledge([]))
      .finally(() => setKnowledgeLoading(false));
  }, []);

  // 初始化欢迎语
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: '您好，我是 AI 智能客服 🤖，7x24 小时为您服务。请问有什么可以帮您？',
        quickReplies: DEFAULT_QUICK,
        showHot: true,
      },
    ]);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const hotQuestions =
    knowledge.length > 0
      ? knowledge.map((k) => k.question).filter(Boolean).slice(0, 5)
      : DEFAULT_QUICK;

  const sendQuestion = async (question: string) => {
    const q = question.trim();
    if (!q || sending) return;
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setSending(true);
    try {
      const res: any = await csApi.chat(q);
      const matched = res?.matched !== false;
      const answer = res?.answer || '抱歉，未找到相关问题答案，是否需要转人工服务？';
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: matched ? answer : '抱歉，未找到相关问题答案，是否需要转人工服务？',
          suggestTransfer: res?.suggestTransfer || !matched,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '抱歉，未找到相关问题答案，是否需要转人工服务？',
          suggestTransfer: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleTransfer = async () => {
    try {
      await csApi.transfer();
      Toast.show({ icon: 'success', content: '已转接人工客服，请稍候' });
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '正在为您转接人工客服，请稍候…' },
      ]);
    } catch {
      // 错误提示由 request 拦截器统一处理
    }
  };

  return (
    <Page>
      <NavBar
        title="在线客服"
        right={
          <span
            style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: 13 }}
            onClick={handleTransfer}
          >
            转人工
          </span>
        }
      />

      {/* 主体区域：绝对定位填满 navbar 以下空间，内部 flex 布局 */}
      <div
        style={{
          position: 'absolute',
          top: 44,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 客服头像区 */}
        <div
          style={{
            background: '#fff',
            padding: '14px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '0.5px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e63946, #c81d2a)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI 智能客服</div>
            <div className="text-sm text-muted flex-center gap-4">
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#2e8b57',
                }}
              />
              7x24 在线
            </div>
          </div>
        </div>

        {/* 聊天区域 - 内部滚动 */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 12,
            background: 'var(--bg)',
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}
            >
              <div style={{ maxWidth: '80%' }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontSize: 14,
                    lineHeight: 1.5,
                    background: m.role === 'user' ? 'var(--primary)' : '#fff',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    borderBottomRightRadius: m.role === 'user' ? 2 : 12,
                    borderBottomLeftRadius: m.role === 'user' ? 12 : 2,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  {m.content}
                </div>

                {/* 常见问题快捷入口 */}
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    {m.quickReplies.map((q) => (
                      <span
                        key={q}
                        className="tag"
                        style={{ cursor: 'pointer', padding: '6px 10px', fontSize: 12 }}
                        onClick={() => sendQuestion(q)}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                )}

                {/* 热门问题列表 */}
                {m.role === 'ai' && m.showHot && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      background: '#fff',
                      borderRadius: 8,
                      border: '0.5px solid var(--border)',
                    }}
                  >
                    <div className="text-sm text-muted mb-8">🔥 热门问题</div>
                    {knowledgeLoading ? (
                      <Loading text="加载中" />
                    ) : hotQuestions.length === 0 ? (
                      <div className="text-sm text-muted">暂无</div>
                    ) : (
                      hotQuestions.map((q) => (
                        <div
                          key={q}
                          className="text-md"
                          style={{
                            padding: '6px 0',
                            cursor: 'pointer',
                            borderBottom: '0.5px solid var(--border)',
                          }}
                          onClick={() => sendQuestion(q)}
                        >
                          <span style={{ color: 'var(--primary)', marginRight: 6 }}>›</span>
                          {q}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 转人工按钮 */}
                {m.role === 'ai' && m.suggestTransfer && (
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={handleTransfer}>
                      转人工客服
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  borderBottomLeftRadius: 2,
                  background: '#fff',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                }}
              >
                AI 正在思考…
              </div>
            </div>
          )}
        </div>

        {/* 底部输入栏 */}
        <div
          style={{
            background: '#fff',
            padding: '8px 12px',
            borderTop: '0.5px solid var(--border)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
            flexShrink: 0,
          }}
        >
          <input
            className="input"
            placeholder="请输入您的问题"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendQuestion(input);
            }}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            disabled={sending || !input.trim()}
            onClick={() => sendQuestion(input)}
          >
            发送
          </button>
        </div>
      </div>
    </Page>
  );
}
