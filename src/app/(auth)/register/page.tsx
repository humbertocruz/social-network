// app/register/page.tsx
import { Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RegisterForm } from './register-form'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your registration details.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
