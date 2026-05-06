const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (k) => env.split('\n').find(l => l.startsWith(k)).split('=')[1].trim();

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

fetch(`${url}/rest/v1/posts?select=*`, {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
})
.then(r => r.json())
.then(d => {
    console.log(d.length ? `Found ${d.length} posts` : 'No posts');
    if(d.length) console.log(d);
});
