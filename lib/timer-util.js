'use babel'

import {EventEmitter} from 'events'

export default class Timer extends EventEmitter {

   /**
   * Start timer
   * @return {number} Return true if start successfully, false if started already
   */
   start_pause() {
     if (this.seconds == null) {
        this.seconds = 0;
        this.countUp();
        return true;
     } // TODO: Right now this stops it even if stopped, need to make it go
     clearTimeout(this.timer);
     this.timer = null;
     return false;
   }

   stop () {
      clearTimeout(this.timer);
      this.timer = this.seconds = null;
   }

   resume () {
      this.countUp();
   }

   countUp () {
      this.emit('tick');
      this.seconds++;
      this.timer = setTimeout(() => this.countUp(), 1000);
   }

}
