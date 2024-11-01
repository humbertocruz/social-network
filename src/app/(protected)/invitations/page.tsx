'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InviteForm } from '@/components/InviteForm'
import { InvitationList } from '@/components/InvitationList'
import { InvitationStats } from '@/components/InvitationStats'

export default function InvitationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Invitation Management</h1>
        <InviteForm />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InviteForm />
                  </CardContent>
                </Card>
              </div>
            </section>
            <InvitationStats />
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationList />
        </TabsContent>

        <TabsContent value="statistics">
          <InvitationStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}