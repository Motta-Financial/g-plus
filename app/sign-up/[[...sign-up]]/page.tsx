import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Join G+</h1>
          <p className="text-muted-foreground">Start organizing your life today</p>
        </div>
        <SignUp
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
          signInUrl="/sign-in"
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
