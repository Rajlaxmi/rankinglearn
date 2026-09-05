// Ranking Faculty — resource data and structured reflection prompts.
// Each stream is a "tab"; each resource opens the side pane with these questions.

const QUESTION_TEMPLATES = {
  scout: [
    "What theme or question here surprised you — one you hadn't prepped for?",
    "Draft a 2–3 sentence answer to the toughest prompt this source raises.",
    "What's one change you'd make to your research-talk deck after reading this?"
  ],
  professor: [
    "Summarize the core idea in your own words, in two sentences.",
    "What's one part of this you couldn't yet explain clearly to an interviewer?",
    "Where does this concept actually show up in a ranking or ads system?"
  ],
  correspondent: [
    "What problem is this system solving, in one sentence?",
    "What's the key architectural idea or trick it relies on?",
    "What tradeoff did they make — and what would you ask them about it?"
  ],
  archivist: [
    "What's the paper's contribution, in one sentence?",
    "What baseline does it compare against, and by how much (if stated)?",
    "What follow-up experiment or critique would you raise if asked about it live?"
  ],
  implementation: [
    "What's the core algorithm or data structure here, in 2-3 sentences?",
    "Which edge case in this scenario is most likely to break a naive first pass, and why?",
    "Name one test you'd write to catch a regression here before it ships."
  ],
  theorist: [
    "What's the paper's core theoretical claim, in one sentence?",
    "What assumption does it make that breaks first in a real production ranking system?",
    "How would you explain this to an interviewer without whiteboarding the full derivation?"
  ],
  curator: [
    "What is this person or publication best known for in ranking, recsys, or ads ML?",
    "Name one specific piece of their work you'd bring up if it came up in the interview.",
    "What's one open question of theirs you'd want to ask if you actually met them?"
  ]
};

