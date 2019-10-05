const appRoot = require('app-root-path');
let externalPermission = null
try {
    externalPermission = require(appRoot + '/hooks/user')
} catch (e) {

}
const permissions = externalPermission && externalPermission().permissions || {
    admin: ['admin:*'],
    authenticated: [
        'user:find', 'user:get', 'user:patch',
        'workspace:find', 'workspace:get', 'workspace:create', 'workspace:update', 'workspace:remove', 'workspace:patch',
        'project:find', 'project:get', 'project:create', 'project:update', 'project:remove', 'project:patch',
        'server:find', 'server:get', 'server:create', 'server:update', 'server:remove', 'server:patch'
    ],
    public: [
        'pushNotification:create', 'pushNotification:remove',
        'workspace:find', 'workspace:get',
        'project:find', 'project:get',
        'server:find', 'server:get'
    ],
}
module.exports = {
    permissions
}