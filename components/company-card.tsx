"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface CompanyCardProps {
  name: string
  taskCount: number
  progress: number
  status: "green" | "blue" | "black"
  index: number
  logo: string
  color: string // kept for compatibility, not used now
}

export default function CompanyCard({
  name,
  taskCount,
  progress,
  status,
  index,
  logo,
}: CompanyCardProps) {
  const router = useRouter()

  // Use theme for "black" so it works in dark mode too.
  const getStatusColor = (s: CompanyCardProps["status"]): string => {
    switch (s) {
      case "green":
        return "#8BC53D"
      case "blue":
        return "#00B0F0"
      case "black":
        // theme-aware foreground (looks black in light, light in dark)
        return "hsl(var(--foreground))"
      default:
        return "#A5A5A5"
    }
  }

  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="h-6 mr-2">
            <Image
              src={logo || "/placeholder.svg"}
              alt={name}
              width={48}
              height={24}
              className="h-6 w-auto"
            />
          </div>
          {/* theme-aware text color */}
          <CardTitle className="text-base text-foreground">{name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tasks</span>
            <span className="font-medium text-foreground">{taskCount}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Progress</span>
              <span className="text-foreground">{progress}%</span>
            </div>

            {/* Color the inner indicator using a CSS var on the wrapper */}
            <Progress
              value={progress}
              className="h-2 bg-muted [&>div]:bg-[--progress-color]"
              style={
                {
                  // Tailwind supports arbitrary value with CSS var
                  "--progress-color": getStatusColor(status),
                } as React.CSSProperties
              }
            />
          </div>

          <Button
            variant="outline"
            className="w-full mt-2 rounded-xl"
            onClick={() => router.push(`/dashboard/company/${index}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


// "use client"

// import type React from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { useRouter } from "next/navigation"
// import Image from "next/image"

// interface CompanyCardProps {
//   name: string
//   taskCount: number
//   progress: number
//   status: "green" | "blue" | "black"
//   index: number
//   logo: string
//   color: string
// }

// export default function CompanyCard({ name, taskCount, progress, status, index, logo, color }: CompanyCardProps) {
//   const router = useRouter()

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "green":
//         return "#8BC53D"
//       case "blue":
//         return "#00B0F0"
//       case "black":
//         return "#050505"
//       default:
//         return "#A5A5A5"
//     }
//   }

//   return (
//     <Card className="shadow-sm rounded-xl">
//       <CardHeader className="pb-2">
//         <div className="flex items-center">
//           <div className="h-6 mr-2">
//             <Image src={logo || "/placeholder.svg"} alt={name} width={48} height={24} className="h-6 w-auto" />
//           </div>
//           <CardTitle className="text-base" style={{ color: "#050505" }}>
//             {name}
//           </CardTitle>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-500">Tasks</span>
//             <span className="font-medium">{taskCount}</span>
//           </div>
//           <div className="space-y-1">
//             <div className="flex justify-between text-sm">
//               <span>Progress</span>
//               <span>{progress}%</span>
//             </div>
//             <Progress
//               value={progress}
//               className="h-2"
//               style={
//                 {
//                   backgroundColor: "#f0f0f0",
//                   "--progress-color": getStatusColor(status),
//                 } as React.CSSProperties
//               }
//               indicatorClassName="bg-current"
//               style={{ color: getStatusColor(status) }}
//             />
//           </div>
//           <Button
//             variant="outline"
//             className="w-full mt-2 rounded-xl"
//             onClick={() => router.push(`/dashboard/company/${index}`)}
//           >
//             View Details
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
