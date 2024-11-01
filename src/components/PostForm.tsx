// src/components/PostForm.tsx
'use client'

import { useState, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Image as ImageIcon, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface PostFormProps {
  onPostCreated?: () => void
}

export function PostForm({ onPostCreated }: PostFormProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 4) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images per post",
        variant: "destructive"
      })
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive"
        })
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive"
        })
        return false
      }
      return true
    })

    setImages(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) return

    setLoading(true)
    try {
      // First upload images if any
      const imageUrls = []
      if (images.length > 0) {
        for (const image of images) {
          const formData = new FormData()
          formData.append('file', image)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          })

          if (!uploadRes.ok) throw new Error('Failed to upload image')

          const { url } = await uploadRes.json()
          imageUrls.push(url)
        }
      }

      // Create post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          images: imageUrls
        })
      })

      if (!response.ok) throw new Error('Failed to create post')

      // Reset form
      setContent('')
      setImages([])
      setPreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast({
        title: "Success",
        description: "Post created successfully"
      })

      // Notify parent component
      onPostCreated?.()

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
            disabled={loading}
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    disabled={loading}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              ref={fileInputRef}
              disabled={loading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || images.length >= 4}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <Button type="submit" disabled={loading || (!content.trim() && images.length === 0)}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
