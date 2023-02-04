import {
  annotateEndpoint,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import {Project, Task, TimeEntry, User} from "api/sdk"
import dayjs from "dayjs"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export type AnnotatedTimeEntry = WithAnnotations<
  TimeEntry,
  {task?: Task; project?: Project; user?: User}
>

export interface TimeEntryTableProps
  extends Partial<RestDataTableProps<AnnotatedTimeEntry>> {
  hiddenColumns?: string[]
}

export const TimeEntryTable: FC<TimeEntryTableProps> = (props) => {
  const {hiddenColumns = [], ...restProps} = props

  const {session} = useContext(AuthContext)

  const annotatedTimeEntryEndpoint: SessionRestEndpoint<AnnotatedTimeEntry> =
    annotateEndpoint(session.timeEntry, async (timeEntries) => {
      const taskIds = new Set<string>()
      const projectIds = new Set<string>()
      const userIds = new Set<string>()

      timeEntries.forEach((timeEntry) => {
        userIds.add(timeEntry.user)
        timeEntry.task && taskIds.add(timeEntry.task)
        timeEntry.project && projectIds.add(timeEntry.project)
      })

      const [tasks, projects, users] = await Promise.all([
        session.task.query({condition: {_id: {Inside: [...taskIds]}}}),
        session.project.query({condition: {_id: {Inside: [...projectIds]}}}),
        session.user.query({condition: {_id: {Inside: [...userIds]}}})
      ])

      return timeEntries.map((timeEntry) => ({
        ...timeEntry,
        annotations: {
          user: users.find((user) => user._id === timeEntry.user),
          task: tasks.find((task) => task._id === timeEntry.task),
          project: projects.find((project) => project._id === timeEntry.project)
        }
      }))
    })

  const columns: RestDataTableProps<AnnotatedTimeEntry>["columns"] = [
    {
      field: "date",
      headerName: "Date",
      valueGetter: (params) => dayjs(params.row.date).format("MM/DD/YYYY"),
      type: "date"
    },
    {
      field: "duration",
      headerName: "Duration",
      valueGetter: (params) =>
        dayjs.duration(params.row.duration).format("HH:mm")
    },
    {
      field: "project",
      headerName: "Project",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.annotations.project?.name
    },
    {
      field: "task",
      headerName: "Task",
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => params.row.annotations.task?.description
    },
    {
      field: "user",
      headerName: "User",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.annotations.user?.email
    },
    {
      field: "summary",
      headerName: "Summary",
      flex: 2,
      minWidth: 200
    }
  ]

  return (
    <RestDataTable
      {...restProps}
      restEndpoint={annotatedTimeEntryEndpoint}
      defaultSorting={[{field: "date", sort: "desc"}]}
      columns={columns.filter(
        (column) => !hiddenColumns.includes(column.field)
      )}
    />
  )
}