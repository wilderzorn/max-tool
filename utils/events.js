import EventEmitter from 'events';

const emitter = window.emitter ? window.emitter : new EventEmitter();
emitter.setMaxListeners(200);

export default emitter;
