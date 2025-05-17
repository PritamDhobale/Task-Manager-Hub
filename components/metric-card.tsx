import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  progress?: number
  color?: string
}

export default function MetricCard({ title, value, icon, progress, color = "#007BFF" }: MetricCardProps) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined && (
          <Progress
            value={progress}
            className="h-2 mt-2"
            style={
              {
                backgroundColor: "#f0f0f0",
                "--progress-color": color,
              } as React.CSSProperties
            }
            indicatorClassName="bg-current"
            style={{ color }}
          />
        )}
      </CardContent>
    </Card>
  )
}
