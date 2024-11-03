// src/app/(protected)/profile/edit/page.tsx
"use client"

import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { fetchClient } from '@/lib/fetch-client';

export default function EditProfilePage() {
  const { user, setActiveProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  console.log(uploadingImage)
  const [profiles, setProfiles] = useState(
    user?.profiles.map(profile => ({
      ...profile,
      newAvatar: null as File | null
    })) || []
  )

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    profileIndex: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "Image must be less than 5MB",
        variant: "destructive"
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File must be an image",
        variant: "destructive"
      })
      return
    }

    const newProfiles = [...profiles]
    newProfiles[profileIndex].newAvatar = file
    setProfiles(newProfiles)
  }

  const handleProfileUpdate = async (profileIndex: number) => {
    try {
      setLoading(true);
      const profile = profiles[profileIndex];

      // Upload new avatar if exists
      let avatarUrl = profile.avatar;
      if (profile.newAvatar) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', profile.newAvatar);

        // Special handling for file upload
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.status >= 400) {
          throw new Error(uploadData.error || 'Failed to upload image');
        }

        avatarUrl = uploadData.url;
      }

      // Update profile using fetchClient
      const updatedProfile = await fetchClient(`/api/profile/${profile.id}`, {
        method: 'PUT',
        body: {
          name: profile.name,
          bio: profile.bio,
          avatar: avatarUrl
        }
      });

      // Update local state
      const newProfiles = [...profiles];
      newProfiles[profileIndex] = {
        ...updatedProfile,
        newAvatar: null
      };
      setProfiles(newProfiles);

      // Update active profile if this was the active one
      setActiveProfile(updatedProfile);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <Tabs defaultValue={profiles[0]?.type} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit Profiles</h1>
          <TabsList>
            {profiles.map(profile => (
              <TabsTrigger 
                key={profile.id} 
                value={profile.type}
                disabled={loading}
              >
                {profile.type}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {profiles.map((profile, index) => (
          <TabsContent 
            key={profile.id} 
            value={profile.type}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Edit {profile.type} Profile</CardTitle>
                <CardDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={
                        profile.newAvatar 
                          ? URL.createObjectURL(profile.newAvatar)
                          : profile.avatar
                      } 
                    />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, index)}
                      disabled={loading}
                      className="hidden"
                      id={`avatar-${profile.id}`}
                    />
                    <Button
                      variant="outline"
                      onClick={() => 
                        document.getElementById(`avatar-${profile.id}`)?.click()
                      }
                      disabled={loading}
                    >
                      Change Avatar
                    </Button>
                    {profile.newAvatar && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newProfiles = [...profiles]
                          newProfiles[index].newAvatar = null
                          setProfiles(newProfiles)
                        }}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`name-${profile.id}`}>Name</Label>
                  <Input
                    id={`name-${profile.id}`}
                    value={profile.name}
                    onChange={(e) => {
                      const newProfiles = [...profiles]
                      newProfiles[index].name = e.target.value
                      setProfiles(newProfiles)
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`bio-${profile.id}`}>Bio</Label>
                  <Textarea
                    id={`bio-${profile.id}`}
                    value={profile.bio || ''}
                    onChange={(e) => {
                      const newProfiles = [...profiles]
                      newProfiles[index].bio = e.target.value
                      setProfiles(newProfiles)
                    }}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleProfileUpdate(index)}
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
