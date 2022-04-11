import { z } from 'zod';
import { dump } from 'js-yaml';

var shortTextLength = 64;
var longTextLength = 253;
var shortText = z.string().max(shortTextLength);
var longText = z.string().max(longTextLength);
var validName = shortText.regex(/^([a-zA-Z0-9_-]+)$/);
var recordKey = longText.regex(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
var reference = z.string().regex(/^([a-zA-Z0-9_-]{1,64}):([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_-]{1,64})$/, 'reference must have the format KIND:NAMESPACE/NAME');
var componentReference = z.string().regex(/^component:([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_-]{1,64})$/, 'component reference must have the format component:NAMESPACE/NAME');
var groupReference = z.string().regex(/^group:([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_-]{1,64})$/, 'group reference must have the format group:NAMESPACE/NAME');
var systemReference = z.string().regex(/^system:([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_-]{1,64})$/, 'system reference must have the format system:NAMESPACE/NAME');
var apiReference = z.string().regex(/^api:([a-zA-Z0-9_-]{1,64})\/([a-zA-Z0-9_-]{1,64})$/, 'api reference must have the format api:NAMESPACE/NAME');
var backstageApiVersion = z.literal('backstage.io/v1alpha1')["default"]('backstage.io/v1alpha1');
var botpressApiVersion = z.literal('botpress.com/v1alpha1')["default"]('botpress.com/v1alpha1');
var lifecycle = z["enum"](['production', 'deprecated', 'experimental'])["default"]('production');
var metadataSchema = z.object({
  name: validName,
  namespace: z["enum"](['default'])["default"]('default'),
  title: shortText,
  description: longText,
  reference: reference["default"]('unknown:default/unknown'),
  labels: z.record(recordKey, longText)["default"]({}),
  annotations: z.record(recordKey, longText)["default"]({}),
  tags: shortText.array()["default"]([]),
  links: z.object({
    title: shortText,
    url: longText,
    icon: longText
  }).array()["default"]([])
});
var definitionSchema = z.object({
  apiVersion: backstageApiVersion,
  metadata: metadataSchema
});
var systemEntitySchema = definitionSchema.extend({
  kind: z.literal('System')["default"]('System'),
  spec: z.object({
    owner: groupReference
  })
});
var groupEntitySchema = definitionSchema.extend({
  apiVersion: backstageApiVersion,
  kind: z.literal('Group')["default"]('Group'),
  spec: z.object({
    type: z["enum"](['team', 'organization']),
    parent: groupReference.optional(),
    children: reference.array()["default"]([]),
    profile: z.object({
      email: z.string().email().optional()
    })
  })
});
var userEntitySchema = definitionSchema.extend({
  apiVersion: backstageApiVersion,
  kind: z.literal('User')["default"]('User'),
  spec: z.object({
    memberOf: groupReference.array(),
    profile: z.object({
      displayName: shortText,
      email: z.string().email().optional()
    })
  })
});
var componentEntitySchema = definitionSchema.extend({
  apiVersion: backstageApiVersion,
  kind: z.literal('Component')["default"]('Component'),
  spec: z.object({
    owner: groupReference,
    system: systemReference,
    providesApis: apiReference.array()["default"]([]),
    dependsOn: componentReference.array()["default"]([]),
    type: z["enum"](['service', 'website']),
    lifecycle: lifecycle
  })
});
var apiEntitySchema = definitionSchema.extend({
  apiVersion: backstageApiVersion,
  kind: z.literal('API')["default"]('API'),
  spec: z.object({
    owner: groupReference,
    system: systemReference,
    type: z["enum"](['openapi', 'asyncapi', 'graphql', 'grpc']),
    lifecycle: lifecycle,
    definition: z.string()
  })
});
var deploymentEntitySchema = definitionSchema.extend({
  apiVersion: botpressApiVersion,
  kind: z.literal('Deployment')["default"]('Deployment'),
  spec: z.object({
    owner: componentReference,
    environment: shortText
  })
});
var documentationEntitySchema = definitionSchema.extend({
  apiVersion: botpressApiVersion,
  kind: z.literal('Documentation')["default"]('Documentation'),
  spec: z.object({
    owner: componentReference
  })
});

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var Entity = function Entity(schema, metadataProps, spec) {
  var title = metadataProps.title,
      description = metadataProps.description,
      name = metadataProps.name,
      namespace = metadataProps.namespace;
  var entity = schema.safeParse({
    metadata: {
      title: title,
      description: description,
      name: name,
      namespace: namespace
    },
    spec: spec
  });

  if (!entity.success) {
    throw Error("unable to create entity: ".concat(entity.error.message));
  }

  return _objectSpread2(_objectSpread2({}, entity.data), {}, {
    metadata: _objectSpread2(_objectSpread2({}, entity.data.metadata), {}, {
      reference: "".concat(entity.data.kind, ":").concat(entity.data.metadata.namespace, "/").concat(entity.data.metadata.name).toLowerCase()
    })
  });
};
var entityFunctions = function entityFunctions(entity) {
  return {
    /**
     * get the entity data object
     * @returns entity data
     */
    get: function get() {
      return entity;
    },

    /**
     * set updates the entity data object by passing an update function
     */
    set: function set(update) {
      return update(entity);
    },

    /**
     * encode the entity in yaml format
     * @returns string with the yaml format of the entity
     */
    yaml: function yaml() {
      return dump(entity);
    },

    /**
     * encode the entity in json format
     * @returns string with the json format of the entity
     */
    json: function json() {
      return JSON.stringify(entity);
    },

    /**
     * reference of this object that can be used to link object in backstage
     * @returns string format of the reference
     */
    ref: function ref() {
      return entity.metadata.reference;
    },

    /**
     * doc path for this entity. This is used to generate the techdocs entity reference
     * @returns string used by the techdocs entity reference
     */
    doc: function doc() {
      return "".concat(entity.metadata.namespace, "/").concat(entity.kind, "/").concat(entity.metadata.name).toLowerCase();
    },

    /**
     * path of the file created by this entity
     * @returns string of the file path for this entity
     */
    path: function path() {
      var _a;

      var key = "".concat(entity.metadata.namespace, "/").concat(entity.kind, "/");

      if ((_a = entity.spec) === null || _a === void 0 ? void 0 : _a.type) {
        key += "".concat(entity.spec.type, "-");
      }

      key += "".concat(entity.metadata.name, ".yaml");
      return key.toLowerCase();
    },

    /**
     * add a link to this entity
     */
    addLink: function addLink(link) {
      if (!entity.metadata.links) {
        entity.metadata.links = [];
      }

      entity.metadata.links.push(link);
    }
  };
};
var addTechDocs = function addTechDocs(entity) {
  entity.metadata.annotations['backstage.io/techdocs-ref'] = "url:/api/techdocs/static/docs/".concat(entity.metadata.namespace, "/").concat(entity.kind, "/").concat(entity.metadata.name).toLowerCase();
};

var Api = function Api(props) {
  var system = props.system,
      owner = props.owner,
      definition = props.definition;
  var entity = Entity(apiEntitySchema, props, {
    owner: owner,
    system: system,
    definition: definition,
    type: 'openapi',
    lifecycle: 'production'
  });
  return entityFunctions(entity);
};

var Deployment = function Deployment(props) {
  var entity = Entity(deploymentEntitySchema, props, {
    owner: props.owner,
    environment: props.environment
  });
  return entityFunctions(entity);
};

var Organization = function Organization(props) {
  var entity = Entity(groupEntitySchema, props, {
    type: 'organization',
    children: [],
    profile: {}
  });
  return entityFunctions(entity);
};

var Service = function Service(props) {
  var docs = props.docs,
      github = props.github,
      owner = props.owner,
      system = props.system,
      providesApis = props.providesApis,
      dependsOn = props.dependsOn;
  var entity = Entity(componentEntitySchema, props, {
    owner: owner,
    system: system,
    type: 'service',
    lifecycle: 'production',
    providesApis: providesApis !== null && providesApis !== void 0 ? providesApis : [],
    dependsOn: dependsOn !== null && dependsOn !== void 0 ? dependsOn : []
  });

  if (docs) {
    addTechDocs(entity);
  }

  if (github) {
    entity.metadata.annotations['github.com/project-slug'] = "".concat(github.organization, "/").concat(github.repository);
  }

  return _objectSpread2(_objectSpread2({}, entityFunctions(entity)), {}, {
    /**
     * add a dependency to the service entity
     * @param service the service that it depends on
     */
    addDependency: function addDependency(service) {
      return _addDependency(entity, service);
    }
  });
};

var _addDependency = function _addDependency(service, dependent) {
  service.spec.dependsOn.push(dependent.metadata.reference);
};

var System = function System(props) {
  var entity = Entity(systemEntitySchema, props, {
    owner: props.owner
  });
  return entityFunctions(entity);
};

var Team = function Team(props) {
  var entity = Entity(groupEntitySchema, props, {
    type: 'team',
    parent: props.organization,
    children: [],
    profile: {}
  });
  return entityFunctions(entity);
};

var User = function User(props) {
  var name = props.name,
      teams = props.teams,
      picture = props.picture,
      email = props.email,
      github = props.github;
  var normalizedName = props.name.toLowerCase().replace(/ /g, '-');
  var entity = Entity(userEntitySchema, _objectSpread2(_objectSpread2({}, props), {}, {
    name: normalizedName
  }), {
    memberOf: teams,
    profile: {
      displayName: name,
      picture: picture
    }
  });

  if (github) {
    entity.metadata.annotations['github.com/user-login'] = github.username;
  }

  if (email) {
    entity.metadata.annotations['google.com/email'] = email;
  }

  return entityFunctions(entity);
};

var Website = function Website(props) {
  var docs = props.docs,
      github = props.github,
      owner = props.owner,
      system = props.system;
  var entity = Entity(componentEntitySchema, props, {
    owner: owner,
    system: system,
    type: 'website',
    lifecycle: 'production',
    dependsOn: [],
    providesApis: []
  });

  if (docs) {
    addTechDocs(entity);
  }

  if (github) {
    entity.metadata.annotations['github.com/project-slug'] = "".concat(github.organization, "/").concat(github.repository);
  }

  return entityFunctions(entity);
};

var Documentation = function Documentation(props) {
  var entity = Entity(documentationEntitySchema, props, {
    owner: props.owner
  });
  addTechDocs(entity);
  return entityFunctions(entity);
};

var teams = z["enum"](['sre', 'nlp', 'developer-apps', 'business-apps']);
var systems = z["enum"](['cloud', 'nlp', 'monitoring']);
var baseSchema = z.object({
  $schema: z.string(),
  name: validName.describe('name of the project'),
  description: longText.describe('short description of the project'),
  team: teams.describe('team that owns this project'),
  docs: z.string().describe('path to the documentation file or directory (ex: README.md). Relative to the backstage configuration file.').optional()
});

var serviceV1Schema = baseSchema.extend({
  type: z.literal('service@v1'),
  system: systems.describe('system that this service is part of'),
  api: z.object({
    type: z["enum"](['openapi', 'asyncapi', 'graphql', 'grpc']),
    source: z.string()
  }).optional()
});

var websiteV1Schema = baseSchema.extend({
  type: z.literal('website@v1'),
  system: systems.describe('system that this service is part of')
});

var documentationV1Schema = baseSchema.extend({
  type: z.literal('documentation@v1')
});

var schema = z.union([serviceV1Schema, websiteV1Schema, documentationV1Schema]);

export { Api, Deployment, Documentation, Organization, Service, System, Team, User, Website, documentationV1Schema, schema, serviceV1Schema, websiteV1Schema };
