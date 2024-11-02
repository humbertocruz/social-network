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
    <div className="container py-4 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stats cards */}
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
            {/* Post cards */}
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Photo cards */}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="space-y-4">
            {/* Message cards */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}