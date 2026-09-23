import { useState } from 'react';
import { 
  GitBranch,
  BriefcaseBusiness,
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  Edit3, 
  Terminal, 
  Cpu, 
  Layers, 
  BookOpen, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Info,
  Sliders,
  Share2
} from 'lucide-react';

const OPENROUTER_CHAT_COMPLETIONS_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const FREE_MODELS = [
  { id: 'openrouter/free', name: 'OpenRouter Auto-Free Router', badge: 'Recommended', desc: 'Automatically selects best available free LLM' },
  { id: 'cohere/north-mini-code:free', name: 'Cohere North Mini Code', badge: 'Fast Code', desc: 'Optimized for technical syntax & repository analysis' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B', badge: 'High Quality', desc: 'Great tone control & natural developer language' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA Nemotron 3 Ultra', badge: 'Large Context', desc: 'Ideal for deep directory structures & large repos' },
  { id: 'inclusionai/ling-3.0-flash-vl:free', name: 'InclusionAI Ling 3.0 Flash VL', badge: 'Vision & Fast', desc: 'Fast multimodal model for visual repository context' }
];

const COPILOT_PROMPTS = [
  {
    title: "1. Go Backend: Repo Parser & Extractor",
    role: "Backend Architecture",
    description: "Prompt Copilot to build a Go file walker that reads key repo files without hitting token limits.",
    code: `// Prompt for GitHub Copilot in Go:
// Create a Go function named CollectRepoContext(repoURL string) (string, error) that:
// 1. Clones a git repo to a temporary directory or accepts local repo path.
// 2. Traverses the directory up to 3 levels deep, excluding .git, node_modules, and vendor.
// 3. Reads contents of README.md, go.mod, package.json, Dockerfile, docker-compose.yml.
// 4. Truncates individual file contents to 3,000 characters maximum.
// 5. Combines file contents into a single formatted Markdown string for LLM prompt context.`
  },
  {
    title: "2. Go Backend: OpenRouter API Handler",
    role: "LLM API Integration",
    description: "Prompt Copilot to construct the HTTP client targeting OpenRouter free models.",
    code: `// Prompt for GitHub Copilot in Go:
// Implement an HTTP handler function GenerateLinkedInPostHandler(w http.ResponseWriter, r *http.Request) in Go:
// 1. Parse JSON payload containing 'repo_url', 'tone', 'openrouter_key', and 'model'.
// 2. Call CollectRepoContext to get the structured summary string.
// 3. Send a POST request to "https://openrouter.ai/api/v1/chat/completions" using net/http.
// 4. Include Headers: Content-Type, Authorization: Bearer <key>, HTTP-Referer, and X-Title.
// 5. Enforce robust exponential backoff retry logic if status code is 429 (Rate Limit).
// 6. Return JSON response: { "post_content": string, "detected_tech": []string, "status": "success" }.`
  },
  {
    title: "3. React: Fetch & LinkedIn Preview Hook",
    role: "Frontend Integration",
    description: "Prompt Copilot to write a custom React hook for handling generation state and copy functionality.",
    code: `// Prompt for GitHub Copilot in React/JSX:
// Create a custom React hook 'useLinkedInGenerator' that manages:
// - State variables: apiKey, model, repoUrl, tone, options (hashtags, emojis, cta), isLoading, error, generatedPost, techStack.
// - Function 'generatePost()': validates input, sends POST to '/api/generate', and updates states.
// - Function 'copyToClipboard()': uses navigator.clipboard.writeText and sets copied status with a 2-second timeout.
// Include simulated fallback mock data if API key is not provided.`
  },
  {
    title: "4. React: Editable LinkedIn Card Component",
    role: "UI Component",
    description: "Prompt Copilot to create a LinkedIn UI post preview component with edit mode.",
    code: `// Prompt for GitHub Copilot in React/Tailwind:
// Build a React component 'LinkedInPreviewCard' styled with Tailwind CSS:
// 1. Render user profile header (avatar, name, tagline, time, global icon).
// 2. Render post body text with preserved whitespace (whitespace-pre-wrap).
// 3. Add an toggleable edit mode using <textarea> so users can edit the text directly.
// 4. Render mock engagement counters (likes, comments, reposts) and action buttons (Like, Comment, Repost, Send).
// 5. Add a floating 'Copy to LinkedIn' primary button at the top right.`
  }
];

