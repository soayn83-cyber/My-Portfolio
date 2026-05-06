const fs = require('fs');
let content = fs.readFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx', 'utf8');
content = content.replace(/pdf_url: null\s+\}\)/g, 'pdf_url: null,\n      keywords: null\n    })');
fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx', content, 'utf8');
console.log('Fixed pdf_url multiple matches')
