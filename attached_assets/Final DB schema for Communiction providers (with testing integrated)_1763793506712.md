You’re right to push for “not half cooked”. Let’s bake testing *into* the model + UI instead of as an afterthought.

Below is a **full refresh**:

1. Final **DB schema** (with testing fields integrated).

2. Single **self-contained HTML5**:
   
   - Provider list
   
   - Create/Edit with **Production / Sandbox tabs**
   
   - Testing hooks (test destination + last test status) in the env panels
   
   - “Test configuration” modal
   
   - “Delete provider” modal  
     All buttons square, layout clean and not cluttered.

---

## 1. Final DB schema (with testing integrated)

### 1.1 `communication_providers`

```sql
CREATE TABLE communication_providers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,          -- e.g. "Twilio"
    code            VARCHAR(50)  NOT NULL UNIQUE,   -- e.g. "TWILIO"
    description     TEXT,

    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 1.2 `communication_provider_environments`

(PROD / SANDBOX + testing metadata)

```sql
CREATE TABLE communication_provider_environments (
    id                  BIGSERIAL PRIMARY KEY,
    provider_id         BIGINT NOT NULL
                            REFERENCES communication_providers(id)
                            ON DELETE CASCADE,

    env_type            VARCHAR(20) NOT NULL, -- 'PROD' or 'SANDBOX'

    base_url            VARCHAR(255) NOT NULL,
    api_version         VARCHAR(50),

    request_format      VARCHAR(20) NOT NULL DEFAULT 'JSON', -- JSON | XML | FORM
    response_format     VARCHAR(20) NOT NULL DEFAULT 'JSON', -- JSON | XML
    default_method      VARCHAR(10) NOT NULL DEFAULT 'POST', -- POST | GET

    request_timeout_ms  INTEGER NOT NULL DEFAULT 10000,
    max_retries         INTEGER NOT NULL DEFAULT 2,
    rate_limit_per_sec  INTEGER,   -- NULL = no app-level throttle

    -- Testing-related
    test_destination    VARCHAR(50),           -- controlled test phone/email
    last_test_at        TIMESTAMPTZ,
    last_test_status    VARCHAR(20),           -- 'SUCCESS' | 'FAILED'
    last_test_error     TEXT,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_default_for_env  BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT env_type_chk CHECK (env_type IN ('PROD','SANDBOX')),
    CONSTRAINT provider_env_unique UNIQUE (provider_id, env_type)
);
```

---

### 1.3 `communication_provider_auth`

```sql
CREATE TABLE communication_provider_auth (
    id                      BIGSERIAL PRIMARY KEY,
    environment_id          BIGINT NOT NULL
                                REFERENCES communication_provider_environments(id)
                                ON DELETE CASCADE,

    auth_type               VARCHAR(30) NOT NULL,
    -- 'BASIC' | 'API_KEY' | 'BEARER_TOKEN'

    account_id              VARCHAR(120),  -- e.g. Twilio Account SID
    region                  VARCHAR(50),   -- 'us1', 'eu1', etc.

    username                TEXT,
    password_encrypted      TEXT,          -- password / auth token (encrypted)

    api_key_encrypted       TEXT,
    api_secret_encrypted    TEXT,

    access_token_encrypted  TEXT,          -- bearer token

    extra_json              JSONB,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT auth_type_chk CHECK (auth_type IN ('BASIC','API_KEY','BEARER_TOKEN'))
);
```

---

### 1.4 `communication_provider_channel_config`

```sql
CREATE TABLE communication_provider_channel_config (
    id                          BIGSERIAL PRIMARY KEY,
    environment_id              BIGINT NOT NULL
                                    REFERENCES communication_provider_environments(id)
                                    ON DELETE CASCADE,

    channel_type                VARCHAR(30) NOT NULL,
    -- 'SMS' | 'WHATSAPP' | 'EMAIL'

    default_sender              VARCHAR(120),      -- phone/email/alpha sender
    long_message_policy         VARCHAR(20) NOT NULL DEFAULT 'SPLIT',
    -- 'SPLIT' | 'TRUNCATE' | 'ERROR'

    messaging_service_id        VARCHAR(120),      -- e.g. Twilio Messaging SID
    whatsapp_business_number    VARCHAR(50),
    whatsapp_template_namespace VARCHAR(120),

    config_json                 JSONB,

    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT channel_type_chk CHECK (channel_type IN ('SMS','WHATSAPP','EMAIL'))
);
```

---

### 1.5 `communication_provider_webhooks`

```sql
CREATE TABLE communication_provider_webhooks (
    id                      BIGSERIAL PRIMARY KEY,
    environment_id          BIGINT NOT NULL
                                REFERENCES communication_provider_environments(id)
                                ON DELETE CASCADE,

    event_type              VARCHAR(50) NOT NULL,
    -- 'INBOUND_MESSAGE' | 'DELIVERY_STATUS' | 'WHATSAPP_STATUS' | 'GENERIC'

    url                     VARCHAR(255) NOT NULL,
    http_method             VARCHAR(10) NOT NULL DEFAULT 'POST',

    inbound_auth_type       VARCHAR(30) NOT NULL DEFAULT 'SIGNATURE',
    -- 'SIGNATURE' | 'TOKEN' | 'IP_WHITELIST' | 'NONE'

    signing_secret_encrypted TEXT,
    token_encrypted          TEXT,
    allowed_ips              TEXT,     -- comma-separated or JSON if you prefer

    is_active               BOOLEAN NOT NULL DEFAULT TRUE,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

That’s enough for providers, environments, auth, channels, webhooks **and** integrated testing (destinations + last test status).

---


