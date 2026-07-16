-- Interview Prep App — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile on signup, carrying over full_name from metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============ QUESTIONS (global content) ============
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid (),
  section text not null,
  title text not null,
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  leetcode text not null default '',
  default_confidence text not null default 'Medium' check (default_confidence in ('Low', 'Medium', 'High')),
  default_notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Questions readable by authenticated users"
  on public.questions for select
  to authenticated
  using (true);

create policy "Questions writable by admins"
  on public.questions for all
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

-- ============ DOCS (knowledge base, global content) ============
create table if not exists public.docs (
  id uuid primary key default gen_random_uuid (),
  section text not null,
  title text not null,
  type text not null default 'Notes from books',
  excerpt text not null default '',
  body text not null default '',
  has_image boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.docs enable row level security;

create policy "Docs readable by authenticated users"
  on public.docs for select
  to authenticated
  using (true);

create policy "Docs writable by admins"
  on public.docs for all
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

-- ============ PER-USER QUESTION STATE ============
create table if not exists public.question_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  confidence text check (confidence in ('Low', 'Medium', 'High')),
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

alter table public.question_state enable row level security;

create policy "Users manage their own question state"
  on public.question_state for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============ SEED CONTENT (from the design prototype) ============
insert into public.questions (section, title, difficulty, leetcode, default_confidence, default_notes) values
('coding', 'Two Sum', 'Easy', 'https://leetcode.com/problems/two-sum/', 'High', 'Classic hashmap lookup. O(n) time, O(n) space. Remember the complement trick.'),
('coding', 'Longest Substring Without Repeating Characters', 'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Medium', 'Sliding window + set. Watch off-by-one on window shrink.'),
('coding', 'Merge k Sorted Lists', 'Hard', 'https://leetcode.com/problems/merge-k-sorted-lists/', 'Low', 'Revisit heap-based approach, forgot priority queue comparator syntax.');

insert into public.docs (section, title, type, has_image, excerpt, body) values
('coding', 'Big-O Cheat Sheet', 'Notes from books', false, 'Quick reference for common time/space complexities across data structures.', E'A condensed reference I keep coming back to before interviews.\n\nArrays: access O(1), search O(n), insert/delete O(n).\nHash tables: average O(1) for get/set, worst case O(n).\nBalanced BSTs: O(log n) for search/insert/delete.\nHeaps: O(log n) insert/extract, O(1) peek.\n\nRule of thumb: if the interviewer says "as fast as possible", they usually want you to name the hashmap trade-off first, then justify it.'),
('coding', 'Amazon Onsite — Coding Round Debrief', 'Real interview experience', false, 'What I was actually asked and how the conversation went.', E'Got a graph traversal question disguised as a "delivery route" problem. Interviewer cared more about how I clarified constraints than the final code.\n\nWhat worked: restating the problem out loud, sketching the graph on the shared doc before writing any code, narrating trade-offs as I went.\n\nWhat I would change: I jumped to DFS too fast — should have asked about graph size first, since BFS with early exit was the better fit for their constraints.'),
('sysdesign', 'Designing for 10x Read Traffic', 'Best practices', false, 'A framework for reasoning about caching layers under interview time pressure.', E'Start from the access pattern, not the tech. Steps I use:\n\n1. Estimate read:write ratio.\n2. Identify hot keys / celebrity problem.\n3. Pick a cache tier (CDN, app-local, distributed) per layer.\n4. Talk explicitly about invalidation — this is what separates strong answers from average ones.\n\nInterviewers consistently reward naming the invalidation strategy before being asked.'),
('sysdesign', 'Rate Limiter Design Notes', 'Personal thoughts and solutions', true, 'Token bucket vs sliding window log, and how I sketch it on a whiteboard.', E'Two approaches I default to:\n\nToken bucket: fixed refill rate, allows bursts up to bucket size. Simple to reason about, easy to distribute with Redis (INCR + TTL).\n\nSliding window log: exact but memory-heavy at scale — store timestamps per key.\n\nI usually draw the bucket + refill arrow first, then discuss where the counter lives (local vs shared Redis) since that is usually the follow-up.'),
('microservices', 'Saga Pattern & Compensating Transactions', 'Notes from books', true, 'Choreography vs orchestration, and when each one falls apart.', E'Choreography: each service listens for events and reacts — no central brain, but harder to trace failure paths past 4-5 services.\n\nOrchestration: a saga coordinator drives the steps explicitly — easier to reason about and retry, but becomes a single point of design complexity.\n\nCompensating transactions are the part people forget to mention: every forward step needs an explicit undo, and undos are not always symmetric (e.g. "cancel shipment" after it already left the warehouse).'),
('k8s', 'Debugging CrashLoopBackOff', 'Personal thoughts and solutions', false, 'My checklist for the most common pod failure state.', E'Order I check things in:\n\n1. kubectl logs --previous\n2. kubectl describe pod for events\n3. Resource limits — OOMKilled shows up here\n4. Liveness probe too aggressive?\n\nNine times out of ten it is either a bad env var or a probe that fires before the app finishes booting.'),
('k8s', 'Rolling Update vs Recreate', 'Best practices', true, 'Deployment strategies and how maxSurge/maxUnavailable actually behave.', E'RollingUpdate: new pods come up alongside old ones. maxSurge controls how many extra pods above desired count; maxUnavailable controls how many can be down mid-rollout. Tune both down to 0/1 for strict zero-downtime.\n\nRecreate: kills all old pods before creating new ones — simple, but guarantees downtime. Only reach for it when the app cannot run two versions side by side (e.g. shared schema migration mid-deploy).'),
('aws', 'S3 Consistency & Common Gotchas', 'Notes from books', false, 'What changed in 2020 and what still trips people up in interviews.', E'S3 has offered strong read-after-write consistency since December 2020 — for both new object PUTs and overwrite PUTs/DELETEs. Before that, overwrites were eventually consistent, which is still the "gotcha" answer a lot of guides expect.\n\nStill worth mentioning in an interview: consistency doesn''t solve races between two concurrent writers — last writer wins, so you still need application-level locking for that case.'),
('java', 'Why HashMap Iteration Order Isn''t Guaranteed', 'Notes from books', false, 'Effective Java notes on collection contracts.', E'HashMap makes no ordering guarantee — bucket placement depends on hashCode() and current capacity. If you need order, reach for LinkedHashMap (insertion order) or TreeMap (sorted).\n\nCode example:\n\nMap<String,Integer> m = new LinkedHashMap<>();\nm.put("b",2); m.put("a",1);\n// iterates b, a — insertion order preserved'),
('spring', 'Bean Lifecycle & Scopes', 'Personal thoughts and solutions', true, 'The order @PostConstruct, constructor injection, and BeanPostProcessors actually run in.', E'Singleton (default) vs prototype: singleton beans are created once per container and cached; prototype beans are created fresh on every lookup — Spring will not manage their destruction for you.\n\nLifecycle order I always forget until I draw it: constructor -> dependency injection -> BeanPostProcessor.postProcessBeforeInitialization -> @PostConstruct -> postProcessAfterInitialization -> bean ready -> @PreDestroy on shutdown (singleton only).'),
('frontend', 'Server Components Mental Model', 'Personal thoughts and solutions', false, 'How I explain RSC in interviews without hand-waving.', E'The framing that finally clicked for me: server components render to a serialized tree on the server and ship zero JS for that subtree. Client components are the interactive islands.\n\nCommon interview trap: being asked to fetch data in a client component when a server component would remove a network waterfall entirely.');

-- ============ MAKE YOURSELF ADMIN ============
-- After signing up in the app, run (replace with your email):
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
