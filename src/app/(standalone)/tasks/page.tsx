"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  Circle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TaskStatus = "In Progress" | "Done" | "Canceled" | "Todo" | "Backlog"
type TaskPriority = "Low" | "Medium" | "High"
type TaskLabel = "Bug" | "Feature" | "Documentation"

interface Task {
  id: string
  label: TaskLabel
  title: string
  status: TaskStatus
  priority: TaskPriority
}

const tasks: Task[] = [
  { id: "TASK-8782", label: "Documentation", title: "You can't compress the program without quantifying the open-source SS...", status: "In Progress", priority: "Medium" },
  { id: "TASK-1138", label: "Feature", title: "Generating the driver won't do anything, we need to quantify the 1080p SM ...", status: "In Progress", priority: "Medium" },
  { id: "TASK-8404", label: "Documentation", title: "Calculating the bus won't do anything, we need to navigate the back-end...", status: "In Progress", priority: "High" },
  { id: "TASK-5365", label: "Bug", title: "We need to generate the virtual HEX alarm!", status: "In Progress", priority: "Low" },
  { id: "TASK-1024", label: "Documentation", title: "Backing up the pixel won't do anything, we need to transmit the primary l...", status: "In Progress", priority: "Low" },
  { id: "TASK-1571", label: "Documentation", title: "Overriding the microchip won't do anything, we need to transmit the digit...", status: "In Progress", priority: "Low" },
  { id: "TASK-8484", label: "Feature", title: "I'll input the neural DRAM circuit, that should protocol the SMTP interface!", status: "In Progress", priority: "Medium" },
  { id: "TASK-9616", label: "Bug", title: "We need to parse the solid state UDP firewall!", status: "In Progress", priority: "Low" },
  { id: "TASK-4920", label: "Feature", title: "We need to synthesize the cross-platform ASCII pixel!", status: "In Progress", priority: "Medium" },
  { id: "TASK-5168", label: "Bug", title: "Bypassing the hard drive won't do anything, we need to input the bluetooth ...", status: "In Progress", priority: "High" },
]

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  High: <ArrowUp className="h-4 w-4 text-muted-foreground" />,
  Medium: <ArrowRight className="h-4 w-4 text-muted-foreground" />,
  Low: <ArrowDown className="h-4 w-4 text-muted-foreground" />,
}

export default function TasksPage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [filterValue, setFilterValue] = useState("")

  const allSelected = selectedRows.size === tasks.length
  const someSelected = selectedRows.size > 0 && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(tasks.map((t) => t.id)))
    }
  }

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(filterValue.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-auto p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks for this month.
          </p>
        </div>
        <Avatar>
          <AvatarImage src="" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter tasks..."
            className="w-[250px] h-8"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <Button variant="outline" size="sm">
            Status
          </Button>
          <Button variant="outline" size="sm">
            Priority
          </Button>
          <Button variant="ghost" size="sm">
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected || (someSelected && "indeterminate")}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[120px]">
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  Task
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[180px]">
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[180px]">
                <Button variant="ghost" size="sm" className="-ml-3 h-8">
                  Priority
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[72px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow
                key={task.id}
                data-state={selectedRows.has(task.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(task.id)}
                    onCheckedChange={() => toggleRow(task.id)}
                    aria-label={`Select ${task.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{task.label}</Badge>
                    <span className="truncate max-w-[500px]">{task.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    {task.status}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {priorityIcons[task.priority]}
                    {task.priority}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Make a copy</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          {selectedRows.size} of {tasks.length} row(s) selected.
        </p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm font-medium">Page 1 of 2</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
