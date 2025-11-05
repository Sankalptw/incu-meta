"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Calendar as CalendarIcon, Clock, Info, Plus, Search, User, CalendarClock, Filter, GridIcon, List } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

type Schedule = {
  _id: string
  startupId: {
    _id: string
    name: string
  }
  date: string
  time: string
  description: string
  createdAt: string
}

type Startup = {
  _id: string
  name: string
}

type ViewMode = "grid" | "list" | "calendar"

const Schedules = () => {
  const { admin } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const navigate = useNavigate()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    startupId: "",
    date: "",
    time: "",
    description: "",
  })

  // Form validation
  const [formErrors, setFormErrors] = useState({
    startupId: false,
    date: false,
    time: false,
  })

  // Fetch startups
  const fetchStartups = async () => {
    if (!admin?.token) return

    try {
      const response = await fetch("http://localhost:3000/api/admin/all-startups", {
        headers: {
          token: admin.token,
        },
      })
      const data = await response.json()
      setStartups(data.startups || [])
    } catch (error) {
      console.error("Error fetching startups:", error)
      toast.error("Failed to load startups")
    }
  }

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!admin?.token) return

    try {
      const response = await fetch("http://localhost:3000/api/admin/all-schedules", {
        headers: {
          token: admin.token,
        },
      })
      const data = await response.json()
      setSchedules(data.schedules || [])
      setFilteredSchedules(data.schedules || [])
    } catch (error) {
      console.error("Error fetching schedules:", error)
      toast.error("Failed to load schedules")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStartups()
    fetchSchedules()
  }, [admin?.token])

  useEffect(() => {
    // Filter schedules based on search term and active filter
    const today = new Date().toISOString().split("T")[0]

    let filtered = schedules

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.startupId?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeFilter === "upcoming") {
      filtered = filtered.filter((schedule) => schedule.date >= today)
    } else if (activeFilter === "past") {
      filtered = filtered.filter((schedule) => schedule.date < today)
    }

    setFilteredSchedules(filtered)
  }, [searchTerm, activeFilter, schedules])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if value exists
    if (value) {
      setFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (value) {
      setFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const validateForm = () => {
    const errors = {
      startupId: !formData.startupId,
      date: !formData.date,
      time: !formData.time,
    }

    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async () => {
    if (!admin?.token) return

    if (!validateForm()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("https://localhost:3000/api/admin/schedule-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: admin.token,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Schedule created successfully")
        setIsModalOpen(false)
        setFormData({
          startupId: "",
          date: "",
          time: "",
          description: "",
        })
        fetchSchedules() // Refresh the list
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to create schedule")
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error("Error creating schedule")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getRelativeDateLabel = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    if (dateString === today) return "Today"
    if (dateString === tomorrowStr) return "Tomorrow"
    return null
  }

  const renderSkeletons = () => {
    return Array(6)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))
  }

  const getScheduleStatusColor = (date: string) => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    if (date < today) return "text-muted-foreground"
    if (date === today) return "text-emerald-500"
    if (date === tomorrowStr) return "text-amber-500"
    return "text-sky-500"
  }

  // Helper function to standardize date format for comparison
  const formatDateForComparison = (date: Date | string) => {
    // Create a new date using year, month, day to ensure consistent timezone handling
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Group schedules by date for calendar view
  const getCalendarData = () => {
    const calendarData: Record<string, Schedule[]> = {}
    
    filteredSchedules.forEach(schedule => {
      // Ensure consistent date format for comparisons
      const formattedDate = formatDateForComparison(schedule.date)
      
      if (!calendarData[formattedDate]) {
        calendarData[formattedDate] = []
      }
      calendarData[formattedDate].push(schedule)
    })
    
    return calendarData
  }

  const calendarData = getCalendarData()
  
  // Get dates with schedules for the selected month
  const getDatesWithSchedules = () => {
    return Object.keys(calendarData).map(dateStr => new Date(dateStr))
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
      <div className="text-slate-400 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-1 text-slate-700">No meetings found</h3>
      <p className="text-slate-500 mb-6 text-center max-w-md">
        {searchTerm
          ? "Try adjusting your search term or filter criteria"
          : "Schedule your first meeting to get started with your startups"}
      </p>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => {
          setSearchTerm("")
          setActiveFilter("all")
          if (!schedules.length) {
            setIsModalOpen(true)
          }
        }}
      >
        {searchTerm || activeFilter !== "all" ? (
          <>
            <Filter className="h-4 w-4" />
            Clear filters
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create your first schedule
          </>
        )}
      </Button>
    </div>
  )

  const renderCard = (schedule: Schedule) => {
    const relativeDateLabel = getRelativeDateLabel(schedule.date)
    const isPast = new Date(schedule.date) < new Date(new Date().toDateString())
    const statusColor = getScheduleStatusColor(schedule.date)

    return (
      <Card
        key={schedule._id}
        className={`overflow-hidden transition hover:shadow-md cursor-pointer group ${
          isPast ? "bg-slate-50" : "bg-white"
        }`}
        onClick={() => navigate(`/admin/schedule/${schedule._id}`)}
      >
        <CardHeader className={`pb-2 border-b ${isPast ? "bg-slate-50" : "bg-slate-50/50"}`}>
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1 group-hover:text-slate-700">
              {schedule.description || "Untitled Meeting"}
            </CardTitle>
            {isPast ? (
              <Badge variant="outline" className="bg-slate-100 text-slate-500">
                Past
              </Badge>
            ) : relativeDateLabel ? (
              <Badge variant="secondary" className={statusColor}>
                {relativeDateLabel}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-100 text-sky-500">
                Upcoming
              </Badge>
            )}
          </div>
          <CardDescription className="flex items-center gap-1 mt-1">
            <CalendarIcon className="h-3 w-3" />
            {formatDate(schedule.date)}
            <span className="mx-1">•</span>
            <Clock className="h-3 w-3" />
            {schedule.time}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="bg-slate-100 p-1.5 rounded-full">
              <User className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-medium text-slate-700">
              {schedule.startupId?.name || "Unknown Startup"}
            </span>
          </div>
          {schedule.description && (
            <div className="mt-3 text-sm text-slate-600 line-clamp-2">
              <Info className="h-4 w-4 inline mr-2 opacity-70" />
              {schedule.description}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-3 text-xs text-slate-500 border-t bg-slate-50/50">
          <span>Created {new Date(schedule.createdAt).toLocaleDateString()}</span>
        </CardFooter>
      </Card>
    )
  }

  const renderGridView = () => {
    if (loading) {
      return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderSkeletons()}</div>
    }
    
    if (filteredSchedules.length === 0) {
      return renderEmptyState()
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedules.map(schedule => renderCard(schedule))}
      </div>
    )
  }

  const renderListView = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="w-full p-4 border rounded-md">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )
    }
    
    if (filteredSchedules.length === 0) {
      return renderEmptyState()
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Startup</TableHead>
            <TableHead className="w-1/5">Date & Time</TableHead>
            <TableHead className="w-2/5">Description</TableHead>
            <TableHead className="w-1/10">Status</TableHead>
            <TableHead className="w-1/10 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSchedules.map((schedule) => {
            const isPast = new Date(schedule.date) < new Date(new Date().toDateString())
            const relativeDateLabel = getRelativeDateLabel(schedule.date)
            const statusColor = getScheduleStatusColor(schedule.date)
            
            return (
              <TableRow 
                key={schedule._id} 
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => navigate(`/schedule/${schedule._id}`)}
              >
                <TableCell className="font-medium">{schedule.startupId?.name || "Unknown Startup"}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(schedule.date)}</span>
                    <span className="text-sm text-slate-500">{schedule.time}</span>
                  </div>
                </TableCell>
                <TableCell className="line-clamp-2">{schedule.description || "Untitled Meeting"}</TableCell>
                <TableCell>
                  {isPast ? (
                    <Badge variant="outline" className="bg-slate-100 text-slate-500">
                      Past
                    </Badge>
                  ) : relativeDateLabel ? (
                    <Badge variant="secondary" className={statusColor}>
                      {relativeDateLabel}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-sky-500">
                      Upcoming
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  const renderCalendarView = () => {
    if (loading) {
      return (
        <div className="h-96 bg-slate-50 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      )
    }
    
    // Convert calendar data keys to consistent format
    const normalizedCalendarData: Record<string, Schedule[]> = {}
    Object.entries(calendarData).forEach(([dateStr, events]) => {
      const normalizedDate = formatDateForComparison(new Date(dateStr))
      normalizedCalendarData[normalizedDate] = events
    })
    
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevMonth = new Date(selectedMonth)
                prevMonth.setMonth(prevMonth.getMonth() - 1)
                setSelectedMonth(prevMonth)
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextMonth = new Date(selectedMonth)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                setSelectedMonth(nextMonth)
              }}
            >
              Next
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 p-2">
              {day}
            </div>
          ))}
          
          {(() => {
            const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
            const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
            const startDate = new Date(monthStart)
            startDate.setDate(startDate.getDate() - startDate.getDay())
            
            const endDate = new Date(monthEnd)
            if (endDate.getDay() < 6) {
              endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
            }
            
            const dateArray = []
            let currentDate = new Date(startDate)
            
            while (currentDate <= endDate) {
              dateArray.push(new Date(currentDate))
              currentDate.setDate(currentDate.getDate() + 1)
            }
            
            return dateArray.map((date, i) => {
              const formattedDate = formatDateForComparison(date)
              const isCurrentMonth = date.getMonth() === selectedMonth.getMonth()
              const isToday = formatDateForComparison(new Date()) === formattedDate
              const hasEvents = normalizedCalendarData[formattedDate] && normalizedCalendarData[formattedDate].length > 0
              
              return (
                <div
                  key={i}
                  className={`
                    h-24 p-1 border rounded-md overflow-hidden
                    ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}
                    ${isToday ? 'ring-2 ring-sky-200' : ''}
                    ${hasEvents ? 'cursor-pointer hover:bg-slate-50' : ''}
                  `}
                  onClick={() => {
                    if (hasEvents) {
                      // Filter to show only this date's events when clicked
                      setSearchTerm("")
                      setActiveFilter("all")
                      
                      // Set filtered schedules to show only events for this date
                      const dateEvents = normalizedCalendarData[formattedDate]
                      setFilteredSchedules(dateEvents)
                      setViewMode("grid")
                    }
                  }}
                >
                  <div className="flex flex-col h-full">
                    <div className={`text-xs font-medium ${isToday ? 'bg-sky-100 text-sky-600 rounded-full w-5 h-5 flex items-center justify-center' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    {hasEvents && (
                      <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                        {normalizedCalendarData[formattedDate].slice(0, 2).map((schedule, idx) => (
                          <div 
                            key={schedule._id}
                            className="text-xs px-1 py-0.5 truncate rounded bg-sky-50 text-sky-600 border border-sky-100"
                          >
                            {schedule.time} - {schedule.startupId?.name || "Meeting"}
                          </div>
                        ))}
                        
                        {normalizedCalendarData[formattedDate].length > 2 && (
                          <span className="text-xs text-slate-500 px-1">
                            +{normalizedCalendarData[formattedDate].length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-slate-700" />
              <h1 className="text-3xl font-bold text-slate-800">Meeting Schedules</h1>
            </div>
            <p className="text-slate-600 max-w-xl">
              Manage and schedule meetings with startups. Track upcoming and past meetings in one place.
            </p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 px-6 shadow-md">
                <Plus size={18} />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="startup" className={formErrors.startupId ? "text-destructive" : ""}>
                    Startup <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.startupId} onValueChange={(value) => handleSelectChange("startupId", value)}>
                    <SelectTrigger className={formErrors.startupId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a startup" />
                    </SelectTrigger>
                    <SelectContent>
                      {startups.map((startup) => (
                        <SelectItem key={startup._id} value={startup._id}>
                          {startup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.startupId && <p className="text-destructive text-sm">Please select a startup</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className={formErrors.date ? "text-destructive" : ""}>
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={formErrors.date ? "border-destructive" : ""}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {formErrors.date && <p className="text-destructive text-sm">Required</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className={formErrors.time ? "text-destructive" : ""}>
                      Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={formErrors.time ? "border-destructive" : ""}
                    />
                    {formErrors.time && <p className="text-destructive text-sm">Required</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter meeting agenda or notes"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Create Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by startup or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full md:w-auto" value={activeFilter} onValueChange={setActiveFilter}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex justify-end">
              <Tabs defaultValue="grid" className="w-full md:w-auto" value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="grid">
                    <GridIcon className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">List</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Calendar</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewMode === "grid" && renderGridView()}
          {viewMode === "list" && renderListView()}
          {viewMode === "calendar" && renderCalendarView()}
        </div>
      </div>
    </div>
  )
}

export default Schedules
