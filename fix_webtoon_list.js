const fs = require('fs');
let content = fs.readFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/webtoon-list.tsx', 'utf8');

const regex = /{/\* Logline \/ Description Box \*/}[\s\S]*?(<\/div>)/;
const replacement = {/* Logline / Description Box */}
              <div className="flex-1 flex flex-col rounded-lg border border-primary/20 p-4 bg-background/50">
                {post.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground/50 italic">설명이 없습니다.</p>
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
              </div>;

content = content.replace(regex, replacement);
fs.writeFileSync('C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/webtoon-list.tsx', content, 'utf8');
console.log('updated WebtoonList with keywords!');
