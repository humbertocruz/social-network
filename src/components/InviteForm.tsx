'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function InviteForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast({
        title: 'Invitation sent',
        description: 'The invitation has been sent successfully'
      })
      setEmail('')
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Friend</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a Friend</DialogTitle>
          <DialogDescription>
            Send an invitation email to your friend to join Vibe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
