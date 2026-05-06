const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Interface update
data = data.replace('export interface EpisodeLink', 'export interface WorkStep {\n  image_url: string\n  description: string\n}\n\nexport interface EpisodeLink');
data = data.replace('production_date?: string | null', 'production_date?: string | null\n  work_steps?: WorkStep[] | null');

// 2. Initial state modifications
data = data.replaceAll('production_date: null', 'production_date: null,\n      work_steps: []');

// 3. handleSave update
const insertWorkStepsToDB = \          production_date: formData.production_date || null
        }\
const updatedInsertWorkStepsToDB = \          production_date: formData.production_date || null,
          work_steps: formData.work_steps || null
        }\
data = data.replace(insertWorkStepsToDB, updatedInsertWorkStepsToDB);

fs.writeFileSync(file, data, 'utf8');
console.log('posts-manager updated structural properties');
