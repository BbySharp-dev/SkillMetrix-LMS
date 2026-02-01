import { useQuery } from '@tanstack/react-query'
import { healthCheck } from '@/api/healthApi'

export function HomePage() {
  const { data: healthData, isLoading: healthLoading, error: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SkillMetrix LMS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to SkillMetrix Learning Management System
        </p>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Health Check</h2>
            {healthLoading && (
              <div className="text-blue-600">Loading...</div>
            )}
            {healthError && (
              <div className="text-red-600">
                Error: {healthError instanceof Error ? healthError.message : 'Unknown error'}
              </div>
            )}
            {healthData && (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">{healthData.message}</p>
                <p className="text-sm text-gray-600">Status: {healthData.status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
