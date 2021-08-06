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
  interval: number;
  sessionCount: number;
}

function printTime(s: Seconds): string {
  const min = Math.floor(s / 60);
  const sec = s % 60;

  return [min, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function resetInterval(p: Pomodoro) {
  if (p.interval != -1) {
    clearInterval(p.interval);
    p.interval = -1;
  }
}

function startTimer(p: Pomodoro) {
  console.log("Timer Started");
  p.timer.state = TimerState.Ticking;

  if (p.cycle.name === CycleName.Work) {
    p.sessionCount += 1;
  }

  p.interval = window.setInterval(() => {
    if (p.timer.value === 0) {
      finishTimer(p);
    } else {
      p.timer.value -= 1;
    }
  }, 1000);
}

function finishTimer(p: Pomodoro) {
  console.log("Timer Finished");
  p.timer.state = TimerState.Finished;
  resetInterval(p);
}

function pauseTimer(p: Pomodoro) {
  console.log("Timer Paused");
  p.timer.state = TimerState.Paused;
  resetInterval(p);
}

function nextTimer(p: Pomodoro) {
  console.log("Next Timer");
  p.timer.state = TimerState.Idle;

  if (p.cycle.name === CycleName.Break || p.cycle.name === CycleName.LongBreak) {
    if (p.cycle.name === CycleName.LongBreak) {
      p.sessionCount = 0;
    }
    p.cycle.name = CycleName.Work;
    p.cycle.time = 5;
    p.timer.value = 5;
  } else if (p.sessionCount >= 3) {
    p.cycle.name = CycleName.LongBreak;
    p.cycle.time = 3;
    p.timer.value = 3;
  } else {
    p.cycle.name = CycleName.Break;
    p.cycle.time = 1;
    p.timer.value = 1;
  }
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
    },
    interval: -1,
    sessionCount: 0
  };

  console.log(p);
}

main();












