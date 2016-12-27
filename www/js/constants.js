angular.module('app.constant', [])
 
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
 
.constant('USER_ROLES', {
  admin: 'admin_rol',
  premium: 'premium_rol',
  free:'free_rol'

});