import { SupabaseTest } from "@/components/supabase-test"
import { DatabaseSetupTest } from "@/components/database-setup-test"

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supabase Integration Test</h1>
        <p className="text-gray-600">Test your Supabase connection and database setup</p>
      </div>

      <SupabaseTest />
      <DatabaseSetupTest />
    </div>
  )
}
