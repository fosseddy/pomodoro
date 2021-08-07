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

class Pomodoro {
  cycle: Cycle;
  timer: Timer;
  sessionCount: number;

  constructor(c: Cycle, t: Timer) {
    this.sessionCount = 0;
    this.cycle = c;
    this.timer = t;
  }

  tick(): boolean {
    this.timer.value -= 1;
    return this.timer.value === 0;
  }

  start() {
    this.timer.state = TimerState.Ticking;

    if (this.cycle.name === CycleName.Work) {
      this.sessionCount += 1;
    }
  }

  finish() {
    this.timer.state = TimerState.Finished;
  }

  pause() {
    this.timer.state = TimerState.Paused;
  }

  next() {
    this.timer.state = TimerState.Idle;

    if (this.cycle.name === CycleName.Break || this.cycle.name === CycleName.LongBreak) {
      if (this.cycle.name === CycleName.LongBreak) {
        this.sessionCount = 0;
      }
      this.setCycle({ name: CycleName.Work, time: 5 });
    } else if (this.sessionCount >= 3) {
      this.setCycle({ name: CycleName.LongBreak, time: 3 });
    } else {
      this.setCycle({ name: CycleName.Break, time: 1 });
    }
  }

  setCycle(newCycle: Cycle) {
    this.cycle = newCycle;
    this.timer.value = newCycle.time;
  }
}

export { Pomodoro, CycleName, TimerState };
