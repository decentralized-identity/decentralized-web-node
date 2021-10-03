
function jsonSchemaValidation(){
  return true;
}

const Validator = {
  validate(content){
    let schema = Validator.schemas[content.type];
    return schema && jsonSchemaValidation(schema);
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