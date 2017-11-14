'use babel'

import path from 'path'
import { CompositeDisposable } from 'atom'
import Timer from './timer'
import StatusBarTile from './status-bar-tile'
import StatsTracker from './stats-tracker'
import EditorObserver from './editor-observer'
import StatsView from './stats-view'


export default {
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
      'tomatimer:start': () => this.start(),
      'tomatimer:stop': () => this.stop(),
      'tomatimer:reset': () => this.reset(),
      'tomatimer:pause-or-resume': () => this.pauseOrResume()
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
    const stateStr = window.localStorage.getItem('Tiny-Timer') || {}
    try {
      const state = JSON.parse(stateStr)
      this.statsTracker = new StatsTracker(state.stats)
    } catch (err) {
      console.log(err)
      window.localStorage.removeItem('Tiny-Timer')
      this.statsTracker = new StatsTracker()
    }
  },

  /**
   * Instead of using Atom's serializing mechanism that saves state separately for different projects,
   * use localStorage to share history data across projects and windows.
   * Atom manages the calls of this method, which is perfect for us.
   * TODO More achivements and stats
   */
  serialize () {
    const toSave = {
      stats: this.statsTracker.getStats()
    }

    window.localStorage.setItem('Tiny-Timer', JSON.stringify(toSave))
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
    if (this.timer.isStopped()) return

    if (this.paused) {
      this.timer.resume()
      this.paused = false
      this.notify('Tiny Timer has resumed')
    } else {
      this.timer.pause()
      this.paused = true
      this.notify('Tiny Timer is paused')

      // Resume once user starts typing again
      this.editorObserver.once('editor_did_change', () => {
        if (this.paused) this.pauseOrResume()
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
    if (!silent) this.beep()
    atom.notifications.addInfo(title, {
      detail: message,
      icon: 'hourglass'
    })
  },

  _start () {
    const todayCompletions = this.statsTracker.today.completions

    this.editorObserver.start()
  }
}
