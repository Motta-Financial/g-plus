import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Welcome to G+</h1>
          <p className="text-muted-foreground">Your personal life ERP system</p>
        </div>
        <SignIn
          afterSignInUrl="/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-lg border-2 border-border",
            },
          }}
        />
      </div>
    </div>
  )
}
