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

type Settings = {
  work: Cycle;
  break: Cycle;
  longBreak: Cycle;
  maxSessionCount: number;
}

type Data = {
  timer: Timer;
  cycle: Cycle;
  setIntervalId: number;
  sessionCount: number;

  settings: Settings;

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
      timer: { value: -1, state: TimerState.Idle },
      cycle: { name: CycleName.Work, time: -1 },
      sessionCount: 0,
      setIntervalId: -1,

      settings: {
        work: { name: CycleName.Work, time: 25 * 60 },
        break: { name: CycleName.Break, time: 5 * 60 },
        longBreak: { name: CycleName.LongBreak, time: 20 * 60 },
        maxSessionCount: 4
      },

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
      const circleLen = 283;
      const progress =
        circleLen - (this.timer.value / this.cycle.time * circleLen);
      return `${progress.toFixed(0)} ${circleLen}`;
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

  created() {
    this.setNewCycle(this.settings.work);

    console.assert(
      this.timer.value !== -1 && this.cycle.time !== -1,
      "Could not initialize setting values"
    );
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
      if (
        this.cycle.name === CycleName.Work &&
        this.timer.state === TimerState.Idle
      ) {
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

      if (this.cycle.name !== CycleName.Work) {
        if (this.cycle.name === CycleName.LongBreak) {
          this.sessionCount = 0;
        }
        this.setNewCycle(this.settings.work);
      } else if (this.sessionCount >= this.settings.maxSessionCount) {
        this.setNewCycle(this.settings.longBreak);
      } else {
        this.setNewCycle(this.settings.break);
      }
    },

    setNewCycle(c: Cycle) {
      this.cycle = c;
      this.timer.value = c.time;
    },

    reset() {
      this.resetInterval();
      this.setNewCycle(this.settings.work);
      this.timer.state = TimerState.Idle;
      this.sessionCount = 0;
    }
  }
});
</script>

<template lang="pug">
  div#app
    div.timer
      svg.timer__progress(viewBox="0 0 100 100")
        g
          circle.timer__progress-circle.timer__progress-circle--bg
          circle.timer__progress-circle.timer__progress-circle--fg(
            :class="`timer__progress-circle--${circleProgressColor}`"
            :stroke-dasharray="circleProgress"
          )

      div.timer__info
        p.timer__value {{ formattedTimer }}
        p.timer__cycle-name {{ cycleName }}

    button.btn.btn--content-center(
      v-if="timer.state === TimerState.Idle || timer.state === TimerState.Paused"
      @click="startTimer"
    )
      svg.icon(viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          polygon.icon--filled-white.icon--white(points="10,8 16,12 10,16 10,8")

    button.btn.btn--content-center(
      v-else-if="timer.state === TimerState.Ticking"
      @click="pauseTimer"
    )
      svg.icon(viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          rect.icon--white(x="10" y="8" width="1" height="8")
          rect.icon--white(x="13" y="8" width="1" height="8")

    button.btn.btn--content-center(v-else @click="nextTimer")
      svg.icon(viewBox="0 0 24 24")
        g
          circle(cx="12" cy="12" r="11")
          polyline.icon--white(
            stroke-width="2"
            points="9,8 12,12 9,16"
          )
          polyline.icon--white(
            stroke-width="2"
            points="13,8 16,12 13,16"
          )

    div.session-counter
      p.session-counter__value
        | {{ sessionCount }} / {{ settings.maxSessionCount }}
      button.session-counter__btn.btn(@click="reset") Reset
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5rem;
  padding-bottom: 2rem;
}

.btn {
  cursor: pointer;
  border: none;
  background: none;

  &:hover { opacity: 0.5; }

  &--content-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.icon {
  width: 64px;
  fill: none;
  stroke: $gray;
  stroke-width: 1px;
  stroke-linecap: round;
  stroke-linejoin: round;

  &--filled-gray { fill: $gray; }
  &--filled-white { fill: $white; }
  &--white { stroke: $white; }
}

.timer {
  position: relative;
  width: 100%;
  height: 60%;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $white;
  margin-bottom: 3rem;

  &__progress { transform: rotate(-90deg); }

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
    padding-top: 1rem;
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

.session-counter {
  margin-top: auto;
  display: flex;
  flex-direction: column;

  &__value {
    text-align: center;
    color: $white;
    margin-bottom: .5rem;
  }

  &__btn { color: $gray; }
}
</style>
