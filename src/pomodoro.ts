import React from "react";

type Seconds = number

enum Cycle {
  Work = "WORK",
  Break = "BREAK",
  LongBreak = "LONG_BREAK"
}

enum TimerState {
  Idle = "IDLE",
  Ticking = "TICKING",
  Paused = "PAUSED",
  Finished = "FINISHED"
}

type usePomodoroHook = {
  tick: () => boolean;
  start: () => void;
  finish: () => void;
  pause: () => void;
  next: () => void;
  cycle: Cycle;
  timer: Seconds;
  timerState: TimerState;
  sessionCount: number;
}

function usePomodoro(): usePomodoroHook {
  const [cycle, setCycle] = React.useState<Cycle>(Cycle.Work);
  const [timer, setTimer] = React.useState<Seconds>(5);
  const [timerState, setTimerState] = React.useState<TimerState>(TimerState.Idle);
  const [sessionCount, setSessionCount] = React.useState<number>(0);

  function tick(): boolean {
    const newTimer = timer - 1;
    setTimer(newTimer);
    return newTimer <= 0;
  }

  function start() {
    if (cycle === Cycle.Work && timerState === TimerState.Idle) {
      setSessionCount(sessionCount + 1);
    }
    setTimerState(TimerState.Ticking);
  }

  function finish() {
    setTimerState(TimerState.Finished);
  }

  function pause() {
    setTimerState(TimerState.Paused);
  }

  function next() {
    setTimerState(TimerState.Idle);

    if (cycle === Cycle.Break || cycle === Cycle.LongBreak) {
      if (cycle === Cycle.LongBreak) {
        setSessionCount(0);
      }

      // TODO: Add max session count and cycles time to settings
      setNewCycle(Cycle.Work, 5);
    } else if (sessionCount >= 3) {
      setNewCycle(Cycle.LongBreak, 5);
    } else {
      setNewCycle(Cycle.Break, 1);
    }
  }

  function setNewCycle(newCycle: Cycle, time: Seconds) {
    setCycle(newCycle);
    setTimer(time);
  }

  return {
    tick,
    start,
    finish,
    pause,
    next,
    cycle,
    timer,
    timerState,
    sessionCount
  };
}

export { usePomodoro, Cycle, TimerState };
export type { Seconds };
