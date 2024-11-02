// src/app/(protected)/profile/page.tsx
'use client'

import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="container py-10">
      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {user?.profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {profile.type}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          {/* Settings content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
