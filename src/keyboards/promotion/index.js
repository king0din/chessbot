const { promotionMap } = require('@/helpers')
/**
 * Piyon terfi seçeneklerini oluşturan fonksiyon.
 *
 * @param {Object} param Parametre nesnesi.
 * @param {Array} param.makeMoves Yapılabilecek hamle listesi.
 * @param {Object} param.pressed Basılan karenin bilgileri.
 * @return {Array} Terfi butonları dizisi.
 */
module.exports = ({ makeMoves, pressed }) => makeMoves.map(({ key }) => ({
  text: promotionMap[key[key.length - 1]],
  callback_data: `${pressed.file}${pressed.rank}${key[key.length - 1]}`,
}))