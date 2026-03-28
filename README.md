NOTE:
1. when deploy to server (i.e. Namecheap), if the error Fail to fetch appears, the reason was somehow the fontend does not send to correct endpoint address (send to localhost, i.e.). This might because of the development vs. production configuration in the environment of the server.
Fix: change in file api.ts:
const getBaseURL = () => {
  //if (window.location.hostname === 'localhost') {
  //  return 'http://localhost:3000/api/v1';
  //}

  // Production
  return 'https://innspill.ai/microapi/api/v1';
};

2. Change the relative path name:
/images/keenious.jpg --> ./images/keenious.jpg