import { z } from 'zod';

declare const metadataSchema: z.ZodObject<{
    name: z.ZodString;
    namespace: z.ZodDefault<z.ZodEnum<["default"]>>;
    title: z.ZodString;
    description: z.ZodString;
    reference: z.ZodDefault<z.ZodString>;
    labels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    annotations: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    links: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        icon: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string;
        icon: string;
    }, {
        title: string;
        url: string;
        icon: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    namespace: "default";
    title: string;
    description: string;
    reference: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
    tags: string[];
    links: {
        title: string;
        url: string;
        icon: string;
    }[];
}, {
    namespace?: "default" | undefined;
    reference?: string | undefined;
    labels?: Record<string, string> | undefined;
    annotations?: Record<string, string> | undefined;
    tags?: string[] | undefined;
    links?: {
        title: string;
        url: string;
        icon: string;
    }[] | undefined;
    name: string;
    title: string;
    description: string;
}>;

interface MetadataProps {
    namespace?: string;
    title: string;
    description: string;
    name: string;
}
declare type MetadataType = z.infer<typeof metadataSchema>;
declare const entityFunctions: <T extends {
    spec: object & {
        type?: string;
    };
    kind: string;
    metadata: MetadataType;
} & {
    metadata: {
        reference: string;
        name: string;
        namespace: "default";
        title: string;
        description: string;
        labels: Record<string, string>;
        annotations: Record<string, string>;
        tags: string[];
        links: {
            title: string;
            url: string;
            icon: string;
        }[];
    };
}>(entity: T) => {
    /**
     * get the entity data object
     * @returns entity data
     */
    get: () => T;
    /**
     * set updates the entity data object by passing an update function
     */
    set: (update: (entity: T) => void) => void;
    /**
     * encode the entity in yaml format
     * @returns string with the yaml format of the entity
     */
    yaml: () => string;
    /**
     * encode the entity in json format
     * @returns string with the json format of the entity
     */
    json: () => string;
    /**
     * reference of this object that can be used to link object in backstage
     * @returns string format of the reference
     */
    ref: () => string;
    /**
     * doc path for this entity. This is used to generate the techdocs entity reference
     * @returns string used by the techdocs entity reference
     */
    doc: () => string;
    /**
     * path of the file created by this entity
     * @returns string of the file path for this entity
     */
    path: () => string;
    /**
     * add a link to this entity
     */
    addLink: (link: MetadataType['links'][0]) => void;
};
declare type BaseEntity = ReturnType<typeof entityFunctions>;

