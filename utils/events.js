import EventEmitter from 'events';

const emitter = window.emitter ?? new EventEmitter();
emitter.setMaxListeners(200);

if (!window.emitter) {
  window.emitter = emitter;
}

export default emitter;
