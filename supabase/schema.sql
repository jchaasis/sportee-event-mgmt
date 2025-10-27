-- Sportee Database Schema
-- This file contains the complete database schema for the Sportee application
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members (junction table between users and organizations)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    capacity INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sport_type TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event-Venue junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, venue_id)
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_venues_event_id ON event_venues(event_id);
CREATE INDEX IF NOT EXISTS idx_event_venues_venue_id ON event_venues(venue_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert new organizations (when signing up)
CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (true);

-- ============================================
-- ORGANIZATION MEMBERS POLICIES
-- ============================================

-- Users can view their own membership records
CREATE POLICY "Users can view their memberships"
    ON organization_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert new memberships (when signing up or invited)
CREATE POLICY "Users can create memberships"
    ON organization_members FOR INSERT
    WITH CHECK (user_id = auth.uid() OR true);

-- ============================================
-- VENUES POLICIES
-- ============================================

-- Venues are publicly readable (any authenticated user)
CREATE POLICY "Authenticated users can view venues"
    ON venues FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can create venues
CREATE POLICY "Authenticated users can create venues"
    ON venues FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Users can update venues they create or that are in their organization
CREATE POLICY "Users can update venues"
    ON venues FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Users can view events for organizations they belong to
CREATE POLICY "Users can view their organization events"
    ON events FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Users can create events for their organizations
CREATE POLICY "Users can create events"
    ON events FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

-- Users can update events they created
CREATE POLICY "Users can update their events"
    ON events FOR UPDATE
    USING (created_by = auth.uid());

-- Users can delete events they created
CREATE POLICY "Users can delete their events"
    ON events FOR DELETE
    USING (created_by = auth.uid());

-- ============================================
-- EVENT_VENUES POLICIES
-- ============================================

-- Users can view event_venues for events they can see
CREATE POLICY "Users can view event venues"
    ON event_venues FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events
            WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can create event-venue associations for events they created
CREATE POLICY "Users can create event venues"
    ON event_venues FOR INSERT
    WITH CHECK (
        event_id IN (
            SELECT id FROM events WHERE created_by = auth.uid()
        )
    );

-- Users can delete event-venue associations for events they created
CREATE POLICY "Users can delete event venues"
    ON event_venues FOR DELETE
    USING (
        event_id IN (
            SELECT id FROM events WHERE created_by = auth.uid()
        )
    );

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on venues
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on events
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TEST DATA (Optional - for development)
-- ============================================

-- Uncomment to insert test data
/*
-- Insert test venues
INSERT INTO venues (name, address, capacity) VALUES
    ('Stadium A', '123 Main St', 5000),
    ('Stadium B', '456 Oak Ave', 3000),
    ('Arena C', '789 Pine Rd', 2000),
    ('Field D', '321 Elm Dr', 1000),
    ('Hall E', '654 Maple Ln', 500);

-- Note: You'll need to insert test organizations, users, and events after authentication is set up
*/

