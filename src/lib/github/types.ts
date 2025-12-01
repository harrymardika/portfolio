// GitHub API types
export interface GitHubRepo {
  id: string;
  name: string;
  description: string;
  url: string;
  homepage?: string;
  stargazerCount: number;
  primaryLanguage?: {
    name: string;
    color?: string;
  };
  languages: {
    edges: Array<{
      node: {
        name: string;
        color?: string;
      };
      size: number;
    }>;
  };
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  updatedAt: string;
}
