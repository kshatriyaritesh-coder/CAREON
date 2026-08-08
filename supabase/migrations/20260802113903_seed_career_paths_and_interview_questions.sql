/*
# Seed Career Paths and Interview Questions

Seeds the career_paths table with 6 reference career paths, and seeds
interview_questions with a question bank across Software Engineering, Data Science,
Marketing, Finance, and Design domains at easy/medium/hard levels.
*/

INSERT INTO career_paths (title, description, required_skills, related_interests, related_job_categories, entry_roles, roadmap_steps, courses)
VALUES
(
  'Software Engineer',
  'Build and maintain software applications, from web apps to backend systems.',
  ARRAY['JavaScript','Python','Data Structures','Algorithms','Git','SQL','React','Node.js'],
  ARRAY['programming','technology','problem solving','mathematics','logic'],
  ARRAY['software development','web development','mobile development','backend engineering'],
  ARRAY['Junior Software Developer','Frontend Developer','Backend Developer','Full Stack Developer'],
  '[
    {"month":"1-2","milestone":"Learn programming fundamentals (variables, loops, functions) in Python or JavaScript"},
    {"month":"3-4","milestone":"Build 2-3 small projects (calculator, to-do app, simple website)"},
    {"month":"5-6","milestone":"Learn a web framework (React or Node.js) and build a full-stack project"},
    {"month":"7-8","milestone":"Study data structures and algorithms; practice on LeetCode"},
    {"month":"9-10","milestone":"Contribute to an open-source project or build a portfolio project"},
    {"month":"11-12","milestone":"Apply for internships or junior roles; prepare for technical interviews"}
  ]',
  '[
    {"name":"CS50 Introduction to Computer Science","platform":"edX / Harvard"},
    {"name":"The Odin Project","platform":"Free Online"},
    {"name":"Full Stack Open","platform":"University of Helsinki"},
    {"name":"Data Structures and Algorithms Specialization","platform":"Coursera"}
  ]'
),
(
  'Data Scientist',
  'Analyze complex data to uncover insights and build predictive models.',
  ARRAY['Python','Statistics','Machine Learning','SQL','Pandas','NumPy','Data Visualization','R'],
  ARRAY['mathematics','statistics','research','pattern recognition','technology'],
  ARRAY['data science','machine learning','analytics','business intelligence'],
  ARRAY['Data Analyst','Junior Data Scientist','ML Engineer','Business Intelligence Analyst'],
  '[
    {"month":"1-2","milestone":"Learn Python basics and data libraries (Pandas, NumPy, Matplotlib)"},
    {"month":"3-4","milestone":"Study statistics fundamentals: probability, distributions, hypothesis testing"},
    {"month":"5-6","milestone":"Learn machine learning with scikit-learn; build a classification/regression project"},
    {"month":"7-8","milestone":"Deep dive into SQL and data wrangling with real datasets"},
    {"month":"9-10","milestone":"Build an end-to-end data science project with a public dataset (e.g. Kaggle)"},
    {"month":"11-12","milestone":"Learn a deep learning framework (TensorFlow or PyTorch) and apply for roles"}
  ]',
  '[
    {"name":"Python for Everybody","platform":"Coursera / University of Michigan"},
    {"name":"Machine Learning Specialization","platform":"Coursera / Andrew Ng"},
    {"name":"Statistics with Python Specialization","platform":"Coursera"},
    {"name":"Kaggle Learn","platform":"Kaggle"}
  ]'
),
(
  'Digital Marketing Specialist',
  'Plan and execute marketing campaigns across digital channels to drive growth.',
  ARRAY['SEO','Google Analytics','Social Media Marketing','Content Writing','Email Marketing','PPC','A/B Testing'],
  ARRAY['communication','creativity','writing','social media','business'],
  ARRAY['digital marketing','content marketing','social media','growth marketing'],
  ARRAY['Marketing Coordinator','Social Media Manager','Content Writer','SEO Specialist'],
  '[
    {"month":"1-2","milestone":"Learn digital marketing fundamentals: SEO, SEM, social media, email marketing"},
    {"month":"3-4","milestone":"Get Google Analytics and Google Ads certifications (free)"},
    {"month":"5-6","milestone":"Run a personal blog or social media page to practice content marketing"},
    {"month":"7-8","milestone":"Learn copywriting and email marketing using free tools like Mailchimp"},
    {"month":"9-10","milestone":"Build a portfolio with case studies showing campaign results"},
    {"month":"11-12","milestone":"Apply for junior marketing roles or freelance projects"}
  ]',
  '[
    {"name":"Google Digital Marketing Certification","platform":"Google Skillshop"},
    {"name":"HubSpot Content Marketing Certification","platform":"HubSpot Academy"},
    {"name":"Facebook Blueprint","platform":"Meta"},
    {"name":"SEO Fundamentals","platform":"SEMrush Academy"}
  ]'
),
(
  'Financial Analyst',
  'Analyze financial data to guide business decisions, budgeting, and investments.',
  ARRAY['Financial Modeling','Excel','Accounting','Valuation','SQL','Power BI','Statistics'],
  ARRAY['mathematics','finance','economics','business','analysis'],
  ARRAY['finance','investment banking','corporate finance','accounting'],
  ARRAY['Financial Analyst','Junior Accountant','Investment Banking Analyst','Budget Analyst'],
  '[
    {"month":"1-2","milestone":"Learn accounting fundamentals and financial statement analysis"},
    {"month":"3-4","milestone":"Master Excel: VLOOKUP, pivot tables, financial modeling templates"},
    {"month":"5-6","milestone":"Study valuation methods: DCF, comparable companies, precedent transactions"},
    {"month":"7-8","milestone":"Get a certification: CFA Level 1 prep or Bloomberg Market Concepts"},
    {"month":"9-10","milestone":"Build a financial model for a real public company using annual reports"},
    {"month":"11-12","milestone":"Apply for analyst roles or internships at banks or financial firms"}
  ]',
  '[
    {"name":"Financial Markets","platform":"Coursera / Yale"},
    {"name":"Excel Skills for Business","platform":"Coursera / Macquarie"},
    {"name":"Bloomberg Market Concepts","platform":"Bloomberg"},
    {"name":"Corporate Finance Fundamentals","platform":"Wall Street Prep"}
  ]'
),
(
  'UX/UI Designer',
  'Design intuitive, user-centered digital products and interfaces.',
  ARRAY['Figma','User Research','Wireframing','Prototyping','Design Systems','HTML','CSS'],
  ARRAY['design','creativity','art','psychology','user experience'],
  ARRAY['product design','UX design','UI design','graphic design'],
  ARRAY['Junior UX Designer','UI Designer','Product Designer','Visual Designer'],
  '[
    {"month":"1-2","milestone":"Learn UX fundamentals: user research, personas, user journey mapping"},
    {"month":"3-4","milestone":"Master Figma: components, auto-layout, prototyping"},
    {"month":"5-6","milestone":"Redesign 3 existing apps for your portfolio"},
    {"month":"7-8","milestone":"Conduct real user research interviews and usability tests"},
    {"month":"9-10","milestone":"Learn basic HTML/CSS to understand developer handoffs"},
    {"month":"11-12","milestone":"Build a portfolio website and apply for junior UX/UI roles"}
  ]',
  '[
    {"name":"Google UX Design Certificate","platform":"Coursera"},
    {"name":"Figma for Beginners","platform":"Figma Community"},
    {"name":"Interaction Design Foundation","platform":"IDF"},
    {"name":"Nielsen Norman Group UX Training","platform":"NN/g"}
  ]'
),
(
  'Cybersecurity Analyst',
  'Protect systems and networks from digital threats and vulnerabilities.',
  ARRAY['Networking','Linux','Python','Ethical Hacking','SIEM','Incident Response','Cryptography'],
  ARRAY['technology','problem solving','security','networks','forensics'],
  ARRAY['cybersecurity','information security','network security','cloud security'],
  ARRAY['Security Analyst','SOC Analyst','Penetration Tester','IT Security Specialist'],
  '[
    {"month":"1-2","milestone":"Learn networking fundamentals: TCP/IP, DNS, firewalls, OSI model"},
    {"month":"3-4","milestone":"Get comfortable with Linux command line and basic scripting"},
    {"month":"5-6","milestone":"Study ethical hacking concepts and practice on TryHackMe or HackTheBox"},
    {"month":"7-8","milestone":"Prepare for CompTIA Security+ certification"},
    {"month":"9-10","milestone":"Build a home lab: set up a SIEM (Splunk) and simulate attacks"},
    {"month":"11-12","milestone":"Complete a CTF challenge and apply for SOC analyst or internship roles"}
  ]',
  '[
    {"name":"Google Cybersecurity Certificate","platform":"Coursera"},
    {"name":"CompTIA Security+ Study Guide","platform":"CompTIA"},
    {"name":"TryHackMe","platform":"TryHackMe"},
    {"name":"Cybersecurity Essentials","platform":"Cisco NetAcad"}
  ]'
)
ON CONFLICT DO NOTHING;

