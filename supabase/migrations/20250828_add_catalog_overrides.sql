-- Add catalog_overrides column to client_app_overrides table
-- This stores plan-specific overrides like title, includes, and priceBand

ALTER TABLE client_app_overrides 
ADD COLUMN IF NOT EXISTS catalog_overrides JSONB DEFAULT '{}'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_client_app_overrides_catalog_overrides 
ON client_app_overrides USING gin(catalog_overrides);

-- Add column comment
COMMENT ON COLUMN client_app_overrides.catalog_overrides IS 'Plan-specific overrides keyed by plan ID containing title, includes, and priceBand';

-- Example structure:
-- {
--   "foundation": {
--     "title": "Starter Package",
--     "includes": ["Custom item 1", "Custom item 2"],
--     "priceBand": "$1,000 - $3,000"
--   },
--   "growth": {
--     "priceBand": "$5,000 - $10,000"
--   }
-- }