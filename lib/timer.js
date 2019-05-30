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
         default: 'false'
      }
   },

   subscriptions: null,

   activate () {
      // Load state from local storage
      this.loadState();

      // Set up timer
      this.timer = new Timer();
      this.timer.on('tick', () => this.tick());

      // Register commands
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
         'timer:start/pause': () => this.start_pause(),
         'timer:stop': () => this.stop(),
         'timer:reset': () => this.reset()
      }))

      // Init EditorObserver
      this.editorObserver = new EditorObserver();
      this.editorObserver.on('lines_added', lines => this.statsTracker.addLines(lines));
      this.editorObserver.on('lines_deleted', lines => this.statsTracker.deleteLines(lines));

      // Init stats view
      this.statsView = new StatsView();
      this.statsViewModal = atom.workspace.addModalPanel({item: this.statsView.getElement(), visible: false});
      this.statsView.on('close_clicked', () => this.statsViewModal.hide());
   },

   deactivate () {
      this.subscriptions.dispose();

      for (let view of ['statusBarTile', 'statsView']) {
         if (this[view] != null) {
            this[view].destroy && this[view].destroy();
            this[view] = null;
         }
      }
   },

   /**
   * Load state from local storage
   */
   loadState () {
      const stateStr = window.localStorage.getItem('timer') || {};
      try {
         const state = JSON.parse(stateStr);
         this.statsTracker = new StatsTracker(state.stats);
      } catch (err) {
         console.log(err);
         window.localStorage.removeItem('timer');
         this.statsTracker = new StatsTracker();
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
      };

      window.localStorage.setItem('timer', JSON.stringify(toSave));
   },

   /**
   * Consumed services
   */
   consumeStatusBar (statusBar) {
      this.statusBarTile = new StatusBarTile();
      this.statusBarTile.on('icon_click', () => this.toggleStats());
      this.statusBarTile.on('time_click', () => this.start_pause());

      statusBar.addRightTile({
         item: this.statusBarTile.getElement(),
         priority: 999
      })
   },

   /**
   * Event handlers
   */
   start_pause () {
     if(this.timer.start_pause()) {
       this.editorObserver.start(); // TODO: Check if I need to stop the editorObserver
     }
   },

   // TODO cleanup
   stop () {
      this.timer.stop(); // TODO: Check if I need to stop the editorObserver
      this.statusBarTile.render();
   },

   reset () {
     if(this.timer.timer == null) {
        this.timer.stop();
     }
     else {
       this.timer.stop();
       this.timer.start();
     }
   },

   tick () {
      const seconds = this.timer.getSeconds();
      if (this.statusBarTile != null) this.statusBarTile.render(seconds);
   },

   /**
   * Toggle stats view modal
   */
   toggleStats () {
      if (this.statsViewModal.isVisible()) {
         this.statsViewModal.hide();
      } else {
         this.statsView.render(this.statsTracker.getStats())
         this.statsViewModal.show();
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
      });
   }
}
