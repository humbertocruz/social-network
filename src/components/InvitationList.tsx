'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Invitation {
  id: string
  email: string
  code: string
  isUsed: boolean
  createdAt: string
  expiresAt: string
  usedAt?: string
  invitedUser?: {
    email: string
    profiles: Array<{
      name: string
    }>
  }
}

export function InvitationList() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/invitations/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to load invitations')

      const data = await res.json()
      setInvitations(data.invitations)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Invitations</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Invited User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant={invitation.isUsed ? "success" : "secondary"}>
                    {invitation.isUsed ? 'Used' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(invitation.createdAt), 'PP')}
                </TableCell>
                <TableCell>
                  {format(new Date(invitation.expiresAt), 'PP')}
                </TableCell>
                <TableCell>
                  {invitation.invitedUser ? (
                    <span>{invitation.invitedUser.profiles[0]?.name}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
