import WSS from 'ws';

export class Utils {

    public static IsJsonString(str) {
        try {
          var json = JSON.parse(str);
          return (typeof json === 'object');
        } catch (e) {
          return false;
        }
      }

      public static async delay<T extends { cancel: Function }>(
        ms: number,
      ): Promise<T> {
        let ctr, rej;
        const p = new Promise<any>((resolve, reject) => {
          ctr = setTimeout(resolve, ms);
          rej = reject;
        });
        Object.defineProperty(p, 'cancel', {
          value: () => {
            clearTimeout(ctr);
            rej(Error('Cancelled'));
          },
          writable: true,
          enumerable: true,
          configurable: false,
        });
        return p;
      }

      public static compareArrays<T>(a1: T[], a2: T[]): boolean {
        const missing = a1.filter(item => a2.indexOf(item) < 0);
    
        return !!!missing.length;
      }

      public static async connection(socket, timeout = 10000) {
        const isOpened = () => (socket.readyState === WSS.OPEN)
      
        if (socket.readyState !== WSS.CONNECTING) {
          return isOpened()
        }
        else {
          const intrasleep = 100
          const ttl = timeout / intrasleep // time to loop
          let loop = 0
          while (socket.readyState === WSS.CONNECTING && loop < ttl) {
            await new Promise(resolve => setTimeout(resolve, intrasleep))
            loop++
          }
          return isOpened()
        }
      }
}