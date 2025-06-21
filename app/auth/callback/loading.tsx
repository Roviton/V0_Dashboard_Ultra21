import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Truck } from "lucide-react"

export default function CallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-2xl font-black text-gray-900">
                Ultra<span className="text-blue-600 font-extrabold">21</span>
              </div>
              <div className="text-xs text-gray-600 font-medium tracking-wide">Freight Solutions</div>
            </div>
          </div>

          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>

          <CardTitle className="text-xl">Loading...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">Processing your request...</p>
        </CardContent>
      </Card>
    </div>
  )
}
