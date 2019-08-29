const project = require('dbf-dbmodels/Models/RolesAndGroups').project;

module.exports.GetOne = async (context) => {
  return await project.findOne(context);
}

module.exports.GetMany = async (context) => {
  return await project.find(context);
}

module.exports.UpdateOne = async (context, data) => {
  return await project.findOneAndUpdate(context, data);
}