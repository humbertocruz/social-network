// src/app/(protected)/messages/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Image as ImageIcon, X, Search } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Message {
  id: string
  content?: string
  image?: string
  type: 'text' | 'image'
  senderId: string
  receiverId: string
  createdAt: string
  sender: {
    profiles: Array<{
      name: string
      avatar: string
    }>
  }
}

interface Contact {
  id: string
  profiles: Array<{
    name: string
    avatar: string
  }>
  lastMessage?: {
    content: string
    createdAt: string
  }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user?.role !== 'PREMIUM') {
      toast({
        title: "Premium Feature",
        description: "Chat is only available for premium users.",
        variant: "destructive"
      })
      return
    }

    fetchContacts()
  }, [user])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/messages/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch contacts')
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      })
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`/api/messages?receiverId=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        })
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    
    if (!response.ok) throw new Error('Failed to upload image')
    
    const data = await response.json()
    return data.url
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact || (!newMessage.trim() && !selectedImage)) return

    setLoading(true)
    try {
      let imageUrl = null
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newMessage,
          image: imageUrl,
          type: imageUrl ? 'image' : 'text',
          receiverId: selectedContact.id
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const message = await response.json()
      setMessages(prev => [...prev, message])
      setNewMessage('')
      setSelectedImage(null)
      setImagePreview(null)
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.profiles[0]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (user?.role !== 'PREMIUM') {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Premium Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chat functionality is only available for premium users. 
              Upgrade your account to access this feature.
            </p>
            <Button className="mt-4 w-full">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
        {/* Contacts List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[650px] pr-4">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar>
                    <AvatarImage src={contact.profiles[0]?.avatar} />
                    <AvatarFallback>
                      {contact.profiles[0]?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{contact.profiles[0]?.name}</p>
                    {contact.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(contact.lastMessage.createdAt), 'HH:mm')}
                    </span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          {selectedContact ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={selectedContact.profiles[0]?.avatar} />
                    <AvatarFallback>
                      {selectedContact.profiles[0]?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedContact.profiles[0]?.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col h-[650px]">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user?.id 
                              ? 'justify-end' 
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.type === 'image' ? (
                              <Dialog>
                                <DialogTrigger>
                                  <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                                    <Image
                                      src={message.image!}
                                      alt="Message image"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <div className="relative w-full h-[80vh]">
                                    <Image
                                      src={message.image!}
                                      alt="Message image"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            <span className="text-xs opacity-70">
                              {format(new Date(message.createdAt), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <form
                    onSubmit={sendMessage}
                    className="p-4 border-t space-y-4"
                  >
                    {imagePreview && (
                      <div className="relative w-24 h-24">
                        <Image
                          src={imagePreview}
                          alt="Selected image"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        ref={imageInputRef}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={loading}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button type="submit" disabled={loading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a contact to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
