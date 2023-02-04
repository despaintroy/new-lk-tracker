import {ArrowDropDown} from "@mui/icons-material"
import {Chip, Divider, Menu, MenuItem} from "@mui/material"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export interface UserChipProps {
  users: User[]
  task: Task
  setTask: (task: Task) => void
}

export const UserChip: FC<UserChipProps> = (props) => {
  const {users, task, setTask} = props
  const {session, currentUser} = useContext(AuthContext)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isChanging, setIsChanging] = useState(false)

  const isMine = task.user === currentUser._id
  const taskUser = users.find((user) => user._id === task.user)
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (user: User) => {
    setIsChanging(true)
    handleClose()

    session.task
      .modify(task._id, {user: {Assign: user._id}})
      .then(setTask)
      .catch(() => alert("Error changing user"))
      .finally(() => setIsChanging(false))
  }

  return (
    <>
      <Chip
        size="small"
        color={isMine ? "primary" : undefined}
        label={taskUser?.email ?? "Unknown"}
        icon={<ArrowDropDown />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={isChanging}
      />

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleChange(currentUser)}>Myself</MenuItem>
        <Divider />
        {users.map((user) => (
          <MenuItem onClick={() => handleChange(user)} key={user._id}>
            {user.email}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