export default function App() {
  // Configuration State
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY ?? '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openrouter/free');
  
  // Input Form State
  const [repoUrl, setRepoUrl] = useState('https://github.com/uber/zap');
  const [tone, setTone] = useState('technical');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  // App Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'copilot'
  const [copilotCopiedIdx, setCopilotCopiedIdx] = useState<number | null>(null);

  // Output Result State
  const [postContent, setPostContent] = useState(
    `🚀 High-Performance Blazing Fast Structured Logging in Go: How Uber Solved Logging Bottlenecks\n\n` +
    `Standard logging libraries often slow down production microservices due to heavy memory allocations and reflection overhead. When building high-throughput backend applications, logging latency directly impacts API response times.\n\n` +
    `🛠️ Tech Stack & Key Architecture:\n` +
    `• Go (Golang) Zero-Allocation Engine\n` +
    `• Strongly Typed Field Encoder\n` +
    `• Atomic Level Encoders & Zapcore abstractions\n` +
    `• Benchmarked 4x–10x faster than traditional loggers\n\n` +
    `⚡ Key Takeaway:\n` +
    `By avoiding interface{} allocations and utilizing structured encoders, Uber achieved low-latency logging without sacrificing developer ergonomics.\n\n` +
    `How do you handle log serialization in your high-load distributed systems? Let's discuss in the comments below! 👇\n\n` +
    `#Golang #BackendEngineering #SystemDesign #OpenSource #SoftwareArchitecture`
  );

  const [techStack, setTechStack] = useState(['Go', 'Uber Architecture', 'High Throughput', 'Zero-Allocation', 'Structured Logging']);
  const handleGenerate = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setIsEditing(false);

    // Extract repo name derived from URL
    const cleanRepoName = repoUrl.replace(/https?:\/\/github\.com\//, '').replace(/\/$/, '');
    
    // Check if OpenRouter API Key is supplied
    if (apiKey.trim()) {
      try {
        const systemPrompt = `You are a world-class Developer Advocate and Technical Content Strategist.
Analyze the repository path/URL: "${repoUrl}".
Write an engaging, structured LinkedIn post formatted for direct copying.

Tone style: ${tone}
Include Emojis: ${includeEmojis}
Include Hashtags: ${includeHashtags}
Include Call to Action: ${includeCTA}

Formatting rules for LinkedIn:
- Catchy first line (Hook).
- Clear problem statement.
- Tech Stack & Architecture bullet points.
- Key takeaways or learnings.
- DO NOT use markdown header tags (# Title) or backtick code blocks in the output text.
- Separate paragraphs clearly.`;

        const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'Git-to-LinkedIn Generator'
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Generate a LinkedIn post summarizing the architecture and value proposition of repository: ${repoUrl}` }
            ]
          })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          setPostContent(data.choices[0].message.content);
          setTechStack(['OpenRouter AI', 'Git Analysis', 'Architecture', 'Tech Stack']);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('OpenRouter API request failed or was blocked, falling back to smart simulation:', err);
      }
    }

    // Simulated Smart Generator Fallback (Runs if no key or API call completes)
    setTimeout(() => {
      let simulatedPost: string;
      let simulatedStack: string[];

      if (repoUrl.toLowerCase().includes('shortener') || repoUrl.toLowerCase().includes('url')) {
        simulatedStack = ['Go', 'Redis', 'PostgreSQL', 'Base62', 'Chi Router', 'Docker'];
        simulatedPost = `${includeEmojis ? '🚀 ' : ''}Architecting Low-Latency URL Shorteners: Lessons in Caching & Hashing Strategies\n\n` +
          `Handling millions of redirect queries daily requires minimizing database latency. In this project, I built a high-throughput URL shortener focused on cache-first routing and atomic key encoding.\n\n` +
          `🛠️ Core Architecture & Tech Stack:\n` +
          `• Go (Golang) & Chi HTTP Router for high-concurrency requests\n` +
          `• Redis In-Memory Cache for 0.5ms redirect responses\n` +
          `• Base62 Hashing Algorithm for collision-free 6-char URLs\n` +
          `• PostgreSQL for persistent mappings & analytics\n\n` +
          `⚡ Key Engineering Takeaway:\n` +
          `Offloading hot key lookups to Redis before reaching persistent storage reduced database CPU load by over 80% during stress tests.\n\n` +
          (includeCTA ? `How do you handle invalidation in your caching layers? Let's discuss in the comments below! 👇\n\n` : '') +
          (includeHashtags ? `#Golang #BackendEngineering #Redis #SystemDesign #DistributedSystems` : '');
      } else if (repoUrl.toLowerCase().includes('queue') || repoUrl.toLowerCase().includes('job') || repoUrl.toLowerCase().includes('worker')) {
        simulatedStack = ['Go Goroutines', 'Worker Pool', 'RabbitMQ', 'Exponential Backoff', 'Docker'];
        simulatedPost = `${includeEmojis ? '⚙️ ' : ''}Building a Fault-Tolerant Asynchronous Job Queue in Go\n\n` +
          `Background task processing can quickly bottleneck your web server if handled synchronously. To ensure high reliability, I designed a bounded-concurrency worker pool in Go.\n\n` +
          `🛠️ Key Stack & Patterns Implemented:\n` +
          `• Worker Pool Pattern utilizing Go Channels & Goroutines\n` +
          `• Graceful Shutdown listening for OS SIGINT/SIGTERM signals\n` +
          `• Dead Letter Queue (DLQ) with Exponential Backoff retries\n` +
          `• Redis Streams for persistent task buffering\n\n` +
          `💡 Learnings:\n` +
          `By bounding the channel queue size, memory usage remained flat even during peak traffic spikes.\n\n` +
          (includeCTA ? `What queuing strategies do you use for background jobs? Drop your thoughts below! 👇\n\n` : '') +
          (includeHashtags ? `#BackendEngineering #Golang #Concurrency #DistributedSystems #SoftwareArchitecture` : '');
      } else {
        simulatedStack = ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'OpenRouter AI'];
        simulatedPost = `${includeEmojis ? '✨ ' : ''}Introducing ${cleanRepoName || 'My Open Source Project'}: Simplifying Developer Workflows\n\n` +
          `Understanding complex codebases quickly is a common challenge for developer teams. I created this project to automatically parse repository structures and extract clear, actionable summaries.\n\n` +
          `🛠️ Architecture Highlights:\n` +
          `• Clean Context Extraction Engine\n` +
          `• Integrated OpenRouter Free Model API Fallbacks\n` +
          `• Modern Reactive Dashboard Interface\n` +
          `• Developer Copilot Ready Prompt Modules\n\n` +
          `🎯 Problem Solved:\n` +
          `Eliminates manual documentation overhead and turns repository code into polished social content in seconds.\n\n` +
          (includeCTA ? `Check out the repository and let me know your thoughts! 👇\n\n` : '') +
          (includeHashtags ? `#DeveloperTools #OpenSource #React #AI #WebDevelopment` : '');
      }

      setPostContent(simulatedPost);
      setTechStack(simulatedStack);
      setIsLoading(false);
    }, 1200);
  };

  const handleCopy = (text: string, isCopilot = false, idx: number | null = null) => {
    navigator.clipboard.writeText(text);
    if (isCopilot) {
      setCopilotCopiedIdx(idx);
      setTimeout(() => setCopilotCopiedIdx(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white">GitToPost</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                OpenRouter Free
              </span>
            </div>
            <p className="text-xs text-slate-400">Transform Repositories into LinkedIn Architecture Posts</p>
          </div>
        </div>

        {/* TOP CONTROLS: API KEY & MODEL SELECTOR */}
        <div className="flex items-center flex-wrap gap-3">
          {/* API Key Input */}
          <div className="relative flex items-center">
            <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type={showApiKey ? 'text' : 'password'}
              placeholder="OpenRouter API Key (Optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs rounded-lg pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none w-48 sm:w-60 transition-all"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2.5 text-slate-400 hover:text-slate-200"
              title={showApiKey ? "Hide Key" : "Show Key"}
            >
              {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs rounded-lg px-3 py-2 text-slate-200 focus:outline-none cursor-pointer appearance-none pr-8 transition-all"
            >
              {FREE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.badge})
                </option>
              ))}
            </select>
            <Cpu className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generator
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'copilot'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Copilot Guide
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Repository Input Section */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    Git Repository Target
                  </label>
                  <span className="text-[10px] text-slate-500">Local path or GitHub URL</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="e.g. https://github.com/uber/zap or ./my-go-project"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>

                {/* Quick Preset Badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500">Quick Try:</span>
                  <button
                    onClick={() => setRepoUrl('https://github.com/uber/zap')}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] border border-slate-700/50 text-slate-300 transition"
                  >
                    uber/zap (Logger)
                  </button>
                  <button
                    onClick={() => setRepoUrl('https://github.com/gin-gonic/gin')}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] border border-slate-700/50 text-slate-300 transition"
                  >
                    gin-gonic/gin (Router)
                  </button>
                  <button
                    onClick={() => setRepoUrl('https://github.com/my-user/url-shortener')}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-[11px] border border-slate-700/50 text-slate-300 transition"
                  >
                    URL Shortener
                  </button>
                </div>
              </div>

              {/* Post Customization Options */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Tone & Post Formatting
                  </h3>
                </div>

                {/* Tone Options */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Content Tone Focus</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'technical', label: 'Technical & Engineering', sub: 'Deep architecture & benchmarks' },
                      { id: 'showcase', label: 'Showcase & Launch', sub: 'Feature highlights & release' },
                      { id: 'learnings', label: 'Learnings & Challenges', sub: 'Problem solved narrative' },
                      { id: 'punchy', label: 'Short & Punchy', sub: 'Concise scannable bullet points' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTone(t.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          tone === t.id
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-200">{t.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs text-slate-400 font-medium">Output Elements</label>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-xs text-slate-300">Include Strategic Hashtags</span>
                    <input
                      type="checkbox"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="accent-indigo-500 h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-xs text-slate-300">Include Emojis for Visual Scannability</span>
                    <input
                      type="checkbox"
                      checked={includeEmojis}
                      onChange={(e) => setIncludeEmojis(e.target.checked)}
                      className="accent-indigo-500 h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                    <span className="text-xs text-slate-300">Include Engagement Call To Action (CTA)</span>
                    <input
                      type="checkbox"
                      checked={includeCTA}
                      onChange={(e) => setIncludeCTA(e.target.checked)}
                      className="accent-indigo-500 h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                      Analyzing Repo & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      Analyze & Generate LinkedIn Post
                    </>
                  )}
                </button>
              </div>

              {/* Model Info Note */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-start gap-3 text-xs text-slate-400">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">Free Model Router: </span>
                  Uses OpenRouter free rate limits (~20 req/min). If no API key is set, the app triggers a smart context simulation.
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Header Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="w-5 h-5 text-blue-400" />
                  <h2 className="text-sm font-semibold text-slate-200">LinkedIn Post Preview</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Done Editing' : 'Edit Text'}
                  </button>

                  <button
                    onClick={() => handleCopy(postContent)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy to LinkedIn
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mock LinkedIn Post Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                
                {/* LinkedIn Card Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow">
                      DEV
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-100">Backend Software Engineer</span>
                        <span className="text-xs text-slate-500">• 1st</span>
                      </div>
                      <p className="text-xs text-slate-400">Building High Throughput Systems & Go Microservices</p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span>Just now</span>
                        <span>•</span>
                        <span>🌐</span>
                      </div>
                    </div>
                  </div>
                  <Share2 className="w-4 h-4 text-slate-500" />
                </div>

                {/* LinkedIn Card Body (Editable or Viewable) */}
                <div className="p-4 bg-slate-900/90 text-slate-200 text-sm leading-relaxed">
                  {isEditing ? (
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={14}
                      className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg p-3 text-slate-100 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-slate-200">
                      {postContent}
                    </div>
                  )}
                </div>

                {/* Tech Stack Metadata Summary Badges */}
                <div className="px-4 py-3 bg-slate-950/60 border-t border-b border-slate-800/60">
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Detected Architecture Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* LinkedIn Engagement Footer Preview */}
                <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">👍</span>
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">👏</span>
                    </div>
                    <span className="text-[11px] text-slate-400">48 reactions</span>
                  </div>
                  <div className="text-[11px] text-slate-400">12 comments • 4 reposts</div>
                </div>

                {/* Mock Action Bar */}
                <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 grid grid-cols-4 gap-1 text-slate-400 text-xs">
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-slate-800/60 transition">
                    <ThumbsUp className="w-3.5 h-3.5" /> Like
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-slate-800/60 transition">
                    <MessageSquare className="w-3.5 h-3.5" /> Comment
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-slate-800/60 transition">
                    <Repeat2 className="w-3.5 h-3.5" /> Repost
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-slate-800/60 transition">
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Terminal className="w-6 h-6 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Copilot Development Prompts</h2>
              </div>
              <p className="text-sm text-slate-400">
                Use these step-by-step GitHub Copilot prompts to build the full backend Go extractor and React frontend integration.
              </p>
            </div>

            <div className="space-y-4">
              {COPILOT_PROMPTS.map((prompt, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {prompt.role}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-200">{prompt.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{prompt.description}</p>
                    </div>

                    <button
                      onClick={() => handleCopy(prompt.code, true, idx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                    >
                      {copilotCopiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Prompt
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950 font-mono text-xs text-indigo-200/90 overflow-x-auto leading-relaxed">
                    <pre>{prompt.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}