-- ========================
-- INTERVIEW QUESTIONS SEED
-- ========================
INSERT INTO interview_questions (domain, difficulty, question, ideal_keywords, ideal_answer_hint) VALUES
-- Software Engineering
('Software Engineering', 'easy', 'What is the difference between a compiled language and an interpreted language?', ARRAY['compiler','interpreter','machine code','runtime','performance','Python','C++'], 'Compiled languages translate source code directly to machine code before execution; interpreted languages execute code line by line at runtime.'),
('Software Engineering', 'easy', 'Explain what version control is and why it is important.', ARRAY['git','commit','branch','merge','collaboration','history','rollback','repository'], 'Version control tracks changes to code over time, allows collaboration, enables rollback to previous states, and helps teams work in parallel via branches.'),
('Software Engineering', 'medium', 'Describe the difference between REST and GraphQL APIs.', ARRAY['endpoint','query','mutation','over-fetching','under-fetching','schema','HTTP','flexibility'], 'REST uses fixed endpoints returning predefined data; GraphQL uses a single endpoint where clients specify exactly what data they need, reducing over/under-fetching.'),
('Software Engineering', 'medium', 'What is the time complexity of a binary search and how does it work?', ARRAY['O(log n)','divide','sorted','midpoint','compare','halve','logarithmic'], 'Binary search works on sorted arrays by repeatedly halving the search space; it has O(log n) time complexity.'),
('Software Engineering', 'hard', 'Explain the CAP theorem and how it impacts distributed system design.', ARRAY['consistency','availability','partition tolerance','trade-off','distributed','database','eventual consistency'], 'CAP theorem states a distributed system can only guarantee two of: Consistency, Availability, Partition Tolerance. Most systems choose CP or AP depending on use case.'),
-- Data Science
('Data Science', 'easy', 'What is the difference between supervised and unsupervised learning?', ARRAY['labeled','unlabeled','classification','regression','clustering','training','features','target'], 'Supervised learning uses labeled data to train models for prediction; unsupervised learning finds hidden patterns in unlabeled data through clustering or dimensionality reduction.'),
('Data Science', 'easy', 'What is overfitting and how can you prevent it?', ARRAY['training','test','generalize','regularization','cross-validation','dropout','complexity','bias-variance'], 'Overfitting occurs when a model learns noise in training data and fails to generalize. Prevention: regularization, cross-validation, simpler models, more data.'),
('Data Science', 'medium', 'Explain the concept of precision vs recall and when to prioritize each.', ARRAY['true positive','false positive','false negative','precision','recall','F1','imbalanced','cancer','spam'], 'Precision = TP/(TP+FP); Recall = TP/(TP+FN). Prioritize recall when false negatives are costly (medical diagnosis); precision when false positives are costly (spam filters).'),
('Data Science', 'medium', 'Walk me through how you would handle missing data in a dataset.', ARRAY['imputation','mean','median','drop','mode','forward fill','interpolation','analysis','domain knowledge'], 'Options include dropping rows/columns, mean/median/mode imputation, forward fill for time series, or model-based imputation depending on the data type and missing rate.'),
('Data Science', 'hard', 'How does gradient descent work and what are its main variants?', ARRAY['loss function','gradient','learning rate','batch','stochastic','mini-batch','convergence','derivative','update'], 'Gradient descent minimizes loss by iteratively moving in the direction of the negative gradient. Variants: batch (full dataset), stochastic (one sample), mini-batch (subset).'),
-- Digital Marketing
('Digital Marketing', 'easy', 'What is SEO and why is it important?', ARRAY['search engine','ranking','organic','keywords','traffic','visibility','SERP','Google'], 'SEO (Search Engine Optimization) improves a website''s visibility in organic search results, driving free, high-intent traffic without ongoing ad spend.'),
('Digital Marketing', 'easy', 'What is the difference between CTR and conversion rate?', ARRAY['click-through rate','conversion','impressions','clicks','purchase','goal','funnel','percentage'], 'CTR measures how often people click an ad/link (clicks/impressions); conversion rate measures how often clicks result in a desired action (conversions/clicks).'),
('Digital Marketing', 'medium', 'Explain A/B testing and how you would design an experiment.', ARRAY['hypothesis','control','variant','statistical significance','sample size','metric','test','randomize'], 'A/B testing compares two versions by splitting audience randomly, running both simultaneously, and measuring a defined metric until statistical significance is reached.'),
('Digital Marketing', 'medium', 'How would you measure the ROI of a social media campaign?', ARRAY['revenue','cost','clicks','conversions','attribution','tracking','UTM','analytics','ROAS'], 'Track UTM parameters, measure conversions attributed to the campaign, calculate (Revenue - Cost)/Cost × 100 for ROI or use ROAS (revenue/ad spend).'),
('Digital Marketing', 'hard', 'How would you develop a content strategy for a B2B SaaS company from scratch?', ARRAY['buyer persona','funnel','awareness','consideration','SEO','thought leadership','lead generation','KPIs'], 'Define target personas, map content to funnel stages (awareness/consideration/decision), prioritize SEO topics, mix formats, set KPIs, and build a distribution plan.'),
-- Finance
('Finance', 'easy', 'What are the three main financial statements and what does each show?', ARRAY['income statement','balance sheet','cash flow','profit','assets','liabilities','equity','operations'], 'Income statement shows revenue and profit; balance sheet shows assets, liabilities, and equity at a point in time; cash flow statement shows cash inflows and outflows.'),
('Finance', 'easy', 'Explain the concept of the time value of money.', ARRAY['present value','future value','discount rate','interest','NPV','inflation','compound'], 'A dollar today is worth more than a dollar in the future due to its earning potential. This is the foundation for NPV, DCF, and investment decisions.'),
('Finance', 'medium', 'Walk me through a discounted cash flow (DCF) valuation.', ARRAY['free cash flow','discount rate','WACC','terminal value','present value','forecast','assumptions'], 'Forecast free cash flows, determine discount rate (WACC), discount each cash flow to present value, add terminal value, sum all to get enterprise value.'),
('Finance', 'hard', 'What is WACC and how is it used in valuation?', ARRAY['weighted average','cost of equity','cost of debt','capital structure','discount rate','CAPM','beta','tax shield'], 'WACC is the blended cost of capital weighting equity and debt by their proportions. It serves as the discount rate in DCF valuations to account for the cost of financing.'),
-- UX/UI Design
('UX/UI Design', 'easy', 'What is the difference between UX and UI design?', ARRAY['user experience','user interface','research','visual','usability','interaction','wireframe','prototype'], 'UX focuses on the overall experience, user research, and usability; UI focuses on the visual design, typography, color, and interactive elements of the interface.'),
('UX/UI Design', 'easy', 'What is a user persona and how do you create one?', ARRAY['research','demographics','goals','pain points','behavior','interview','empathy','fictional'], 'A user persona is a research-based fictional character representing a target user segment, built from interviews and data, capturing goals, behaviors, and pain points.'),
('UX/UI Design', 'medium', 'Walk me through your design process for a new feature.', ARRAY['research','empathize','define','ideate','prototype','test','iterate','feedback','wireframe'], 'Follow a design thinking process: empathize (research users), define (problem statement), ideate (brainstorm), prototype (low/high fidelity), test (usability), iterate.'),
('UX/UI Design', 'hard', 'How would you design for accessibility (WCAG compliance)?', ARRAY['contrast ratio','screen reader','alt text','keyboard navigation','ARIA','color blind','WCAG','perceivable'], 'Apply WCAG principles: perceivable (alt text, sufficient contrast), operable (keyboard navigation), understandable (clear language), robust (screen reader support, ARIA labels).')
ON CONFLICT DO NOTHING;
