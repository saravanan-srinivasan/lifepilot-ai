export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  analysis?: {
    rootCause?: string;
    riskLevels?: { factor: string; scale: number; color: string }[];
    actionItems?: string[];
    timeframeEstimation?: string;
  };
}

export interface LifeArea {
  id: string;
  name: string;
  score: number;
  icon: string;
  status: 'critical' | 'stable' | 'optimal';
  energyFlow: string; // descriptive direction or value
  connectedTo: string[];
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  category: string;
  level: number;
  xpValue: number;
  streak: number;
  missions: { id: string; text: string; completed: boolean }[];
  completed: boolean;
}

export interface FutureTrajectory {
  year: number;
  careerProgression: number;
  mentalHealth: number;
  financialSecurity: number;
}