const STREAMS = [
  {
    id: "scout",
    num: "01",
    name: "Interview Prep",
    tagline: "Benchmark & rubric",
    mandate: "Debriefs every public account of Netflix's research-scientist loop so the room feels rehearsed, not cold.",
    resources: [
      {
        id: "s1",
        title: "Machine Learning Scientist 5 — Ad Ranking",
        url: "https://www.showbizjobs.com/jobs/netflix-machine-learning-scientist-5-ad-ranking-in-los-angeles/jid-6knm7j",
        source: "Netflix · Job req",
        description: "A live posting for the Ad Ranking team inside Ads Data Science & Engineering. Read it like a spec sheet: it names the team, the mandate, and the signals they say they optimize."
      },
      {
        id: "s2",
        title: "Netflix Research Scientist Interview Guide",
        url: "https://www.interviewquery.com/interview-guides/netflix-research-scientist",
        source: "InterviewQuery",
        description: "Round-by-round breakdown: the 10-slide, 15-minute research presentation (problem, method, results, impact, then Q&A) plus coding and ML design rounds."
      },
      {
        id: "s3",
        title: "Netflix Data Scientist Interview Guide — 20 Real Questions",
        url: "https://www.interviewquery.com/interview-guides/netflix-data-scientist",
        source: "InterviewQuery",
        description: "Adjacent-track question bank; useful for the statistics and experimentation questions that cross over into ranking evaluation."
      },
      {
        id: "s4",
        title: "Netflix Senior Data Scientist Interview Questions",
        url: "https://interviewkickstart.com/blogs/interview-questions/netflix-senior-data-scientist-interview-questions-you-should-know-in-2026",
        source: "Interview Kickstart",
        description: "Seniority-calibrated question set — good for gauging how deep to go on tradeoff and ownership questions."
      },
      {
        id: "s5",
        title: "Netflix Senior Research Scientist — Interview Questions",
        url: "https://www.glassdoor.com/Interview/Netflix-Senior-Research-Scientist-Interview-Questions-EI_IE11891.0,7_KO8,33.htm",
        source: "Glassdoor",
        description: "Crowdsourced, unfiltered candidate reports — noisier, but where the odd one-off prompt shows up first."
      },
      {
        id: "s6",
        title: "Get a Job at Netflix: Interview Process and Top Questions",
        url: "https://www.tryexponent.com/blog/an-inside-look-into-the-netflix-interview-process",
        source: "Aced (ex-Exponent)",
        description: "Process-level view: what each stage is actually evaluating, and how Netflix's \"judgment over process\" culture shows up in the loop."
      },
      {
        id: "s7",
        title: "Netflix Research Scientist Interview Questions & Guide",
        url: "https://dataford.io/interview-guides/netflix/research-scientist",
        source: "Dataford",
        description: "A second independent compilation — cross-reference against the InterviewQuery guide for questions that show up in both."
      }
    ]
  },
  {
    id: "professor",
    num: "02",
    name: "Theory Basics",
    tagline: "Fundamentals",
    mandate: "Rebuilds the fundamentals deep enough that a ranking model's tradeoffs feel obvious, not memorized.",
    resources: [
      {
        id: "p1",
        title: "Part I — Applied Math & ML Basics",
        url: "https://www.deeplearningbook.org/",
        source: "Goodfellow et al. · Ch. 2–5",
        description: "Linear algebra, probability & information theory, numerical computation, and the ML-basics chapter that grounds bias/variance and capacity."
      },
      {
        id: "p2",
        title: "Part II — Modern Practical Deep Networks",
        url: "https://www.deeplearningbook.org/",
        source: "Goodfellow et al. · Ch. 6–12",
        description: "Feedforward networks, regularization, optimization, CNNs, sequence models, and the practical-methodology chapter — the everyday toolkit."
      },
      {
        id: "p3",
        title: "Part III — Deep Learning Research",
        url: "https://www.deeplearningbook.org/",
        source: "Goodfellow et al. · Ch. 13–20",
        description: "Representation learning, structured probabilistic models, and generative models — the register a research-scientist interview expects you to speak in."
      },
      {
        id: "p4",
        title: "CS229: Machine Learning",
        url: "https://cs229.stanford.edu/",
        source: "Stanford",
        description: "The academic-rigor pass: generative learning, learning theory, bias/variance — Andrew Ng's course notes are the densest free derivation set around."
      },
      {
        id: "p5",
        title: "Practical Deep Learning for Coders",
        url: "https://course.fast.ai/",
        source: "fast.ai",
        description: "Code-first counterweight to CS229 — build and train real models across vision, tabular, and collaborative-filtering problems in PyTorch."
      },
      {
        id: "p6",
        title: "Essence of Linear Algebra",
        url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        source: "3Blue1Brown",
        description: "Visual intuition for vectors, transformations, and eigenvectors — what makes embedding-space reasoning click."
      },
      {
        id: "p7",
        title: "StatQuest with Josh Starmer",
        url: "https://www.youtube.com/@statquest/videos",
        source: "YouTube",
        description: "Calibration, cross-entropy, ROC/AUC, regularization — the statistics vocabulary ranking-metric questions assume you already have."
      },
      {
        id: "p8",
        title: "The Elements of Statistical Learning",
        url: "https://hastie.su.domains/ElemStatLearn/",
        source: "Hastie, Tibshirani, Friedman · free PDF",
        description: "The authors' own free edition. Denser than the DL book on classical statistical learning — trees, boosting, model selection — all load-bearing for ranking work."
      },
      {
        id: "p9",
        title: "Machine Learning Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
        source: "Google for Developers",
        description: "15-hour self-study prerequisite for the recommendation-systems course below; fast way to confirm no gaps before going deeper."
      },
      {
        id: "p10",
        title: "Recommendation Systems",
        url: "https://developers.google.com/machine-learning/recommendation",
        source: "Google for Developers",
        description: "Candidate generation, scoring, and re-ranking as a named pipeline — the exact three-stage vocabulary an ads-ranking interview will use."
      }
    ]
  },
  {
    id: "correspondent",
    num: "03",
    name: "Production Research",
    tagline: "Deployed systems",
    mandate: "Tracks what Meta, Google, and Netflix actually ship in production, in their own words.",
    resources: [
      {
        id: "c1",
        title: "From User Sequences to Scaling Laws: A Multi-Stage Architecture for Meta's Ads Ranking",
        url: "https://engineering.fb.com/2026/08/05/ml-applications/from-user-sequences-to-scaling-laws-a-multi-stage-architecture-for-metas-ads-ranking/",
        source: "Engineering at Meta · 2026",
        description: "How Meta structures its ads-ranking stack as a multi-stage pipeline and where scaling laws show up inside it."
      },
      {
        id: "c2",
        title: "Meta Adaptive Ranking Model",
        url: "https://engineering.fb.com/2026/03/31/ml-applications/meta-adaptive-ranking-model-bending-the-inference-scaling-curve-to-serve-llm-scale-models-for-ads/",
        source: "Engineering at Meta · 2026",
        description: "Serving LLM-scale ranking models under a real inference budget — since launch on Instagram, reported +3% ad conversions, +5% CTR for targeted users."
      },
      {
        id: "c3",
        title: "Meta's Generative Ads Model (GEM)",
        url: "https://engineering.fb.com/2025/11/10/ml-applications/metas-generative-ads-model-gem-the-central-brain-accelerating-ads-recommendation-ai-innovation/",
        source: "Engineering at Meta · 2025",
        description: "A foundation model for ads recommendation built at LLM scale, reused as the base for downstream ranking tasks."
      },
      {
        id: "c4",
        title: "Sequence Learning: A Paradigm Shift for Personalized Ads",
        url: "https://engineering.fb.com/2024/11/19/data-infrastructure/sequence-learning-personalized-ads-recommendations/",
        source: "Engineering at Meta · 2024",
        description: "Modeling the order and timing of user actions, not just their existence, to build richer ad-preference representations."
      },
      {
        id: "c5",
        title: "Meta Andromeda",
        url: "https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/",
        source: "Engineering at Meta · 2024",
        description: "The personalized ads-retrieval engine feeding ranking — engagement history, creative, and format as retrieval signals."
      },
      {
        id: "c6",
        title: "Candidate Generation Overview",
        url: "https://developers.google.com/machine-learning/recommendation/overview/candidate-generation",
        source: "Google for Developers",
        description: "The retrieval half of the pipeline that ranking sits downstream of — content-based vs. collaborative approaches, side by side."
      },
      {
        id: "c7",
        title: "Recommending News Articles Using Vertex AI Matching Engine",
        url: "https://cloud.google.com/blog/products/ai-machine-learning/recommending-articles-using-vertex-ai-matching-engine",
        source: "Google Cloud Blog",
        description: "An applied walkthrough of approximate nearest-neighbor matching for large-scale recommendation retrieval."
      },
      {
        id: "c8",
        title: "Scalable ML Training Infrastructure for Online Ads Recommendation and Auction Scoring at Google",
        url: "https://arxiv.org/pdf/2501.10546",
        source: "arXiv 2501.10546",
        description: "The infra reality behind billions of daily auction-scoring calls — how embedding-heavy DLRM-style models get trained at that scale."
      },
      {
        id: "c9",
        title: "Netflix TechBlog — Machine Learning tag",
        url: "https://netflixtechblog.com/tagged/machine-learning",
        source: "netflixtechblog.com",
        description: "The rolling feed to actually watch — subscribe, and skim the archive for anything touching ranking, ads, or Hydra-style multi-task models."
      },
      {
        id: "c10",
        title: "Netflix Recommendations: Beyond the 5 Stars (Part 2)",
        url: "http://techblog.netflix.com/2012/06/netflix-recommendations-beyond-5-stars.html",
        source: "Netflix TechBlog · 2012",
        description: "Older, but foundational: how Netflix first framed recommendation as a formal ML problem — positive/negative examples and learned weights."
      },
      {
        id: "c11",
        title: "Netflix Research — Machine Learning",
        url: "https://research.netflix.com/research-area/machine-learning",
        source: "research.netflix.com",
        description: "Netflix Research's own ML landing page; check its Publications section periodically for anything filed under ads or advertising."
      }
    ]
  },
  {
    id: "archivist",
    num: "04",
    name: "Academic Research",
    tagline: "Research frontier",
    mandate: "Keeps the paper trail current — KDD, RecSys, and ICML work that turns into next quarter's production model.",
    resources: [
      {
        id: "r1",
        title: "RecSys 2025 Recap",
        url: "https://januverma.substack.com/p/recsys-2025-recap",
        source: "Janu Verma",
        description: "Conference-wide themes: pragmatic long-term-value objectives (completion, dislikes, retention) over raw click optimization."
      },
      {
        id: "r2",
        title: "RecSys 2025 Paper Summary",
        url: "https://pyemma.github.io/Recsys-2025-Paper-Summary/",
        source: "Coding Monkey",
        description: "Includes a Prime Video paper on engagement-aligned sequential recommendation with a Mixture-of-Experts atop a Transformer backbone — closest public analog to a Netflix-style ranking stack."
      },
      {
        id: "r3",
        title: "RecSys 2025 — Poster Session",
        url: "https://recsys.acm.org/recsys25/poster-2/",
        source: "ACM RecSys",
        description: "Includes a Pareto-optimal multi-objective ranking framework balancing engagement, revenue, and pricing on a large entertainment platform — read this one closely."
      },
      {
        id: "r4",
        title: "Bidding-Aware Retrieval for Multi-Stage Consistency in Online Advertising",
        url: "https://arxiv.org/pdf/2508.05206",
        source: "arXiv 2508.05206",
        description: "Keeping retrieval, ranking, and the auction's bidding logic consistent across a multi-stage ads pipeline."
      },
      {
        id: "r5",
        title: "A Unified Knowledge-Distillation and Semi-Supervised Learning Framework for Industrial Ads Delivery",
        url: "https://arxiv.org/pdf/2502.06834",
        source: "arXiv 2502.06834",
        description: "Distilling large ranking models down to what can actually be served, without giving up too much signal from unlabeled traffic."
      },
      {
        id: "r6",
        title: "RankMixer: Scaling Up Ranking Models in Industrial Recommenders",
        url: "https://arxiv.org/pdf/2507.15551",
        source: "arXiv 2507.15551",
        description: "An architecture aimed squarely at the question every ranking team eventually hits: how do you scale the ranker without blowing the latency budget."
      },
      {
        id: "r7",
        title: "Denoising Neural Reranker for Recommender Systems",
        url: "https://arxiv.org/pdf/2509.18736",
        source: "arXiv 2509.18736",
        description: "Re-ranking as its own learned stage, cleaning up noise left by the upstream candidate ranker."
      },
      {
        id: "r8",
        title: "Scaling Recommender Transformers to One Billion Parameters",
        url: "https://arxiv.org/pdf/2507.15994",
        source: "arXiv 2507.15994",
        description: "What actually breaks — and what actually helps — when a recommendation transformer is pushed to billion-parameter scale."
      },
      {
        id: "r9",
        title: "Large Foundation Model for Ads Recommendation",
        url: "https://arxiv.org/pdf/2508.14948",
        source: "arXiv 2508.14948",
        description: "The academic mirror of GEM/Andromeda-style work — a single large pretrained model reused across ads ranking tasks."
      },
      {
        id: "r10",
        title: "SHARP-Distill",
        url: "https://icml.cc/virtual/2025/poster/46524",
        source: "ICML 2025 · Poster",
        description: "A 68x-faster recommender combining hypergraph neural networks with language-model distillation — a concrete efficiency/quality tradeoff to be able to discuss."
      },
      {
        id: "r11",
        title: "Awesome Deep Learning Papers for Search, Recommendation & Advertising",
        url: "https://github.com/guyulongcs/Awesome-Deep-Learning-Papers-for-Search-Recommendation-Advertising",
        source: "GitHub",
        description: "A standing, actively maintained index organized by pipeline stage — embedding, matching, pre-ranking, ranking, post-ranking, relevance, LLM, RL. Bookmark this one; it outlives any single reading list."
      }
    ]
  },
  {
    id: "implementation",
    num: "05",
    name: "Implementation Testing",
    tagline: "Coding scenarios",
    mandate: "Runs concrete build-and-break scenarios so ranking code choices get pressure-tested here, not for the first time in a live interview.",
    resources: [
      {
        id: "i1",
        title: "Rebuild nDCG@k From Scratch",
        url: "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html",
        source: "Coding scenario · Metrics",
        description: "Given a batch of ranked slates with graded relevance labels, implement DCG/nDCG@k with no library. Test it against: an empty slate, k larger than the slate, all-zero relevance, and a predicted-score tie that must break deterministically."
      },
      {
        id: "i2",
        title: "Pairwise Ranking Loss, Gradient Check",
        url: "https://developers.google.com/machine-learning/recommendation",
        source: "Coding scenario · Loss functions",
        description: "Implement a pairwise hinge loss (RankNet-style) and unit-test that its gradient actually pushes a mis-ordered pair toward the correct order — not just that average loss goes down."
      },
      {
        id: "i3",
        title: "Calibrate a CTR Model, Then Break It",
        url: "https://scikit-learn.org/stable/modules/calibration.html",
        source: "Coding scenario · Calibration",
        description: "Train a logistic-regression CTR model, then write a test that fails when predicted probabilities drift out of calibration (Brier score or reliability-diagram buckets) after a synthetic distribution shift."
      },
      {
        id: "i4",
        title: "Simulate a Second-Price Auction Under Edge Cases",
        url: "https://arxiv.org/pdf/2501.10546",
        source: "Coding scenario · Auction mechanics",
        description: "Simulate a second-price auction over ranked bids. Test the cases that break naive implementations: a tied top bid, a bid under reserve, and an advertiser whose budget runs out mid-auction."
      },
      {
        id: "i5",
        title: "Off-Policy Evaluate a Ranking Change (IPS)",
        url: "https://arxiv.org/pdf/2004.13574",
        source: "Coding scenario · Counterfactual eval",
        description: "Implement an inverse-propensity-scoring estimator to offline-evaluate a ranking policy change, then write a test that catches the classic failure mode: a handful of near-zero propensities blowing up the variance."
      },
      {
        id: "i6",
        title: "Approximate Nearest-Neighbor Retrieval vs. Brute Force",
        url: "https://github.com/facebookresearch/faiss",
        source: "Coding scenario · Retrieval",
        description: "Build brute-force cosine-similarity retrieval, then swap in an ANN index (e.g. FAISS) and test recall@k against the brute-force ground truth to put a number on what the approximation costs you."
      },
      {
        id: "i7",
        title: "Property-Test a Multi-Objective Ranker's Monotonicity",
        url: "https://hypothesis.readthedocs.io/en/latest/",
        source: "Coding scenario · Property-based testing",
        description: "Write property-based tests (e.g. Hypothesis) asserting that, holding revenue fixed, a higher predicted CTR never lowers an item's final rank score. Let the test generator find the input that breaks it."
      },
      {
        id: "i8",
        title: "Add Diversity Re-ranking Without Tanking Relevance",
        url: "https://aclanthology.org/X98-1025.pdf",
        source: "Coding scenario · Diversity",
        description: "Add an MMR (maximal marginal relevance) re-ranking step and test that it cuts top-k redundancy by a target amount while keeping relevance loss under a set bound — not just \"looks more diverse.\""
      },
      {
        id: "i9",
        title: "Catch a Feature-Leakage Time-Travel Bug",
        url: "https://docs.feast.dev/getting-started/concepts/point-in-time-joins",
        source: "Coding scenario · Feature pipelines",
        description: "Build a point-in-time join for a feature store and write a test that catches a feature computed after its label's timestamp — the leak that inflates offline metrics and quietly vanishes in production."
      },
      {
        id: "i10",
        title: "Load-Test the Ranker's p99 Under an Auction Burst",
        url: "https://arxiv.org/pdf/2507.15551",
        source: "Coding scenario · Latency & reliability",
        description: "Load-test a ranking service's p99 latency under a simulated auction QPS burst, and test that it degrades gracefully to a cheaper fallback model instead of timing out the whole auction."
      }
    ]
  },
  {
    id: "theorist",
    num: "06",
    name: "ML Theory Papers",
    tagline: "Canonical papers",
    mandate: "Grounds the DL-book chapters in the actual papers that introduced regularization, sequential user modeling, the optimizers that make training any of it tractable, and the information theory that underlies both loss functions and representation learning.",
    resources: [
      {
        id: "t1",
        title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
        url: "https://jmlr.org/papers/v15/srivastava14a.html",
        source: "Srivastava, Hinton, Krizhevsky, Sutskever, Salakhutdinov · JMLR 2014",
        description: "The original dropout paper: randomly dropping units during training as an efficient approximation to averaging over an exponential number of thinned networks."
      },
      {
        id: "t2",
        title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift",
        url: "https://arxiv.org/abs/1502.03167",
        source: "Ioffe & Szegedy · ICML 2015 · arXiv 1502.03167",
        description: "Normalizes layer inputs per mini-batch, which speeds up training and acts as an incidental regularizer — the paper's original \"internal covariate shift\" explanation is itself a classic interview debate point."
      },
      {
        id: "t3",
        title: "When Does Label Smoothing Help?",
        url: "https://arxiv.org/abs/1906.02629",
        source: "Müller, Kornblith, Hinton · NeurIPS 2019 · arXiv 1906.02629",
        description: "Softens hard training targets to regularize the model, then shows via penultimate-layer visualizations when that softening helps generalization and when it hurts model calibration and distillation."
      },
      {
        id: "t4",
        title: "Wide & Deep Learning for Recommender Systems",
        url: "https://arxiv.org/abs/1606.07792",
        source: "Cheng et al. · Google · DLRS 2016 · arXiv 1606.07792",
        description: "Jointly trains a wide linear model (memorization of feature co-occurrence) with a deep neural network (generalization via embeddings) — the template most production ranking stacks still riff on."
      },
      {
        id: "t5",
        title: "Deep Interest Network for Click-Through Rate Prediction",
        url: "https://arxiv.org/abs/1706.06978",
        source: "Zhou et al. · Alibaba · KDD 2018 · arXiv 1706.06978",
        description: "Models a user by an attention mechanism over their historical behavior sequence, weighting past actions by relevance to the current candidate ad instead of compressing history into one fixed vector."
      },
      {
        id: "t6",
        title: "Neural Collaborative Filtering",
        url: "https://arxiv.org/abs/1708.05031",
        source: "He, Liao, Zhang, Nie, Hu, Chua · WWW 2017 · arXiv 1708.05031",
        description: "Replaces the inner product in matrix factorization with a learned neural network, arguing a fixed similarity function under-fits complex user-item interaction patterns."
      },
      {
        id: "t7",
        title: "Self-Attentive Sequential Recommendation",
        url: "https://arxiv.org/abs/1808.09781",
        source: "Kang & McAuley · ICDM 2018 · arXiv 1808.09781",
        description: "SASRec: uses a self-attention stack to model a user's action sequence, balancing the long-range context of RNNs against the short-range focus of Markov-chain models."
      },
      {
        id: "t8",
        title: "Adam: A Method for Stochastic Optimization",
        url: "https://arxiv.org/abs/1412.6980",
        source: "Kingma & Ba · ICLR 2015 · arXiv 1412.6980",
        description: "The default optimizer almost everything in this section is trained with — adaptive per-parameter learning rates from running estimates of the first and second moments of the gradient."
      },
      {
        id: "t9",
        title: "Decoupled Weight Decay Regularization",
        url: "https://arxiv.org/abs/1711.05101",
        source: "Loshchilov & Hutter · ICLR 2019 · arXiv 1711.05101",
        description: "AdamW: shows that Adam's usual L2-penalty implementation isn't equivalent to true weight decay, and decoupling the two fixes Adam's often-worse generalization relative to SGD with momentum."
      },
      {
        id: "t10",
        title: "SGDR: Stochastic Gradient Descent with Warm Restarts",
        url: "https://arxiv.org/abs/1608.03983",
        source: "Loshchilov & Hutter · ICLR 2017 · arXiv 1608.03983",
        description: "Periodically restarts the learning-rate schedule with cosine annealing instead of decaying it once — a cheap way to escape sharp minima that still shows up in modern LR-schedule choices."
      },
      {
        id: "t11",
        title: "Lookahead Optimizer: k Steps Forward, 1 Step Back",
        url: "https://arxiv.org/abs/1907.08610",
        source: "Zhang, Lucas, Hinton, Ba · NeurIPS 2019 · arXiv 1907.08610",
        description: "Wraps any base optimizer (e.g. Adam or SGD) with a slow set of weights that periodically pulls back toward, trading a little compute for lower variance and less sensitivity to inner-loop hyperparameters."
      },
      {
        id: "t12",
        title: "Visual Information Theory",
        url: "https://colah.github.io/posts/2015-09-Visual-Information/",
        source: "Christopher Olah · Blog",
        description: "Builds entropy, cross-entropy, and KL divergence up visually from a bit-cost argument — the intuition layer underneath every classification loss and calibration metric in this app."
      },
      {
        id: "t13",
        title: "Deep Learning and the Information Bottleneck Principle",
        url: "https://arxiv.org/abs/1503.02406",
        source: "Tishby & Zaslavsky · arXiv 1503.02406",
        description: "Frames a deep network's layers as a tradeoff between compressing the input and preserving mutual information with the label — the theoretical lens the two papers below react to."
      },
      {
        id: "t14",
        title: "Opening the Black Box of Deep Neural Networks via Information",
        url: "https://arxiv.org/abs/1703.00810",
        source: "Shwartz-Ziv & Tishby · arXiv 1703.00810",
        description: "Tracks mutual information between layers and the input/label across training, arguing SGD has a distinct \"compression phase\" after an initial fitting phase — a claim that drew real pushback (see next)."
      },
      {
        id: "t15",
        title: "Deep Variational Information Bottleneck",
        url: "https://arxiv.org/abs/1612.00410",
        source: "Alemi, Fischer, Dillon, Murphy · ICLR 2017 · arXiv 1612.00410",
        description: "Turns the information-bottleneck objective into a tractable variational bound you can actually train with, and shows the resulting models are more robust to adversarial inputs."
      },
      {
        id: "t16",
        title: "Mutual Information Neural Estimation",
        url: "https://arxiv.org/abs/1801.04062",
        source: "Belghazi et al. · ICML 2018 · arXiv 1801.04062",
        description: "MINE: estimates mutual information between high-dimensional continuous variables with a neural network, sidestepping the discretization that makes classical MI estimators fall apart at scale."
      }
    ]
  },
  {
    id: "curator",
    num: "07",
    name: "People to Follow",
    tagline: "Signal, not noise",
    mandate: "Tracks the individuals actually publishing and building ads, ranking, and recommender-systems work — in big tech, academia, and independent blogs — so this reading list stays current after today.",
    resources: [
      {
        id: "f1",
        title: "Eugene Yan",
        url: "https://eugeneyan.com/",
        source: "Applied Scientist, Amazon · Blog",
        description: "Writes some of the most widely read practitioner posts on recommendation systems, ranking, and evaluation design — start with anything he's written on reranking or offline/online metric gaps."
      },
      {
        id: "f2",
        title: "Thorsten Joachims",
        url: "https://www.cs.cornell.edu/people/tj/",
        source: "Cornell University · Faculty page",
        description: "Learning-to-rank pioneer — his work on optimizing search engines with clickthrough data and counterfactual/off-policy learning underlies a large share of modern ranking theory."
      },
      {
        id: "f3",
        title: "Jay Alammar",
        url: "https://jalammar.github.io/",
        source: "Cohere · Blog",
        description: "\"The Illustrated Transformer\" and similar visual explainers — the accessible on-ramp to the attention mechanisms that Deep Interest Network and SASRec above build ranking on top of."
      },
      {
        id: "f4",
        title: "Xavier Amatriain",
        url: "https://www.amatriain.net/",
        source: "Ex-Netflix, Ex-Quora · Blog",
        description: "Co-author of Netflix's \"Recommendations: Beyond the 5 Stars\" posts and \"10 Lessons Learned from Building ML Systems\" — one of the earliest public accounts of a production ranking stack."
      },
      {
        id: "f5",
        title: "Jure Leskovec",
        url: "https://cs.stanford.edu/~jure/",
        source: "Stanford University · Faculty page",
        description: "Led the PinSage work at Pinterest — graph neural networks for recommendation at a scale few academic labs ever get to test theory against."
      },
      {
        id: "f6",
        title: "Alex Beutel",
        url: "https://www.alexbeutel.com/",
        source: "Google · Personal site",
        description: "Recommendation-ranking researcher behind Latent Cross (context in recurrent recommenders) and fairness-in-ranking work — the algorithmic-fairness angle an interview can turn to without warning."
      },
      {
        id: "f7",
        title: "Justin Basilico",
        url: "https://www.slideshare.net/justinbasilico",
        source: "Netflix · Talks & slides",
        description: "Long-time lead on Netflix's recommendation and ranking systems; his RecSys/KDD conference talks are the closest thing to a public tour of how Netflix actually thinks about this problem."
      }
    ]
  }
];
