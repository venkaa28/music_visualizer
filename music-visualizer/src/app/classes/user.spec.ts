import { User } from './user';

describe('User', () => {
  let user = new User();
  beforeEach
  it('should create an instance', () => {
    expect(user).toBeTruthy();
  });
  
  it('check user initial user\'s email', () => {
    expect(user.email).toBe('');
  });

  it('check user initial user\'s name', () => {
    expect(user.name).toBe('');
  });

  it('check user initial user\'s password', () => {
    expect(user.password).toBe('');
  });

  it('check user initial user\'s spotifyAPIKey', () => {
    expect(user.spotifyAPIKey).toBe('');
  });

  it('check user initial user\'s soundCloudAPIKey', () => {
    expect(user.soundCloudAPIKey).toBe('');
  });
});
