-- ============================================================
-- SUPABASE SETUP — IAT Quiz + Teste A/B
-- Cole esse SQL no Supabase → SQL Editor → Run
-- ============================================================

-- 1. Sessões do quiz (visitas)
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  text NOT NULL,
  utm_source  text, utm_medium text, utm_campaign text,
  utm_content text, utm_term   text, utm_id       text,
  screen      text, viewport   text, platform     text,
  created_at  timestamptz DEFAULT now()
);

-- 2. Eventos do quiz (step views, respostas, completions)
CREATE TABLE IF NOT EXISTS quiz_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  text NOT NULL,
  event_type  text NOT NULL,
  step        int,
  answer      text,
  created_at  timestamptz DEFAULT now()
);

-- 3. Visitas do teste A/B
CREATE TABLE IF NOT EXISTS ab_visits (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  text NOT NULL,
  variant     text NOT NULL,  -- 'quiz' ou 'lp'
  utm_source  text, utm_medium text, utm_campaign text,
  utm_content text, utm_term   text, utm_id       text,
  screen      text, viewport   text, platform     text,
  created_at  timestamptz DEFAULT now()
);

-- 4. Eventos de conversão A/B (cliques no checkout + compras)
CREATE TABLE IF NOT EXISTS ab_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  text NOT NULL,
  variant     text NOT NULL,  -- 'quiz', 'lp' ou 'unknown'
  event_type  text NOT NULL,  -- 'checkout_click' ou 'purchase'
  email       text,           -- email do comprador (preenchido via webhook Hotmart)
  created_at  timestamptz DEFAULT now()
);

-- Adiciona coluna email se a tabela já existir
ALTER TABLE ab_events ADD COLUMN IF NOT EXISTS email text;

-- 5. Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_quiz_events_session  ON quiz_events  (session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_events_type     ON quiz_events  (event_type);
CREATE INDEX IF NOT EXISTS idx_ab_visits_variant    ON ab_visits    (variant);
CREATE INDEX IF NOT EXISTS idx_ab_visits_created    ON ab_visits    (created_at);
CREATE INDEX IF NOT EXISTS idx_ab_events_variant    ON ab_events    (variant);
CREATE INDEX IF NOT EXISTS idx_ab_events_type       ON ab_events    (event_type);

-- 6. Desabilita RLS (anon key pode ler e escrever)
ALTER TABLE quiz_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_events   DISABLE ROW LEVEL SECURITY;
ALTER TABLE ab_visits     DISABLE ROW LEVEL SECURITY;
ALTER TABLE ab_events     DISABLE ROW LEVEL SECURITY;
