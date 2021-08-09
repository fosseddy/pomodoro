import React from "react";
import { usePomodoro, TimerState, Cycle } from "./pomodoro";
import type { Seconds } from "./pomodoro";

import workFinishSound from "./assets/work-finish.mp3";
import breakFinishSound from "./assets/break-finish.mp3";

function App() {
  const pomodoro = usePomodoro();

  const sound = React.useRef<HTMLAudioElement>(new Audio());
  const interval = React.useRef<number>(-1);
  const intervalCallback = React.useRef<() => void>(intervalCb);

  React.useEffect(() => {
    intervalCallback.current = intervalCb;
  });

  React.useEffect(() => {
    const s = sound.current;

    return () => {
      resetInterval();
      s.pause();
    }
  }, []);

  function intervalCb() {
    const isFinished = pomodoro.tick();
    if (isFinished) finishTimer();
  }

  function resetInterval() {
    if (interval.current !== -1) {
      clearInterval(interval.current);
      interval.current = -1;
    }
  }

  function startTimer() {
    pomodoro.start();

    interval.current = window.setInterval(() => {
      intervalCallback.current();
    }, 1000);
  }

  function finishTimer() {
    pomodoro.finish();
    resetInterval();

    if (pomodoro.cycle === Cycle.Work) {
      sound.current.src = workFinishSound;
    } else {
      sound.current.src = breakFinishSound;
    }

    sound.current.play();
  }

  function pauseTimer() {
    pomodoro.pause();
    resetInterval();
  }

  function nextTimer() {
    pomodoro.next();
  }

  return (
    <div>
      <h1>Pomodoro</h1>
      <h2>{printCycle(pomodoro.cycle)}</h2>

      <Timer time={pomodoro.timer} />

      <TimerControls
        onStart={startTimer}
        onPause={pauseTimer}
        onNext={nextTimer}
        state={pomodoro.timerState}
      />

      <p>Session: {pomodoro.sessionCount}/3</p>
    </div>
  );
}

type TimerProps = { time: Seconds }

function Timer({ time }: TimerProps) {
  return(
    <p>{printTimer(time)}</p>
  );
}

type TimerControlsProps = {
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  state: TimerState; 
}

function TimerControls(props: TimerControlsProps) {
  if (props.state === TimerState.Idle || props.state === TimerState.Paused) {
    return(
      <button onClick={props.onStart}>
        Start
      </button>
    );
  }

  if (props.state === TimerState.Ticking) {
    return(
      <button onClick={props.onPause}>
        Pause
      </button>
    );
  }

  return(
    <button onClick={props.onNext}>
      Next
    </button>
  );
}

function printTimer(value: Seconds): string {
  const min = Math.floor(value / 60);
  const sec = value % 60;

  return [min, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function printCycle(cycle: Cycle) {
  const names = {
    [Cycle.Work]: "Work",
    [Cycle.Break]: "Break",
    [Cycle.LongBreak]: "Long Break"
  };

  return names[cycle];
}

export default App;
