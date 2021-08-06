import "./style.css";

type Seconds = number

enum CycleName {
  Work = 0,
  Break,
  LongBreak
}

type Cycle = {
  name: CycleName;
  time: Seconds;
}

enum TimerState {
  Idle = 0,
  Ticking,
  Paused,
  Finished
}

type Timer = {
  value: Seconds;
  state: TimerState;
}

type Pomodoro = {
  cycle: Cycle;
  timer: Timer;
}

function printTime(s: Seconds): string {
  const min = Math.floor(s / 60);
  const sec = s % 60;

  return [min, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function main() {
  const p: Pomodoro = {
    cycle: {
      name: CycleName.Work,
      time: 5
    },
    timer: {
      value: 5,
      state: TimerState.Idle
    }
  };

  console.log("Timer Started");
  p.timer.state = TimerState.Ticking;

  let id = setInterval(() => {
    if (p.timer.value === 0) {
      console.log("Timer Finished");
      p.timer.state = TimerState.Finished;
      clearInterval(id);
    } else {
      p.timer.value -= 1;
    }
  }, 1000);
}

main();












