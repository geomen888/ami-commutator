


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
}