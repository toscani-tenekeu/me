export const hero = {
  name: 'Toscani',
  lastName: 'TENEKEU MODJOU',
  role: 'Founder of KmerHosting & Full-Stack Developer',
  tagline: 'Web platforms, real-time apps & developer tools',
  bio: 'I build reliable products from interface to infrastructure, with a focus on <strong>Vue, React, Node.js, Django and modern deployment workflows</strong>.',
}

export const contact = {
  email: 'hello@toscani.tenekeu.com',
  github: 'https://github.com/toscani-tenekeu',
  linkedin: 'https://linkedin.com/in/toscani-tenekeu',
  youtubeEn: 'https://www.youtube.com/@toscani_tenekeu_en',
  youtubeFr: 'https://www.youtube.com/@toscani_tenekeu_fr',
}

export interface SkillGroup {
  title: string
  icon_svg?: string
  skills: { label: string; featured?: boolean }[]
}

export const skillGroups: SkillGroup[] = [
  { title: 'front-end', skills: [
    { label: 'Vue.js', featured: true }, { label: 'React', featured: true },
    { label: 'Next.js', featured: true }, { label: 'TypeScript', featured: true },
    { label: 'Tailwind CSS' }, { label: 'Fluent UI' }, { label: 'Pinia' }, { label: 'Monaco Editor' },
  ] },
  { title: 'back-end & APIs', skills: [
    { label: 'Node.js', featured: true }, { label: 'Express.js', featured: true },
    { label: 'Django', featured: true }, { label: 'Django REST Framework' },
    { label: 'PHP', featured: true }, { label: 'REST API Design' }, { label: 'WebSockets' },
    { label: 'WebRTC' }, { label: 'OpenAPI' }, { label: 'OpenAI API' },
  ] },
  { title: 'databases & storage', skills: [
    { label: 'MongoDB / Mongoose', featured: true }, { label: 'MySQL / PDO', featured: true },
    { label: 'PostgreSQL / Prisma', featured: true }, { label: 'SQLite / better-sqlite3' },
    { label: 'Redis', featured: true }, { label: 'Cassandra' },
  ] },
  { title: 'cloud & devops', skills: [
    { label: 'Linux', featured: true }, { label: 'Nginx', featured: true },
    { label: 'Docker', featured: true }, { label: 'GitHub Actions', featured: true },
    { label: 'PM2' }, { label: "Certbot / Let's Encrypt" }, { label: 'SSH' }, { label: 'Bash scripting' },
  ] },
  { title: 'testing & security', skills: [
    { label: 'Playwright', featured: true }, { label: 'Vitest', featured: true },
    { label: 'Supertest' }, { label: 'RBAC', featured: true }, { label: 'CSRF protection' },
    { label: 'Session authentication' }, { label: 'Zod validation' }, { label: 'Postman' },
  ] },
  { title: 'languages', skills: [
    { label: 'JavaScript / TypeScript', featured: true }, { label: 'Python', featured: true },
    { label: 'PHP', featured: true }, { label: 'SQL', featured: true }, { label: 'Bash' }, { label: 'HTML / CSS' },
  ] },
  { title: 'tools & workflow', skills: [
    { label: 'Git / GitHub', featured: true }, { label: 'Vite', featured: true },
    { label: 'npm' }, { label: 'VS Code' }, { label: 'Linux CLI' }, { label: 'CI/CD pipelines' },
  ] },
]

export interface Project {
  num: string
  slug: string
  title: string
  desc: string
  tags: string[]
  tagIcons?: Record<string, string>
  visibility: 'public' | 'private'
  image?: string
  github?: string
  live?: string
}

