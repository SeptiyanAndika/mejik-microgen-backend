const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'user:find', 'user:get', 'user:patch'
    ],
    public: [
        'pushNotification:create',
        'pushNotification:remove',
    ],
}
module.exports = {
    permissions
}