# Data Storage Guide

## Current Implementation: JSON File Storage

Your app currently uses **JSON file storage** for both user accounts and chat history.

### What's Stored:

1. **User Accounts** (`data/users.json`)
   - Email, hashed password, name, account creation date
   - One file for all users

2. **Chat History** (`data/chats/{userId}.json`)
   - Each user has their own chat history file
   - Stores: question, GPT response, Gemini response, final synthesis, timestamp
   - Automatically saved when user asks a question
   - Automatically loaded when user logs in

### How It Works:

- **When user asks a question:**
  1. Question is sent to AI models
  2. Response is shown to user
  3. Conversation is automatically saved to `data/chats/{userId}.json`

- **When user logs in:**
  1. App loads their chat history from their file
  2. Previous conversations appear automatically
  3. User can continue where they left off

### Pros:
✅ Simple - no database setup needed  
✅ Works immediately  
✅ Good for development and small scale  
✅ Easy to backup (just copy the `data` folder)  
✅ No external dependencies  

### Cons:
❌ Not scalable for many users  
❌ File system can be slow with lots of data  
❌ No advanced queries or filtering  
❌ Not suitable for production at scale  

---

## Alternative: Supabase (Recommended for Production)

If you want to scale your app or need better performance, **Supabase** is a great option.

### Why Supabase?

✅ **PostgreSQL database** - Fast, reliable, scalable  
✅ **Real-time updates** - Chat history syncs across devices  
✅ **Built-in authentication** - Can replace NextAuth if you want  
✅ **Free tier** - Generous free plan for small apps  
✅ **Easy setup** - Great Next.js integration  
✅ **Automatic backups** - Data is safe  

### How to Migrate to Supabase:

#### 1. Create Supabase Account
- Go to [supabase.com](https://supabase.com)
- Create a free account
- Create a new project

#### 2. Set Up Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users table (if not using Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  gpt_response TEXT NOT NULL,
  gemini_response TEXT NOT NULL,
  final_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
```

#### 3. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

#### 4. Create Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 5. Create Supabase Client

Create `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 6. Update Chat Storage

Replace `lib/chatHistory.js` functions with Supabase calls:

```javascript
import { supabase } from './supabase'

export const saveChat = async (userId, conversation) => {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      question: conversation.user,
      gpt_response: conversation.gpt,
      gemini_response: conversation.gemini,
      final_response: conversation.final
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserChats = async (userId) => {
  const { data, error } = await supabase
    .from('chats')
    .where('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

### Migration Checklist:

- [ ] Create Supabase account and project
- [ ] Set up database tables
- [ ] Install Supabase client
- [ ] Add environment variables
- [ ] Update `lib/chatHistory.js` to use Supabase
- [ ] Update `lib/users.js` to use Supabase (optional)
- [ ] Test chat saving and loading
- [ ] Migrate existing data (if any)

---

## Recommendation

**For now (development):** Keep JSON file storage - it works great!

**For production:** Migrate to Supabase when you:
- Have more than 100 users
- Need better performance
- Want real-time features
- Need data analytics
- Want automatic backups

The current JSON implementation is perfect for learning and small-scale use. You can always migrate to Supabase later - the API structure is similar, so it's an easy switch!

