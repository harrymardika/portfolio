#!/usr/bin/env bun

/**
 * GitHub Projects Fetcher
 *
 * Fetches repository data from GitHub GraphQL API and generates projects.json
 * Features:
 * - Caching with configurable TTL
 * - Rate limiting protection
 * - Retry logic with exponential backoff
 * - Repository filtering
 * - Data validation
 */

// Configuration
const GITHUB_TOKEN = Bun.env.GITHUB_TOKEN;
const GITHUB_USERNAME = Bun.env.GITHUB_USERNAME || "maybeitsai";
const CACHE_DIR = "./src/data";
const CACHE_FILE = `${CACHE_DIR}/projects.json`;
const CACHE_METADATA_FILE = `${CACHE_DIR}/projects-meta.json`;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Repository filtering options
const MIN_STARS = 0; // Minimum stars to include
const EXCLUDED_REPOS: string[] = []; // Repos to exclude
const EXCLUDED_TOPICS: string[] = ["archived", "deprecated"]; // Topics to exclude
const MAX_REPOS = 100; // Maximum repositories to fetch

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  console.error("   Create a token at: https://github.com/settings/tokens");
  console.error("   Required scopes: public_repo, read:user");
  process.exit(1);
}

interface CacheMetadata {
  timestamp: number;
  username: string;
  count: number;
  version: string;
}

interface LanguageEdge {
  node: {
    name: string;
    color: string | null;
  };
  size: number;
}

interface Repository {
  id: string;
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: {
    name: string;
    color: string | null;
  } | null;
  languages: {
    edges: LanguageEdge[];
  };
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  updatedAt: string;
  createdAt: string;
  isArchived: boolean;
  isFork: boolean;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string;
  homepage?: string;
  stars: number;
  topics: string[];
  languages: Array<{
    name: string;
    color: string | null;
    percentage: number;
  }>;
  updatedAt: string;
  createdAt: string;
  year: number;
  heroImage?: string;
}

const query = `
  query($username: String!, $maxRepos: Int!) {
    user(login: $username) {
      repositories(
        first: $maxRepos,
        orderBy: {field: UPDATED_AT, direction: DESC},
        privacy: PUBLIC,
        isFork: false
      ) {
        nodes {
          id
          name
          description
          url
          homepageUrl
          stargazerCount
          isArchived
          isFork
          createdAt
          updatedAt
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              node {
                name
                color
              }
              size
            }
            totalSize
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
        }
        totalCount
      }
    }
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
`;

/**
 * Check if cache is valid
 */
async function isCacheValid(): Promise<boolean> {
  try {
    const cacheFile = Bun.file(CACHE_FILE);
    const metaFile = Bun.file(CACHE_METADATA_FILE);

    const cacheExists = await cacheFile.exists();
    const metaExists = await metaFile.exists();

    if (!cacheExists || !metaExists) {
      console.log("📦 No cache found");
      return false;
    }

    const meta: CacheMetadata = await metaFile.json();

    const age = Date.now() - meta.timestamp;
    const isValid = age < CACHE_TTL && meta.username === GITHUB_USERNAME;

    if (isValid) {
      const ageHours = Math.round(age / (1000 * 60 * 60));
      console.log(`✅ Cache valid (${ageHours}h old, ${meta.count} projects)`);
    } else {
      console.log(
        `⏰ Cache expired (${Math.round(age / (1000 * 60 * 60))}h old)`
      );
    }

    return isValid;
  } catch (error) {
    console.log("⚠️  Cache check failed:", error);
    return false;
  }
}

/**
 * Load projects from cache
 */
async function loadFromCache(): Promise<Project[] | null> {
  try {
    const file = Bun.file(CACHE_FILE);
    const projects: Project[] = await file.json();
    return projects;
  } catch (error) {
    console.error("❌ Failed to load cache:", error);
    return null;
  }
}

/**
 * Validate project data
 */
function validateProject(project: Project): boolean {
  return (
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.slug === "string" &&
    typeof project.url === "string" &&
    typeof project.stars === "number" &&
    Array.isArray(project.topics) &&
    Array.isArray(project.languages) &&
    typeof project.year === "number"
  );
}

/**
 * Filter repository based on criteria
 */
function shouldIncludeRepo(repo: Repository): boolean {
  // Exclude archived repos
  if (repo.isArchived) {
    return false;
  }

  // Exclude forks (already filtered in query, but double-check)
  if (repo.isFork) {
    return false;
  }

  // Check minimum stars
  if (repo.stargazerCount < MIN_STARS) {
    return false;
  }

  // Check excluded repos
  if (EXCLUDED_REPOS.includes(repo.name)) {
    return false;
  }

  // Check excluded topics
  const topics = repo.repositoryTopics.nodes.map((node) => node.topic.name);
  if (topics.some((topic) => EXCLUDED_TOPICS.includes(topic))) {
    return false;
  }

  return true;
}

