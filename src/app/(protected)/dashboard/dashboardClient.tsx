'use client'
// src/app/(protected)/dashboard/page.tsx
import { useToast } from '@/hooks/use-toast'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PostForm } from '@/components/PostForm'
import { GalleryCard, MessageCard, PostCard } from '@/components/DashboardCards';
import { Gallery, Post, User } from '@prisma/client';
import { useRouter } from 'next/navigation';

export default function DashboardClient({data,user}:{data:any,user:any}) {
  const route = useRouter()
  const { posts, photos, messages, stats } = data
  if (!data) {
    return (
      <div className="container py-10">
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="h-[400px] bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  const handlePostCreated = () => {
    route.refresh()
  }

  return (
    <div className="container py-4 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
      </div>

      <Tabs defaultValue="feed" className="space-y-4 md:space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <PostForm onPostCreated={handlePostCreated} />
          <div className="grid gap-4 md:gap-6">
            {posts && posts.map((post:Post, i:number) => {
              return (
                <PostCard key={`post_${i}`} post={post} userId={user?.id||''} />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos && photos.map((gallery:Gallery, i:number) => {
              
              return (
                <GalleryCard key={`gallery_${i}`} gallery={gallery} />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="space-y-4">
          {messages && messages.map((message:Message, i:number) => {
              
              return (
                <MessageCard currentUserId={user?user.id:''} key={`message_${i}`} message={message} />
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}