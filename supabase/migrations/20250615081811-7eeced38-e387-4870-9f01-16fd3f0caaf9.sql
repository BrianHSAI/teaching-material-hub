
-- Migration: Opret tabel til OTP-koder for delingslinks
create table if not exists shared_link_otps (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    otp_code text not null,
    share_type text not null, -- 'file' eller 'folder'
    share_id text not null,   -- id på fil eller mappe
    expires_at timestamptz not null,
    used boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_shared_link_otp_email_share ON shared_link_otps (email, share_type, share_id, otp_code, used, expires_at);
