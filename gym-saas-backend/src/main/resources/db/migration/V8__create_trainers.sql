-- V8: Create trainers and trainer_members tables
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    bio TEXT,
    experience_years INT NOT NULL DEFAULT 0,
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    monthly_commission_percentage NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_tenant_user ON trainers(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_trainers_tenant_active ON trainers(tenant_id, is_active);

DROP TRIGGER IF EXISTS update_trainers_updated_at ON trainers;
CREATE TRIGGER update_trainers_updated_at
BEFORE UPDATE ON trainers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS trainer_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_members_unique ON trainer_members(tenant_id, trainer_id, member_id);
CREATE INDEX IF NOT EXISTS idx_trainer_members_trainer ON trainer_members(tenant_id, trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_members_member ON trainer_members(tenant_id, member_id);

DROP TRIGGER IF EXISTS update_trainer_members_updated_at ON trainer_members;
CREATE TRIGGER update_trainer_members_updated_at
BEFORE UPDATE ON trainer_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
