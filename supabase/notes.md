# Supabase Notes

## Frequently Filtered Columns

- `users.email`
- `users.created_at`
- `posts.user_id`
- `posts.created_at`
- `posts.status`
- `comments.post_id`
- `comments.created_at`

**Note:** Add BTREE indexes on these columns.

## Schema Changes

Use `supabase migration new <name>` for schema changes.
