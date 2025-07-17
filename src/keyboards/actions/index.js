module.exports = (lastTurnCbData) => [{
//   text: 'Ayarlar',
//   callback_data: 'settings',
// }, {
  text: 'Son hamle',
  callback_data: `last${lastTurnCbData ? '::' + lastTurnCbData : ''}`,
}, {
  text: 'Yeni oyun',
  switch_inline_query_current_chat: '',
}]