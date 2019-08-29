const ChannelWorker = require('../Models/ChannelModel');

const GetBotChannelByType = async (botId, channelType) => {
  return await ChannelWorker.GetOne({
    botID: botId,
    type: channelType
  });
}

const GetBotChannelByPageId = async (pageId) => {
  return await ChannelWorker.GetOne({
    "channelFacebook.page_id": pageId
  }); 
}

module.exports = {
  GetBotChannelByType,
  GetBotChannelByPageId
}