const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'event:find', 'event:get', 'event:create', 'event:update', 'event:remove', 'event:patch','order:find', 'order:get', 'order:create', 'order:update', 'order:remove', 'order:patch','ticket:find', 'ticket:get', 'ticket:create', 'ticket:update', 'ticket:remove', 'ticket:patch'
    ],
    public: [
        'event:find', 'event:get','order:find', 'order:get','ticket:find', 'ticket:get'
    ],
}
module.exports = {
    permissions
}
        