/**
 * Transform repository to project
 */
function transformRepository(repo: Repository): Project {
  const totalSize = repo.languages.edges.reduce(
    (acc, edge) => acc + edge.size,
    0
  );

  // Sort languages by size
  const languages = repo.languages.edges
    .map((edge) => ({
      name: edge.node.name,
      color: edge.node.color,
      percentage: totalSize > 0 ? Math.round((edge.size / totalSize) * 100) : 0,
    }))
    .filter((lang) => lang.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return {
    id: repo.id,
    name: repo.name,
    slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: repo.description || "No description provided",
    url: repo.url,
    homepage: repo.homepageUrl || undefined,
    stars: repo.stargazerCount,
    topics: repo.repositoryTopics.nodes.map((node) => node.topic.name),
    languages,
    updatedAt: repo.updatedAt,
    createdAt: repo.createdAt,
    year: new Date(repo.updatedAt).getFullYear(),
  };
}

/**
 * Fetch projects from GitHub with retry logic
 */
async function fetchFromGitHub(retries = MAX_RETRIES): Promise<Project[]> {
  try {
    console.log(`🔄 Fetching repositories for @${GITHUB_USERNAME}...`);

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Temporal-Portal-Portfolio/1.0",
      },
      body: JSON.stringify({
        query,
        variables: {
          username: GITHUB_USERNAME,
          maxRepos: MAX_REPOS,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      console.error("❌ GraphQL errors:", JSON.stringify(data.errors, null, 2));
      throw new Error("GraphQL query failed");
    }

    // Check rate limit
    const rateLimit = data.data.rateLimit;
    console.log(
      `📊 Rate limit: ${rateLimit.remaining}/${
        rateLimit.limit
      } (resets at ${new Date(rateLimit.resetAt).toLocaleTimeString()})`
    );

    if (rateLimit.remaining < 100) {
      console.warn("⚠️  Rate limit running low!");
    }

    const repos: Repository[] = data.data.user.repositories.nodes;
    const totalRepos = data.data.user.repositories.totalCount;

    console.log(`📚 Found ${repos.length}/${totalRepos} public repositories`);

    // Filter and transform repositories
    const projects = repos
      .filter(shouldIncludeRepo)
      .map(transformRepository)
      .filter(validateProject);

    console.log(`✅ Processed ${projects.length} valid projects`);

    return projects;
  } catch (error) {
    console.error(`❌ Fetch attempt failed:`, error);

    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`🔄 Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchFromGitHub(retries - 1);
    }

    throw error;
  }
}

/**
 * Save projects to cache
 */
async function saveToCache(projects: Project[]): Promise<void> {
  try {
    // Save projects
    await Bun.write(CACHE_FILE, JSON.stringify(projects, null, 2));

    // Save metadata
    const metadata: CacheMetadata = {
      timestamp: Date.now(),
      username: GITHUB_USERNAME,
      count: projects.length,
      version: "1.0.0",
    };
    await Bun.write(CACHE_METADATA_FILE, JSON.stringify(metadata, null, 2));

    console.log(`💾 Cached ${projects.length} projects to ${CACHE_FILE}`);
  } catch (error) {
    console.error("❌ Failed to save cache:", error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 GitHub Projects Fetcher");
  console.log("================================\n");

  const startTime = Date.now();
  const forceRefresh = Bun.argv.includes("--force") || Bun.argv.includes("-f");

  try {
    let projects: Project[];

    // Check cache unless force refresh
    if (!forceRefresh && (await isCacheValid())) {
      const cached = await loadFromCache();
      if (cached) {
        console.log(`\n✅ Using cached data (${cached.length} projects)`);
        console.log("💡 Use --force to refresh from GitHub\n");
        return;
      }
    }

    // Fetch from GitHub
    projects = await fetchFromGitHub();

    // Save to cache
    await saveToCache(projects);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Done in ${duration}s\n`);

    // Display summary
    console.log("📈 Summary:");
    console.log(`   Total projects: ${projects.length}`);
    console.log(
      `   Total stars: ${projects.reduce((acc, p) => acc + p.stars, 0)}`
    );

    const allLanguages = new Set<string>();
    projects.forEach((p) =>
      p.languages.forEach((l) => allLanguages.add(l.name))
    );
    console.log(`   Languages: ${allLanguages.size}`);

    const allTopics = new Set<string>();
    projects.forEach((p) => p.topics.forEach((t) => allTopics.add(t)));
    console.log(`   Topics: ${allTopics.size}`);

    const years = projects.map((p) => p.year);
    console.log(
      `   Year range: ${Math.min(...years)} - ${Math.max(...years)}\n`
    );
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check your GITHUB_TOKEN is valid");
    console.error("   2. Verify username is correct");
    console.error("   3. Check your internet connection");
    console.error("   4. Try again with --force flag\n");
    process.exit(1);
  }
}

// Run the script
main();
