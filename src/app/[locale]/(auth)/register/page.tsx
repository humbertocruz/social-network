'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

interface Profile {
  type: 'HE' | 'SHE'
  name: string
  avatar: string
  bio: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([
    { type: 'HE', name: '', avatar: '', bio: '' }
  ])
  
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const verifyInvitation = async (code: string) => {
    try {
      const res = await fetch('/api/invitations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      setVerified(true)
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const code = formData.get('code') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          code,
          profiles
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      const data = await res.json()
      login(data.user)
      
      toast({
        title: 'Registration successful',
        description: 'Welcome to Vibe!'
      })
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const addProfile = () => {
    if (profiles.length < 2) {
      setProfiles([...profiles, { type: 'SHE', name: '', avatar: '', bio: '' }])
    }
  }

  const updateProfile = (index: number, field: keyof Profile, value: string) => {
    const newProfiles = [...profiles]
    newProfiles[index] = { 
      ...newProfiles[index], 
      [field]: field === 'type' ? (value as 'HE' | 'SHE') : value 
    }
    setProfiles(newProfiles)
  }

  if (!email) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              Please use the invitation link sent to your email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {verified ? 'Create your profile(s)' : 'Enter your invitation code'}
          </CardDescription>
        </CardHeader>

        {!verified ? (
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              const code = (e.currentTarget.elements.namedItem('code') as HTMLInputElement).value
              verifyInvitation(code)
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email ?? ''}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="code">Invitation Code</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Verify Code
                </Button>
              </div>
            </form>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-4">
                <Label>Profiles</Label>
                {profiles.map((profile, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Select
                          value={profile.type}
                          onValueChange={(value) => 
                            updateProfile(index, 'type', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select profile type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HE">He</SelectItem>
                            <SelectItem value="SHE">She</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => 
                          updateProfile(index, 'name', e.target.value)
                        }
                        placeholder="Enter profile name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Avatar URL</Label>
                      <Input
                        value={profile.avatar}
                        onChange={(e) => 
                          updateProfile(index, 'avatar', e.target.value)
                        }
                        placeholder="Enter avatar URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => 
                          updateProfile(index, 'bio', e.target.value)
                        }
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                ))}

                {profiles.length < 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProfile}
                    className="w-full"
                  >
                    Add Another Profile
                  </Button>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
