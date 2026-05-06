const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetBefore = \  const handleSave = async () => {\;
const fns = \  const handleWorkStepImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setIsLoading(true)
    try {
      const newSteps: WorkStep[] = []
      const supabase = createClient()
      
      for (const file of Array.from(files)) {
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) throw new Error(\\\파일 (\) 크기가 50MB 초과!\\\)
        const fileExt = file.name.split('.').pop() || "png"
        const fileName = \\\\-\.\\\\
        
        const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file, { upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName)
        newSteps.push({ image_url: publicUrlData.publicUrl, description: "" })
      }
      setFormData(prev => ({ ...prev, work_steps: [...(prev.work_steps || []), ...newSteps] }))
    } catch (error: any) {
      console.error("Upload error:", error)
      alert("작업 이미지 업로드 실패: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const removeWorkStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      work_steps: (prev.work_steps || []).filter((_, i) => i !== index)
    }))
  }

  const handleWorkStepChange = (index: number, description: string) => {
    setFormData(prev => {
      const newSteps = [...(prev.work_steps || [])]
      newSteps[index] = { ...newSteps[index], description }
      return { ...prev, work_steps: newSteps }
    })
  }

\;

if (data.includes(targetBefore) && !data.includes('handleWorkStepImageUpload')) {
  data = data.replace(targetBefore, fns + targetBefore);
  fs.writeFileSync(file, data, 'utf8');
  console.log('Fns updated');
} else {
  console.log('Target not found or already has handleWorkStepImageUpload');
}
