import { Pomodoro, TimerState, CycleName } from "./pomodoro";
import { UI } from "./ui";
import "./style.css";

const p = new Pomodoro(
  { name: CycleName.Work, time: 5 },
  { value: 5, state: TimerState.Idle }
);

const ui = new UI(p);

ui.initEvents();
ui.init();
