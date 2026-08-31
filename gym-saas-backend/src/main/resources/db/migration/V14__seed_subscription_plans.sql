-- V14: Seed SaaS subscription plans
INSERT INTO subscription_plans (id, code, name, description, price_monthly, price_yearly, max_members, max_staff, features, is_active)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'STARTER',
        'Starter Gym',
        'Ideal for small gyms and single fitness studios up to 100 active members',
        1200.00,
        12000.00,
        100,
        2,
        '{"member_management": true, "attendance": true, "payments": true, "sms_reminders": false, "reports": "BASIC", "custom_branding": false}'::jsonb,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'PRO',
        'Pro Fitness Club',
        'For growing fitness clubs with workout planning, trainer management, and analytics',
        2400.00,
        24000.00,
        300,
        10,
        '{"member_management": true, "attendance": true, "payments": true, "trainers": true, "workout_plans": true, "member_progress": true, "reports": "ADVANCED", "custom_branding": true}'::jsonb,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'ENTERPRISE',
        'Enterprise / Multi-Facility',
        'Unlimited scale, dedicated support, complete reports and exports',
        4800.00,
        48000.00,
        NULL,
        NULL,
        '{"member_management": true, "attendance": true, "payments": true, "trainers": true, "workout_plans": true, "member_progress": true, "reports": "FULL", "custom_branding": true, "priority_support": true, "export_raw_data": true}'::jsonb,
        TRUE
    )
ON CONFLICT (code) DO NOTHING;
