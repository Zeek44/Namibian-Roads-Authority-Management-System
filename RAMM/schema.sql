CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  access_token TEXT,
  expires_at BIGINT,
  refresh_token TEXT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS auth_verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('admin', 'inspector', 'contractor', 'viewer')),
  organization TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type_id UUID REFERENCES asset_types(id),
  description TEXT,
  address TEXT,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  condition_rating INTEGER DEFAULT 3 CHECK (condition_rating BETWEEN 1 AND 5),
  construction_date DATE,
  last_maintenance_date DATE,
  maintenance_interval_months INTEGER DEFAULT 12,
  photos JSONB DEFAULT '[]',
  metadata JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'decommissioned')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id TEXT NOT NULL UNIQUE,
  asset_id UUID REFERENCES assets(id),
  inspector_id UUID REFERENCES users(id),
  inspection_date TIMESTAMPTZ DEFAULT NOW(),
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
  findings TEXT,
  recommendations TEXT,
  photos JSONB DEFAULT '[]',
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  weather_conditions TEXT,
  inspection_type TEXT DEFAULT 'routine' CHECK (inspection_type IN ('routine', 'emergency', 'follow_up', 'initial')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id TEXT NOT NULL UNIQUE,
  asset_id UUID REFERENCES assets(id),
  inspection_id UUID REFERENCES inspections(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  work_type TEXT NOT NULL,
  estimated_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  contractor_id UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  scheduled_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected')),
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  completion_photos JSONB DEFAULT '[]',
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO asset_types (name, description, icon, color) VALUES ('Road', 'Paved and unpaved roads', 'road', '#3B82F6') ON CONFLICT (name) DO NOTHING;

INSERT INTO asset_types (name, description, icon, color) VALUES ('Bridge', 'Bridges and overpasses', 'bridge', '#EF4444') ON CONFLICT (name) DO NOTHING;

INSERT INTO asset_types (name, description, icon, color) VALUES ('Culvert', 'Drainage culverts', 'droplet', '#06B6D4') ON CONFLICT (name) DO NOTHING;

INSERT INTO asset_types (name, description, icon, color) VALUES ('Sign', 'Traffic and road signs', 'sign', '#F59E0B') ON CONFLICT (name) DO NOTHING;

INSERT INTO asset_types (name, description, icon, color) VALUES ('Guardrail', 'Safety barriers and guardrails', 'shield', '#10B981') ON CONFLICT (name) DO NOTHING;

INSERT INTO asset_types (name, description, icon, color) VALUES ('Traffic Light', 'Traffic signal systems', 'traffic-cone', '#8B5CF6') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, role, organization) VALUES ('Admin User', 'admin@ramms.gov.na', 'admin', 'NRA Head Office') ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, role, organization) VALUES ('John Inspector', 'john@ramms.gov.na', 'inspector', 'NRA Northern Region') ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, role, organization) VALUES ('Sarah Contractor', 'sarah@roadworks.com.na', 'contractor', 'Namibia Roadworks Ltd') ON CONFLICT (email) DO NOTHING;
