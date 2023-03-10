import {Aggregate, Condition} from "@lightningkite/lightning-server-simplified"
import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Typography, useMediaQuery, useTheme} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {dateToISO, getTimerSeconds} from "utils/helpers"

dayjs.extend(duration)

export const SummaryTime: FC = () => {
  const {session, currentUser, applicationSettings} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [submittedSeconds, setSubmittedSeconds] = useState<number>()
  const [unsubmittedSeconds, setUnsubmittedSeconds] = useState(0)

  const calculateUnsubmittedSeconds = () => {
    const seconds = Object.values(timers).reduce(
      (acc, timer) => acc + getTimerSeconds(timer),
      0
    )

    setUnsubmittedSeconds(seconds)
  }

  useEffect(() => {
    const interval = setInterval(calculateUnsubmittedSeconds, 1000)
    return () => clearInterval(interval)
  }, [timers])

  useEffect(() => {
    const dateCondition: Condition<string> =
      applicationSettings.summaryTime === "day"
        ? {Equal: dateToISO(new Date(), false)}
        : {
            GreaterThanOrEqual: dateToISO(
              dayjs().startOf("week").toDate(),
              false
            )
          }

    session.timeEntry
      .aggregate({
        aggregate: Aggregate.Sum,
        condition: {
          And: [{user: {Equal: currentUser._id}}, {date: dateCondition}]
        },
        property: "durationMilliseconds"
      })
      .then((milliseconds) => setSubmittedSeconds((milliseconds ?? 0) / 1000))
      .catch(console.error)
  }, [timers, applicationSettings.summaryTime])

  return (
    <HoverHelp
      description={
        applicationSettings.summaryTime === "day" ? "Today" : "This Week"
      }
    >
      <Typography fontSize={isMobile ? undefined : "1.2rem"}>
        {submittedSeconds !== undefined
          ? dayjs
              .duration(submittedSeconds + unsubmittedSeconds, "seconds")
              .format("H : mm : ss")
          : "00 : 00 : 00"}
      </Typography>
    </HoverHelp>
  )
}
