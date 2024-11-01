// src/app/(protected)/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import Link from 'next/link'
import { MessageSquare, Heart, Image as ImageIcon, Users, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { PostForm } from '@/components/PostForm'

interface Post {
  id: string
  content: string
  images: Array<{
    id: string
    url: string
  }>
  createdAt: string
  user: {
    id: string
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
  _count: {
    likes: number
    comments: number
  }
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
  read: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
    photos: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handlePostCreated = () => {
    // Refresh the feed
    fetchDashboardData()
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch dashboard data')

      const data = await response.json()
      setPosts(data.posts)
      setPhotos(data.photos)
      setMessages(data.messages)
      setStats(data.stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  return (
    <div className="container py-10">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Followers</p>
                <h3 className="text-2xl font-bold">{stats.followers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Following</p>
                <h3 className="text-2xl font-bold">{stats.following}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Posts</p>
                <h3 className="text-2xl font-bold">{stats.posts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ImageIcon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Photos</p>
                <h3 className="text-2xl font-bold">{stats.photos}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed">
          <PostForm onPostCreated={handlePostCreated} />
          <div className="grid gap-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={post.user.profiles[0]?.avatar} />
                    <AvatarFallback>{post.user.profiles[0]?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{post.user.profiles[0]?.name}</CardTitle>
                    <CardDescription>
                      {format(new Date(post.createdAt), 'PPp')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>
                  {post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {post.images.map((image) => (
                        <div key={image.id} className="relative aspect-square rounded-md overflow-hidden">
                          <Image
                            src={image.url}
                            alt="Post image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post._count.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post._count.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt="Gallery image"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Heart className="h-4 w-4" />
                      <span>{photo._count.likes}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px]">
              <CardContent className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                      !message.read ? 'bg-muted' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={message.sender.profiles[0]?.avatar} />
                      <AvatarFallback>
                        {message.sender.profiles[0]?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {message.sender.profiles[0]?.name}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(message.createdAt), 'PP')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}