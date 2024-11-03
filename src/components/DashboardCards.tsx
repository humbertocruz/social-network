import React from 'react';
import { Heart, MessageCircle, MoreVertical, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

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
import { likePost } from '@/app/api/posts/like' 

// Helper function to format dates
const formatDate = (date) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

const formatTime = (date) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleTimeString('en-US', options);
};

// Post Card Component
const PostCard = ({ post, userId }:{post:Post, userId: string}) => {
  if (!post) return null
  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={post.user?.profiles[0]?.avatar} />
          <AvatarFallback>{post.user?.profiles[0].name.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold">{post.user?.profiles[0].name}</div>
          <div className="text-sm text-gray-500">
            {formatDate(post.createdAt)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm">{post.content}</p>
        {post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {post.images.map((image) => (
              <Image
                width={400}
                height={300}
                key={image.id}
                src={image.url}
                alt="Post image"
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
        <div className="flex space-x-4">
          <Button onClick={()=>likePost(post.id,userId)} variant="ghost" size="sm" className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>{post.likes?.length}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments?.length}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Image Gallery Card Component
const GalleryCard = ({ gallery }) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={gallery.user.profiles[0]?.avatar} />
          <AvatarFallback>{gallery.user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold">{gallery.user.username}</div>
          <div className="text-sm text-gray-500">
            {formatDate(gallery.createdAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {gallery.type === "image" ? (
          <Image
            src={gallery.url}
            alt="Gallery image"
            className="rounded-lg object-cover w-full h-64"
          />
        ) : (
          <video
            src={gallery.url}
            controls
            className="rounded-lg w-full h-64"
          />
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <ThumbsUp className="h-4 w-4" />
          <span>{gallery.ratings.length} ratings</span>
        </div>
      </CardFooter>
    </Card>
  );
};

// Message Card Component
const MessageCard = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.profiles[0]?.avatar} />
          <AvatarFallback>{message.sender.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className={`max-w-md ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
          {message.type === 'image' ? (
            <Image
              src={message.image}
              alt="Message image"
              className="rounded-lg max-w-xs"
            />
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          <div className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'} mt-1`}>
            {formatTime(message.createdAt)}
            {message.read && isOwn && (
              <span className="ml-2">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PostCard, GalleryCard, MessageCard };
