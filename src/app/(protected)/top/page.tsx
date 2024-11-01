// src/app/(protected)/top/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Flame, Clock } from 'lucide-react'
import Image from 'next/image'

interface TopUser {
  id: string
  profiles: Array<{
    name: string
    avatar: string
    type: 'HE' | 'SHE'
  }>
  averageRating: number
  totalRatings: number
  topMedia: {
    url: string
    type: string
    rating: number
  }
}

interface TopMedia {
  id: string
  url: string
  type: string
  averageRating: number
  totalRatings: number
  user: {
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
}

export default function TopPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week')
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [topPhotos, setTopPhotos] = useState<TopMedia[]>([])
  const [topVideos, setTopVideos] = useState<TopMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopData()
  }, [period])

  const fetchTopData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/top?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch top rankings')

      const data = await response.json()
      setTopUsers(data.users)
      setTopPhotos(data.photos)
      setTopVideos(data.videos)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rankings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Top Vibe</h1>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="photos">Top Photos</TabsTrigger>
          <TabsTrigger value="videos">Top Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-6">
            {topUsers.map((user, index) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    {/* Ranking Number */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                      <div className="text-2xl font-bold text-primary">
                        #{index + 1}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user.profiles[0]?.avatar} />
                        <AvatarFallback>{user.profiles[0]?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{user.profiles[0]?.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.profiles[0]?.type === 'HE' ? 'default' : 'secondary'}>
                            {user.profiles[0]?.type}
                          </Badge>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm">{user.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ({user.totalRatings} ratings)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Media Preview */}
                    {user.topMedia && (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden">
                        {user.topMedia.type === 'video' ? (
                          <video
                            src={user.topMedia.url}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Image
                            src={user.topMedia.url}
                            alt="Top media"
                            fill
                            className="object-cover"
                          />
                        )}
                        <div className="absolute bottom-0 right-0 bg-black/60 p-1 rounded-tl">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPhotos.map((photo, index) => (
              <Card key={photo.id}>
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt="Top photo"
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1 text-white">
                      <Trophy className="w-4 h-4" />
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={photo.user.profiles[0]?.avatar} />
                        <AvatarFallback>{photo.user.profiles[0]?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{photo.user.profiles[0]?.name}</span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{photo.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topVideos.map((video, index) => (
              <Card key={video.id}>
                <div className="relative aspect-video">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1 text-white">
                      <Trophy className="w-4 h-4" />
                      <span>#{index + 1}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={video.user.profiles[0]?.avatar} />
                        <AvatarFallback>{video.user.profiles[0]?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{video.user.profiles[0]?.name}</span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{video.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
