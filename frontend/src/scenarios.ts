export interface Scenario {
  id: string;
  title: string;
  description: string;
  requirements: {
    users: string;      // ユーザー規模
    traffic: string;    // トラフィック特性
    availability: string; // 可用性要件
    budget: string;     // 予算感
  };
}

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
];