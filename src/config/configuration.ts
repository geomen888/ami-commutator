import { EnvironmentConfigUtils as env } from '../utils/environment-config.utils';

export default () => ({
  awsWssUrl: env.get('AWS_WSS_URL'),
  amiPassword: env.get('AMI_PASSWORD'),
  jwtSecret: env.get('JWT_SECRET_KEY'),
  amiPort: env.get('AMI_PORT'),
  amiHostIp: env.get('AMI_HOST_IP'),
  // redis: env.get('APP_ENV') === 'ec2'
  //   ? {
  //     host: env.get('REDIS_HOST'),
  //   }
  //   : {
  //     url: env.get('REDIS_URL'),
  //     name: 'ami-calls',
  //     onClientReady: (client) => {
  //       client.on('error', (err) => {
  //         console.error('redis:error::', err);
  //     })
  //  },
  //  }
});
