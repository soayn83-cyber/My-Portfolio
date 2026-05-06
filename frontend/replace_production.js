const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Add to interface Post
data = data.replace('keywords?: string | null', 'keywords?: string | null\n  production_date?: string | null');

// 2. Add to setFormData initializers (4 places)
data = data.replaceAll('keywords: null', 'keywords: null,\n      production_date: null');

// 3. Add to handleSave
data = data.replace('keywords: formData.keywords || null', 'keywords: formData.keywords || null,\n        production_date: formData.production_date || null');

// 4. Add UI input (below keywords)
const targetUI = \                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <div className="space-y-2">\;
const replaceUI = \                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <div className="space-y-2">
                    <Label htmlFor="production_date">제작시기 (선택사항)</Label>
                    <Input
                      id="production_date"
                      value={formData.production_date || ""}
                      onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                      placeholder="예: 2023.01 ~ 2023.06"
                      className="border-primary/20 bg-background/50 focus-visible:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">\;
if (data.includes(targetUI)) {
  data = data.replace(targetUI, replaceUI);
  fs.writeFileSync(file, data, 'utf8');
  console.log('posts-manager updated!');
} else {
  console.log('UI not found!');
  // Let's print out what is near keywords input
  console.log(data.match(/<Label htmlFor="keywords">.*?<\/div>\n\s*<div className="space-y-4 pt-4 border-t border-primary\/10">/s)?.[0] || 'Regex failed to find keywords UI block');
}
