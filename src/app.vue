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
    },

    circleProgressColor(): string {
      const colors = {
        [CycleName.Work]: "red",
        [CycleName.Break]: "green",
        [CycleName.LongBreak]: "blue"
      };

      return colors[this.cycle.name];
    },

    cycleName(): string {
      const names = {
        [CycleName.Work]: "Work",
        [CycleName.Break]: "Break",
        [CycleName.LongBreak]: "Long break"
      };

      return names[this.cycle.name];
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
    div(class="timer")
      svg(class="timer__progress" viewBox="0 0 100 100")
        g
          circle(class="timer__progress-circle timer__progress-circle--bg")
          circle(
            class="timer__progress-circle timer__progress-circle--fg"
            :class="`timer__progress-circle--${circleProgressColor}`"
            :stroke-dasharray="circleProgress"
          )

      div(class="timer__info")
        p(class="timer__value") {{ formattedTimer }}
        p(class="timer__cycle-name") {{ cycleName }}

    button(
      v-if="timer.state === TimerState.Idle || timer.state === TimerState.Paused"
      @click="startTimer"
    )
      svg(class="icon" viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          polygon(class="icon--filled-white icon--white" points="10,8 16,12 10,16 10,8")

    button(
      v-else-if="timer.state === TimerState.Ticking"
      @click="pauseTimer"
    )
      svg(class="icon" viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          rect(class="icon--white" x="10" y="8" width="1" height="8")
          rect(class="icon--white" x="13" y="8" width="1" height="8")

    button(v-else @click="nextTimer")
      svg(class="icon" viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          polyline(class="icon--white" stroke-width="2" points="9,8 12,12 9,16")
          polyline(class="icon--white" stroke-width="2" points="13,8 16,12 13,16")

    p Session: {{ sessionCount }} / 3
</template>

<style scoped lang="scss">
$navy: #2f384b;
$light-navy: #3d4457;
$white: #f6f2eb;
$red: #ff4e4d;
$green: #05ec8c;
$blue: #0bbddb;
$gray: #858c99;
$light-gray: #c0c9da;

button {
  cursor: pointer;
  border: none;
  background: none;

  &:hover {
    opacity: 0.5;
  }
}

#app {
  background: $navy;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
}

.icon {
  width: 64px;
  heigth: 64px;
  fill: none;
  stroke: $gray;
  stroke-width: 1px;
  stroke-linecap: round;
  stroke-linejoin: round;

  &--filled-gray {
    fill: $gray;
  }

  &--filled-white {
    fill: $white;
  }

  &--white {
    stroke: $white;
  }
}

.timer {
  position: relative;
  width: 100%;
  height: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $white;

  &__progress {
    transform: rotate(-90deg);
  }

  &__progress-circle {
    cx: 50px;
    cy: 50px;
    r: 45px;
    fill: none;

    &--bg {
      stroke-width: 1px;
      stroke: $gray;
    }

    &--fg {
      stroke-width: 4px;
      stroke-linecap: round;
      transition: stroke-dasharray 1s linear;
    }

    &--red { stroke: $red; }
    &--blue { stroke: $blue; }
    &--green { stroke: $green; }
  }

  &__info {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 1rem; // balance out &__value margin-bottom: 1rem
  }

  &__value {
    font-size: 64px;
    margin-bottom: 1rem;
  }

  &__cycle-name {
    font-size: 20px;
    text-transform: uppercase;
  }
}
</style>