interface Props$7 {
    owner: string;
    system: string;
    definition: string;
}
declare const Api: (props: Props$7 & MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "API";
        spec: {
            type: "openapi" | "asyncapi" | "graphql" | "grpc";
            owner: string;
            system: string;
            lifecycle: "production" | "deprecated" | "experimental";
            definition: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "API";
        spec: {
            type: "openapi" | "asyncapi" | "graphql" | "grpc";
            owner: string;
            system: string;
            lifecycle: "production" | "deprecated" | "experimental";
            definition: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};
declare type ApiType = ReturnType<ReturnType<typeof Api>['get']>;

interface Props$6 {
    owner: string;
    environment: string;
}
declare const Deployment: (props: Props$6 & MetadataProps) => {
    get: () => {
        apiVersion: "botpress.com/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Deployment";
        spec: {
            owner: string;
            environment: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "botpress.com/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Deployment";
        spec: {
            owner: string;
            environment: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};
declare type DeploymentType = ReturnType<ReturnType<typeof Deployment>['get']>;

declare const Organization: (props: MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Group";
        spec: {
            parent?: string | undefined;
            type: "team" | "organization";
            children: string[];
            profile: {
                email?: string | undefined;
            };
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Group";
        spec: {
            parent?: string | undefined;
            type: "team" | "organization";
            children: string[];
            profile: {
                email?: string | undefined;
            };
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};
declare type OrganizationType = ReturnType<ReturnType<typeof Organization>['get']>;

interface Props$5 {
    owner: string;
    system: string;
    providesApis?: string[];
    dependsOn?: string[];
    docs?: boolean;
    github?: {
        organization: string;
        repository: string;
    };
}
declare type ServiceType = ReturnType<ReturnType<typeof Service>['get']>;
declare const Service: (props: Props$5 & MetadataProps) => {
    /**
     * add a dependency to the service entity
     * @param service the service that it depends on
     */
    addDependency: (service: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Component";
        spec: {
            type: "service" | "website";
            owner: string;
            system: string;
            providesApis: string[];
            dependsOn: string[];
            lifecycle: "production" | "deprecated" | "experimental";
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void;
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Component";
        spec: {
            type: "service" | "website";
            owner: string;
            system: string;
            providesApis: string[];
            dependsOn: string[];
            lifecycle: "production" | "deprecated" | "experimental";
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Component";
        spec: {
            type: "service" | "website";
            owner: string;
            system: string;
            providesApis: string[];
            dependsOn: string[];
            lifecycle: "production" | "deprecated" | "experimental";
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};

interface Props$4 {
    owner: string;
}
declare type SystemType = ReturnType<ReturnType<typeof System>['get']>;
declare const System: (props: Props$4 & MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "System";
        spec: {
            owner: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "System";
        spec: {
            owner: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};

interface Props$3 {
    organization: string;
}
declare type TeamType = ReturnType<ReturnType<typeof Team>['get']>;
declare const Team: (props: Props$3 & MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Group";
        spec: {
            parent?: string | undefined;
            type: "team" | "organization";
            children: string[];
            profile: {
                email?: string | undefined;
            };
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Group";
        spec: {
            parent?: string | undefined;
            type: "team" | "organization";
            children: string[];
            profile: {
                email?: string | undefined;
            };
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};

interface Props$2 {
    picture?: string;
    email?: string;
    teams: string[];
    github?: {
        username: string;
    };
}
declare type UserType = ReturnType<ReturnType<typeof User>['get']>;
declare const User: (props: Props$2 & MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "User";
        spec: {
            profile: {
                email?: string | undefined;
                displayName: string;
            };
            memberOf: string[];
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "User";
        spec: {
            profile: {
                email?: string | undefined;
                displayName: string;
            };
            memberOf: string[];
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};

interface Props$1 {
    owner: string;
    system: string;
    docs?: boolean;
    github?: {
        organization: string;
        repository: string;
    };
}
declare type WebsiteType = ReturnType<ReturnType<typeof Website>['get']>;
declare const Website: (props: Props$1 & MetadataProps) => {
    get: () => {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Component";
        spec: {
            type: "service" | "website";
            owner: string;
            system: string;
            providesApis: string[];
            dependsOn: string[];
            lifecycle: "production" | "deprecated" | "experimental";
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "backstage.io/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Component";
        spec: {
            type: "service" | "website";
            owner: string;
            system: string;
            providesApis: string[];
            dependsOn: string[];
            lifecycle: "production" | "deprecated" | "experimental";
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};

interface Props {
    owner: string;
}
declare const Documentation: (props: Props & MetadataProps) => {
    get: () => {
        apiVersion: "botpress.com/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Documentation";
        spec: {
            owner: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    };
    set: (update: (entity: {
        apiVersion: "botpress.com/v1alpha1";
        metadata: {
            name: string;
            namespace: "default";
            title: string;
            description: string;
            reference: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
        kind: "Documentation";
        spec: {
            owner: string;
        };
    } & {
        metadata: {
            reference: string;
            name: string;
            namespace: "default";
            title: string;
            description: string;
            labels: Record<string, string>;
            annotations: Record<string, string>;
            tags: string[];
            links: {
                title: string;
                url: string;
                icon: string;
            }[];
        };
    }) => void) => void;
    yaml: () => string;
    json: () => string;
    ref: () => string;
    doc: () => string;
    path: () => string;
    addLink: (link: {
        title: string;
        url: string;
        icon: string;
    }) => void;
};
declare type DocumentationType = ReturnType<ReturnType<typeof Documentation>['get']>;

declare type ServiceV1SchemaType = z.infer<typeof serviceV1Schema>;
declare const serviceV1Schema: z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"service@v1">;
    system: z.ZodEnum<["cloud", "nlp", "monitoring"]>;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "service@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "service@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}>;

declare type WebsiteV1SchemaType = z.infer<typeof websiteV1Schema>;
declare const websiteV1Schema: z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"website@v1">;
    system: z.ZodEnum<["cloud", "nlp", "monitoring"]>;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "website@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "website@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}>;

declare type DocumentationV1SchemaType = z.infer<typeof documentationV1Schema>;
declare const documentationV1Schema: z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"documentation@v1">;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "documentation@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "documentation@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    $schema: string;
}>;

declare type SchemaType = z.infer<typeof schema>;
declare const schema: z.ZodUnion<[z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"service@v1">;
    system: z.ZodEnum<["cloud", "nlp", "monitoring"]>;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "service@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "service@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}>, z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"website@v1">;
    system: z.ZodEnum<["cloud", "nlp", "monitoring"]>;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "website@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "website@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    system: "nlp" | "cloud" | "monitoring";
    $schema: string;
}>, z.ZodObject<z.extendShape<{
    $schema: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    team: z.ZodEnum<["sre", "nlp", "developer-apps", "business-apps"]>;
    docs: z.ZodOptional<z.ZodString>;
}, {
    type: z.ZodLiteral<"documentation@v1">;
}>, "strip", z.ZodTypeAny, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "documentation@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    $schema: string;
}, {
    docs?: string | undefined;
    name: string;
    description: string;
    type: "documentation@v1";
    team: "sre" | "nlp" | "developer-apps" | "business-apps";
    $schema: string;
}>]>;

export { Api, ApiType, BaseEntity, Deployment, DeploymentType, Documentation, DocumentationType, DocumentationV1SchemaType, Organization, OrganizationType, SchemaType, Service, ServiceType, ServiceV1SchemaType, System, SystemType, Team, TeamType, User, UserType, Website, WebsiteType, WebsiteV1SchemaType, documentationV1Schema, schema, serviceV1Schema, websiteV1Schema };
