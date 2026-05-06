const fs = require('fs');
const path = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let d = fs.readFileSync(path, 'utf8');

const tOld = `            ) : (
              <div className="space-y-4">
                 <div className="grid gap-2 border-t border-primary/10 pt-4">
                  <Label>상세 이미지 목록 (일러스트/스케치용)</Label>`;

const tNew = `            ) : formData.category === "work_process" ? (
              <div className="space-y-4 pt-4 border-t border-primary/10">
                <Label>상세 작업 과정 목록 (수평 스크롤)</Label>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x items-stretch">
                  {formData.work_steps && formData.work_steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="min-w-[300px] w-[300px] flex-shrink-0 snap-center rounded-lg border border-primary/20 bg-muted/30 p-4 space-y-4 flex flex-col relative h-[450px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg text-primary">Step {stepIndex + 1}</span>
                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 h-8 px-2" onClick={() => removeWorkStep(stepIndex)}>X</Button>
                      </div>
                      <div className="flex-shrink-0 h-[200px] w-full border border-primary/20 rounded-md relative overflow-hidden bg-background">
                        {step.image_url ? (
                          <div className="w-full h-full relative group">
                            <Image src={step.image_url} alt={\`Step \${stepIndex + 1}\`} fill className="object-contain" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Label className="cursor-pointer text-white text-sm bg-black/50 px-3 py-1 rounded-md">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWorkStepImageUpload(stepIndex, e)} />
                                변경
                              </Label>
                            </div>
                          </div>
                        ) : (
                          <Label className="flex w-full h-full cursor-pointer flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors">
                            <span className="text-3xl text-muted-foreground">+</span>
                            <span className="text-xs text-muted-foreground">이미지 업로드</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleWorkStepImageUpload(stepIndex, e)} />
                          </Label>
                        )}
                      </div>
                      <div className="flex-1 min-h-0 pt-2">
                         <Textarea placeholder="이 단계의 과정을 설명해주세요." value={step.description || ""} onChange={(e) => handleWorkStepChange(stepIndex, e.target.value)} className="w-full h-full resize-none text-sm bg-background/50 border-primary/20 p-3" />
                      </div>
                    </div>
                  ))}
                  <div className="min-w-[300px] w-[300px] flex-shrink-0 snap-center rounded-lg border border-dashed border-primary/30 bg-muted/10 flex items-center justify-center p-4 hover:bg-muted/30 transition-colors h-[450px]">
                    <Button type="button" variant="ghost" className="h-full w-full flex flex-col gap-4 text-muted-foreground hover:text-primary" onClick={() => { const steps = formData.work_steps ? [...formData.work_steps] : []; setFormData({ ...formData, work_steps: [...steps, { image_url: "", description: "" }] }); }}>
                      <span className="text-5xl border border-dashed border-current rounded-full w-16 h-16 flex items-center justify-center mb-2 pb-1">+</span>
                      <span>새 작업 단계 추가</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="grid gap-2 border-t border-primary/10 pt-4">
                  <Label>상세 이미지 목록 (일러스트/스케치용)</Label>`;

d = d.replace(tOld, tNew);

fs.writeFileSync(path, d, 'utf8');
console.log('REPLACING:', d.includes('상세 작업 과정 목록'));
