const appRoot = require('app-root-path');
let externalPermission = null
try {
    const root = appRoot.toString().split('/')
    root.pop()
    const path = root.join('/') + '/hooks/user'

    externalPermission = require(path)
} catch (e) {

}
const permissions = externalPermission && externalPermission().permissions || {
    admin: ['admin:*'],
    authenticated: [
        'user:find', 'user:get', 'user:patch',
        'pushNotification:create', 'pushNotification:remove',
        'workspace:find', 'workspace:get', 'workspace:create', 'workspace:removeOwn', 'workspace:patchOwn',
        'project:find', 'project:get', 'project:create', 'project:removeOwn', 'project:patchOwn',
        'server:find', 'server:get', 'server:create', 'server:removeOwn', 'server:patchOwn'
    ],

    public: [,
        'workspace:find', 'workspace:get',
        'project:find', 'project:get',
        'server:find', 'server:get'
    ],
}
module.exports = {
    permissions
}