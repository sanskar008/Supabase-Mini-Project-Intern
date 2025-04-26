# Custom Notes Service - Supabase Mini Project

This is a simple backend service for a personal notes app using Supabase Edge Functions.

## Project Structure

```
.
├── functions/
│   ├── post_notes.js
│   └── get_notes.js
├── schema.sql
└── README.md
```

## Setup and Deployment

1. Create a Supabase project.
2. Run `schema.sql` in the SQL editor.
3. Enable Edge Functions.
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy functions:
   ```bash
   supabase functions deploy post_notes
   supabase functions deploy get_notes
   ```
6. Enable Row Level Security (RLS) and create policies.

## Schema Design

**schema.sql**

```sql
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_at timestamp with time zone DEFAULT now()
);
```

### Why This Schema

- UUID for unique ID.
- user_id links notes to users.
- title required for quick identification.
- content optional.
- created_at for timestamps.

## Edge Functions

### post_notes.js

Handles POST /notes to create a new note.

```javascript
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const { title, content } = await req.json();
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content, user_id: req.headers.get("x-user-id") }])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### get_notes.js

Handles GET /notes to fetch notes for the user.

```javascript
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const userId = req.headers.get("x-user-id");
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## CURL Commands

### Create a New Note

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/post_notes \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{"title": "First Note", "content": "Sample content"}'
```

### Fetch All Notes

```bash
curl -X GET https://your-project-ref.supabase.co/functions/v1/get_notes \
  -H "x-user-id: YOUR_USER_ID"
```
