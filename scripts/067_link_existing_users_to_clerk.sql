-- Link existing users to their Clerk IDs
-- Replace 'clerk_user_id_here' with actual Clerk user IDs from your Clerk dashboard

-- Example for office@aden.md user
-- UPDATE users 
-- SET user_id = 'user_2abc123def456' 
-- WHERE email = 'office@aden.md';

-- Template for linking users:
-- UPDATE users SET user_id = 'CLERK_USER_ID' WHERE email = 'USER_EMAIL';

-- You can also check existing users first:
SELECT id, email, user_id, created_at FROM users ORDER BY created_at DESC;

-- After updating, verify the links:
-- SELECT email, user_id FROM users WHERE user_id IS NOT NULL;
