<script lang="ts">
import Vue from "vue";
import finishWorkSound from "./assets/work-finish.mp3";
import finishBreakSound from "./assets/break-finish.mp3";

type Seconds = number

enum TimerState {
  Idle = "IDLE",
  Ticking = "TICKING",
  Paused = "PAUSED",
  Finished = "FINISHED"
}

type Timer = {
  value: Seconds;
  state: TimerState;
}

enum CycleName {
  Work = "WORK",
  Break = "BREAK",
  LongBreak = "LONG_BREAK"
}

type Cycle = {
  name: CycleName;
  time: Seconds;
}

type Data = {
  timer: Timer;
  cycle: Cycle;
  setIntervalId: number;
  sessionCount: number;

  sound: {
    work: HTMLAudioElement;
    break: HTMLAudioElement;
  }

  TimerState: typeof TimerState;
}

export default Vue.extend({
  name: "App",

  data(): Data {
    return {
      timer: { value: 4, state: TimerState.Idle },
      cycle: { name: CycleName.Work, time: 4 },
      setIntervalId: -1,
      sessionCount: 0,

      sound: {
        work: new Audio(finishWorkSound),
        break: new Audio(finishBreakSound)
      },

      TimerState
    };
  },

  computed: {
    formattedTimer(): string {
      const min = Math.floor(this.timer.value / 60);
      const sec = this.timer.value % 60;

      return [min, sec].map(v => String(v).padStart(2, "0")).join(":");
    },

    circleProgress(): string {
      const len = 283 - (this.timer.value / this.cycle.time * 283);
      return len.toFixed(0) + " 283";
    }
  },

  destroyed() {
    this.resetInterval();
    this.sound.work.pause();
    this.sound.break.pause();
  },

  methods: {
    resetInterval() {
      if (this.setIntervalId !== -1) {
        clearInterval(this.setIntervalId);
        this.setIntervalId = -1;
      }
    },

    startTimer() {
      if (this.cycle.name === CycleName.Work &&
          this.timer.state === TimerState.Idle) {
        this.sessionCount += 1;
      }

      this.timer.state = TimerState.Ticking;

      this.setIntervalId = setInterval(() => {
        if (this.timer.value > 0) {
          this.timer.value -= 1;
        } else {
          this.finishTimer();
        }
      }, 1000);
    },

    pauseTimer() {
      this.timer.state = TimerState.Paused;
      this.resetInterval();
    },

    finishTimer() {
      this.timer.state = TimerState.Finished;
      this.resetInterval();

      if (this.cycle.name === CycleName.Work) {
        this.sound.work.play();
      } else {
        this.sound.break.play();
      }
    },

    nextTimer() {
      this.timer.state = TimerState.Idle;

      if (this.cycle.name === CycleName.Break ||
          this.cycle.name === CycleName.LongBreak) {
        if (this.cycle.name === CycleName.LongBreak) {
          this.sessionCount = 0;
        }
        this.cycle = { name: CycleName.Work, time: 4 };
        this.timer.value = 4;
      } else if (this.sessionCount >= 3) {
        this.cycle = { name: CycleName.LongBreak, time: 2 };
        this.timer.value = 2;
      } else {
        this.cycle = { name: CycleName.Break, time: 1 };
        this.timer.value = 1;
      }
    }
  }
});
</script>

<template lang="pug">
  div#app
    div
      h1 Pomodoro
      br


      div(class="timer")
        svg(class="timer-progress" viewBox="0 0 100 100")
          g
            circle(class="timer-progress__circle timer-progress__circle--bg")
            circle(
              class="timer-progress__circle timer-progress__circle--fg"
              :stroke-dasharray="circleProgress"
            )
        div(style="position: absolute; display: flex; flex-direction: column; align-items: center;")
          p(class="timer-value") {{ formattedTimer }}
          p(class="timer-state") {{ cycle.name }}

      br
      br

      button(
        v-if="timer.state === TimerState.Idle || timer.state === TimerState.Paused"
        @click="startTimer"
      ) Start

      button(
        v-else-if="timer.state === TimerState.Ticking"
        @click="pauseTimer"
      ) Pause

      button(v-else @click="nextTimer") Next
      br
      br

      p Session: {{ sessionCount }} / 3
</template>

<style scoped lang="scss">
$navy: #2f384b;
$white: #f6f2eb;
$red: #ff4e4d;
$green: #05ec8c;
$blue: #0bbddb;
$gray: #858c99;

#app {
  background: $navy;
}

.timer {
  position: relative;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer-value {
  color: $white;
  font-size: 64px;
}

.timer-state {
  color: $white;
  font-size: 32px;
  text-transform: lowercase;
}

.timer-progress {
  transform: rotate(-90deg);
  border: 1px solid green;
}

.timer-progress__circle {
  cx: 50px;
  cy: 50px;
  r: 45px;
  fill: none;
}

.timer-progress__circle--bg {
  stroke-width: 1px;
  stroke: $gray;
}

.timer-progress__circle--fg {
  stroke-width: 4px;
  stroke: $red;
  stroke-linecap: round;
  transition: stroke-dasharray 1s linear;
}
</style>
