const permissions = {
    admin: ['admin:*'],
    authenticated: [
        'post:find', 'post:get', 'post:create', 'post:update', 'post:remove', 'post:patch',
        'userFriend:find', 'userFriend:get', 'userFriend:create', 'userFriend:update', 'userFriend:remove', 'userFriend:patch',
        'comment:find', 'comment:get', 'comment:create', 'comment:update', 'comment:remove', 'comment:patch',
        'forgetPassword:find', 'forgetPassword:get', 'forgetPassword:create', 'forgetPassword:update', 'forgetPassword:remove', 'forgetPassword:patch',
        'users:find', 'users:get', 'users:create', 'users:update', 'users:remove', 'users:patch',
        'user:find', 'user:get', 'user:create', 'user:update', 'user:remove', 'user:patch',
    ],
    public: [
        'post:find', 'post:get',
        'userFriend:find', 'userFriend:get', 'userFriend:create',
        'comment:find', 'comment:get',
        'forgetPassword:find', 'forgetPassword:get'
    ],
}
module.exports = {
    permissions
}