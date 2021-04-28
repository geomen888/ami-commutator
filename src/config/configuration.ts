import { EnvironmentConfigUtils as env } from '../utils/environment-config.utils';

export default () => ({
  awsWssUrl: env.get('AWS_WSS_URL'),
  redis: {
    // for prod only host 
    // host: env.get('REDIS_HOST'),
    // port: env.get('REDIS_PORT'),

    url: env.get('REDIS_URL'),
    name: 'ami-calls',
    onClientReady: (client) => {
      client.on('error', (err) => {
        console.error('redis:error::', err);
      })
    },
  }
});
