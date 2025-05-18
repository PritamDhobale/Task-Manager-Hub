"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Bell,
  LogOut,
  ListTodo,
  Settings,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useCompanies } from "@/hooks/useCompanies"
import { useProfile } from "@/contexts/profile-context"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useProfile()
  const { companies } = useCompanies()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <>
      {/* ✅ Mobile Header with Toggle */}
      <div className="lg:hidden flex justify-between items-center p-3 bg-white shadow-md fixed w-full z-50">
        <Image
          src="https://i.postimg.cc/T3tpSFtG/Screenshot-2025-05-07-113555.png"
          alt="Taskhub Logo"
          width={120}
          height={30}
        />
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* ✅ Sidebar Drawer */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        {/* Header with logo + notifications */}
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex items-center justify-start pl-3">
            <Image
              src="https://i.postimg.cc/T3tpSFtG/Screenshot-2025-05-07-113555.png"
              alt="Taskhub Logo"
              width={150}
              height={38}
              className="h-10 w-auto"
            />
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <span>Tasks Assigned</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <span>Priority Tasks</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main nav */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-3 py-2 text-sm rounded-xl ${
                      pathname === "/dashboard" ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/task-list"
                    className={`flex items-center px-3 py-2 text-sm rounded-xl ${
                      pathname === "/dashboard/task-list" ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ListTodo className="mr-3 h-5 w-5" />
                    Task List
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Companies</h2>
              <ul className="space-y-1">
                {companies.map((company) => (
                  <li key={company.id}>
                    <Link
                      href={`/dashboard/company/${company.id}`}
                      className={`flex items-center px-3 py-2 text-sm rounded-xl ${
                        pathname === `/dashboard/company/${company.id}`
                          ? "bg-gray-100 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                      style={{ color: "#050505" }}
                    >
                      <span>{company.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Profile section */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback>{profile.name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-gray-500">{profile.jobTitle}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/")}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}











// "use client"

// import { usePathname, useRouter } from "next/navigation"
// import Link from "next/link"
// import { LayoutDashboard, Bell, LogOut, ListTodo, Settings, User } from "lucide-react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { useCompanies } from "@/hooks/useCompanies"
// import { ChevronDown } from "lucide-react"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import Image from "next/image"
// import { useProfile } from "@/contexts/profile-context"

// export default function Sidebar() {
//   const pathname = usePathname()
//   const router = useRouter()
//   const { profile } = useProfile()

//   const { companies } = useCompanies()

//   // const companies = [
//   //   {
//   //     name: "Sage Healthy",
//   //     color: "#050505",
//   //   },
//   //   {
//   //     name: "Sage Healthy Global",
//   //     status: "green",
//   //     color: "#8bc53d",
//   //     logo: "https://i.postimg.cc/ydQbwfk4/Sagehealty-Global.png",
//   //   },
//   //   {
//   //     name: "HubOne Systems",
//   //     status: "blue",
//   //     color: "#00B0F0",
//   //     logo: "https://i.postimg.cc/C529fvgH/Hubone-Systems.png",
//   //   },
//   //   {
//   //     name: "Gentyx",
//   //     status: "green",
//   //     color: "#8bc53d",
//   //     logo: "https://i.postimg.cc/brrKJ7Kw/Gentyx.png",
//   //   },
//   //   {
//   //     name: "HoldCos",
//   //     status: "black",
//   //     color: "#050505",
//   //     logo: "https://i.postimg.cc/8zMxjBnM/Holdco-Venture.png",
//   //   },
//   // ]

//   return (
//     <div className="h-screen flex flex-col border-r border-gray-200 bg-white w-64 flex-shrink-0">
//       <div className="p-4 flex justify-between items-center border-b">
//         <div className="flex items-center justify-start pl-3">
//           <Image
//             src="https://i.postimg.cc/T3tpSFtG/Screenshot-2025-05-07-113555.png"
//             alt="Taskhub Logo"
//             width={150}
//             height={38}
//             className="h-10 w-auto"
//           />
//         </div>
//         <div className="flex space-x-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="h-8 w-8">
//                 <Bell className="h-5 w-5" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               <DropdownMenuItem className="cursor-pointer">
//                 <span>Tasks Assigned</span>
//               </DropdownMenuItem>
//               <DropdownMenuItem className="cursor-pointer">
//                 <span>Priority Tasks</span>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <Button variant="ghost" size="icon" className="h-8 w-8">
//             <LogOut className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         <nav className="space-y-6">
//           <div>
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dashboard</h2>
//             <ul className="space-y-1">
//               <li>
//                 <Link
//                   href="/dashboard"
//                   className={`flex items-center px-3 py-2 text-sm rounded-xl ${
//                     pathname === "/dashboard" ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50"
//                   }`}
//                 >
//                   <LayoutDashboard className="mr-3 h-5 w-5" />
//                   Overview
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   href="/dashboard/task-list"
//                   className={`flex items-center px-3 py-2 text-sm rounded-xl ${
//                     pathname === "/dashboard/task-list" ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50"
//                   }`}
//                 >
//                   <ListTodo className="mr-3 h-5 w-5" />
//                   Task List
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Companies</h2>
//             <ul className="space-y-1">
//               {companies.map((company) => (
//                 <li key={company.id}>
//                   <Link
//                     href={`/dashboard/company/${company.id}`}
//                     className={`flex items-center px-3 py-2 text-sm rounded-xl ${
//                       pathname === `/dashboard/company/${company.id}` ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
//                     }`}
//                     style={{ color: "#050505" }}
//                   >
//                     <span>{company.name}</span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </nav>
//       </div>

//       <div className="p-4 border-t">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <div className="flex items-center cursor-pointer">
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
//                 <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
//               </Avatar>
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-medium">{profile.name}</p>
//                 <p className="text-xs text-gray-500">{profile.jobTitle}</p>
//               </div>
//               <ChevronDown className="h-4 w-4 text-gray-500" />
//             </div>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="start" className="w-56">
//             <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
//               <User className="mr-2 h-4 w-4" />
//               <span>Edit Profile</span>
//             </DropdownMenuItem>
//             <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
//               <Settings className="mr-2 h-4 w-4" />
//               <span>Settings</span>
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/")}>
//               <LogOut className="mr-2 h-4 w-4" />
//               <span>Logout</span>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     </div>
//   )
// }
