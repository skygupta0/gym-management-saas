-- V3: Create members table with full-text GIN search
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    member_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    mobile VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    date_of_birth DATE,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    blood_group VARCHAR(10),
    medical_conditions TEXT,
    address TEXT,
    photo_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_tenant_code ON members(tenant_id, member_code);
CREATE INDEX IF NOT EXISTS idx_members_tenant_status ON members(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_members_tenant_mobile ON members(tenant_id, mobile);

-- GIN full-text index across name, mobile, email
CREATE INDEX IF NOT EXISTS idx_members_search ON members
    USING gin(to_tsvector('english',
        coalesce(first_name, '') || ' ' ||
        coalesce(last_name, '') || ' ' ||
        coalesce(mobile, '') || ' ' ||
        coalesce(email, '')
    ));

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
