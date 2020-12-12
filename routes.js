import axios from 'axios';
import _ from 'lodash';


class Routes {
    _buildAxiosConfig(config) {
        if ((this.espnS2 && this.SWID)) {
          const headers = { Cookie: `espn_s2=${this.espnS2}; SWID=${this.SWID};` };
          return _.merge({}, config, { headers, withCredentials: true });
        }
    
        return config;
      }
    
      static _buildRoute({ base, params }) {
        return `${base}${params}`;
      }
}

export default Routes;