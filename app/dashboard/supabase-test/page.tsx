import { SupabaseTest } from "@/components/supabase-test"

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Supabase Connection Test</h1>
        <p className="text-muted-foreground mt-2">Test your Supabase connection and environment variables</p>
      </div>
      <SupabaseTest />
    </div>
  )
}
