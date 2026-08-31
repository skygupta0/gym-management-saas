-- V10: Create member_progress table for body measurements & progress tracking
CREATE TABLE IF NOT EXISTS member_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight_kg NUMERIC(5, 2),
    height_cm NUMERIC(5, 2),
    bmi NUMERIC(5, 2),
    body_fat_percentage NUMERIC(5, 2),
    chest_inches NUMERIC(5, 2),
    waist_inches NUMERIC(5, 2),
    hips_inches NUMERIC(5, 2),
    biceps_inches NUMERIC(5, 2),
    thighs_inches NUMERIC(5, 2),
    photo_front_url TEXT,
    photo_side_url TEXT,
    photo_back_url TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_member_progress_member_date ON member_progress(tenant_id, member_id, recorded_date);

DROP TRIGGER IF EXISTS update_member_progress_updated_at ON member_progress;
CREATE TRIGGER update_member_progress_updated_at
BEFORE UPDATE ON member_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
