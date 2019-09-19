const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'users:find', 'users:get'
    ],
    public: [
        'pushNotification:create',
        'pushNotification:remove',
    ],
}
module.exports = {
    permissions
}