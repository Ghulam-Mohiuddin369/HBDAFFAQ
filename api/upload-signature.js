import { route, send } from './_lib/http.js';
import { cloudinaryConfig, sign, FOLDER } from './_lib/cloudinary.js';

// Lets the browser upload straight to Cloudinary without ever seeing the API secret.
export default route({
  POST: async (req, res) => {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = sign({ folder: FOLDER, timestamp }, apiSecret);
    send(res, 200, { cloudName, apiKey, timestamp, folder: FOLDER, signature });
  },
});
