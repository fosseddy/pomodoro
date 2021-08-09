import React from "react";
import { usePomodoro, TimerState, Cycle } from "./pomodoro";
import type { Seconds } from "./pomodoro";
import styled from "styled-components";
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
    <Container>
      <h1>Pomodoro</h1>
      <h2>{printCycle(pomodoro.cycle)}</h2>

      <Timer time={pomodoro.timer} />

      <CircleProgress
        time={pomodoro.timer}
        // TODO: add timers to settings
        maxTime={(() => {
          const t = {
            [Cycle.Work]: 5,
            [Cycle.Break]: 1,
            [Cycle.LongBreak]: 3
          }

          return t[pomodoro.cycle];
        })()}
      />

      <TimerControls
        onStart={startTimer}
        onPause={pauseTimer}
        onNext={nextTimer}
        state={pomodoro.timerState}
      />

      <p>Session: {pomodoro.sessionCount}/3</p>
    </Container>
  );
}

const Container = styled.main`
  border: 1px solid black;
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  padding-top: 3rem;
`;

function CircleProgress({ time, maxTime }: { time: Seconds, maxTime: Seconds }) {
  const size = (s: string, r: string) => ({ cx: s, cy: s, r: r });
  const [v, setV] = React.useState<string>("0");

  React.useEffect(() => {
    const t = 283 - (time/maxTime*283);
    setV(t.toFixed(1));
  }, [time, maxTime]);

  return(
    <svg viewBox="0 0 100 100" style={{width: "200px", height: "auto", border: "1px solid red"}}>
      <g>
        <Circle {...size("50", "45")} />
        <ElapsedCircle {...size("50", "45")} strokeDasharray={v + " 283"} />
      </g>
    </svg>
  );
}

const Circle = styled.circle`
  fill: none;
  stroke: gray;
  stroke-width: 3px;
`;

const ElapsedCircle = styled(Circle)`
  stroke: red; 
  stroke-width: 6px;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: 1s linear all;
`;

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

export { App };
