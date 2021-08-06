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

function resetInterval() {
  if (p.interval !== -1) {
    clearInterval(p.interval);
    p.interval = -1;
  }
}

function startTimer() {
  console.log("Timer Started");
  p.timer.state = TimerState.Ticking;

  if (p.cycle.name === CycleName.Work) {
    p.sessionCount += 1;
  }

  p.interval = window.setInterval(() => {
    if (p.timer.value === 0) {
      finishTimer();
    } else {
      p.timer.value -= 1;
    }

    renderTimer();
  }, 1000);
}

function finishTimer() {
  console.log("Timer Finished");
  p.timer.state = TimerState.Finished;
  resetInterval();

  renderTimerControls();
}

function pauseTimer() {
  console.log("Timer Paused");
  p.timer.state = TimerState.Paused;
  resetInterval();
}

function nextTimer() {
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

  renderTimer();
}

function renderTimer() {
  const s = p.timer.value;
  const min = Math.floor(s / 60);
  const sec = s % 60;

  timer.innerText = [min, sec].map(v => String(v).padStart(2, "0")).join(":");
}

function renderTimerControls() {
  const text = ((): string => {
    switch (p.timer.state) {
      case TimerState.Idle:
      case TimerState.Paused:
        return "Start";

      case TimerState.Ticking:
        return "Pause";

      case TimerState.Finished:
        return "Next";
    }
  })();

  timerControls.innerText = text;
}

const maybeTimer = document.querySelector<HTMLParagraphElement>("#timer");
const maybeTimerControls = document.querySelector<HTMLButtonElement>("#timer-controls");
if (!maybeTimer || !maybeTimerControls) throw new Error("Tried to query dom element, but too unlucky");

const timer = maybeTimer;
const timerControls = maybeTimerControls;

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

timerControls.addEventListener("click", () => {
  switch (p.timer.state) {
    case TimerState.Idle:
    case TimerState.Paused:
      startTimer(); 
      break;

    case TimerState.Ticking:
      pauseTimer();
      break;

    case TimerState.Finished:
      nextTimer();
      break;
  }

  renderTimerControls();
});

renderTimer();
renderTimerControls();






































