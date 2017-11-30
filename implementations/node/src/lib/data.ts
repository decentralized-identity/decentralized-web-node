const data = {
  parseObject(obj) {
    return new Promise(function(resolve, reject) {
      if (!obj.id)
        return reject(
          ctx.throw(400, 'You are not permitted to make this request')
        );
      resolve(true);
    });
  }
};

export default data;
