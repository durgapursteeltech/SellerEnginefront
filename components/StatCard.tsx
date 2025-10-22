interface StatCardProps {
  title: string
  value: number
  bgColor: string
  loading?: boolean
}

export default function StatCard({ title, value, bgColor, loading = false }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-center`}>
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      {loading ? (
        <div className="flex justify-center items-center h-9">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
        </div>
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      )}
    </div>
  )
} 