import { EventEmitter } from 'events';

// import { EventEmitter } from 'node:events';


class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// myEmitter.on('back', () => {
//   console.log('an even occured!');
//   process.exit(0);
// });
// myEmitter.emit('event');


export default myEmitter;