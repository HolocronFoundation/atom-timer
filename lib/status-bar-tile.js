'use babel'

import { EventEmitter } from 'events'
import { formatSeconds } from './time-formatter'

export default class StatusBarTile extends EventEmitter {
   constructor () {
      super()
      this.render()
   }

   render (seconds) {
      if (this.element == null) {
         // Hourglass icon
         this.iconSpan = document.createElement('span')
         this.iconSpan.className = 'icon icon-hourglass'
         this.iconSpan.addEventListener('click', () => this.emit('icon_click'))
         this.iconSpan.addEventListener('mouseover', () => this.toggleHighlight(this.iconSpan, true))
         this.iconSpan.addEventListener('mouseout', () => this.toggleHighlight(this.iconSpan, false))

         // Time display
         this.timeSpan = document.createElement('span')
         this.timeSpan.addEventListener('click', () => this.emit('time_click'))
         this.timeSpan.addEventListener('mouseover', () => this.toggleHighlight(this.timeSpan, true))
         this.timeSpan.addEventListener('mouseout', () => this.toggleHighlight(this.timeSpan, false))

         // Pause flag
         this.pauseSpan = document.createElement('span');
         this.pauseSpan.className = "pause"
         this.pauseSpan.textContent = '▯▯';

         // Container
         this.element = document.createElement('div');
         this.element.className = 'inline-block timer-tile';
         this.element.appendChild(this.iconSpan);
         this.element.appendChild(this.timeSpan);
         this.element.appendChild(this.pauseSpan);
      }

      // Set time
      this.timeSpan.textContent = formatSeconds(seconds)
   }

   togglePauseFlag (paused) {
      if (paused) this.pauseSpan.textContent = '▯▯';
      else this.pauseSpan.textContent = '▷';
   }

   toggleHighlight (element, hovered) {
      const highlightClass = 'text-warning'
      if (hovered) {
         if (!element.classList.contains(highlightClass)) element.classList.add(highlightClass)
      } else {
         element.classList.remove(highlightClass)
      }
   }

   getElement () { return this.element }

   destroy () { this.element.remove() }
}
