-- V9: Create workout_plans and workout_exercises tables
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    goal VARCHAR(100),
    difficulty_level VARCHAR(50) DEFAULT 'BEGINNER',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_tenant_member ON workout_plans(tenant_id, member_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_tenant_active ON workout_plans(tenant_id, is_active);

DROP TRIGGER IF EXISTS update_workout_plans_updated_at ON workout_plans;
CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON workout_plans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(100),
    sets INT NOT NULL DEFAULT 3,
    reps VARCHAR(50) NOT NULL DEFAULT '10-12',
    target_weight_kg NUMERIC(6, 2),
    rest_seconds INT DEFAULT 60,
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_plan ON workout_exercises(workout_plan_id, day_of_week);

DROP TRIGGER IF EXISTS update_workout_exercises_updated_at ON workout_exercises;
CREATE TRIGGER update_workout_exercises_updated_at
BEFORE UPDATE ON workout_exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
