-- V5: Create memberships table with plan snapshot & freeze tracking
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_duration_days INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    original_end_date DATE NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    freeze_start_date DATE,
    freeze_end_date DATE,
    total_frozen_days INT NOT NULL DEFAULT 0,
    previous_membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memberships_tenant_member ON memberships(tenant_id, member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_status ON memberships(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_end_date ON memberships(tenant_id, end_date);

-- Partial index for fast expiry queries
CREATE INDEX IF NOT EXISTS idx_memberships_expiry_dashboard
    ON memberships(tenant_id, status, end_date)
    WHERE status IN ('ACTIVE', 'EXPIRING_SOON');

DROP TRIGGER IF EXISTS update_memberships_updated_at ON memberships;
CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON memberships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
