const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = \      for (const file of Array.from(files)) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })
        
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Upload failed")
        urls.push(data.url)
      }\;

const replaceStr = \      const supabase = createClient()
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop() || "png"
        const fileName = \\\\-\.\\\\
        
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false
          })

        if (uploadError) throw new Error(uploadError.message || "Upload failed")

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName)
          
        urls.push(publicUrlData.publicUrl)
      }\;

if (data.includes(targetStr)) {
  data = data.replaceAll(targetStr, replaceStr);
  fs.writeFileSync(file, data, 'utf8');
  console.log('Successfully updated uploads in posts-manager.tsx');
} else {
  console.log('Target string not found!');
  // print context to debug
  console.log(data.substring(data.indexOf('for (const file of Array.from(files))'), data.indexOf('for (const file of Array.from(files))') + 500));
}
