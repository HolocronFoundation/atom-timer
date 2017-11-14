'use babel'

import {EventEmitter} from 'events'

export default class Timer extends EventEmitter {

   /**
   * Start timer
   * @return {number} Return 1 if started successfully, 0 if started already
   */
   start () {
      if (this.seconds == null) {
         this.seconds = 0
         this.countUp()
         return 1
      }
      return 0
   }

   stop () {
      clearTimeout(this.timer)
      this.timer = this.seconds = null
   }

   pause () {
      if (this.isStopped()) return // Do nothing if stopped
      clearTimeout(this.timer)
      this.timer = null
   }

   resume () {
      this.countUp()
   }

   countUp () {
      this.emit('tick')
      this.seconds++

      this.timer = setTimeout(() => this.countUp(), 1000)
   }

   getSeconds () {
      return this.seconds
   }

   isStopped () {
      return this.seconds == null
   }
}
