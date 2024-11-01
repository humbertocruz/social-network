// src/app/(protected)/radar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, MapPin, Users } from 'lucide-react'

interface NearbyUser {
  id: string
  distance: number
  profiles: Array<{
    name: string
    avatar: string
    type: 'HE' | 'SHE'
  }>
  lastLocation: string
}

export default function RadarPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      getUserLocation()
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      })
    }
  }, [])

  useEffect(() => {
    if (coords) {
      fetchNearbyUsers()
    }
  }, [coords])

  const getUserLocation = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        await updateUserLocation(latitude, longitude)
        setLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        toast({
          title: "Error",
          description: "Failed to get your location",
          variant: "destructive"
        })
        setLoading(false)
      }
    )
  }

  const updateUserLocation = async (latitude: number, longitude: number) => {
    try {
      setUpdating(true)
      const response = await fetch('/api/users/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ latitude, longitude })
      })

      if (!response.ok) throw new Error('Failed to update location')
    } catch (error) {
      console.error('Update location error:', error)
      toast({
        title: "Error",
        description: "Failed to update your location",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const fetchNearbyUsers = async () => {
    if (!coords) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/users/nearby?lat=${coords.lat}&lng=${coords.lng}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch nearby users')

      const data = await response.json()
      setNearbyUsers(data)
    } catch (error) {
      console.error('Fetch nearby users error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch nearby users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-2xl font-bold">Radar</CardTitle>
          <Button
            onClick={getUserLocation}
            disabled={updating}
            variant="outline"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Update Location
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : nearbyUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyUsers.map((nearby) => (
                <Card key={nearby.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={nearby.profiles[0]?.avatar} />
                        <AvatarFallback>
                          {nearby.profiles[0]?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-medium leading-none">
                          {nearby.profiles[0]?.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={nearby.profiles[0]?.type === 'HE' ? 'default' : 'secondary'}>
                            {nearby.profiles[0]?.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {nearby.distance < 1
                              ? `${(nearby.distance * 1000).toFixed(0)}m away`
                              : `${nearby.distance.toFixed(1)}km away`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">No users nearby</h3>
              <p className="text-muted-foreground">
                Try updating your location or check back later
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
