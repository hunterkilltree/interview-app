CREATE TABLE questions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section             VARCHAR(50)  NOT NULL,
    title               VARCHAR(300) NOT NULL,
    difficulty          VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    leetcode_url        VARCHAR(500) NOT NULL DEFAULT '',
    default_confidence  VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    default_notes       TEXT         NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_section ON questions(section);
CREATE INDEX idx_questions_created ON questions(created_at);

CREATE TABLE docs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section     VARCHAR(50)  NOT NULL,
    title       VARCHAR(300) NOT NULL,
    type        VARCHAR(100) NOT NULL DEFAULT 'Notes from books',
    excerpt     TEXT         NOT NULL DEFAULT '',
    body        TEXT         NOT NULL DEFAULT '',
    has_image   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_section ON docs(section);
CREATE INDEX idx_docs_created ON docs(created_at);

CREATE TABLE question_state (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    confidence  VARCHAR(50),
    notes       TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, question_id)
);

CREATE INDEX idx_question_state_user ON question_state(user_id);
