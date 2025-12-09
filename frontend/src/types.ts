export type ScenarioDifficulty = 'small' | 'medium' | 'large';
export type PartnerRole = 'cfo' | 'cto' | 'ceo';

export interface ScenarioRequirements {
  users: string;
  traffic: string;
  availability: string;
  budget: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  requirements: ScenarioRequirements;

  isCustom?: boolean;
  difficulty?: ScenarioDifficulty;
  partnerRole?: PartnerRole;
}

export interface DetailedScores {
  availability: number;
  scalability: number;
  security: number;
  maintainability: number;
  costEfficiency: number;
  feasibility: number;
}

export interface EvaluationResult {
  score: number;
  totalScore: number;
  details: DetailedScores;
  feedback: string;
  improvement: string;
}

export interface NodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
}

export interface EdgeData {
  source: string;
  target: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}