"use client"
import type { User } from "@supabase/supabase-js"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "ai"
import { Send, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AssistantClientProps {
  user: User
}

export function AssistantClient({ user }: AssistantClientProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const suggestedPrompts = [
    "What are my big rocks for this week?",
    "Show me my upcoming deadlines",
    "What's on my schedule today?",
    "Give me a summary of all my workstreams",
    "Help me prioritize my tasks",
  ]

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-col gap-6 h-[calc(100vh-12rem)]">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Mermaid Assistant
          </h1>
          <p className="text-muted-foreground">Your personal AI assistant for managing your workstreams</p>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Chat with Mermaid
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-0">
            <ScrollArea className="flex-1 px-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
                  <div className="text-6xl">🐱‍♀️</div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Hello, Grace!</h3>
                    <p className="text-muted-foreground max-w-md">
                      I'm Mermaid, your personal assistant. I'm here to help you manage your tasks, stay organized, and
                      focus on what matters most. How can I assist you today?
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {suggestedPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleInputChange({ target: { value: prompt } } as any)
                          setTimeout(() => {
                            const form = document.querySelector("form")
                            form?.requestSubmit()
                          }, 0)
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">🐱‍♀️</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">GC</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">🐱‍♀️</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask Mermaid anything about your tasks and schedule..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
