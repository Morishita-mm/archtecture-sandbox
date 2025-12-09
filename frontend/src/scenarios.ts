import type { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'internal_tool',
    title: '社内勤怠管理システム',
    description: '社員50名が毎朝9時に打刻するためのシンプルなシステム。',
    requirements: {
      users: '50 users (Internal)',
      traffic: 'Very Low (Peak at 9:00 AM only)',
      availability: 'Moderate (Can allow short downtimes at night)',
      budget: 'Low (Avoid over-engineering)',
    },
  },
  {
    id: 'sns_app',
    title: '画像投稿SNS (Twitter Clone)',
    description: 'ユーザーが写真を投稿し、タイムラインで見ることができるアプリ。',
    requirements: {
      users: '1 Million DAU (Global)',
      traffic: 'High (Read heavy, Write heavy)',
      availability: 'Critical (24/7 uptime required)',
      budget: 'High (Performance is priority)',
    },
  },
  
  // カスタム設計用テンプレート
  {
    id: 'custom',
    title: 'カスタム設計（フリーテーマ）',
    description: '独自のテーマ設定を行い、クライアントへのヒアリングから設計を始めます。',
    isCustom: true,
    difficulty: 'medium',
    requirements: {
      users: 'AI決定',
      traffic: 'AI決定',
      availability: 'AI決定',
      budget: 'AI決定',
    },
  },
];