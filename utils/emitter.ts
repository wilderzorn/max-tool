import Emittery from 'emittery';

const emitter = window.emitter ? window.emitter : new Emittery();

export default emitter;
