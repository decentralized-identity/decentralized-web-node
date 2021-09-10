
function jsonSchemaValidation(){
  return true;
}

const Validator = {
  validate(message){
    let schema = Validator.schemas[message.type];
    if (schema && !jsonSchemaValidation(schema)) throw 'Malformed invocation objects';
  },
  schemas: {
    ProfileRead: true,
    ProfileWrite: true,
    ProfileDelete: true,
    CollectionsQuery: true,
    CollectionsCreate: true,
    CollectionsUpdate: true,
    CollectionsReplace: true,
    CollectionsDelete: true,
    CollectionsBatch: true,
    ActionsQuery: true,
    ActionsCreate: true,
    ActionsUpdate: true,
    ActionsDelete: true,
    ActionsBatch: true,
    PermissionsRequest: true,
    PermissionsQuery: true,
    PermissionsCreate: true,
    PermissionsUpdate: true,
    PermissionsDelete: true,
    PermissionsBatch: true,
  }
};

export default Validator;