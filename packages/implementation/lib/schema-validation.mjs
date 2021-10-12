
function jsonSchemaValidation(){
  return true;
}

const Validator = {
  async validate(descriptor){
    let validator = Validator.interfaces[descriptor.type];
    return validator instanceof Function ? !!validator(descriptor) : !!validator;
  },
  interfaces: {
    ProfileRead: true,
    ProfileWrite: true,
    ProfileDelete: true,
    CollectionsQuery: true,
    CollectionsWrite: descriptor => {
      return true;
    },
    CollectionsCommit: descriptor => {
      return true;
    },
    CollectionsDelete: true,
    ActionsQuery: true,
    ActionsCreate: true,
    ActionsUpdate: true,
    ActionsDelete: true,
    PermissionsRequest: true,
    PermissionsQuery: true,
    PermissionsGrant: true,
    PermissionsRevoke: true,
  }
};

export default Validator;