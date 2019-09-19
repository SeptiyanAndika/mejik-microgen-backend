const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'users:find', 'users:get', 'users:create', 'users:update', 'users:remove', 'users:patch',
        'user:find', 'user:get', 'user:create', 'user:update', 'user:remove', 'user:patch',
    ],
    public: [
        'pushNotification:create',
        'pushNotification:remove',
    ],
}
module.exports = {
    permissions
}