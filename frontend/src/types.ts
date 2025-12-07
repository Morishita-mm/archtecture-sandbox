export interface EvaluationResult {
  score: number;
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