const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const dbFilePath = path.join(__dirname, 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));

  if (req.path === '/groups' && req.method === 'GET') {
    const transformedData = transformDataForGroups(dbData.grupos);
    res.json(transformedData);
  } else if (req.path.startsWith('/groups/') && req.method === 'GET') {
    const groupId = req.path.split('/')[2];
    const foundGroup = dbData.grupos.find((group) => group.id === groupId);

    if (foundGroup) {
      const transformedData = transformGroup(
        foundGroup,
        dbData.grupos,
        dbData.usuarios
      );
      res.json(transformedData);
    } else {
      res.status(404).send('Group not found');
    }
  } else {
    next();
  }
};

function transformDataForGroups(groups) {
  const buildGroupHierarchy = (group) => ({
    id: group.id,
    code: group.groupCode,
    name: group.groupName,
    status: group.isActive,
    usersCount: group.users.length,
    children: groups
      .filter((g) => g.parentKey === group.id)
      .map(buildGroupHierarchy),
  });

  return groups.filter((group) => !group.parentKey).map(buildGroupHierarchy);
}

function transformGroup(group, groups, users) {
  const mapUsers = (userIds) =>
    userIds.map((userId) => {
      const user = users.find((u) => u.id === userId);
      if (user) {
        const { id, name, email } = user;
        return { key: id, name, email };
      }
      return null;
    });

  let parentGroupInfo = null;
  if (group.parentKey) {
    const parentGroup = groups.find((g) => g.id === group.parentKey);
    if (parentGroup) {
      parentGroupInfo = `${parentGroup.groupCode} - ${parentGroup.groupName}`;
    }
  }

  return {
    key: group.id,
    groupCode: group.groupCode,
    groupName: group.groupName,
    isActive: group.isActive,
    users: mapUsers(group.users).filter((user) => user !== null),
    parentGroup: parentGroupInfo,
  };
}
