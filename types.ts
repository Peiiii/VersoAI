
export interface PageInfo {
  url: string;
  title: string;
  favIconUrl?: string;
}

export interface EvidenceItem {
  id: string;
  timestamp: number;
  sourceUrl: string;
  sourceTitle: string;
  content: string;
  type: 'quote' | 'insight';
}

export interface ResearchBrief {
  summary: string;
  keyPoints: string[];
  entities: { name: string; type: string; description: string }[];
  metrics: {
    readingTime: number;
    complexity: 'Simple' | 'Intermediate' | 'Advanced';
    sentiment: string;
  };
}

export interface GemigoSDK {
  platform: 'extension' | 'desktop' | 'web';
  extension: {
    getPageInfo(): Promise<PageInfo | null>;
    getPageText(): Promise<string>;
    getSelection(): Promise<{ text: string }>;
    extractArticle(): Promise<{ success: boolean; title?: string; content?: string }>;
    injectCSS(css: string): Promise<{ success: boolean; styleId?: string }>;
    removeCSS(styleId: string): Promise<{ success: boolean }>;
    insertWidget(html: string, position?: string): Promise<{ success: boolean; widgetId?: string }>;
    onSelectionChange(handler: (text: string) => void): () => void;
  };
  storage: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown): Promise<void>;
  };
  notify(options: { title: string; message: string }): Promise<void>;
}

declare global {
  interface Window {
    gemigo: GemigoSDK;
  }
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  NOTEBOOK = 'NOTEBOOK',
  CHAT = 'CHAT'
}
