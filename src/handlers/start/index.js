const { mainMenu } = require('@/helpers')

module.exports = () => async (ctx) => {
  await ctx.replyWithMarkdown(
    'Bir arkadaşınızla satranç oynamak için mesaj yazma alanınıza @santrancbot yazın.',
    { reply_markup: { inline_keyboard: mainMenu } }
  )
}
