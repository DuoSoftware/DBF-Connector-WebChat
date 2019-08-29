const channel = require('dbf-dbmodels/Models/Channels').channel;

module.exports.GetOne = async (context) => {
  return await channel.findOne(context);
}

module.exports.GetMany = async (context) => {
  return await channel.find(context);
}

module.exports.UpdateOne = async (context, data) => {
  return await channel.findOneAndUpdate(context, data);
}