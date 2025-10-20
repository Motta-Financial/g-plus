"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Plus, Trash2, RefreshCw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function EmailAccounts() {
  const emailAccounts = useAppStore((state) => state.emailAccounts)
  const addEmailAccount = useAppStore((state) => state.addEmailAccount)
  const deleteEmailAccount = useAppStore((state) => state.deleteEmailAccount)
  const [isOpen, setIsOpen] = useState(false)
  const [provider, setProvider] = useState<"gmail" | "outlook" | "imap">("gmail")
  const [emailAddress, setEmailAddress] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleAddAccount = async () => {
    if (!emailAddress) {
      toast.error("Please enter an email address")
      return
    }

    try {
      await addEmailAccount({
        provider,
        email_address: emailAddress,
        display_name: displayName || emailAddress,
        is_active: true,
        sync_enabled: true,
      })

      toast.success("Email account added successfully")
      setIsOpen(false)
      setEmailAddress("")
      setDisplayName("")
      setProvider("gmail")
    } catch (error: any) {
      toast.error(error.message || "Failed to add email account")
    }
  }

  const handleSync = async (accountId: string) => {
    setSyncing(accountId)
    try {
      const response = await fetch("/api/email/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_account_id: accountId }),
      })

      if (!response.ok) throw new Error("Sync failed")

      toast.success("Email sync initiated")
    } catch (error: any) {
      toast.error(error.message || "Failed to sync emails")
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to remove this email account?")) return

    try {
      await deleteEmailAccount(accountId)
      toast.success("Email account removed")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove email account")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-light tracking-wide">Email Accounts</h3>
          <p className="text-sm text-muted-foreground">Connect your email accounts to sync to Triage</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Email Account</DialogTitle>
              <DialogDescription>Connect an email account to sync messages to your Triage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={(value: any) => setProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="imap">IMAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name (Optional)</Label>
                <Input placeholder="Work Email" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <Button onClick={handleAddAccount} className="w-full">
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {emailAccounts.length === 0 ? (
          <Card className="p-12 text-center fashion-card">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-light">No email accounts connected</p>
            <p className="text-sm text-muted-foreground mt-2">Add an email account to start syncing to Triage</p>
          </Card>
        ) : (
          emailAccounts.map((account) => (
            <Card key={account.id} className="p-6 fashion-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-cyan-500/10">
                    <Mail className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-light">{account.display_name || account.email_address}</p>
                      {account.is_active && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{account.email_address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Provider: {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                    </p>
                    {account.last_synced_at && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(account.last_synced_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSync(account.id)}
                    disabled={syncing === account.id}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing === account.id ? "animate-spin" : ""}`} />
                    Sync
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(account.id)}
                    className="gap-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
