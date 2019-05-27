# Timer
[![apm version](https://img.shields.io/apm/v/tinytimer.svg?style=flat-square)](https://atom.io/packages/tinytimer)
[![Build Status](https://travis-ci.org/igrad/atom-tomatimer.svg?branch=master)](https://travis-ci.org/igrad/atom-tomatimer)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

A basic timer for [Atom](https://atom.io), based on igrad's [fork](https://github.com/igrad/atom-tomatimer) of Yu1989's [tomatimer](https://github.com/Yu1989/atom-tomatimer).


## Install
```
$ apm install tinytimer
```

## Usage
- Commands in *Command Palette*:
  - `timer: Start` Start Tiny Timer.
  - `timer: Stop` Stop Tiny Timer.
  - `timer: Reset` Restart current session.
  - `timer: Pause Or Resume` Pause or resume current session.
    - Typing in Atom automatically resumes the timer.
- Once started, look for a timer on status bar, that consists of an hourglass icon and a time.
  - Click icon to view your Timer historical stats.
  - Click time to pause/resume current session.

## Keyboard Shortcuts
- <kbd>ctrl-alt-t</kbd> `timer: Start`
- <kbd>ctrl-alt-s</kbd> `timer: Stop`
- <kbd>ctrl-alt-r</kbd> `timer: Reset`
- <kbd>ctrl-alt-p</kbd> `timer: Pause Or Resume`
