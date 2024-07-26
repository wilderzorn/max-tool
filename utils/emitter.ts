import Emittery from 'emittery';

const emitter = window.emitter ? window.emitter : new Emittery();
emitter?.setMaxListeners(200); // 最大监听器数量为 200

export default emitter;