export const projects: Project[] = [
  {
    num: '01', slug: 'kmerhosting', title: 'KmerHosting', visibility: 'private',
    desc: 'Web hosting and cloud platform built for African customers, with hosting services, domains, account management and developer tooling. The production source code is private.',
    tags: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker', 'Nginx'], live: 'https://kmerhosting.com',
  },
  {
    num: '02', slug: 'fullstack-hosting-platform-starter-mevn-stack', title: 'Fullstack Hosting Platform Starter — MEVN Stack', visibility: 'public',
    desc: 'Production-oriented starter with Vue 3, Vite, TypeScript, Pinia and Tailwind on the front end, plus Express 5, MongoDB, Mongoose, Zod, Clerk and OpenAPI on the back end. Includes Vitest, Supertest and Playwright.',
    tags: ['Vue.js', 'TypeScript', 'Express.js', 'MongoDB', 'Clerk', 'OpenAPI', 'Playwright'],
    github: 'https://github.com/toscani-tenekeu/Fullstack_Hosting_Plateform_Starter_MEVN_Stack',
  },
  {
    num: '03', slug: 'realtime-chatapp-django-reactjs-sqlite3', title: 'Realtime ChatApp — Django & React', visibility: 'public',
    desc: 'Real-time direct and group messaging with replies, reactions, forwarding, voice messages, WebSocket updates and WebRTC calls. Built with React 19, Fluent UI, Django REST Framework, Channels and SQLite.',
    tags: ['React', 'Django', 'DRF', 'WebSockets', 'WebRTC', 'SQLite', 'Playwright'],
    github: 'https://github.com/toscani-tenekeu/Realtime_ChatApp_Django_ReactJS_SQLite3',
  },
  {
    num: '04', slug: 'chat-application-django-redis-cassandra', title: 'Chat Application — Django, Redis & Cassandra', visibility: 'public',
    desc: 'Responsive private and group chat application with real-time messaging, presence and theme support. Django Channels and Daphne handle live connections, Redis handles channel messaging, and Cassandra stores chat data.',
    tags: ['Django', 'Channels', 'Daphne', 'Redis', 'Cassandra', 'WebSockets'],
    github: 'https://github.com/toscani-tenekeu/ChatApplication_Django_Redis_Cassandra',
  },
  {
    num: '05', slug: 'inventory-management-system-php-mysql', title: 'Inventory Management System', visibility: 'public',
    desc: 'Secure inventory and stock management application built with PHP 8.2 and MySQL. It uses PDO, role-based access control, CSRF protection, sessions and database transactions to enforce stock rules.',
    tags: ['PHP', 'MySQL', 'PDO', 'RBAC', 'CSRF', 'Nginx'],
    github: 'https://github.com/toscani-tenekeu/Inventory_Management_System_PHP_MySQL',
  },
  {
    num: '06', slug: 'kmerhosting-developer-tools', title: 'KmerHosting Developer Tools', visibility: 'public',
    desc: 'Open-source TypeScript SDK and command-line tooling for integrating with the KmerHosting API and automating common platform operations from Node.js projects or a terminal.',
    tags: ['TypeScript', 'Node.js', 'SDK', 'CLI', 'REST API'],
    github: 'https://github.com/KmerHosting/kmerhosting_sdk', live: 'https://kmerhosting.com/docs/developer/overview',
  },
  {
    num: '07', slug: 'shrub-online-code-editor', title: 'Shrub — Online Code Editor', visibility: 'public',
    desc: 'Browser-based code editor built with Next.js, React, TypeScript and Monaco Editor. The interface uses Radix UI and Tailwind CSS for an accessible, responsive development experience.',
    tags: ['Next.js', 'React', 'TypeScript', 'Monaco Editor', 'Radix UI', 'Tailwind CSS'],
    github: 'https://github.com/toscani-tenekeu/Shrub-free-online-code-editor',
  },
  {
    num: '08', slug: 'tinyfolio', title: 'Tinyfolio', visibility: 'public',
    desc: 'Compact responsive portfolio built with React and TypeScript. It uses TanStack Router and Fluent UI v9, with theme support and reusable interface components.',
    tags: ['React', 'TypeScript', 'TanStack Router', 'Fluent UI', 'Vite'],
    github: 'https://github.com/toscani-tenekeu/tinyfolio',
  },
  {
    num: '09', slug: 'audio-transcriber', title: 'Audio Transcriber', visibility: 'public',
    desc: 'Lightweight browser interface that sends an audio file of up to 25 MB to OpenAI speech-to-text and displays the transcript. It runs without a back end and does not persist the API key.',
    tags: ['HTML', 'JavaScript', 'OpenAI API', 'Speech-to-text'],
    github: 'https://github.com/toscani-tenekeu/Audio-Transcriber',
  },
  {
    num: '10', slug: 'wfilemanager', title: 'wFileManager', visibility: 'public',
    desc: 'Public repository for a web-based file manager currently in its initial development phase. The implementation and technical documentation are being prepared.',
    tags: ['Work in progress', 'File manager'], github: 'https://github.com/toscani-tenekeu/wFileManager',
  },
  {
    num: '11', slug: 'webcpl', title: 'Webcpl', visibility: 'public',
    desc: 'Public repository for a web control panel project currently in its initial development phase. The implementation and technical documentation are being prepared.',
    tags: ['Work in progress', 'Web control panel'], github: 'https://github.com/toscani-tenekeu/Webcpl',
  },
]

