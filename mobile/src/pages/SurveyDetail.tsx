import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, Toast } from 'antd-mobile';
import { activityApi, promoApi } from '../services/api';
import { Page, NavBar, Loading, Empty, useFetch } from '../components/common';

const mockQuestions = [
  { id: 1, type: 'radio', title: '您最常光顾天街的哪个区域？', options: ['餐饮区', '零售区', '娱乐区', '儿童区'] },
  { id: 2, type: 'checkbox', title: '您希望增加哪些业态？（多选）', options: ['亲子乐园', '宠物友好区', '深夜食堂', '文创市集', '运动健身'] },
  { id: 3, type: 'text', title: '您对天街的服务有什么建议？' },
  { id: 4, type: 'rating', title: '请对天街整体体验打分' },
  { id: 5, type: 'radio', title: '您的年龄段？', options: ['18-25岁', '26-35岁', '36-45岁', '45岁以上'] },
  { id: 6, type: 'checkbox', title: '您通常和谁一起来天街？', options: ['独自', '伴侣', '家人', '朋友', '同事'] },
  { id: 7, type: 'radio', title: '您平均每月来天街几次？', options: ['1-2次', '3-5次', '6-10次', '10次以上'] },
  { id: 8, type: 'rating', title: '请对天街停车便利性打分' },
];

export default function SurveyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => activityApi.all() as Promise<any>, []);

  const allData = data as any;
  const surveys: any[] = allData?.surveys ?? [];
  const survey = surveys.find((s: any) => String(s.id) === id) ?? surveys[0];

  const questions: any[] = survey?.questions?.length > 0 ? survey.questions : mockQuestions;

  const storageKey = `survey_${id}_answers`;
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storageKey]);

  const setAnswer = useCallback((qid: number | string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const unanswered = questions.filter((q) => {
      const a = answers[q.id];
      if (q.type === 'checkbox') return !a || a.length === 0;
      return a === undefined || a === null || a === '';
    });
    if (unanswered.length > 0) {
      Toast.show(`还有 ${unanswered.length} 题未作答`);
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await promoApi.surveySubmit(survey?.id ?? id ?? 0, answers);
      sessionStorage.removeItem(storageKey);
      Dialog.alert({
        title: '提交成功 🎉',
        content: `感谢您的参与！获得 ${res?.reward ?? survey?.reward ?? 20} 积分`,
        confirmText: '好的',
        onConfirm: () => navigate(-1),
      });
    } catch (e: any) {
      Toast.show(e?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, survey, id, navigate, storageKey]);

  if (loading) return <Page><NavBar title="问卷调查" /><Loading /></Page>;
  if (error) return <Page><NavBar title="问卷调查" /><Empty text="加载失败" /></Page>;

  const participants = survey?.participants ?? 128;
  const reward = survey?.reward ?? 20;

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (q.type === 'checkbox') return a && a.length > 0;
    return a !== undefined && a !== null && a !== '';
  }).length;

  return (
    <Page>
      <NavBar title="问卷调查" />

      {/* 顶部信息 */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {survey?.title ?? '天街顾客体验调查'}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>已有 <span className="text-primary text-bold">{participants}</span> 人参与</span>
          <span>完成奖励：<span className="text-primary text-bold">{reward} 积分</span></span>
        </div>
      </div>

      {/* 问卷说明 */}
      <div className="card">
        <div className="card-title">问卷说明</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          感谢您参与本次调查，您的意见将帮助我们提升服务品质。预计耗时 3-5 分钟，所有信息仅用于统计，不会泄露个人隐私。
        </div>
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>答题进度：</span>
          <span className="text-primary text-bold">{answeredCount}/{questions.length}</span>
        </div>
        <div className="progress" style={{ marginTop: 4, background: '#f0f0f0' }}>
          <div
            className="progress-bar"
            style={{ background: 'var(--primary)', width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 问题列表 */}
      {questions.map((q: any, idx: number) => (
        <div key={q.id} className="card" style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            <span className="text-primary">{idx + 1}.</span> {q.title}
            {q.type === 'checkbox' && <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 'normal' }}>（多选）</span>}
          </div>

          {q.type === 'radio' && q.options?.map((opt: string, oi: number) => {
            const selected = answers[q.id] === oi;
            return (
              <div
                key={oi}
                style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                  background: selected ? 'var(--primary-light)' : '#f5f5f5',
                  border: selected ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer', fontSize: 13,
                }}
                onClick={() => setAnswer(q.id, oi)}
              >
                {selected ? '● ' : '○ '}{opt}
              </div>
            );
          })}

          {q.type === 'checkbox' && q.options?.map((opt: string, oi: number) => {
            const selectedArr: number[] = answers[q.id] ?? [];
            const selected = selectedArr.includes(oi);
            return (
              <div
                key={oi}
                style={{
                  padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                  background: selected ? 'var(--primary-light)' : '#f5f5f5',
                  border: selected ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer', fontSize: 13,
                }}
                onClick={() => {
                  const arr = [...selectedArr];
                  if (selected) {
                    setAnswer(q.id, arr.filter((x) => x !== oi));
                  } else {
                    arr.push(oi);
                    setAnswer(q.id, arr);
                  }
                }}
              >
                {selected ? '■ ' : '□ '}{opt}
              </div>
            );
          })}

          {q.type === 'text' && (
            <textarea
              className="input textarea"
              placeholder="请输入您的回答"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
            />
          )}

          {q.type === 'rating' && (
            <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const current = answers[q.id] ?? 0;
                const filled = star <= current;
                return (
                  <span
                    key={star}
                    style={{
                      fontSize: 28, cursor: 'pointer',
                      color: filled ? '#ffd700' : '#e0e0e0',
                    }}
                    onClick={() => setAnswer(q.id, star)}
                  >
                    ★
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* 提交按钮 */}
      <div className="section" style={{ marginTop: 8 }}>
        <button
          className="btn btn-primary btn-block"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '提交问卷'}
        </button>
      </div>
    </Page>
  );
}
