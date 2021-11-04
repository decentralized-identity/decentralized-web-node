 
const codes = {
  204: {
    message: 'Bad Request'
  },
  400: {
    message: 'Unauthorized'
  },
  401: {
    message: 'Unauthorized'
  },
  404: {
    message: 'Not Found'
  },
  500: {
    message: 'Internal Error'
  },
  501: {
    message: 'Not Implemented'
  }
};
 
export default {
  getStatus(code) {
    return Object.assign({
      code: code
    }, codes[code]);
  }
}