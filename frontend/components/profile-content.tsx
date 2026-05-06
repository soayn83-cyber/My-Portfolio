"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"

export interface ProfileItem {
  date: string
  content: string
}

export interface WorkLink {
  title: string
  episodes: string
  role: string
  url: string
}

export interface Profile {
  id: string
  name: string | null
  bio: string | null
  profile_image_url: string | null
  contact_email: string | null
  social_links: Record<string, string> | null
  experience: ProfileItem[] | null
  certifications: ProfileItem[] | null
  education: ProfileItem[] | null
  work_links: WorkLink[] | null
}

interface ProfileContentProps {
  profile: Profile | null
}

export function ProfileContent({ profile }: ProfileContentProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy email", err)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center w-full"
      >
        {/* Profile Image (Full Width Banner) */}
        <div className="relative mb-12 w-full h-[30rem] md:h-[36rem] lg:h-[40rem] overflow-hidden shadow-lg border-b border-primary/20">
          {profile?.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={profile.name || "Profile"}
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5">
              <span className="font-serif text-8xl text-primary/30">
                {profile?.name?.[0] || "P"}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 mt-8 md:mt-12">
          {/* Name */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 font-serif text-5xl font-bold text-foreground md:text-6xl lg:text-7xl"
          >
            {profile?.name || "Artist Name"}
          </motion.h1>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 max-w-2xl text-center"
          >
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/70">
              {profile?.bio || "Welcome to my portfolio. I create illustrations and webtoons with love and passion."}
            </p>
          </motion.div>

          {/* Contact & Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 w-full max-w-2xl">
            {/* Contact */}
            {profile?.contact_email && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => handleCopyEmail(profile.contact_email!)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-primary/20"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="hover:text-primary transition-colors">
                  {isCopied ? "이메일이 복사되었습니다!" : profile.contact_email}
                </span>
              </motion.div>
            )}

            {/* Social Links */}
            {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {Object.entries(profile.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-primary/30 px-5 py-2.5 text-sm text-foreground/70 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {platform}
                  </a>
                ))}
              </motion.div>
            )}
          </div>

          {/* Work Links (작품 바로가기) */}
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

          {/* 이력서 항목 (학력 / 경력 / 자격) */}
          {(profile?.education?.length || profile?.experience?.length || profile?.certifications?.length) ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 w-full max-w-5xl flex flex-col md:flex-row gap-16 md:gap-12 lg:gap-20 mb-20"
            >
              {/* 학력사항 */}
              {profile?.education && profile.education.length > 0 && (
                <div className="flex-1 relative">
                  <div className="flex items-center gap-6 mb-8 w-full">
                    <h2 className="text-xl font-serif md:text-2xl text-foreground whitespace-nowrap tracking-wide">
                      Education
                    </h2>
                    <div className="h-px w-full bg-primary/20"></div>
                  </div>
                  <div className="flex flex-col gap-6 pl-2">
                    {profile.education.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 group">
                        <span className="text-sm font-medium text-primary tracking-wider">
                          {item.date}
                        </span>
                        <span className="text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                          {item.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 경력사항 */}
              {profile?.experience && profile.experience.length > 0 && (
                <div className="flex-1 relative">
                  <div className="flex items-center gap-6 mb-8 w-full">
                    <h2 className="text-xl font-serif md:text-2xl text-foreground whitespace-nowrap tracking-wide">
                      Experience
                    </h2>
                    <div className="h-px w-full bg-primary/20"></div>
                  </div>
                  <div className="flex flex-col gap-6 pl-2">
                    {profile.experience.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5 group">
                        <span className="text-sm font-medium text-primary tracking-wider">
                          {item.date}
                        </span>
                        <span className="text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                          {item.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 자격사항 */}
              {profile?.certifications && profile.certifications.length > 0 && (
                 <div className="flex-1 relative pt-0">
                 <div className="flex items-center gap-6 mb-8 w-full">
                   <h2 className="text-xl font-serif md:text-2xl text-foreground whitespace-nowrap tracking-wide">
                     Certifications
                   </h2>
                   <div className="h-px w-full bg-primary/20"></div>
                 </div>
                 <div className="flex flex-col gap-6 pl-2">
                   {profile.certifications.map((item, idx) => (
                     <div key={idx} className="flex flex-col gap-1.5 group">
                       <span className="text-sm font-medium text-primary tracking-wider">
                         {item.date}
                       </span>
                       <span className="text-sm md:text-base text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                         {item.content}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
              )}
            </motion.div>
          ) : null}

        </div>
      </motion.div>
    </div>
  )
}
