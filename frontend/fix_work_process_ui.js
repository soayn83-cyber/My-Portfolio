const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = \              ) : (
                <div className="space-y-4">
                   <div className="grid gap-2 border-t border-primary/10 pt-4">
                    <Label>상세 이미지 목록 (일러스트/스케치용)</Label>\;

// Using the same layout exactly matching the visual requirements of work process
const newStr = \              ) : formData.category === "work_process" ? (
                <div className="space-y-4">
                  <div className="grid gap-2 border-t border-primary/10 pt-4">
                    <Label>이미지 업로드 (Work Process)</Label>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                      {formData.work_steps && formData.work_steps.map((step, index) => (
                        <div key={index} className="flex-shrink-0 w-[200px] flex flex-col gap-2 snap-center">
                          <div className="relative aspect-square w-full border-2 border-destructive/80 rounded-sm bg-background/50 overflow-hidden group">
                            <Image src={step.image_url} alt={\\\Work step \\\\} fill className="object-cover p-1" />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeWorkStep(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={step.description}
                            onChange={(e) => handleWorkStepChange(index, e.target.value)}
                            placeholder="(작업파트 설명글)"
                            className="text-center border-b-2 border-dashed border-destructive/50 text-destructive font-medium border-x-0 border-t-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-destructive placeholder:text-destructive/50"
                          />
                        </div>
                      ))}
                      
                      <div className="flex-shrink-0 w-[200px] h-[200px] border-2 border-dashed border-primary/30 rounded-sm flex items-center justify-center bg-card hover:bg-primary/5 transition-colors relative snap-center cursor-pointer">
                        <div className="flex flex-col items-center text-primary/50">
                          <Plus className="h-8 w-8 mb-2" />
                          <span className="text-sm font-medium">Add Process Image</span>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          multiple
                          onChange={handleWorkStepImageUpload}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="grid gap-2 border-t border-primary/10 pt-4">
                    <Label>상세 이미지 목록 (일러스트/스케치용)</Label>\;

if (data.includes(targetStr)) {
  data = data.replace(targetStr, newStr);
  fs.writeFileSync(file, data, 'utf8');
  console.log('Work Process UI added!');
} else {
  console.log('Could not find target string for UI update.');
}
