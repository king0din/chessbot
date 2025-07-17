const Telegraf = require('telegraf')
const { emodji, letters } = require('@/helpers')
const { Markup } = Telegraf
const NIL = 0
let pieces = (NIL !== 0) ? letters : emodji
/**
 * Tahta oluşturucu fonksiyon.
 *
 * @param {Array} board Tahta.
 * @param {Boolean} isWhite Beyaz tarafın hamlesi olup olmadığını gösterir.
 * @param {Array[]} actions Tahtanın altındaki ek butonlar.
 * @return {Extra}
 */
module.exports = ({ board, isWhite, actions, callbackOverride }) => {
  const horizontal = 'hgfedcba'.split('')
  const vertical = Array.from({ length: 8 }, (item, idx) => idx + 1).reverse()
  /**
   * İç içe döngülerle tahta oluşturma.
   *
   * @type {Array}
   */
  let boardMarkup = vertical.map((row) => horizontal.map((col) => {
    /**
     * Basılan kareyi bul.
     *
     * @type {Object}
     */
    const square = board
      .find(({ file, rank }) => file === col && rank === row)
    /**
     * Eğer bir taş varsa.
     */
    if (square && square.piece) {
      const piece = pieces[square.piece.side.name][square.piece.type]
      return {
        text: `${square.move ? 'X' : ''}${piece}`,
        callback_data: callbackOverride || `${col}${row}`,
      }
    }
    /**
     * Eğer boş bir kare ise.
     */
    return {
      text: square.move ? '·' : unescape('%u0020'),
      callback_data: callbackOverride || `${col}${row}`,
    }
  }))
  /**
   * Tahtanın döndürülmesini yönet.
   */
  if (!isWhite) {
    boardMarkup = boardMarkup.map((row) => row.reverse()).reverse()
  }
  /**
   * Ek butonları ekle.
   */
  if (actions) {
    boardMarkup.push(actions)
  }
  /**
   * Extra nesnesini döndürür.
   */
  return Markup.inlineKeyboard(boardMarkup).extra()
}