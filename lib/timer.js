'use babel'

import path from 'path'
import { CompositeDisposable } from 'atom'
import Timer from './timer-util'
import StatusBarTile from './status-bar-tile'
import StatsTracker from './stats-tracker'
import EditorObserver from './editor-observer'
import StatsView from './stats-view'


export default {
   config: {
      typeToResume: {
         title: 'Type To Resume',
         description: 'Typing into the open Atom tab will automatically resume the timer.',
         type: 'boolean',
         default: 'true'
      }
   },

   subscriptions: null,

   activate () {
      // Load state from local storage
      this.loadState()

      // Set up timer
      this.timer = new Timer()
      this.timer.on('tick', () => this.tick())

      // Register commands
      this.subscriptions = new CompositeDisposable()
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'timer:start': () => this.start(),
         'timer:stop': () => this.stop(),
         'timer:reset': () => this.reset(),
         'timer:pause-or-resume': () => this.pauseOrResume()
      }))

      // Init EditorObserver
      this.editorObserver = new EditorObserver()
      this.editorObserver.on('lines_added', lines => this.statsTracker.addLines(lines))
      this.editorObserver.on('lines_deleted', lines => this.statsTracker.deleteLines(lines))

      // Init stats view
      this.statsView = new StatsView()
      this.statsViewModal = atom.workspace.addModalPanel({item: this.statsView.getElement(), visible: false})
      this.statsView.on('close_clicked', () => this.statsViewModal.hide())
   },

   deactivate () {
      this.subscriptions.dispose()

      for (let view of ['statusBarTile', 'statsView']) {
         if (this[view] != null) {
            this[view].destroy && this[view].destroy()
            this[view] = null
         }
      }
   },

   /**
   * Load state from local storage
   */
   loadState () {
      const stateStr = window.localStorage.getItem('timer') || {}
      try {
         const state = JSON.parse(stateStr)
         this.statsTracker = new StatsTracker(state.stats)
      } catch (err) {
         console.log(err)
         window.localStorage.removeItem('timer')
         this.statsTracker = new StatsTracker()
      }
   },

   /**
   * Instead of using Atom's serializing mechanism that saves state separately for different projects,
   * use localStorage to share history data across projects and windows.
   * Atom manages the calls of this method, which is perfect for us.
   * TODO More achievements and stats
   */
   serialize () {
      const toSave = {
         stats: this.statsTracker.getStats()
      }

      window.localStorage.setItem('timer', JSON.stringify(toSave))
   },

   /**
   * Consumed services
   */
   consumeStatusBar (statusBar) {
      this.statusBarTile = new StatusBarTile()
      this.statusBarTile.on('icon_click', () => this.toggleStats())
      this.statusBarTile.on('time_click', () => this.pauseOrResume())

      statusBar.addRightTile({
         item: this.statusBarTile.getElement(),
         priority: 999
      })
   },

   /**
   * Event handlers
   */
   start () {
      if (this.statusBarTile == null) setTimeout(() => this._start(), 1000)
      else this._start()
   },

   pauseOrResume () {
      if (!this.timer.getSeconds()) {
         this.start()
         return
      }
      if (this.timer.isStopped()) return

      if (this.paused) {
         this.timer.resume()
         this.paused = false
      } else {
         this.timer.pause()
         this.paused = true

         // Resume once user starts typing again
         this.editorObserver.once('editor_did_change', () => {
            if (this.paused && atom.config.get('timer.typeToResume')) this.pauseOrResume()
         })
      }
      this.statusBarTile.togglePauseFlag(this.paused)
   },

   // TODO cleanup
   stop () {
      this.timer.stop()
      this.statusBarTile.render()
   },

   reset () {
      this.timer.stop()
      this.timer.start()
   },

   tick () {
      const seconds = this.timer.getSeconds()
      if (this.statusBarTile != null) this.statusBarTile.render(seconds)
   },

   /**
   * Toggle stats view modal
   */
   toggleStats () {
      if (this.statsViewModal.isVisible()) {
         this.statsViewModal.hide()
      } else {
         this.statsView.render(this.statsTracker.getStats())
         this.statsViewModal.show()
      }
   },


   /**
   * Play sound and show notification
   * @param  {string} title - Title of notification
   * @param  {string} message - Body of notification
   * @param  {boolean} silent - Whether sound should be muted, default to false
   */
   notify (title, message, silent = false) {
      atom.notifications.addInfo(title, {
         detail: message,
         icon: 'hourglass'
      })
   },

   _start () {
      if (this.timer.start()) this.notify('Timer started')
      this.editorObserver.start()
   }
}
