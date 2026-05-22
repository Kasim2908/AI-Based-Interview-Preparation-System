require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// API endpoints
app.post('/api/feedback', async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required.' });
  }

  try {
    // Enhanced AI feedback analysis
    const trimmed = answer.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const words = trimmed.toLowerCase().split(/\s+/);
    
    // Analyze answer relevance
    const relevantKeywords = ['problem', 'solution', 'approach', 'implement', 'experience', 'example', 'improve', 'learn', 'team', 'code', 'database', 'api', 'server', 'client', 'user', 'requirement', 'challenge'];
    const keywordMatches = words.filter(w => relevantKeywords.some(k => w.includes(k))).length;
    const relevance = Math.min(10, Math.floor((keywordMatches / words.length) * 15));

    // Analyze communication and grammar
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const clarity = Math.min(10, Math.max(2, Math.floor((avgWordsPerSentence / 15) * 10)));
    
    // Analyze confidence
    const confidenceIndicators = ['definitely', 'certainly', 'clearly', 'obviously', 'successfully', 'effectively', 'efficiently'];
    const confidenceCount = confidenceIndicators.filter(ind => trimmed.toLowerCase().includes(ind)).length;
    const confidence = Math.min(10, Math.floor(3 + (wordCount / 50) + confidenceCount));

    // Technical correctness
    const technical = Math.min(10, Math.floor(Math.min(wordCount / 30, 1) * 10));

    const avgScore = Math.round((clarity + confidence + relevance + technical) / 4);
    
    // Generate suggestions
    const suggestions = [];
    if (wordCount < 50) suggestions.push('Provide more detailed answers with specific examples.');
    if (wordCount > 300) suggestions.push('Be more concise while maintaining clarity.');
    if (relevance < 5) suggestions.push('Include more relevant technical terms and real-world examples.');
    if (confidenceCount === 0) suggestions.push('Use confident language and provide specific examples.');
    if (sentences.length < 2) suggestions.push('Structure your answer with multiple well-formed sentences.');

    const feedback = `Clarity: ${Math.round(clarity)}/10\nConfidence: ${Math.round(confidence)}/10\nRelevance: ${Math.round(relevance)}/10\nTechnical Correctness: ${Math.round(technical)}/10\n\nFeedback: Your answer contains ${wordCount} words and ${sentences.length} sentences. Focus on including more specific technical terms and real-world examples.\n\nSuggestions: ${suggestions.length > 0 ? suggestions[0] : 'Great answer! Keep practicing.'}`;

    res.json({ feedback });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ error: 'Failed to get feedback.' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    res.status(201).json({ message: 'History saved successfully.' });
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ error: 'Failed to save history.' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// Q&A API Endpoint
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const q = question.toLowerCase().trim();
    
    // Knowledge base for common interview questions
    const knowledgeBase = {
      docker: {
        keywords: ['docker', 'container', 'containerization'],
        answer: 'Docker is a containerization platform that packages applications and their dependencies into isolated containers. It ensures consistency across different environments (dev, test, production). Key benefits: ✓ Lightweight, ✓ Fast deployment, ✓ Scalability, ✓ Isolation. Docker uses images (blueprints) and containers (running instances). Example: "docker run -d nginx" runs Nginx container. Docker vs VMs: Containers are lighter, faster to start, and share OS kernel.'
      },
      react: {
        keywords: ['react', 'reactjs'],
        answer: 'React is a JavaScript library for building user interfaces with component-based architecture. Key features: ✓ Component Reusability, ✓ Virtual DOM (improves performance), ✓ JSX (HTML-like syntax), ✓ Unidirectional data flow. Why React: Fast rendering, large community, good documentation, SEO friendly. React lifecycle: Mount → Update → Unmount. Hooks (useState, useEffect) manage state and side effects. React is maintained by Facebook and used by Netflix, Uber, Airbnb.'
      },
      microservices: {
        keywords: ['microservice', 'microservices', 'architecture'],
        answer: 'Microservices is an architectural pattern where an application is built as a collection of small, independent services that run in their own processes and communicate via APIs. Advantages: ✓ Scalability, ✓ Flexibility, ✓ Fault isolation, ✓ Technology diversity. Disadvantages: ✗ Complexity, ✗ Distributed debugging, ✗ Data consistency challenges. Technologies: Docker + Kubernetes for orchestration, API Gateways for routing. Example: Netflix uses microservices to handle millions of concurrent users.'
      },
      git: {
        keywords: ['git', 'version control', 'github'],
        answer: 'Git is a distributed version control system that tracks changes in source code. Key concepts: ✓ Repository (local & remote), ✓ Commits (snapshots), ✓ Branches (parallel development), ✓ Merging. Common commands: git clone, git add, git commit -m, git push, git pull, git merge. Workflow: Create branch → Make changes → Commit → Push → Create PR → Review → Merge. Git prevents code loss and enables collaboration.'
      },
      rest: {
        keywords: ['rest', 'api', 'restful'],
        answer: 'REST (Representational State Transfer) is an architectural style for designing networked applications. Uses HTTP methods: ✓ GET (retrieve), ✓ POST (create), ✓ PUT (update), ✓ DELETE (remove). Key principles: ✓ Stateless (no session), ✓ Cacheable, ✓ Layered, ✓ Uniform interface. Example: GET /api/users retrieves all users, POST /api/users creates new user. Status codes: 200 (success), 404 (not found), 500 (error). REST is widely used, stateless, and scalable.'
      },
      kubernetes: {
        keywords: ['kubernetes', 'k8s', 'container orchestration'],
        answer: 'Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications. Key components: ✓ Pod (smallest unit), ✓ Service (networking), ✓ Deployment (manages pods), ✓ ConfigMap (configuration). Features: ✓ Auto-scaling, ✓ Load balancing, ✓ Rolling updates, ✓ Self-healing. Why Kubernetes: Handles complex deployments, provides resilience, enables easy scaling. Used by Google, Netflix, Airbnb for managing millions of containers.'
      },
      sql: {
        keywords: ['sql', 'database', 'query'],
        answer: 'SQL (Structured Query Language) is used to interact with databases. Key statements: ✓ SELECT (retrieve data), ✓ INSERT (add data), ✓ UPDATE (modify), ✓ DELETE (remove). Joins: INNER, LEFT, RIGHT, FULL connect tables. Indexes improve query performance. Example: SELECT * FROM users WHERE age > 25 retrieves adults. SQL Injection is a security risk. ACID properties ensure data reliability.'
      },
      oops: {
        keywords: ['oops', 'oop', 'object oriented', 'programming'],
        answer: 'OOP (Object-Oriented Programming) is a paradigm based on objects and classes. Four pillars: ✓ Encapsulation (data hiding), ✓ Inheritance (code reuse), ✓ Polymorphism (multiple forms), ✓ Abstraction (hiding complexity). Benefits: ✓ Modularity, ✓ Reusability, ✓ Maintainability. Languages: Java, Python, C++, C#. Example: Class Dog inherits from Animal. Polymorphism: bark() behaves differently for Dog vs Cat.'
      },
      api: {
        keywords: ['api', 'application programming interface', 'endpoint'],
        answer: 'API (Application Programming Interface) defines how software components communicate. Types: ✓ REST API (HTTP), ✓ GraphQL (query language), ✓ WebSocket (real-time), ✓ SOAP (XML-based). Components: ✓ Endpoint (URL), ✓ Methods (GET, POST), ✓ Authentication (API keys, JWT), ✓ Response format (JSON). Example: Weather API provides current temperature data. APIs enable integration between services and apps.'
      },
      cloud: {
        keywords: ['cloud', 'aws', 'azure', 'gcp', 'cloud computing'],
        answer: 'Cloud Computing delivers computing services (compute, storage, networking) via internet. Models: ✓ IaaS (Infrastructure as Service), ✓ PaaS (Platform), ✓ SaaS (Software). Providers: AWS, Azure, Google Cloud, IBM Cloud. Benefits: ✓ Scalability, ✓ Cost-effective, ✓ Global reach, ✓ High availability. Services: EC2 (virtual machines), S3 (storage), Lambda (serverless). Cloud enables businesses to focus on applications, not infrastructure.'
      }
    };

    // Find matching answer
    let answer = '';
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(kw => q.includes(kw))) {
        answer = data.answer;
        break;
      }
    }

    // Default answer if no match
    if (!answer) {
      answer = `I can help answer questions about: Docker, React, Microservices, Git, REST APIs, Kubernetes, SQL, OOP, Cloud Computing, and more. Please ask a specific technical question related to interviews, programming, or software engineering.`;
    }

    res.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({ error: 'Failed to process question.' });
  }
});

