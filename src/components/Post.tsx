// src/components/Post.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'
import Link from 'next/link'

interface PostImage {
  id: string
  url: string
}

interface PostProfile {
  name: string
  avatar: string
  type: 'HE' | 'SHE'
}

interface PostUser {
  id: string
  profiles: PostProfile[]
}

interface PostProps {
  id: string
  content: string
  images: PostImage[]
  createdAt: string
  user: PostUser
  _count: {
    likes: number
    comments: number
  }
  isLiked?: boolean
  onDelete?: () => void
}

export function Post({
  id,
  content,
  images,
  createdAt,
  user,
  _count,
  isLiked = false,
  onDelete
}: PostProps) {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [likes, setLikes] = useState(_count.likes)
  const [liked, setLiked] = useState(isLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${id}/like`, {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to like post')

      setLiked(!liked)
      setLikes(liked ? likes - 1 : likes + 1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Check out this post on Vibe',
        text: content,
        url: `${window.location.origin}/posts/${id}`
      })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share post",
          variant: "destructive"
        })
      }
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete post')

      toast({
        title: "Success",
        description: "Post deleted successfully"
      })

      onDelete?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/profile/${user.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profiles[0]?.avatar} />
                <AvatarFallback>{user.profiles[0]?.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="space-y-1">
              <Link 
                href={`/profile/${user.id}`}
                className="font-medium hover:underline"
              >
                {user.profiles[0]?.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {format(new Date(createdAt), 'PPp')}
              </p>
            </div>
          </div>
          {currentUser?.id === user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="sr-only">Post menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                  disabled={isLoading}
                >
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-sm">{content}</p>
        {images.length > 0 && (
          <div className={`grid gap-2 ${
            images.length === 1 ? 'grid-cols-1' : 
            images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {images.map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div className="relative aspect-square rounded-md overflow-hidden cursor-pointer">
                    <Image
                      src={image.url}
                      alt="Post image"
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt="Post image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center space-x-4 text-muted-foreground">
          <Button 
            variant="ghost" 
            size="sm"
            className="space-x-2"
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart 
              className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`}
            />
            <span>{likes}</span>
          </Button>
          <Link href={`/posts/${id}`}>
            <Button variant="ghost" size="sm" className="space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>{_count.comments}</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
            className="ml-auto"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}