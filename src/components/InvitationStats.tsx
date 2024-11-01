'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LineChart, BarChart } from 'recharts'
import { Users, UserPlus, UserCheck, Clock, TrendingUp } from 'lucide-react'

interface Stats {
  networkSize: number
  networkByLevel: Record<number, number>
  activeUsers: number
  viralCoefficient: number
  networkDepth: number
  topInviters: Array<{
    id: string
    name: string
    invitations: number
    level: number
  }>
}

export function InvitationStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/invitations/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to fetch statistics')

      const data = await res.json()
      setStats(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load statistics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading statistics...</div>
  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.networkSize}</div>
            <p className="text-xs text-muted-foreground">Total users in network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Depth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.networkDepth}</div>
            <p className="text-xs text-muted-foreground">Levels deep</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viral Coefficient</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.viralCoefficient.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Avg. invites per user</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Growth by Level</CardTitle>
            <CardDescription>Distribution of users across levels</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={Object.entries(stats.networkByLevel).map(([level, count]) => ({
                level: `Level ${level}`,
                users: count
              }))}
              width={400}
              height={300}
            >
              {/* Chart configuration */}
            </BarChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Inviters</CardTitle>
            <CardDescription>Most active network builders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topInviters.map((inviter, index) => (
                <div key={inviter.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{inviter.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Level {inviter.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{inviter.invitations}</p>
                    <p className="text-sm text-muted-foreground">invites</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
