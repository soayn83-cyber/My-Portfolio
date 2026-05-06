const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

// Insert handleSwapOrder
const insertHandleSwapOrderBefore = \  const handleCreateNew = () => {\;
const swapOrderCode = \  const handleSwapOrder = async (post: Post, direction: "up" | "down") => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const categoryPosts = posts
        .filter(p => p.category === post.category)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
      const currentIndex = categoryPosts.findIndex(p => p.id === post.id);
      let targetPost = null;
      
      if (direction === "up" && currentIndex > 0) {
        targetPost = categoryPosts[currentIndex - 1];
      } else if (direction === "down" && currentIndex < categoryPosts.length - 1) {
        targetPost = categoryPosts[currentIndex + 1];
      }
      
      if (!targetPost) {
        setIsLoading(false);
        return;
      }

      let newPostDate = targetPost.created_at;
      let newTargetDate = post.created_at;
      
      if (newPostDate === newTargetDate) {
         const d = new Date(newPostDate);
         if (direction === 'up') d.setSeconds(d.getSeconds() + 1);
         else d.setSeconds(d.getSeconds() - 1);
         newPostDate = d.toISOString();
      }

      await supabase.from("posts").update({ created_at: newPostDate }).eq("id", post.id);
      await supabase.from("posts").update({ created_at: newTargetDate }).eq("id", targetPost.id);
      
      const newPosts = posts.map(p => {
        if (p.id === post.id) return { ...p, created_at: newPostDate };
        if (p.id === targetPost.id) return { ...p, created_at: newTargetDate };
        return p;
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setPosts(newPosts);
      await revalidateSite();
      // setTimeout(() => router.refresh(), 500); // give time for cache to invalidate
    } catch (e: any) {
      console.error(e);
      alert("순서 변경 실패: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }

\;

if (data.includes(insertHandleSwapOrderBefore) && !data.includes('handleSwapOrder')) {
  data = data.replace(insertHandleSwapOrderBefore, swapOrderCode + insertHandleSwapOrderBefore);
  console.log('injected handleSwapOrder');
}


// UI Replace
const targetUI = \                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </Button>\;
const replaceUI = \                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleSwapOrder(post, 'up')} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary" disabled={isLoading} title="위로 올리기 (최신순위)">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleSwapOrder(post, 'down')} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary" disabled={isLoading} title="아래로 내리기">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="border border-primary/10 bg-background hover:bg-primary/10 hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </Button>\;

if (data.includes(targetUI)) {
  data = data.replace(targetUI, replaceUI);
  fs.writeFileSync(file, data, 'utf8');
  console.log('UI arrows successfully added.');
} else {
  console.log('Target UI string not found');
}