// Speech-to-Text Endpoint (Whisper API)
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided.' });
    }

    console.log(`[Whisper] Processing audio file: ${req.file.originalname}`);

    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempFilePath = path.join(tempDir, `audio_${Date.now()}.webm`);
    
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'en'
    });

    fs.unlinkSync(tempFilePath);

    const text = transcript.text;
    console.log(`[Whisper] Transcribed text: "${text}"`);

    res.json({ text, success: true });
  } catch (error) {
    console.error('[Whisper] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to transcribe audio. Make sure OpenAI API key is configured.',
      message: error.message 
    });
  }
});

// Text-to-Speech Endpoint
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required.' });
    }

    console.log(`[TTS] Converting text to speech: "${text.substring(0, 50)}..."`);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-key-here') {
      console.error('[TTS] ❌ No valid OpenAI API key found');
      return res.status(400).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to .env file'
      });
    }

    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    
    console.log(`[TTS] ✅ Audio generated successfully (${buffer.length} bytes)`);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(buffer);
    
  } catch (error) {
    console.error('[TTS] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      message: error.message
    });
  }
});

// Test TTS endpoint for debugging
app.get('/api/test-tts', async (req, res) => {
  try {
    console.log('[TEST] Testing TTS endpoint...');
    
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: 'Hello, this is a test of the text to speech system.',
    });

    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    console.log(`[TEST] ✅ Test audio generated (${buffer.length} bytes)`);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message 
    });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📝 Open your browser and navigate to http://localhost:${port}`);
});
