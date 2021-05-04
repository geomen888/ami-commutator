


export class Utils {

    public static IsJsonString(str) {
        try {
          var json = JSON.parse(str);
          return (typeof json === 'object');
        } catch (e) {
          return false;
        }
      }
}