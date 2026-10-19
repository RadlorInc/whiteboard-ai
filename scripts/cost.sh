#!/bin/sh
# Cost per video by prompt version on the LOCAL stack (sql/cost-by-version.sql). Production: paste the same file into
# the Supabase SQL editor (agents never query production).
exec docker exec -i supabase_db_whiteboard-ai psql -U postgres -d postgres -P pager=off < "$(dirname "$0")/../sql/cost-by-version.sql"
