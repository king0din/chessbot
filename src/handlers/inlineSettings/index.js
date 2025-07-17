const {
  debug,
  getGame,
  isWhiteUser,
  isBlackUser,
} = require('@/helpers')

module.exports = () => [
  /^settings::(\d+)(?:::(\w+))?(?:::(\w+))?$/,
  async (ctx) => {
    const game = await getGame(ctx, ctx.match[1])

    if (!isBlackUser(game, ctx) && !isWhiteUser(game, ctx)) {
      return ctx.answerCbQuery('Üzgünüm, bu oyun meşgul. Yeni bir tane yapmayı deneyin.')
    }

    switch (ctx.match[2]) {
      case 'rotation':
        switch (ctx.match[3]) {
          case 'whites':
          case 'blacks':
          case 'dynamic':
            if (game) {
              const config = JSON.parse(game.config) || {}
              config.rotation = ctx.match[3]

              await ctx.db('games')
                .update({ config: JSON.stringify(config) })
                .where('id', game.id)
                .catch(debug)
            }

            return ctx.answerCbQuery(`Siz ${ctx.match[3]} döndürme modunu seçtiniz. Bu, bir sonraki hamle sonrası uygulanacak.`)

          default:
            await ctx.editMessageReplyMarkup({
              inline_keyboard: [
                [{
                  text: 'Beyazlar altta',
                  callback_data: `settings::${game.id}::rotation::whites`,
                }],
                [{
                  text: 'Siyahlar altta',
                  callback_data: `settings::${game.id}::rotation::blacks`,
                }],
                [{
                  text: 'Mevcut hamleci altta',
                  callback_data: `settings::${game.id}::rotation::dynamic`,
                }],
                [{
                  text: '⬅️ Ayarlara geri dön',
                  callback_data: `settings::${game.id}`,
                }],
              ],
            }).catch(debug)

            return ctx.answerCbQuery('Lütfen bir döndürme modu seçin!')
        }

      default:
        await ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [{
              text: 'Tahta Döndürme',
              callback_data: `settings::${game.id}::rotation`,
            }],
            [{
              text: '⬅️ Oyuna geri dön',
              callback_data: `back::${game.id}`,
            }],
          ],
        }).catch(debug)

        return ctx.answerCbQuery('Lütfen değiştirmek istediğiniz bir ayar seçin!')
    }
  },
]