export interface Cert {
  icon: string
  title: string
  org: string
  year?: string
  badge: 'In Progress' | 'Diploma' | 'Baccalaureate' | 'Certification'
  image?: string
}
export interface CertGroup { title: string; layout: 'rows' | 'cards'; items: Cert[] }

export const certGroups: CertGroup[] = [
  { title: 'academic', layout: 'rows', items: [
    { icon: 'graduation-cap', title: '4th Year Computer Engineering (In Progress)', org: 'École Supérieure Polytechnique de Douala', year: '2021 — present', badge: 'In Progress' },
    { icon: 'scroll', title: 'BTS — Information Systems Management', org: 'Institut Supérieur Hintel — Mention BIEN', year: '2019 — 2021', badge: 'Diploma' },
    { icon: 'award', title: 'Baccalauréat C — Mathematics & Physics', org: 'Institut Petou II', badge: 'Baccalaureate' },
  ] },
  { title: 'cloud & devops', layout: 'cards', items: [
    { icon: 'certificate', title: 'AWS DevOps Engineer — Professional (Exam Prep)', org: 'Whizlabs', year: 'October 2024', badge: 'Certification', image: '/certs/devops.jpg' },
    { icon: 'certificate', title: 'AWS Fundamentals — Specialization', org: 'Amazon Web Services', year: 'September 2024', badge: 'Certification', image: '/certs/aws_fundamentals.png' },
  ] },
  { title: 'front-end & design', layout: 'cards', items: [
    { icon: 'certificate', title: 'Meta Front-End Developer — Specialization', org: 'Meta / Coursera', year: 'September 2024', badge: 'Certification', image: '/certs/meta_frontend.jpg' },
    { icon: 'certificate', title: 'Microsoft UX Design — Professional Certificate', org: 'Microsoft / Coursera', year: 'August 2024', badge: 'Certification', image: '/certs/microsoft_ux.jpg' },
  ] },
  { title: 'ai & productivity', layout: 'cards', items: [
    { icon: 'certificate', title: 'Prompt Engineering for ChatGPT', org: 'Vanderbilt University / Coursera', year: '2024', badge: 'Certification', image: '/certs/prompt_engineering.png' },
  ] },
]

