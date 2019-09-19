const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');
const {OAuth2Client} = require('google-auth-library');
const { GOOGLE_CLIENT_ID } = require('../config')
const axios = require('axios')

const parseGoogleToken = (idToken,oAuth2Google)  =>{
  return oAuth2Google.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  })
}

const parseFacebookToken = (token) =>{
  return axios.get(`https://graph.facebook.com/v4.0/me?fields=id%2Cfirst_name%2Clast_name%2Cemail&access_token=${token}`)
}

class MyGoogle extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    return {
      ...baseData,
      email: profile.email
    };
  }
  async authenticate(authentication,params){
    console.log("authentication", authentication)
    return { 
      authentication: { strategy: 'google' },
      user: authentication.user
    }
  }
}

class MyFacebook extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    return {
      ...baseData,
      email: profile.email
    };
  }
  async authenticate(authentication,params){
    console.log("authentication", authentication)
    return { 
      authentication: { strategy: 'facebook' },
      user: authentication.user
    }
  }
}

module.exports = app => {
  const authentication = new AuthenticationService(app);
  const oAuth2Google = new OAuth2Client(GOOGLE_CLIENT_ID);
  app.set('parseGoogleToken', (idToken)=>parseGoogleToken(idToken, oAuth2Google))
  app.set('parseFacebookToken', parseFacebookToken)
  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('google', new MyGoogle());
  authentication.register('facebook', new MyFacebook());
  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
