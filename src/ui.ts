import { Pomodoro, TimerState } from "./pomodoro";

class UI {
  interval: number;
  p: Pomodoro;
  timer: HTMLElement;
  timerControls: HTMLButtonElement;

  constructor(p: Pomodoro) {
    const timer = document.querySelector<HTMLElement>("#timer");
    const timerControls = document.querySelector<HTMLButtonElement>("#timer-controls");
    if (!timer || !timerControls) throw new Error("Tried to query DOM element, but too unlucky");

    this.timer = timer;
    this.timerControls = timerControls;
    this.p = p;
    this.interval = -1;
  }

  initEvents() {
    const buttonFns = {
      [TimerState.Idle]: this.startTimer,
      [TimerState.Ticking]: this.pauseTimer,
      [TimerState.Paused]: this.startTimer,
      [TimerState.Finished]: this.nextTimer 
    }

    this.timerControls.addEventListener("click", () => {
      const fn = buttonFns[this.p.timer.state].bind(this);
      fn();
    });
  }

  init() {
    this.renderTimer();
    this.renderTimerControls();
  }

  resetInterval() {
    if (this.interval !== -1) {
      clearInterval(this.interval);
      this.interval = -1;
    }
  }

  startTimer() {
    this.p.start();

    this.interval = window.setInterval(() => {
      const isFinished = this.p.tick();
      if (isFinished) this.finishTimer();
      this.renderTimer();
    }, 1000);

    this.renderTimerControls();
  }

  finishTimer() {
    this.p.finish();
    this.resetInterval();
    this.renderTimerControls();
  }

  pauseTimer() {
    this.p.pause();
    this.resetInterval();
    this.renderTimerControls();
  }

  nextTimer() {
    this.p.next();
    this.renderTimer();
    this.renderTimerControls();
  }

  renderTimer() {
    const s = this.p.timer.value;
    const min = Math.floor(s / 60);
    const sec = s % 60;

    this.timer.innerText = [min, sec].map(v => String(v).padStart(2, "0")).join(":");
  }

  renderTimerControls() {
    const buttonText = {
      [TimerState.Idle]: "Start",
      [TimerState.Ticking]: "Pause",
      [TimerState.Paused]: "Start",
      [TimerState.Finished]: "Next"
    }

    this.timerControls.innerText = buttonText[this.p.timer.state];
  }
}

export { UI };