export const terminalCommands = {
  help: () => [
    { type: 'success', text: 'Available commands:' }, { type: 'blank' },
    { type: 'out', text: '  help       -- show this message' }, { type: 'out', text: '  whoami     -- about me' },
    { type: 'out', text: '  ls         -- list sections' }, { type: 'out', text: '  skills     -- view tech stack' },
    { type: 'out', text: '  works      -- view projects' }, { type: 'out', text: '  certs      -- certificates & degrees' },
    { type: 'out', text: '  contact    -- get in touch' }, { type: 'out', text: '  theme      -- toggle dark / light' },
    { type: 'out', text: '  clear      -- clear terminal' }, { type: 'out', text: '  exit       -- close terminal' },
    { type: 'blank' }, { type: 'comment', text: '// Tab to autocomplete  .  Up/Down for history  .  Esc to close' },
  ],
  whoami: () => [
    { type: 'blank' }, { type: 'success', text: 'Toscani TENEKEU MODJOU' },
    { type: 'out', text: 'Founder of KmerHosting & Full-Stack Developer' }, { type: 'blank' },
    { type: 'comment', text: '// Building reliable products from interface to infrastructure.' }, { type: 'blank' },
  ],
  ls: () => [{ type: 'blank' }, { type: 'out', text: '  skills/   works/   certs/   contact/' }, { type: 'blank' }],
  skills: () => [
    { type: 'blank' }, { type: 'success', text: 'Tech Stack' }, { type: 'blank' },
    { type: 'out', text: '  Front-end     Vue.js . React . Next.js . TypeScript . Tailwind . Fluent UI' },
    { type: 'out', text: '  Back-end      Node.js . Express.js . Django/DRF . PHP . REST . WebSockets' },
    { type: 'out', text: '  Data          MongoDB . MySQL . PostgreSQL . SQLite . Redis . Cassandra' },
    { type: 'out', text: '  DevOps        Linux . Nginx . Docker . GitHub Actions . Certbot' },
    { type: 'out', text: '  Testing       Playwright . Vitest . Supertest' }, { type: 'blank' },
  ],
  works: () => [
    { type: 'blank' }, { type: 'success', text: 'Verified projects' }, { type: 'blank' },
    { type: 'out', text: '  01  KmerHosting                     Next.js . TypeScript . PostgreSQL' },
    { type: 'out', text: '  02  Hosting Platform Starter        Vue.js . Express.js . MongoDB' },
    { type: 'out', text: '  03  Realtime ChatApp                React . Django . WebRTC' },
    { type: 'out', text: '  04  Django Redis Cassandra Chat     Django . Redis . Cassandra' },
    { type: 'out', text: '  05  Inventory Management System     PHP . MySQL . RBAC' },
    { type: 'out', text: '  06  KmerHosting Developer Tools     TypeScript . Node.js . SDK/CLI' },
    { type: 'out', text: '  07  Shrub Online Code Editor        Next.js . Monaco Editor' },
    { type: 'out', text: '  08  Tinyfolio                       React . Fluent UI . Vite' },
    { type: 'out', text: '  09  Audio Transcriber               JavaScript . OpenAI API' },
    { type: 'out', text: '  10  wFileManager                    Work in progress' },
    { type: 'out', text: '  11  Webcpl                          Work in progress' }, { type: 'blank' },
  ],
  certs: () => [
    { type: 'blank' }, { type: 'success', text: 'Credentials' }, { type: 'blank' },
    { type: 'out', text: '  [ongoing]  4th Year Computer Engineering     ESP Douala' },
    { type: 'out', text: '  [diploma]  BTS -- Information Systems Mgmt   Hintel / Mention BIEN' },
    { type: 'out', text: '  [course]   AWS DevOps Engineer Exam Prep     2024' },
    { type: 'out', text: '  [cert]     AWS Fundamentals                  2024' },
    { type: 'out', text: '  [cert]     Meta Front-End Developer          2024' },
    { type: 'out', text: '  [cert]     Microsoft UX Design               2024' },
    { type: 'out', text: '  [cert]     Prompt Engineering                2024' }, { type: 'blank' },
  ],
  contact: () => [
    { type: 'blank' }, { type: 'success', text: 'Contact' }, { type: 'blank' },
    { type: 'out', text: '  Email      hello@toscani.tenekeu.com' },
    { type: 'out', text: '  GitHub     github.com/toscani-tenekeu' },
    { type: 'out', text: '  LinkedIn   linkedin.com/in/toscani-tenekeu' }, { type: 'blank' },
  ],
}
