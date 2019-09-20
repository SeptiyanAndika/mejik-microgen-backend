const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'user:find', 'user:get'
    ],
    public: [
        'pushNotification:create',
        'pushNotification:remove',
    ],
}
module.exports = {
    permissions
}