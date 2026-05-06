const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/app/webtoon/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = "interface PageProps {\n  params: Promise<{ id: string }>\n  searchParams: Promise<{ episode?: string }>\n}\n\nexport default async function WebtoonDetailPage({ params, searchParams }: PageProps) {\n  const { id } = await params\n  const resolvedSearchParams = await searchParams\n  const episodeIndex = resolvedSearchParams.episode ? parseInt(resolvedSearchParams.episode, 10) : undefined\n\n  const supabase = await createClient()\n  \n  const { data: post } = await supabase\n    .from('posts')\n    .select('*')\n    .eq('id', id)\n    .eq('is_published', true)\n    .single()\n\n  if (!post) {\n    notFound()\n  }\n\n  // If viewing a specific episode with uploaded images\n  if (episodeIndex !== undefined && post.episodes && post.episodes[episodeIndex]) {\n    const episode = post.episodes[episodeIndex]\n    if (episode.images && episode.images.length > 0) {\n      post.title = post.title + ' - ' + episode.title\n      post.images = episode.images\n      // Optional: keep original thumbnail or clear it so it doesn\\'t show as the first image of the manuscript\n      post.thumbnail_url = null\n      post.description = null \n    }\n  }\n\n  const { data: comments } = await supabase";

content = content.replace(/interface PageProps \{\s*params: Promise<\{ id: string \}>\s*\}\s*export default async function WebtoonDetailPage\(\{ params \}: PageProps\) \{\s*const \{ id \} = await params\s*const supabase = await createClient\(\)\s*const \{ data: post \} = await supabase/, replacement);

fs.writeFileSync(file, content, 'utf8');
