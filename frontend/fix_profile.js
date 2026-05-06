const fs = require('fs');
let txt = fs.readFileSync('components/profile-content.tsx', 'utf8');
const searchString = `          {/* 이력서 항목 (학력 / 경력 / 자격) */}`;
const replaceString = `          {/* Work Links (작품 바로가기) */}
          {profile?.work_links && profile.work_links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 mb-16 w-full max-w-4xl"
            >
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-6 mb-4 w-full">
                  <div className="h-px w-full bg-primary/20"></div>
                  <h2 className="text-xl font-serif text-foreground whitespace-nowrap tracking-wide px-4">
                    Works
                  </h2>
                  <div className="h-px w-full bg-primary/20"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 group">
                  {profile.work_links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm"
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <span className="font-bold text-base text-foreground transition-colors">{link.title}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-background text-primary border border-primary/10 whitespace-nowrap">{link.role}</span>
                      </div>
                      <p className="text-sm text-foreground/70">{link.episodes}</p>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 이력서 항목 (학력 / 경력 / 자격) */}`;

txt = txt.replace(searchString, replaceString);
fs.writeFileSync('components/profile-content.tsx', txt, 'utf8');
console.log('done')