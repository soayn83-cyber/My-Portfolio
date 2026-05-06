const fs = require('fs');
let file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/webtoon-list.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr = \</p>
                )}
              </div>
            </div>\;

const replaceStr = \</p>
                )}
                {post.keywords && (
                  <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-primary/10">
                    {post.keywords.split(/[, ]+/).filter(k => k).map((keyword, idx) => {
                      const cleanKeyword = keyword.startsWith('#') ? keyword : \\\#\\\\;
                      return (
                        <span key={idx} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground">
                          {cleanKeyword}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>\;

if (data.includes(targetStr)) {
  data = data.replace(targetStr, replaceStr);
  
  // also update the outer div inside webtoon-list if needed
  data = data.replace(\<div className="flex-1 rounded-lg border border-primary/20 p-4 bg-background/50">\, \<div className="flex-1 flex flex-col rounded-lg border border-primary/20 p-4 bg-background/50">\);

  fs.writeFileSync(file, data, 'utf8');
  console.log('Successfully updated webtoon-list.tsx');
} else {
  console.log('Target string not found in file!');
}
