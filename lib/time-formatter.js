'use babel'

export default {

  /**
   * Format seconds in form of mm:ss
   * @param  {number} seconds - Seconds
   * @return {string} Time in form of hh:mm:ss
   */
  formatSeconds (seconds) {
    if (seconds == null || +seconds !== seconds) return '00:00:00'

    const hour = Math.floor(seconds / 60 / 60)
    const min = Math.floor(seconds / 60) - 60 * hour
    const sec = seconds - 60 * min - 60 * 60 * hour
    return `${('00' + hour).slice(-2)}:${('00' + min).slice(-2)}:${('00' + sec).slice(-2)}`
  },

  /**
   * Get today in form of YYYYMMDD
   * @return {string} Today in form of YYYYMMDD
   */
  today () {
    const date = new Date()
    const year = date.getFullYear()
    const month = ('00' + date.getMonth()).slice(-2)
    const day = ('00' + date.getDate()).slice(-2)
    return `${year}${month}${day}`
  }
}
